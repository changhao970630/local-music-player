// Modules to control application life and create native browser window
const AppWindows = require("./utils/appWindows")
const { app, ipcMain, dialog } = require('electron')
const path = require('path')
const { v4: uuidv4 } = require('uuid');

const MusicDataStorage = require("./utils/MusicDataStroage")
 const musicDataStorage = new MusicDataStorage({ name: "MusicData" })
 console.log(musicDataStorage.getMusicList());
app.on('ready', () => {
  const mainWindow = new AppWindows({}, "./renderer/index.html");
  mainWindow.webContents.on("did-finish-load",()=>{
    mainWindow.send("rerenderMainList",musicDataStorage.getMusicList())
  })
  let addWindow = null;
  ipcMain.on("add-music-channel", (event, args) => {
    if (!addWindow) {
      addWindow = new AppWindows({
        width: 400,
        height: 400,
        parent: mainWindow
      }, './renderer/add.html')
    } else {
      return;
    }
    addWindow.on("closed", () => {
      addWindow = null;
    })
  })
  ipcMain.on("openFolderSelectMusic", async (event) => {
    const res = await dialog.showOpenDialog({
      message: "请选择以mp3结尾的音频文件！😄",
      buttonLabel: "哈哈选择完成啦🥰",
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: "Music", extensions: ['mp3'] }]
    })
    event.sender.send("selected-musics", res)
  })
  ipcMain.on("export-to-list", (event, args) => {
    musicDataStorage.addToMusic(args);
    mainWindow.send("rerenderMainList",musicDataStorage.getMusicList())
  })
  ipcMain.on("delete-list",(event,args)=>{
    musicDataStorage.saveMusicList(args);
    mainWindow.send("rerenderMainList",musicDataStorage.getMusicList())
  })
})