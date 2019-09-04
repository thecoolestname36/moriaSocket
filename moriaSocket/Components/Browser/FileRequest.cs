using System.Collections.Generic;

namespace moriaSocket.Components.Browser
{
	public class FileRequest
	{

		public bool Complete;
		public string Data;
		public string FileRequestID;
		public System.Int64 segmentNum;

		public FileRequest(string fileRequestId)
		{
			this.FileRequestID = fileRequestId;
			this.segmentNum = 0;
		}

	}
}