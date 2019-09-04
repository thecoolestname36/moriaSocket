class DirectoryItem extends Item {

	constructor(id, dir) {
		super(id, dir);
		this.Icon = "folder-open-outline-filled-icon.png";
		this.IconClass = "directory-image-icon";
		this.ButtonElem.setAttribute("onclick", "document.DirectoryExplorer.ActionDirClick(event, this);");
		
	}

}