/// <reference types="./../types/pixi.js" />

import Config from "./config.js";
import Menu from "./stages/menu.js";

const app = new PIXI.Application(Config.renderOptions);

document
    .querySelector('.container')
    .appendChild(app.view);

app.loader.baseUrl = Config.assetsBaseUrl;

app.loader
    .add('bg_tiled_layer1', 'bg_tiled_layer1.png')
    .add('bg_tiled_layer2', 'bg_tiled_layer2_stars.png');

app.loader.load(init);

let stages = {};

/**
 * Init game after loading
 */
function init() {
    stages = {
        menu : new Menu(app)
    };

    app.stage = stages.menu;

    app.ticker.add(update, this);
}

function update(delta) {
    app.stage.update(delta);
}