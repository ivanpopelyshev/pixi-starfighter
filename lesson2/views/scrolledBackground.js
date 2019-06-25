import {createBg} from  "../core/fabrics.js";

export default class ScrolledBackground extends PIXI.Container {
    constructor(resources, size) {
        super();
        
        this.scrollSpeed = 1;
        this.scroll = new PIXI.Point();
        this.offset = new PIXI.Point();

        this.layers = [
            createBg(resources['bg_tiled_layer1'].texture, size),
            createBg(resources['bg_tiled_layer2'].texture, size)
        ];

        this.addChild(...this.layers);
    }

    update(delta) {

        this.scroll.y = (this.scroll.y + delta * this.scrollSpeed) % 2048;

        let count = this.layers.length;
        for(let i = 0; i < count; i ++) {

            let factor = 1 - i / count;

            this.layers[i].tilePosition.set(
                factor * (this.scroll.x + this.offset.x),
                factor * (this.scroll.y + this.offset.y)
            );
        }
    }
}