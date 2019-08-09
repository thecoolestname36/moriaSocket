class DirectoryExplorer {

	Explorer;
	Contents;
	Cwd;
	Navbar;
	PreviewOverlay;

	constructor() {
		this.Contents = {};
		this.Explorer = document.getElementById("DirectoryExplorer");
		this.Cwd = [new Breadcrumb("\\", 0)];
		this.Navbar = document.getElementById("NavbarPath");
		this.Navbar.appendChild(this.Cwd[this.Cwd.length - 1].ListItemElem);
		this.PreviewOverlay = new PreviewOverlay("preview-overlay");
	}

	GetCwdString() {
		var s = "";
		for (var i = 1, l = this.Cwd.length; i < l; i++) {
			s += "\\";
			s += this.Cwd[i].Name;
			
		}
		return s;
	}

	ActionCdHome() {
		for (var i = this.Cwd.length - 1; i >= 1; i--) {
			this.Navbar.removeChild(this.Cwd[i].ListItemElem);
			this.Cwd.pop();
		}
		document.Socket.SendCdDir();
	}

	ActionCdUp() {
		if (this.Cwd.length > 1) {
			this.Navbar.removeChild(this.Cwd[this.Cwd.length - 1].ListItemElem);
			this.Cwd.pop();
			document.Socket.SendCdDir();
		}
	}

	ActionDirClick(event, elem) {
		this.Cwd.push(
			new Breadcrumb(
				this.Contents[elem.parentElement.id].Name,
				this.Cwd.length
			)
		);
		this.Navbar.appendChild(this.Cwd[this.Cwd.length - 1].ListItemElem);
		document.Socket.SendCdDir();
	}

	ActionFileClick(event, elem) {
		//var exists = true;
		//if (!document.FileRequests.hasOwnProperty(this.Contents[elem.parentElement.id].FileRequestID)) {
		//	exists = false;
		//	this.Contents[elem.parentElement.id].FileRequestID = document.Socket.FileRequestID;
		//	document.FileRequests[this.Contents[elem.parentElement.id].FileRequestID] = new FileRequest(
		//		elem.parentElement.id
		//	)
		//	document.Socket.SendGetFile(
		//		this.Contents[elem.parentElement.id].Name,
		//		this.Contents[elem.parentElement.id].FileRequestID
		//	);
			
		//}
		//if (document.FileRequests[this.Contents[elem.parentElement.id].FileRequestID].CanPreview) {
		//	this.PreviewOverlay.Show(elem.parentElement.id);
		//}
		//if (exists) {
		//	document.FileRequests[this.Contents[elem.parentElement.id].FileRequestID].Complete = true;
		//}
		document.FileRequests[this.Contents[elem.parentElement.id].FileRequestID] = new FileRequest(
			elem.parentElement.id
		)
		document.Socket.SendGetFile(
			this.Contents[elem.parentElement.id].Name,
			this.Contents[elem.parentElement.id].FileRequestID
		);
		
	}

	ActionItemRightClick(event, elem) {
		event.preventDefault();
		document.RightClickContextMenu.Show(elem.parentElement.id, event.pageX, event.pageY);
	}

	ActionBreadcrumbClick(event, elem) {
		var numToPop = (this.Cwd.length - 1) - elem.dataset.index;
		if (numToPop > 0) {
			for (var i = 0; i < numToPop; i++) {
				this.Navbar.removeChild(this.Cwd[this.Cwd.length - 1].ListItemElem);
				this.Cwd.pop();
			}
			document.Socket.SendCdDir();
		}
	}

	ActionMkdir() {
		var name = prompt("Enter New Folder Name:");
		if (name != null) {
			document.Socket.SendMkdir(name);
		}
	}

	ServerCommandDir(contents) {
		this.RemoveContents();

		for (var i in contents) {
			this.AddItemToExplorer(contents[i]);
		}
	}

	AddItemToExplorer(item) {
		if (item.Type == "directory") {
			this.Contents[item.ID] = new DirectoryItem(item.ID, item);
		} else {
			this.Contents[item.ID] = new FileItem(item.ID, item);
		}
		this.Explorer.append(this.Contents[item.ID].Elem);
	}

	RemoveContents() {

		for (var i in this.Contents) {
			document.getElementById(i).remove();
			delete this.Contents[i];
		}

	}

	RemoveItem(id) {
		document.getElementById(id).remove();
		delete this.Contents[id];
	}

	Renamed(contents) {
		this.Contents[contents.before.ID].Elem.parentElement.removeChild(this.Contents[contents.before.ID].Elem);
		delete this.Contents[contents.before.ID];
		this.AddItemToExplorer(contents.after);
	}

	DrawExplorer() {
		for (var i in this.Contents) {
			this.Explorer.append(this.Contents[i].Elem);
		}
	}

	ActionUpload(event, that) {
		var input = document.createElement("input");
		input.type = "file";
		input.onchange = function () {
			var file = this.files[0];
			var filename = this.files[0].name;
			var reader = new FileReader();
			reader.readAsBinaryString(file);
			//reader.onprogress = function (event) {}
			reader.onload = function () {
				document.LoadingOverlay.Show();
				document.LoadingOverlay.SetMessage("Parsing Upload...");
				document.Socket.SendFileUploadBase64(filename, btoa(reader.result));
			};
			reader.onerror = function (error) {
				document.LoadingOverlay.Hide();
				document.LoadingOverlay.ClearMessage("");
				alert('Error: ', error);
			};
			
			
		};
		//document.getElementById("file-uploads").appendChild(input);
		//document.getElementById("file-uploads").firstElementChild.click();
		input.click(); // This is causing errors and will only sometimes fire the onchange event.
	}

	FileUploadComplete(contents) {
		document.LoadingOverlay.Hide();
		document.LoadingOverlay.ClearMessage("");
	}

	ErrorReceived(contents) {
		alert("Server Error." +"\n" + "Message: " + contents.message);
	}

	AlertReceived(contents) {
		alert("Server Alert." + "\n" + "Message: " + contents.message);
	}


}