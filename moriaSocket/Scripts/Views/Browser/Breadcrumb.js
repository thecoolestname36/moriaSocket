class Breadcrumb {

	_Name;
	get Name() {
		return this._Name;
	};
	set Name(n) {
		this._Name = n;
		this.ButtonElem.innerText = this._Name;
	}
	_Index;
	get Index() {
		return this._Index;
	}
	set Index(i) {
		this._Index = i;
		this.ButtonElem.setAttribute("data-index", this._Index);
	}

	ListItemElem;
	ButtonElem;

	constructor(name, index) {
		this.ListItemElem = document.createElement("li");
		this.ListItemElem.className = "nav-item breadcrumbs-item";
		this.ButtonElem = document.createElement("button");
		this.ButtonElem.className = "nav-link breadcrumbs-link";
		this.ButtonElem.setAttribute("onclick", "document.DirectoryExplorer.ActionBreadcrumbClick(event, this);");
		this.ListItemElem.appendChild(this.ButtonElem);
		this.Name = name;
		this.Index = index;
	}

}