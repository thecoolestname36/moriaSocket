class DirectoryExplorer {

	Explorer;
	Contents;
	Cwd;
	Navbar;
	PreviewOverlay;
	EncryptDownloads;
	EncryptDownloadsArticle;

	constructor() {
		this.Contents = {};
		this.EncryptDownloads = {};
		this.Explorer = document.getElementById("DirectoryExplorer");
		this.EncryptDownloadsArticle = document.getElementById("EncryptDownloads");
		this.Cwd = [new Breadcrumb("\\", 0)];
		this.Navbar = document.getElementById("NavbarPath");
		this.Navbar.appendChild(this.Cwd[this.Cwd.length - 1].ListItemElem);
		this.PreviewOverlay = new PreviewOverlay("preview-overlay");
		history.pushState({}, '');
		window.onpopstate = function () {
			if (!document.RightClickContextMenu.Hidden) {
				document.RightClickContextMenu.Hide();
			} else {
				document.DirectoryExplorer.ActionCdUp();
			}
			history.pushState({}, '');
		};
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

	//ActionFileClickSocket(event, elem) {
	//	document.FileRequests[this.Contents[elem.parentElement.id].FileRequestID] = new FileRequest(
	//		elem.parentElement.id
	//	)
	//	document.Socket.SendGetFile(
	//		this.Contents[elem.parentElement.id].Name,
	//		this.Contents[elem.parentElement.id].FileRequestID
	//	);
	//}

	/**
	 * Use this action for when you would like to encrypt and download the file on a direct click on the file tile.
	 * Example: this.ButtonElem.setAttribute("onclick", "document.DirectoryExplorer.ActionFileClick(event, this);");
	 * @param {any} event
	 * @param {Element} elem
	 */
	ActionFileClick(event, elem) {
		this.Download(elem.parentElement.id);
	}

	Download(id) {
		var form = document.getElementById("DownloadForm");
		form["Wssid"].value = document.Socket.WSSID;
		form["Payload"].value = document.Socket.Security.AesEncrypt(JSON.stringify({
			path: this.GetCwdString(),
			name: this.Contents[id].Name,
			noise: Security.GenerateHexString(Number.parseInt(Math.random() * 128))
		})).ciphertext.toString(CryptoJS.enc.Base64);
		form.submit();
		form["Wssid"].value = "";
		form["Payload"].value = "";
	}

	/**
	 * Gets the file info from the id provided and starts an encrypt and download procedure.
	 * @param {string} id Target 
	 */
	EncryptDownload(id) {
		var downloadId = FileEncryptDownload.MakeFileEncryptDownloadID();
		this.EncryptDownloads[downloadId] = new FileEncryptDownload(
			downloadId,
			this.GetCwdString(),
			this.Contents[id].Name
		);
		this.EncryptDownloadsArticle.appendChild(this.EncryptDownloads[downloadId].Elem);
		this.EncryptDownloadsArticle.classList.remove('hide');
		this.EncryptDownloads[downloadId].AjaxGet();
	}

	ActionItemRightClick(event, elem) {
		event.preventDefault();
		switch(document.DirectoryExplorer.Contents[elem.parentElement.id].Type) {
			case "file": {
				document.RightClickContextMenu.ShowFile(elem.parentElement.id, event.pageX, event.pageY);
				break;
			}
			case "directory": {
				document.RightClickContextMenu.ShowDirectory(elem.parentElement.id, event.pageX, event.pageY);
				break;
			}
		}
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
				var id = document.Socket.FileUploadID;
				document.Socket.FileUpload[id] = btoa(reader.result);
				document.Socket.SendFileUploadBase64(filename, id);
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

	ErrorReceived(contents) {
		alert("Server Error." +"\n" + "Message: " + contents.message);
		console.error("Server Error. Message: ", contents.message);
	}

	AlertReceived(contents) {
		alert("Server Alert." + "\n" + "Message: " + contents.message);
	}

	ConsoleLogReceived(contents) {
		console.log("Server Console Log: ", contents.message);
	}

}