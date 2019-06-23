import {createText, createBg} from  "./../fabrics.js";
import Config from "./../config.js";

const centerX = Config.renderOptions.width * 0.5;
const centerY = Config.renderOptions.height * 0.5;
const bgSpeed = 1;

let menuTextEntries = {
    logo : {
        text : "PixiJS",
        position: {
            x : centerX, y : 100
        },
        style : {
            fontFamily : "Roboto, sans-serif",
            fill : "#e91e63",
            fontSize : 56,
            strokeThickness : 0
        }
    },
    name : {
        text : "Starfighter",
        position : {
            x : centerX , y : 150
        },
        style : {
            fontFamily : "VT323, monospace",
            fontSize: 62
        }
    },
    play : {
        text: "Play",
        position : {
            x: centerX, y : centerY
        },
        style : {
            fontFamily : "VT323, monospace",
        }
    }
};

export default class Menu extends PIXI.Container {
    
    constructor (app) {
        super();
        this.app = app;
        this.entries = {};

        this.backgroundY = 0;
        this.createBackgrounds();
        this.createTexts();
    }

    createBackgrounds() {
        const size = {
            width  : Config.renderOptions.width,
            height  : Config.renderOptions.height            
        };

        let bg2 = createBg(this.app.loader.resources['bg_tiled_layer2'].texture, size);
        let bg1 = createBg(this.app.loader.resources['bg_tiled_layer1'].texture, size);
        
        this.entries.bg1 = bg1;
        this.entries.bg2 = bg2;
    
        this.addChild(bg1, bg2);
    }

    createTexts() {
        for(let key in menuTextEntries)
        {
            let text = menuTextEntries[key].text;
            let style = menuTextEntries[key].style;
            let position = menuTextEntries[key].position || {x : 0, y : 0};

            let textEntry = createText(text, style);
            textEntry.position.set(position.x, position.y);

            this.addChild(textEntry);
            this.entries[key] = textEntry;
        }
    }

    update(delta) {
        this.backgroundY = (this.backgroundY + delta * bgSpeed) % 2048;
        this.entries.bg1.tilePosition.y = this.backgroundY / 2;
        this.entries.bg2.tilePosition.y = this.backgroundY;
    }
}