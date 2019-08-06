class PreviewOverlay {

	Elem;
	ItemContainer;
	Item = false;
	OnClass = "preview";
	ContentID = "";

	constructor(id) {
		this.Elem = document.getElementById(id);
		this.ItemContainer = document.getElementById(id + "-item-container");
	}

	Show(contentId) {
		this.ContentID = contentId;
		document.getElementById(this.Elem.id).className = this.OnClass;
	}

	Img() {
		this.Item = document.createElement("img");
		this.Item.className = "preview-overlay-item";
		this.Item.alt = document.DirectoryExplorer.Contents[this.ContentID].Name;
		this.Item.src = document.FileRequests[document.DirectoryExplorer.Contents[this.ContentID].FileRequestID].MIMEData;
		this.ItemContainer.appendChild(this.Item);
	}

	Mp4() {
		this.Item = document.createElement("video");
		this.Item.className = "preview-overlay-item";
		this.Item.setAttribute("controls", "");
		var source = document.createElement("source");
		source.setAttribute("type", "video/mp4");
		source.src = document.FileRequests[document.DirectoryExplorer.Contents[this.ContentID].FileRequestID].MIMEData;
		this.Item.appendChild(source);
		this.ItemContainer.appendChild(this.Item);
	}
	
	LoadMp4Source(data) {
		
	}

	Hide() {
		this.ContentID = "";
		document.getElementById(this.Elem.id).className = "";
	}

	ActionClose(event, elem) {
		this.Hide();
		if (this.ItemContainer.hasChildNodes) {
			this.ItemContainer.removeChild(this.Item);
		}
		delete this.Item;
		this.Item = false;
		
	}

	ActionDownload(event, elem) {
		// Seems like I cannot download using this method over 1.5 MB
		// see: https://stackoverflow.com/questions/10473932/browser-html-force-download-of-image-from-src-dataimage-jpegbase64
		var a = document.createElement("a");
		a.setAttribute("download", document.DirectoryExplorer.Contents[this.ContentID].Name);
		a.href = document.FileRequests[document.DirectoryExplorer.Contents[this.ContentID].FileRequestID].MIMEData;
		a.click();
	}

}