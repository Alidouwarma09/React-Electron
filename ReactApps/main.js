const { app, BrowserWindow, Menu, Notification } = require("electron");
const path = require("path");
const fs = require("fs");
const express = require("express");

let splash, mainWindow;
const PORT = 3000;

// ------------------- SPLASH SCREEN -------------------
function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
  });

  splash.loadFile(path.join(__dirname, "animations/splash.html"));
}

// ------------------- MAIN WINDOW -------------------
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1524,
    height: 668,
    minWidth: 1024,
    minHeight: 768,
    show: false,
    icon: path.join(__dirname, "icon.png"),
    
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.setTitle("My APP");
  });

  Menu.setApplicationMenu(null);

  // ------------------- SERVIR DIST VIA EXPRESS -------------------
  const server = express();
  server.use(express.static(path.join(__dirname, "dist")));

  // ✅ Démarrer le serveur puis charger la fenêtre
  server.listen(PORT, () => {
    console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
    mainWindow.loadURL(`http://localhost:${PORT}`);
  });

  // ------------------- SPLASH + SHOW -------------------
  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      if (splash) splash.close();
      mainWindow.show();
    }, 2500);
  });

  // ------------------- BARRE DE PROGRESSION -------------------
  mainWindow.webContents.on("did-start-loading", () => {
    mainWindow.setProgressBar(0.1);
  });

  mainWindow.webContents.on("did-stop-loading", () => {
    mainWindow.setProgressBar(-1);
  });

  // ------------------- GESTION DES ÉCHECS DE CHARGEMENT -------------------
  mainWindow.webContents.on("did-fail-load", (event, code, desc, url) => {
    console.log("❌ Échec du chargement :", code, desc, url);
  });

  // ------------------- MENU CONTEXTUEL -------------------
  const menuTemplate = [
    {
      label: "⬅️  Retour",
      accelerator: "Alt+Left",
      click: () => {
        if (mainWindow.webContents.canGoBack()) {
          mainWindow.webContents.goBack();
        }
      },
    },
    {
      label: "🔄  Actualiser",
      accelerator: "F5",
      click: () => {
        mainWindow.webContents.reload();
      },
    },
    {
      label: "🔽  Réduire",
      accelerator: "Ctrl+M",
      click: () => {
        mainWindow.minimize();
      },
    },
    {
      label: "❌  Quitter",
      role: "quit",
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

  // --- MENU CONTEXTUEL ---
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "⬅️  Retour",
      click: () => {
        if (mainWindow.webContents.canGoBack()) {
          mainWindow.webContents.goBack();
        }
      },
    },
    {
      label: "🔄  Actualiser",
      click: () => {
        mainWindow.webContents.reload();
      },
    },
    {
      label: "🔽  Réduire",
      click: () => {
        mainWindow.minimize();
      },
    },
  ]);



  mainWindow.webContents.on("context-menu", () => {
    contextMenu.popup();
  });
}

// ------------------- APP READY -------------------
app.whenReady().then(() => {
  createSplash();
  createMainWindow();
});

// ------------------- QUITTER -------------------
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
