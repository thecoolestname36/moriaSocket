class Item {

	_ID;
	get ID() {
		return this._ID;
	}
	set ID(i) {
		this._ID = i;
		this.Elem.id = i;
	}
	_Name;
	get Name() {
		return this._Name;
	}
	set Name(n) {
		this._Name = n;
		this.TextElem.innerText = n;
	}
	get ShortName() {
		return this._Name;
	}
	_Icon;
	get Icon() {
		return this._Icon;
	}
	set Icon(i) {
		this._Icon = i;
		this.ImgElem.src = "/Content/Images/" + i;
	}
	_IconClass;
	get IconClass() {
		return this._IconClass;
	}
	set IconClass(ic) {
		this._IconClass = ic;
		this.ImgElem.className = "col-12 " + ic;
	}

	Elem;
	ButtonElem;
	ImgElem;
	TextElem;
	Extension;
	Type;

	constructor(id, item) {
		this._ID = id;
		this._Name = item.Name;
		this.Extension = "";
		this.Type = item.Type;

		this.Elem = document.createElement("div");
		this.Elem.id = this._ID;
		this.Elem.className = "browser-item-large col-xs-4 col-sm-3 col-md-2 col-xl-1";
		this.TextElem = document.createElement("div");
		this.TextElem.className = "browser-button-text col-12";
		this.TextElem.innerText = this._Name;
		this.ButtonElem = document.createElement("button");
		this.ButtonElem.className = "row button-glass browser-button";
		this.ButtonElem.setAttribute("oncontextmenu", "document.DirectoryExplorer.ActionItemRightClick(event, this);");
		this.ImgElem = document.createElement("img");
		this.ImgElem.className = "col-12 browser-image-icon";

		this.ButtonElem.appendChild(this.ImgElem);
		this.ButtonElem.appendChild(this.TextElem);
		this.Elem.appendChild(this.ButtonElem);

	}

}