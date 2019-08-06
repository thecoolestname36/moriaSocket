class FileRequest {

	ContentsID;
	_Complete;
	get Complete() {
		return this._Complete;
	}
	set Complete(c) {
		this._Complete = c;
		if (this._Complete == true) {
			this.OnComplete();
		}
	}
	MIMEString = "data:;base64";
	Data;
	get MIMEData() {
		return this.MIMEString + "," + this.Data;
	}
	CanPreview = true;

	constructor(contentsId) {
		this.ContentsID = contentsId;
		this.Data = "";
		switch (document.DirectoryExplorer.Contents[this.ContentsID].Extension.toLowerCase()) {
			case ".jpg":
				this.MIMEString = "data:image/jpeg;base64";
				break;
			case ".jpeg":
				this.MIMEString = "data:image/jpeg;base64";
				break;
			case ".png":
				this.MIMEString = "data:image/png;base64";
				break;
			case ".mp4":
				this.MIMEString = "data:video/mp4;base64";
				break;
			default:
				this.CanPreview = false;
		}
	}

	HandleData(data, complete) {
		this.Data += data;
		this.Complete = complete;
	}

	// Need to create a dictionary of the mime typtes here (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)
	// with those we can inject the mime type eg. 'image/jpeg' when a extension of '.jpg' or '.jpeg' comes along
	// ...... Or less is better?  The default seems to download anything I throw at it, besides this 17mb video.
	OnComplete() {

		switch (document.DirectoryExplorer.Contents[this.ContentsID].Extension.toLowerCase()) {
			case ".jpeg":
				document.DirectoryExplorer.PreviewOverlay.Img();
				break;
			case ".jpg":
				document.DirectoryExplorer.PreviewOverlay.Img();
				break;
			case ".png":
				document.DirectoryExplorer.PreviewOverlay.Img();
				break;
			case ".mp4":
				document.DirectoryExplorer.PreviewOverlay.Mp4();
				break;
			default:
				var a = document.createElement("a");
				a.setAttribute("download", document.DirectoryExplorer.Contents[this.ContentsID].Name);
				a.href = this.MIMEData;
				a.click();
		}
		
		
	}

}