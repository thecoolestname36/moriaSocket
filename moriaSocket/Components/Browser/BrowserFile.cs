using System.IO;

namespace moriaSocket.Components.Browser
{
	public struct BrowserFile
	{
		public string Type;
		public string ID;
		public string Name;
		public string Path;
		public string Extension;


		public BrowserFile(string path)
		{
			this.Type = "file";
			FileInfo info = new FileInfo(path);
			this.Name = info.Name;
			this.Extension = info.Extension.ToLower();
			this.Path = info.DirectoryName;
			this.ID = Utilities.Idify(this.Name);
			
		}

	}
}