class FileItem extends Item {

	FileRequestID = 0;
	get ShortName() {
		return this._Name.substring(0, this._Name.length - this.Extension.length);
	}

	constructor(id, file) {
		super(id, file);
		this.Icon = "file-icon.png";
		this.IconClass = "file-image-icon";
		this.ButtonElem.setAttribute("onclick", "document.DirectoryExplorer.ActionFileClick(event, this);");
		this.Extension = file.Extension;
	}

}