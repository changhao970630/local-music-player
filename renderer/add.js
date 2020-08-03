const {ipcRenderer} = require("electron");
const {$} = require('../utils/helper');
const path = require("path")
let musicList = []
window.onload = function(){
    const renderHtml = (pathes)=>{
        let html = "";
        Array.isArray(pathes)&&pathes.forEach(path_item=>{
            html+=`<li class="list-group-item list-group-item-primary">${path.basename(path_item)}</li>`
        })
        return `<ul  class="list-group">${html}</ul>`
    }
    $("#select-music-btn").addEventListener("click",()=>{
        ipcRenderer.send("openFolderSelectMusic","打开系统文件框，选择音乐")
    })
    ipcRenderer.on("selected-musics",(event,res)=>{
        musicList = res.filePaths;
       $('#music-list').innerHTML = renderHtml(res.filePaths)
    })
    $('#export-to-list').addEventListener("click",()=>{
        ipcRenderer.send("export-to-list",musicList)
    })
}