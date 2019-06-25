let defaultTextStyle = {
    align: "center",
    dropShadow: true,
    dropShadowAlpha: 0.4,
    dropShadowAngle: -2.7,
    dropShadowBlur: 5,
    dropShadowDistance: 4,
    fill: "#cccccc",
    fontFamily: "Impact",
    fontSize: 40,
    miterLimit: 2,
    padding: 14,
    stroke: "#414141",
    strokeThickness: 5,
};

/**
 * Create PIXI.Text element 
 * @param {string} text 
 * @param {*} options 
 */
export function createText(text, options) {
    let style = Object.assign({}, defaultTextStyle , options || {});
    let textObject = new PIXI.Text(text, style);
    textObject.anchor.set(0.5);
    return textObject;
}

/**
 * Create tiled background
 * @param {PIXI.Texture} tex 
 */
export function createBg(tex, options = undefined) {
    options = Object.assign({
        width : 600, height: 800
    },options);

    let tiling = new PIXI.TilingSprite(tex, options.width, options.height);
    return tiling;
}

export function createAnimatedShip(resources) {

    let texLeft = resources['ship_turn'].texture;
    let texForward = resources['ship_straight'].texture;
    let texRight = new PIXI.Texture(texLeft.baseTexture, texLeft.frame);
    texRight.rotate = 12;
    let textures = [texForward, texLeft, texForward, texRight];

    let ship = new PIXI.AnimatedSprite(textures, false);
    
    ship.animationSpeed = 0.05;
    ship.scale.set(2);
    ship.anchor.set(0.5);

    return ship;
}
