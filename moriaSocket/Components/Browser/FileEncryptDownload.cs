using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace moriaSocket.Components.Browser
{
	public class FileEncryptDownload : FileStream
	{
		public readonly List<string> PreparedFileList;
		public BrowserSocket Socket;

		public FileEncryptDownload(BrowserSocket socket, string path, FileMode mode = FileMode.Open, FileAccess access = FileAccess.Read, FileShare share = FileShare.Read) : base(path, mode, access, share)
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
	}
}
