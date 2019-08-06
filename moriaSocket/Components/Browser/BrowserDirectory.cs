using System.IO;

namespace moriaSocket.Components.Browser
{
	public struct BrowserDirectory
	{
		public string Type;
		public string ID;
		public string Name;
		public string Path;


		public BrowserDirectory(string path)
		{
			this.Type = "directory";
			DirectoryInfo info = new DirectoryInfo(path);
			this.Name = info.Name;
			this.Path = info.FullName;
			this.ID = Utilities.Idify(info.Name);
		}

	}
}