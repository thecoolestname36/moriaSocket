using System.IO;
using System.Collections.Generic;

namespace moriaSocket.Components.Browser
{
	public static class ServerCommand
	{

		public static Dictionary<string, object> Dir(string path)
		{
			Dictionary<string, object> contents = new Dictionary<string, object>();

			string[] dirs = Directory.GetDirectories(path);
			for (int i = 0, l = dirs.Length; i < l; i++)
			{
				BrowserDirectory item = new BrowserDirectory(dirs[i]);
				contents.Add(item.ID, item);
			}
			string[] files = Directory.GetFiles(path);
			for (int i = 0, l = files.Length; i < l; i++)
			{
				BrowserFile item = new BrowserFile(files[i]);
				contents.Add(item.ID, item);
			}
			return contents;
		}

		public static bool Mkdir(string path, string name)
		{
			bool result = false;
			DirectoryInfo newDir = new DirectoryInfo(name);
			DirectoryInfo info = Directory.CreateDirectory(path + @"\" + newDir.Name);
			if (Directory.Exists(info.FullName)) {
				if (info.Exists)
				{
					result = true;
				}
			}
			return result;
		}

		public static FileStream GetFile(string path)
		{
			//byte[] file = File.ReadAllBytes(fullPath);
			return File.Open(path, FileMode.Open, FileAccess.Read, FileShare.Read);
			//return file;
			
		}

		public static void Rename(string path, string oldName, string newName)
		{
			string target = path + @"\" + oldName;
			string destination = path + @"\" + newName;
			if (File.Exists(target))
			{
				File.Move(target, destination);
			} else if (Directory.Exists(target))
			{
				Directory.Move(target, destination);
			}
		}

		/**
		 * @throws DirectoryNotEmptyException
		 */
		public static void Delete(string path, string name)
		{
			string target = path + @"\" + name;
			if (File.Exists(target))
			{
				File.Delete(target);
			} else if (Directory.Exists(target))
			{
				Directory.Delete(target);
			}
		}


	}
}