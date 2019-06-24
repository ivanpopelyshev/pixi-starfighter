/// <reference types="./../types/pixi.js" />

import Config from "./config.js";
import Assets from "./assets.js";
import Menu from "./stages/menu.js";
import Game from "./stages/game.js";

const app = new PIXI.Application(Config.renderOptions);

//Because now we use module-mode, this scripts was be isolated from global scope.
//Pass app reference to window object manually
window.app = app;

document
    .querySelector('.container')
    .appendChild(app.view);

//Load reosurces from asset database from assets.js
app.loader.baseUrl = Assets.baseUrl;
app.loader
    .add(Assets.assetList)
    .load(init);

/**
 * MapLike object of game Stages 
 */
let stages = {};

/**
 * Init game after loading
 */
function init() {
    stages = {
        menu : new Menu(app),
        game : new Game(app)
    };

    //set current stage as menu
    app.stage = stages.menu;

    app.ticker.add(update, this);
}

/**
 * Update app instance and stages
 * @param {number} delta 
 */
function update(delta) {
    app.stage.update(delta);
}

/**
 * Change stages
 * @param {number} name
 */
app.setStage = function(name) {
    if(stages[name]){
        app.stage = stages[name];
    }
}