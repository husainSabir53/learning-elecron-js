const { app, BrowserWindow, ipcMain } = require("electron");
const connectToDatabase = require("./database");
const { updateAppState, createNewClient } = require("./helper");
const fs = require("fs");
const path = require("path");

const userDataPath = app.getPath("userData");
const userFile = path.join(userDataPath, "user.json");

let mainWindow = null;

function createWindow() {
  if (mainWindow === null) {
    mainWindow = new BrowserWindow({
      width: 752,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    const userExists = fs.existsSync(userFile);

    if (userExists) {
      // User exists, start the app
      mainWindow.loadFile("index.html");
    } else {
      // User doesn't exist, open the form
      mainWindow.loadFile("addUser.html");
    }

    mainWindow.on("closed", () => {
      mainWindow = null;
    });
  }
}

ipcMain.on("user", async (e, user) => {
  fs.writeFileSync(userFile, JSON.stringify(user), (err) => {
    if (err) throw err;
  });
  createNewClient(user);
  await updateAppState({
    openedTime: new Date().toLocaleString(),
    active: true,
    clientName: user.name,
  });
  mainWindow.loadFile("index.html");
});

app.on("before-quit", async (event) => {
  event.preventDefault();
  const user = getUserData();
  await updateAppState({
    closedTime: new Date().toLocaleString(),
    active: false,
    clientName: user.name,
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.on("welMsg", (event, arg) => {
  const user = getUserData();
  event.sender.send("welMsg-reply", user);
});

const getUserData = () => {
  const user = fs.readFileSync(userFile, "utf-8");
  return JSON.parse(user);
};

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", async (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      createWindow();

      const user = getUserData();

      await updateAppState({
        openedTime: new Date().toLocaleString(),
        active: true,
        clientName: user.name,
      });
    }
  });

  app.on("ready", () => {
    connectToDatabase()
      .then(async () => {
        const { dbConnectNotification } = require("./notification");

        console.log("Connected to Database and updating state.");
        dbConnectNotification.show();
        createWindow();

        const user = getUserData();

        await updateAppState({
          openedTime: new Date().toLocaleString(),
          active: true,
          clientName: user.name,
        });

        // husain();
      })
      .catch((error) => {
        const { dbDisonnectedNotification } = require("./notification");
        console.error("Failed to connect to the database:", error);
        dbDisonnectedNotification.show();
      });
  });
}
