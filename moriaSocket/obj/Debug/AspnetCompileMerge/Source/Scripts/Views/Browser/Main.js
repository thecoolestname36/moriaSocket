document.DirectoryExplorer = false;
document.LoadingOverlay = new LoadingOverlay("loading-overlay");
document.RightClickContextMenu = new RightClickContextMenu("right-click-context-menu");
document.onclick = function () {
	document.RightClickContextMenu.ActionHideContextMenu();
};

(document.Main = function () {
	document.LoadingOverlay.Show();
	if (document.DirectoryExplorer === false) {
		document.DirectoryExplorer = new DirectoryExplorer();
	}
	document.FileRequests = {};
	document.Socket = new BrowserSocket(new Security(256, 128), "wss://moria.sradzone.com/Browser/OpenBrowser");

})();
