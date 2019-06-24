import Config from "./../config.js";

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
        
        this.player = new PlayerModel();
        this.player.position.set(
            Config.renderOptions.width / 2,
            Config.renderOptions.height * 2/3);
        this.player.target.copyFrom(this.player.position);


        this.bindInput();
    }

    bindInput() {
        this.interactive = true;

        this.on("pointermove", (event) => {
            let pos = event.data.global;
            this.player.target.copyFrom(pos);
        });
    }

    /**
     * Update stage 
     * @param {number} delta 
     */
    update(delta) {

    }
}