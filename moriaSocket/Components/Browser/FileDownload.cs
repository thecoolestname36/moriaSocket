using System;
using System.Collections.Generic;
using System.IO;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;

namespace moriaSocket.Components.Browser
{
	public class FileDownload : FileStream
	{
		public readonly List<string> PreparedFileList;
		public BrowserSocket Socket;

		public FileDownload(BrowserSocket socket, string path, FileMode mode = FileMode.Open, FileAccess access = FileAccess.Read, FileShare share = FileShare.Read) : base(path, mode, access, share)
		{
			Socket = socket;
		}

		public async Task<string> EncryptToString()
		{
			int bufferSize = WebSocketManager.BUFFER_SIZE;
			int segments = (int)Math.Ceiling(((double)this.Length) / ((double)bufferSize));
			List<Task<char[]>> tasks = new List<Task<char[]>>(segments);
			byte[] buffer = new byte[bufferSize];
			int bytesRead = 0;
			while ((bytesRead = this.Read(buffer, 0, buffer.Length)) > 0)
			{

				if (bytesRead < bufferSize)
				{
					Array.Resize(ref buffer, bytesRead);
				}
				tasks.Add(Task.Factory.StartNew( (Object obj) => {

					//char[] payloadCharArr = Convert.ToBase64String(this.Socket.EncryptAes(System.Text.Encoding.UTF8.GetString(obj as byte[]))).ToCharArray();
					char[] payloadCharArr = Convert.ToBase64String(this.Socket.EncryptAes(Convert.ToBase64String(obj as byte[]))).ToCharArray();
					Array.Resize(ref payloadCharArr, payloadCharArr.Length + 1);
					payloadCharArr[payloadCharArr.Length - 1] = ',';
					return payloadCharArr;

				}, buffer.Clone() ));
			}
			
			await Task.WhenAll(tasks);
			this.Flush();

			long count = 0;
			for (int i = 0; i < segments; i++)
			{
				count += tasks[i].Result.Length;
			}
			char[] payload = new char[count];
			long index = 0;
			for (int i = 0; i < segments; i++)
			{
				for (int j = 0, jMax = tasks[i].Result.Length; j < jMax; j++)
				{
					payload[index] = tasks[i].Result[j];
					index++;
				}

				tasks[i].Dispose();
			}

			return new string(payload);

		}

		public static bool AllowedPath(string basePath, string path = "")
		{
			bool result = false;
			if (!path.Contains(".."))
			{
				try
				{
					var candidateInfo = new DirectoryInfo(basePath + System.IO.Path.DirectorySeparatorChar + path);
					var otherInfo = new DirectoryInfo(basePath);

					while (candidateInfo.Parent != null)
					{
						if (candidateInfo.Parent.FullName == otherInfo.FullName || candidateInfo.FullName == otherInfo.FullName)
						{
							result = true;
							break;
						}
						else candidateInfo = candidateInfo.Parent;
					}
				}
				catch (System.Exception error)
				{
					var message = string.Format("Unable to check directories {0} and {1}: {2}", path, basePath, error);
					System.Diagnostics.Trace.WriteLine(message);
				}
			}
			return result;
		}

	}
}