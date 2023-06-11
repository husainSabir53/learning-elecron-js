const { app, BrowserWindow, ipcMain } = require("electron");
const connectToDatabase = require("./database");
// const cron = require('node-cron');
const { updateAppState, createNewClient } = require("./helper");
// const {Item} = require('./model.js');
const fs = require("fs");
const path = require("path");

const userDataPath = app.getPath("userData");
const userFile = path.join(userDataPath, "user.json");

let mainWindow = null;

function createWindow() {
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

// function husain(){
//   let page = 1
//   cron.schedule('* * * * *', () => {
//     console.log('Cron job ran at:', new Date().toLocaleString());

//     const newItem = new Item({
//       name: "HOPSTACK",
//       updatedTime: new Date().toLocaleString(),
//       Number: page,
//     });
//     page = page + 1
//     newItem.save()
//       .then(() => {
//         console.log(`UPDATED ${page-1}`);
//         time = time + 1
//         const notification = new Notification({
//           title: 'New Item Created',
//           body: 'An item has been created successfully.',
//         });
//         notification.show();
//       })
//       .catch((error) => {
//         console.error('Failed to create item', error);
//       });
//   });
// }
const getUserData = () => {
  const user = fs.readFileSync(userFile, "utf-8");
  return JSON.parse(user);
};

// const gotTheLock = app.requestSingleInstanceLock();

// if (!gotTheLock) {
//   app.quit();
// } else {
//   app.on("second-instance", () => {
//     if (mainWindow) {
//       if (mainWindow.isMinimized()) mainWindow.restore();
//       mainWindow.focus();
//     }
//   });
// }
