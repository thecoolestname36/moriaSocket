using System.IO;
using System.Threading;

namespace moriaSocket.Components.Browser
{
	public class BrowserDirectoryWatcher : FileSystemWatcher
	{
		public string KeyName;
		public string BasePath;

		public BrowserDirectoryWatcher(string StartDirectory) : base(StartDirectory)
		{
			this.BasePath = StartDirectory;
			this.EnableRaisingEvents = true;
			this.IncludeSubdirectories = false;
		}

		public string GetRelativePath() {
			return this.Path.Remove(0, this.BasePath.Length);
		}

		public void SetFromRelativePath(string relPath) {
			string tempPath = this.BasePath + relPath;
			if (this.AllowedPath(tempPath)) {
				this.Path = tempPath;
			}
			
		}

		public bool AllowedPath(string path = "") {
			if (path.Length == 0) {
				path = this.Path;
			}

			bool result = false;
			if (!path.Contains(".."))
			{
				try
				{
					var candidateInfo = new DirectoryInfo(path);
					var otherInfo = new DirectoryInfo(this.BasePath);

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
					var message = string.Format("Unable to check directories {0} and {1}: {2}", path, this.BasePath, error);
					System.Diagnostics.Trace.WriteLine(message);
				}
			}
			return result;
		}

		public void OnOther(object source, FileSystemEventArgs e)
		{
		}

	}
}