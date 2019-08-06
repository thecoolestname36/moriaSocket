using System.Collections.Generic;

namespace moriaSocket.Components.Browser
{
	public class FileRequest
	{

		public bool Complete;
		public string Data;
		public string FileRequestID;

		public FileRequest(string fileRequestId)
		{
			this.FileRequestID = fileRequestId;
		}

	}
}