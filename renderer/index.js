const { ipcRenderer } = require("electron");
const { $ } = require('../utils/helper');
let musicList;
let current;
let audioPlayer = new Audio();
let playingTime = "00:00";
const renderLocalList = function (arg) {
    musicList = arg;
    if (arg && Array.isArray(arg)) {
        let currentList = "";
        arg.forEach(item => {
            currentList += `<li id="list-item" class="list-group-item  " >
            <div class="row">
                <div class="col-10">
                    <i class="fa fa-music" aria-hidden="true" ></i>
                    ${item.name}
                </div>
                <div class="col-2">
            <i class="fa ${current&&current.path==item.path&&audioPlayer.played?'fa-pause':'fa-play'} mr-2"   data-id="${item.id}" style="cursor: pointer;color:red" aria-hidden="true"></i>
            <i class="fa fa-trash-alt"  data-id="${item.id}"  style="cursor: pointer;" aria-hidden="true"></i>
            </div>
            </div>
            </li>`
        })
        $("#current_list").innerHTML = arg.length > 0 ? `<ul class="list-group">${currentList}</ul>` : `暂无歌曲`
    }
}
const calcTime = (time) => {
    
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min >= 10 ? min : `0${min}`}:${sec >= 10 ? sec : `0${sec}`}`
}
const renderPlayerHtml = (name, duration) => {
    const player = $(".player-container")
    const html = `
        <div class="col-8 font-weight-bold">
            ${name ? `正在播放:${name}` : `播放器君👨在休息♨️`}
        </div>
        <div class="col-4">
            <span id="current-seeker">${playingTime}</span>/${duration ? duration : "00:00"}
        </div>
        <div class="progress">
      </div>
    `
    player.innerHTML = html;
}

window.onload = function () {
    renderPlayerHtml();
    audioPlayer.addEventListener("loadedmetadata", () => {
        console.log(current);
        //渲染播放器状态
        renderPlayerHtml(current.name, calcTime(audioPlayer.duration))
    })
    audioPlayer.addEventListener("timeupdate", (e) => {
        //播放器播放时
        const nowTime = Math.floor(e.target.currentTime);
        playingTime = calcTime(nowTime);
        const percent = nowTime/Math.floor(audioPlayer.duration)*100;
        $(".progress-bar").style.display ="block";
        $(".progress-bar").style.width = percent+"%";
        renderPlayerHtml(current.name, calcTime(audioPlayer.duration))
    })
    audioPlayer.addEventListener("ended",(event)=>{
       const currentIndex  = musicList.map(item=>{
            return item.id;
        }).indexOf(current.id)
        console.log(currentIndex);
        if(currentIndex<musicList.length-1){
            current = musicList[currentIndex+1]
        }else{
            current = musicList[0]
        }
        audioPlayer.src = current.path;
        audioPlayer.play();
        renderLocalList(musicList);
    })
    $("#add-music-btn").addEventListener("click", () => {
        ipcRenderer.send("add-music-channel", '打开添加音乐的渲染进程窗口')
    })
    ipcRenderer.on("rerenderMainList", (event, arg) => {
        musicList = arg;
        renderLocalList(arg);
    })
    $("#current_list").addEventListener("click", (event) => {
        event.preventDefault();
        const { dataset, classList } = event.target;
        const { id } = dataset;
        if (id && classList.contains("fa-play")) {
            if (current && current.id == id) {
                audioPlayer.play()
            } else {
                current = musicList.find(item => item.id === id);
                audioPlayer.src = current.path;
                audioPlayer.play();
                //改变歌曲播放的时候，选择pause，改为play
                renderLocalList(musicList);
            }
            classList.replace("fa-play", "fa-pause")
        } else if (classList.contains("fa-pause")) {
            //暂停播放
            audioPlayer.pause();
            event.target.classList.replace("fa-pause", "fa-play")
        } else if (classList.contains("fa-trash-alt")) {
            if (current&&current.id == id) {
                audioPlayer.pause();
                $(".progress-bar").style.width ="0%";
                current = null;
                renderPlayerHtml();
                audioPlayer.src = null;
                playingTime = "00:00"
                renderPlayerHtml();
            }
            musicList = musicList.filter(item => item.id !== id);
            ipcRenderer.send("delete-list", musicList)
            
        }
    })
}