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
		var startTime = (new Date()).getTime();
		var index = 0;
		var fileLength = file.length;
		var segmentSize = 256;
		var fileUploadId = this.FileUploadID;
		//console.log("SendFileUploadBase64: initfileupload");
		var m = new ClientMessage();
		m.Command = "initfileupload";
		m.Contents = {
			i: fileUploadId,
			n: name, // name
			c: Math.ceil((fileLength / segmentSize)) // segmentCount
		};
		var segmentHundredth = Math.floor(m.Contents.c / 100);
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
			if ((m.Contents.s % segmentHundredth) === 0) {
				var message = Number.parseInt(((index / fileLength) * 100)) + "%";
				document.LoadingOverlay.SetMessage(message);
			}


			m.Contents.s++;
		} while (index < fileLength);
		document.LoadingOverlay.SetMessage("Finalizing...");
		console.log("Duration: " + ((new Date()).getTime() - startTime));
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
					document.FileRequests[serverMessage.Contents.FileRequestID].HandleData(serverMessage.Contents.Data, Number.parseInt(serverMessage.Contents.segmentNum), serverMessage.Contents.Complete);
					//if (serverMessage.Contents.Complete) {
					//	delete document.FileRequests[serverMessage.Contents.Metadata.MessageID];
					//}
					break;
				case "uploadcomplete":
					document.DirectoryExplorer.FileUploadComplete(serverMessage.Contents);
					break;
				case "filerequestinit":
					document.FileRequests[serverMessage.Contents.FileRequestID].Segments = Number.parseInt(serverMessage.Contents.s);
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