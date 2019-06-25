import {createText, createBg} from  "./../core/fabrics.js";
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
        isButton : true,
        position : {
            x: centerX, y : centerY * 1.5
        },
        style : {
            fontFamily : "VT323, monospace",
        }
    }
};

export default class Menu extends PIXI.Container {
    
    /**
     * Create MainMenu stage
     * @param {PIXI.Application} app 
     */
    constructor (app) {
        super();
        this.app = app;
        this.entries = {};

        this.backgroundY = 0;
        this.createBackgrounds();
        this.createTexts();
    }

    /**
     * Create scrolled Background 
     */
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

    /**
     * Create texts entries from map
     */
    createTexts() {
        for(let key in menuTextEntries)
        {
            let text = menuTextEntries[key].text;
            let style = menuTextEntries[key].style;
            let position = menuTextEntries[key].position || {x : 0, y : 0};
            let isButton = menuTextEntries[key].isButton;

            let textEntry = createText(text, style);
            textEntry.name = key;
            textEntry.position.set(position.x, position.y);
            
            if(isButton) {
                this.makeButton(textEntry);
            }

            this.addChild(textEntry);
            this.entries[key] = textEntry;
        }

        //Swich stage to 'game' when click to Play button
        this.entries.play.on("pointerdown", ()=>{
            this.app.setStage("game");
        });
    }

    /**
     * Mark object as Button and add outline
     * @param {PIXI.Container} obj 
     */
    makeButton(obj) {
        
        let size = obj.getBounds();
        size.width *=2;
        let outline = new PIXI.Graphics();
        outline
            .lineStyle(2, 0xcccccc)
            .beginFill(0x0, 0.001)
            .drawRect(-size.width / 2, -size.height / 2, size.width, size.height);
        
        obj.addChild(outline);
        obj.interactive = true;
        obj.buttonMode = true;

        obj.on("pointerover", ()=>{
            outline.tint = 0xff00000;
        });
        
        obj.on("pointerout", ()=>{
            outline.tint = 0xffffff;
        });
        
    }

    /**
     * Update stage
     * @param {number} delta 
     */
    update(delta) {
        this.backgroundY = (this.backgroundY + delta * bgSpeed) % 2048;
        this.entries.bg1.tilePosition.y = this.backgroundY / 2;
        this.entries.bg2.tilePosition.y = this.backgroundY;
    }
}