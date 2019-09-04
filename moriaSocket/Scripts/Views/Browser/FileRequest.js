class FileRequest {

	Segments;
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
	
	constructor(contentsId) {
		this.CanPreview = true;
		this.ContentsID = contentsId;
		this.Data = [];
		//switch (document.DirectoryExplorer.Contents[this.ContentsID].Extension.toLowerCase()) {
		//	case ".jpg":
		//		this.MIMEString = "data:image/jpeg;base64";
		//		break;
		//	case ".jpeg":
		//		this.MIMEString = "data:image/jpeg;base64";
		//		break;
		//	case ".png":
		//		this.MIMEString = "data:image/png;base64";
		//		break;
		//	case ".mp4":
		//		this.MIMEString = "data:video/mp4;base64";
		//		break;
		//	default:
		//		this.CanPreview = false;
		//}
		this.CanPreview = false;
		document.LoadingOverlay.Show();
		// THE BELOW IS A HOTFIX FOR THE IMAGES NOT LOADING THE BEST ALWAYS
		
		// DELETE WHEN COMPLETED
	}

	HandleData(data, segmentNum, complete) {
		var message = Number.parseInt((segmentNum / this.Segments) * 100) + "%";
		if (message != document.LoadingOverlay.Message) {
			document.LoadingOverlay.SetMessage(message);
		}
		this.Data[segmentNum] = data;
		this.Complete = complete;
	}

	// Need to create a dictionary of the mime typtes here (https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types)
	// with those we can inject the mime type eg. 'image/jpeg' when a extension of '.jpg' or '.jpeg' comes along
	// ...... Or less is better?  The default seems to download anything I throw at it, besides this 17mb video.
	OnComplete() {

		var data = "";
		for (var i = 0, max = this.Data.length; i < max; i++) {
			data += this.Data[i];
			delete this.Data[i];
		}


		//switch ("") {//document.DirectoryExplorer.Contents[this.ContentsID].Extension.toLowerCase()) {
		//	case ".jpeg":
		//		document.DirectoryExplorer.PreviewOverlay.Img();
		//		break;
		//	case ".jpg":
		//		document.DirectoryExplorer.PreviewOverlay.Img();
		//		break;
		//	case ".png":
		//		document.DirectoryExplorer.PreviewOverlay.Img();
		//		break;
		//	case ".mp4":
		//		document.DirectoryExplorer.PreviewOverlay.Mp4();
		//		break;
		//	default:
		//		var a = document.createElement("a");
		//		a.setAttribute("download", document.DirectoryExplorer.Contents[this.ContentsID].Name);
		//		a.href = "data:;base64" + "," + data;
		//		document.body.appendChild(a);
		//		a.click();
		//		document.body.removeChild(a);
		//}



		var byteString = atob(data);
		data = "";
		var ab = new ArrayBuffer(byteString.length);
		var ia = new Uint8Array(ab);

		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		var a = document.createElement("a");
		a.setAttribute("download", document.DirectoryExplorer.Contents[this.ContentsID].Name);
		a.href = window.URL.createObjectURL(new Blob([ab], { type: '' }));
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);

		//var contentsId = this.ContentsID;
		//var ext = document.DirectoryExplorer.Contents[this.ContentsID].Extension.toLowerCase();
		//var pageImage = new Image();
		//pageImage.src = this.MIMEString + "," + data;
		//pageImage.onload = function () {
		//	const canvas = document.createElement('canvas');
		//	canvas.width = pageImage.naturalWidth;
		//	canvas.height = pageImage.naturalHeight;

		//	const ctx = canvas.getContext('2d');
		//	ctx.imageSmoothingEnabled = false;
		//	ctx.drawImage(pageImage, 0, 0);
		//	console.log(canvas, pageImage);
		//	let fileName = contentsId;
		//	const link = document.createElement('a');
		//	link.download = fileName + ext;
		//	console.log(canvas)
		//	canvas.toBlob(function (blob) {
		//		console.log(blob)
		//		link.href = URL.createObjectURL(blob);
		//		link.click();
		//	});
		//}


		//window.location.href = this.MIMEString + "," + data;
		document.LoadingOverlay.Hide();
		document.LoadingOverlay.ClearMessage("");
	}

}