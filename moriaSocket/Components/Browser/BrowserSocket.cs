using System;
using System.Web.WebSockets;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System.Web.Helpers;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Timers;

namespace moriaSocket.Components.Browser
{
	public class BrowserSocket : WebSocketHandlerSecure, IDisposable
	{

		public string Key;
		public BrowserDirectoryWatcher DirWatcher;
		private ConcurrentDictionary<string, FileUpload<int, string>> FileUploadBuffer = new ConcurrentDictionary<string, FileUpload<int, string>>(WebSocketManager.CollectionConcurrency, 1);

		public BrowserSocket(string key, BrowserDirectoryWatcher dir) {
			this.Key = key;
			this.WebSocketOptions = new AspNetWebSocketOptions()
			{
				SubProtocol = "browser",
				RequireSameOrigin = true
			};
			this.DirWatcher = dir;
			if (Directory.Exists(this.DirWatcher.Path))
			{
				this.DirWatcher.Created += this.OnCreated;
				this.DirWatcher.Renamed += this.OnRenamed;
				//this.DirWatcher.Changed += this.OnChanged; // This event seems to be useful, will fire if an internal folder changes
				this.DirWatcher.Deleted += this.OnDeleted;
			}

		}

		~BrowserSocket()
		{
			this.Dispose();
		}

		public void Dispose()
		{
			this.Context.WebSocket.CloseAsync(System.Net.WebSockets.WebSocketCloseStatus.NormalClosure, "Disposed", System.Threading.CancellationToken.None);
			this.DirWatcher.Dispose();
		}

		public async void SendDir() {
			try
			{
				await this.SendAes(Json.Encode(new ServerMessage()
				{
					Command = "dir",
					Contents = ServerCommand.Dir(this.DirWatcher.Path)
				}));
			}
			catch (Exception e)
			{
				this.SendServerError(e);
			}
		}

		public void ClientMkdirRequest(string content)
		{
			if (this.DirWatcher.AllowedPath())
			{
				try { 
					ServerCommand.Mkdir(this.DirWatcher.Path, content);
				}
				catch (Exception e)
				{
					this.SendServerError(e);
				}
			}
		}

		public void ClientRenameRequest(Dictionary<string, string> contents)
		{
			if (this.DirWatcher.AllowedPath() && contents.TryGetValue("Old", out string oldName) && contents.TryGetValue("New", out string newName)) {
				try
				{
					ServerCommand.Rename(this.DirWatcher.Path, oldName, newName);
				}
				catch (Exception e)
				{
					this.SendServerError(e);
				}
			}

		}

		public void ClientDeleteRequest(string content)
		{
			if (this.DirWatcher.AllowedPath())
			{
				try
				{
					ServerCommand.Delete(this.DirWatcher.Path, content);
				}
				catch (Exception e)
				{
					this.SendServerError(e);
				}
			}
		}

		public async void GetFile(Dictionary<string,string> contents)
		{
			if (contents.TryGetValue("Name", out string name) && contents.TryGetValue("FileRequestID", out string fileRequestId)) {
				string path = this.DirWatcher.Path + @"\" + name;
				if (this.DirWatcher.AllowedPath(path))
				{
					try
					{
						using (FileStream fs = ServerCommand.GetFile(path))
						{
							FileInfo fi = new FileInfo(path);
							FileRequest fr = new FileRequest(fileRequestId);
							int offset = 0;
							int bufferSize = WebSocketManager.BUFFER_SIZE;

							await this.SendAes(Json.Encode(new ServerMessage()
							{
								Command = "filerequestinit",
								Contents = new Dictionary<string, string>(2)
								{
									{ "FileRequestID", fileRequestId },
									{ "s", (fi.Length / (long) bufferSize).ToString() }
								}
							}));


							int bytesRead = bufferSize;
							while (bytesRead == bufferSize)
							{
								byte[] buffer = new byte[bufferSize];
								bytesRead = fs.Read(buffer, offset, bufferSize);
								if (bytesRead < bufferSize)
								{
									byte[] smallBuff = new byte[bytesRead];
									for (int i = 0; i < bytesRead; i++)
									{
										smallBuff[i] = buffer[i];
									}
									buffer = smallBuff;
								}

								fr.Data = System.Convert.ToBase64String(buffer);
								fr.Complete = bytesRead != bufferSize;
								await this.SendAes(Json.Encode(new ServerMessage()
								{
									Command = "filerequest",
									Contents = fr
								}));
								fr.segmentNum++;
							}
							fs.Close();
						}
					}
					catch (Exception e)
					{
						this.SendServerError(e);
					}
				}
			}
		}

		public void InitClientFileUpload(Dictionary<string, string> contents)
		{
			if (contents.TryGetValue("i", out string fileUploadId)
				&& contents.TryGetValue("n", out string name)
				&& contents.TryGetValue("c", out string segmentCount)
			) {
				if (this.DirWatcher.AllowedPath(this.DirWatcher.Path + @"\" + name))
				{
					if (!this.FileUploadBuffer.TryAdd(fileUploadId, new FileUpload<int, string>(name, this.DirWatcher.Path, fileUploadId, int.Parse(segmentCount))))
					{
						this.SendServerError(new Exception("File upload error: Upload ID already exists, pelase try again!"));
					}
					this.FileUploadBuffer.TryGetValue(fileUploadId, out FileUpload<int, string> upload);
					SpinWait.SpinUntil(() => upload.Done);
					//this.SendServerAlert(name + " finished uploading.");
					this.SendServerUploadComplete(upload.FileUploadID);
					this.FileUploadBuffer.TryRemove(fileUploadId, out FileUpload<int, string> deletedUpload);
				}
				else
				{
					this.SendServerError(new Exception("File upload error: Path not allowed!"));
				}
			}
		}

		public void ClientFileUpload(Dictionary<string, string> contents)
		{
			if (contents.TryGetValue("i", out string fileUploadId)
				&& contents.TryGetValue("d", out string fileData)
				&& contents.TryGetValue("s", out string segmentNum)
			) {
				long endTicks = (DateTime.Now.AddSeconds(3)).Ticks;
				SpinWait.SpinUntil(() => (
					this.FileUploadBuffer.ContainsKey(fileUploadId) ||
					DateTime.Now.Ticks > endTicks
				));

				if (this.FileUploadBuffer.TryGetValue(fileUploadId, out FileUpload<int, string> fileUpload))
				{
					if (fileUpload.WriteWorker.Status == TaskStatus.Created) {
						fileUpload.WriteWorker.Start();
					}
					fileUpload.TryAdd(int.Parse(segmentNum), fileData);
				}
				else {
					if (DateTime.Now.Ticks > endTicks)
					{
						this.SendServerError(new Exception("File upload error: Thread timeout, no KVP created."));
					}
					else
					{
						this.SendServerError(new Exception("File upload error: TryGetValue error!"));
					}
				}
			}
			return;
		}

		/**
		 * e.FullPath; // Contains the FUll path to the new thing
		 * e.Name; // COntains the name of the new thing
		 * source.Path // Contains the cwd of the new thing
		 * 
		 */
		public void OnCreated(object source, FileSystemEventArgs e)
		{
			FileAttributes attr = File.GetAttributes(e.FullPath);
			var item = new ServerMessage() {
				Command = "created"
			};
			//detect whether its a directory or file
			if ((attr & FileAttributes.Directory) == FileAttributes.Directory)
			{ // Is a directory
				item.Contents = new BrowserDirectory(e.FullPath);
			}
			else
			{ // Is a file
				item.Contents = new BrowserFile(e.FullPath);
			}
			Task.Run(() => this.SendAes(Json.Encode(item)));

		}

		/**
		 * e.FullPath; // Contains the FUll path to the new thing
		 * e.Name; // COntains the name of the new thing
		 * source.Path // Contains the cwd of the new thing
		 * 
		 */
		public void OnDeleted(object source, FileSystemEventArgs e)
		{
			Task.Run(() => this.SendAes(Json.Encode(new ServerMessage
			{
				Command = "deleted",
				Content = Utilities.Idify(e.Name)
			})));
		}

		/**
		 * e.ChangeType	Renamed	System.IO.WatcherChangeTypes
		 * e.FullPath	"C:\\inetpub\\moriaSocket\\directories\\New Name"	string
		 * e.Name	"New Name"	string
		 * e.OldFullPath	"C:\\inetpub\\moriaSocket\\directories\\New folder (2)"	string
		 * e.OldName	"New folder (2)"	string
		 * 
		 */
		public void OnRenamed(object source, RenamedEventArgs e)
		{
			FileAttributes attr = File.GetAttributes(e.FullPath);
			var item = new ServerMessage()
			{
				Command = "renamed"
			};
			//detect whether its a directory or file
			if ((attr & FileAttributes.Directory) == FileAttributes.Directory)
			{ // Is a directory
				item.Contents = new Dictionary<string, BrowserDirectory>(2) {
					{ "before", new BrowserDirectory(e.OldFullPath) },
					{ "after", new BrowserDirectory(e.FullPath) }
				};
			}
			else
			{ // Is a file
				item.Contents = new Dictionary<string, BrowserFile>(2) {
					{ "before", new BrowserFile(e.OldFullPath) },
					{ "after", new BrowserFile(e.FullPath) }
				};
			}
			Task.Run(() => this.SendAes(Json.Encode(item)));
		}

		public void OnChanged(object source, FileSystemEventArgs e)
		{
			//this.SendAes("File System Updated: " + "File:" + e.FullPath + " ChangeType:" + e.ChangeType);
		}

		public override void ReceiveAesBase64Thread()
		{
			SpinWait.SpinUntil(() => (this.IsReady() && this.IsOpen()));
			while (this.IsOpen())
			{
				try
				{
					string ms = this.GetMessageSecure();
					if (ms.Length > 0)
					{
						ClientMessage message = Json.Decode<ClientMessage>(ms);
						if (message != null)
						{
							switch (message.Command)
							{
								case "dir":
									Task.Run(() => this.SendDir());
									break;
								case "cddir":
									this.DirWatcher.SetFromRelativePath(message.Content);
									string s = this.DirWatcher.Path;
									Task.Run(() => this.SendDir());
									break;
								case "mkdir":
									Task.Run(() => this.ClientMkdirRequest(message.Content));
									break;
								case "getfile":
									Task.Run(() => this.GetFile(message.Contents));
									break;
								case "rename":
									Task.Run(() => this.ClientRenameRequest(message.Contents));
									break;
								case "delete":
									Task.Run(() => this.ClientDeleteRequest(message.Content));
									break;
								case "initfileupload":
									Task.Run(() => this.InitClientFileUpload(message.Contents));
									break;
								case "fileupload":
									Task.Run(() => this.ClientFileUpload(message.Contents));
									break;
							}
							//System.Diagnostics.Debug.WriteLine("Received: " + message);
						}
					}
				} catch (Exception e)
				{
					this.SendServerError(e);
				}
			}

			// Clean up
			WebSocketManager.BrowserSockets.Remove(this.Key);
			this.DirWatcher.Dispose();
		}

		public void SendServerError(Exception e) {
			System.Diagnostics.EventLog.WriteEntry("MoriaSocket", e.Message, System.Diagnostics.EventLogEntryType.Error);
			this.SendAes(Json.Encode(new ServerMessage
			{
				Command = "error",
				Contents = new Dictionary<string, string>(1)
				{
					{ "message", e.Message }
				}
			}));
		}

		public void SendServerAlert(string a)
		{
			this.SendAes(Json.Encode(new ServerMessage
			{
				Command = "alert",
				Contents = new Dictionary<string, string>(1)
				{
					{ "message", a }
				}
			}));
		}

		public void SendServerConsoleLog(string a)
		{
			this.SendAes(Json.Encode(new ServerMessage
			{
				Command = "consolelog",
				Contents = new Dictionary<string, string>(1)
				{
					{ "message", a }
				}
			}));
		}

		public void SendServerUploadComplete(string id)
		{
			this.SendAes(Json.Encode(new ServerMessage
			{
				Command = "uploadcomplete",
				Contents = new Dictionary<string, string>(1)
				{
					{ "id", id }
				}
			}));
		}

	}
}