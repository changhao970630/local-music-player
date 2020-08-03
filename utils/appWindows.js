const {BrowserWindow} = require('electron')
class AppWindows extends BrowserWindow{
    constructor(config,pageHtmlLocation){
        const baseConfig = {
            width:666,
            height:666,
            webPreferences:{
              nodeIntegration:true,//可以使用nodejsAPI
            }
        }
        const finalConfig = {...baseConfig,...config}; 
        super(finalConfig);
        this.loadFile(pageHtmlLocation)
        this.once("ready-to-show",()=>{
            this.show()
        })
    }
}
module.exports = AppWindows