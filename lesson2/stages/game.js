/// <reference types="./../../types/pixi.js" />

import Config from "./../config.js";
import ShipPresenter from "../presenters/shipPresenter.js";

//basic data model
class BasicModel  {
    constructor(tag = "basic") {
        this.position = new PIXI.Point( 0, 0 );
        this.vel = new PIXI.Point( 0, 0 );
        this.tag = tag;
    }
}

//player data model
class PlayerModel extends BasicModel {
    constructor() {
        super("player");
        this.target = new PIXI.Point(0,0);
    }
}

export default class Game extends PIXI.Container {
    /**
     * Create game stage
     * @param {PIXI.Application} app 
     */
    constructor(app) {
        super();
        this.app = app;
        
        this.animatedPresenter = new ShipPresenter(this, app.loader.resources);
        
        this.player = new PlayerModel();
        this.player.position.set(
            Config.renderOptions.width * 0.5,
            Config.renderOptions.height * 2 / 3
        );
        this.player.target.copyFrom(this.player.position);
        this.animatedPresenter.pair([this.player]);

        this.bindInput();
    }

    bindInput() {
        this.interactive = true;

        this.on("pointermove", (event) => {
            let pos = event.data.global;

            //clamp target position 
            pos.x = Math.max(
                64 ,
                Math.min(pos.x, Config.renderOptions.width - 64)
            );
            pos.y = Math.max(
                Config.renderOptions.height - Config.renderOptions.width - 64 * 3 ,
                Math.min(pos.y, Config.renderOptions.height - 64)
            );
            
            this.player.target.copyFrom(pos);
        });
    }

    /**
     * Update stage 
     * @param {number} delta 
     */
    update(delta) {
        this.animatedPresenter.present({delta});
    }
}