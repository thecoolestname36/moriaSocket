class BrowserSocket extends WebSocketTLS {

	_FileRequestID = 0;
	get FileRequestID() {
		this._FileRequestID++;
		return (this._FileRequestID).toString();
	}
	_FileUploadID = 0;
	get FileUploadID() {
		this._FileUploadID++;
		return (this._FileUploadID).toString();
	}

	constructor(security, url) {
		super(security, url, "browser");
		this.onsecure = function (event) {
			document.Socket.SendCdDir();
		}
		this.onclosed = function (event) {
			document.LoadingOverlay.Show();
		}
	}

	SendDir() {
		document.FileRequests = {};
		document.LoadingOverlay.Show();
		var m = new ClientMessage();
		m.Command = "dir";
		this.SendSecure(JSON.stringify(m));
	}

	SendCdDir() {
		document.FileRequests = {};
		document.LoadingOverlay.Show();
		var m = new ClientMessage();
		m.Command = "cddir";
		m.Content = document.DirectoryExplorer.GetCwdString();
		this.SendSecure(JSON.stringify(m));
	}

	SendMkdir(name) {
		var m = new ClientMessage();
		m.Command = "mkdir";
		m.Content = name;
		this.SendSecure(JSON.stringify(m));
	}

	SendGetFile(name, fileRequestId) {
		var m = new ClientMessage();
		m.Command = "getfile";
		m.Contents = {
			Name: name,
			FileRequestID: fileRequestId
		};
		this.SendSecure(JSON.stringify(m));
	}

	SendRename(oldName, newName) {
		var m = new ClientMessage();
		m.Command = "rename";
		m.Contents = {
			Old: oldName,
			New: newName
		};
		this.SendSecure(JSON.stringify(m));
	}

	SendDelete(name) {
		var m = new ClientMessage();
		m.Command = "delete";
		m.Content = name;
		this.SendSecure(JSON.stringify(m));
	}

	SendFileUploadBase64(name, file) {
		var index = 0;
		var fileLength = file.length;
		var segmentSize = 256;
		var fileUploadId = this.FileUploadID;

		var m = new ClientMessage();
		m.Command = "initfileupload";
		m.Contents = {
			i: fileUploadId,
			n: name, // name
			c: Math.ceil((fileLength / segmentSize)) // segmentCount
		};
		this.SendSecure(JSON.stringify(m));

		m.Command = "fileupload";
		m.Contents = {
			i: fileUploadId,
			d: "", // data
			s: 0 // segmentNum
			
		};
		do {
			m.Contents.d = file.substring(index, index + segmentSize);
			index += segmentSize;
			this.SendSecure(JSON.stringify(m));
			//console.log(index, fileLength);
			m.Contents.s++;
		} while (index < fileLength);

	}

	ReceiveSecure(message) {
		
		try {
			var json = JSON.parse(message);
			var serverMessage = new ServerMessage(json);
			switch (serverMessage.Command) {
				case "dir":
					document.DirectoryExplorer.ServerCommandDir(serverMessage.Contents);
					document.LoadingOverlay.Hide();
					break;
				case "created":
					document.DirectoryExplorer.AddItemToExplorer(serverMessage.Contents);
					break;
				case "deleted":
					document.DirectoryExplorer.RemoveItem(serverMessage.Content);
					break;
				case "renamed":
					document.DirectoryExplorer.Renamed(serverMessage.Contents);
					break;
				case "filerequest":
					document.FileRequests[serverMessage.Contents.FileRequestID].HandleData(serverMessage.Contents.Data, serverMessage.Contents.Complete);
					//if (serverMessage.Contents.Complete) {
					//	delete document.FileRequests[serverMessage.Contents.Metadata.MessageID];
					//}
					break;
				case "alert":
					document.DirectoryExplorer.AlertReceived(serverMessage.Contents);
					break;
				case "error":
					document.DirectoryExplorer.ErrorReceived(serverMessage.Contents);
					break;
			}
		} catch (e) {
			console.log("Exception:", e);
		}	
		
	}
	

}