const Stroe = require("electron-store");
const path = require('path');
const { v4: uuidv4 } = require('uuid');
class MusicDataStroage extends Stroe {
    musicList;
    constructor(config) {
        super(config);
        this.musicList = this.getMusicList();
    }
    saveMusicList(musicList) {
        this.musicList = musicList;
        this.set("music_list", musicList);
    }
    getMusicList() {
        return this.get("music_list") || [];
    }
    addToMusic(propsData) {
        const musicWithProps = this.musicList.filter(item=>{
            return propsData.indexOf(item.path) < 0;//拿出的是propsData没有的musicList有的
        })
        const final = propsData.map(item=>{
            return {
                id: uuidv4(),
                name: path.basename(item),
                path: item
            }
        })
        this.saveMusicList([...musicWithProps,...final]);
        return this.musicList;
    }
}
module.exports = MusicDataStroage