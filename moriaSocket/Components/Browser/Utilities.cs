using System.IO;

namespace moriaSocket.Components.Browser
{
	public static class Utilities
	{

		public static string Idify(string s) {
			s = s.Replace(' ', '_');
			return s;
		}

		public static bool AllowedPath(string basePath, string path = "") {
			bool result = false;
			if(!path.Contains("..")) {
				try {
					var candidateInfo = new DirectoryInfo(basePath + System.IO.Path.DirectorySeparatorChar + path);
					var otherInfo = new DirectoryInfo(basePath);

					while(candidateInfo.Parent != null) {
						if(candidateInfo.Parent.FullName == otherInfo.FullName || candidateInfo.FullName == otherInfo.FullName) {
							result = true;
							break;
						} else candidateInfo = candidateInfo.Parent;
					}
				} catch(System.Exception error) {
					var message = string.Format("Unable to check directories {0} and {1}: {2}", path, basePath, error);
					System.Diagnostics.Trace.WriteLine(message);
				}
			}
			return result;
		}

	}
}
