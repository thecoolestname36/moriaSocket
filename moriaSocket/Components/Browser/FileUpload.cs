using System.Collections.Concurrent;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System;

namespace moriaSocket.Components.Browser
{

	public class FileUpload<TKey, TValue> : ConcurrentDictionary<int, string>
	{
		//public ConcurrentDictionary<int, string> FileData;
		public string FileName;
		public string Path;
		public string FileUploadID;
		public int SegmentCount;
		public FileStream Stream;
		public int WriteIndex = 0;
		public Task WriteWorker;

		public bool Done = false;

		public FileUpload(string n, string p, string id, int sC) : base(WebSocketManager.CollectionConcurrency, sC) {
			this.FileName = n;
			this.Path = p;
			this.FileUploadID = id;
			this.SegmentCount = sC;

			this.WriteWorker = new Task(this.FileWriteJob);

		}

		public void FileWriteJob() {
			this.Stream = new FileStream(this.Path + @"\" + this.FileName, FileMode.Create);
			int currentIndex = 0;
			try
			{
				while (currentIndex < this.SegmentCount)
				{
					SpinWait.SpinUntil(() => this.ContainsKey(currentIndex));
					this.TryGetValue(currentIndex, out string value);
					this.TryUpdate(currentIndex, "", value);
					byte[] buff = System.Convert.FromBase64String(value);
					this.Stream.Write(buff, 0, buff.Length);
					currentIndex++;
				}
			}
			catch (Exception e) {
				string m = e.Message;
			}

			this.Stream.Flush();
			this.Stream.Close();
			this.Done = true;
		}

		~FileUpload() {
			//this.Stream.Close();
			//this.Stream.Dispose();
		}


	}
}