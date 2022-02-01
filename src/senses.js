const { app, BrowserWindow } = require("electron");

// loading server module
require("./server/app");

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		darkTheme: true,
		fullscreen: true,
		backgroundColor: "#000000",
	});

	mainWindow.loadFile("gui/index.html");

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {
	createWindow();

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", function () {
	if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", (event) => {
	console.log("[Senses - Smart Mirror] - Shutting down server..");
	event.preventDefault();
	process.exit(0);
});
