const { app, BrowserWindow, ipcMain, dialog, Menu, Notification } = require("electron");
const path = require("path");
const fs = require("fs");

let splash, mainWindow;

function createSplash() {
  splash = new BrowserWindow({
    width: 600,
    height: 500,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
  });

  splash.loadFile(path.join(__dirname, "contain/animations/splash.html"));
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1524,
    height: 668,
    title: "mon app",
    minWidth: 1024,
    minHeight: 768,
    show: false,
    icon: path.join(__dirname, "contain/img.png"),
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, "contain/index.html"));

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.setTitle("My APP");
  });

  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      splash.close();
      mainWindow.show();
    }, 6000);
  });

  // --- BARRE DE PROGRESSION ---
  mainWindow.webContents.on("did-start-loading", () => {
    mainWindow.setProgressBar(0.1);
  });

  mainWindow.webContents.on("did-stop-loading", () => {
    mainWindow.setProgressBar(-1);
  });

  // --- MENU GLOBAL ---
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

  // --- GESTION DES TÉLÉCHARGEMENTS ---
  mainWindow.webContents.session.on("will-download", (event, item) => {
    const downloadsDir = path.join(app.getPath("downloads"), "DOWNLOAD_DOSSIER");
    if (!fs.existsSync(downloadsDir)) fs.mkdirSync(downloadsDir);

    const filename = item.getFilename();
    let savePath = path.join(downloadsDir, filename);
    let counter = 1;

    while (fs.existsSync(savePath)) {
      const parsed = path.parse(filename);
      savePath = path.join(downloadsDir, `${parsed.name}(${counter})${parsed.ext}`);
      counter++;
    }

    item.setSavePath(savePath);

    item.on("updated", (event, state) => {
      if (state === "progressing" && !item.isPaused()) {
        const progress = item.getReceivedBytes() / item.getTotalBytes();
        mainWindow.setProgressBar(progress);
      }
    });

    item.once("done", (event, state) => {
      mainWindow.setProgressBar(-1);
      if (state === "completed") {
        new Notification({
          title: "My APP",
          body: `${filename} a été téléchargé dans le dossier DOWNLOAD_DOSSIER.`,
        }).show();
      } else {
        new Notification({
          title: "MY APP - Erreur",
          body: `Le téléchargement de ${filename} a échoué (${state}).`,
        }).show();
      }
    });
  });

  // ✅ INTERCEPTION DES ALERTES JS BLOQUANTES
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: "deny" };
  });


}

// App ready
app.whenReady().then(() => {
  createSplash();
  createMainWindow();
});

// Quitter si toutes les fenêtres sont fermées
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
