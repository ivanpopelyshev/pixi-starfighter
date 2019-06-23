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
export function createBg(tex) {
    let tiling = new PIXI.TilingSprite(tex, 600, 800);
    tiling.position.set(60, 200);
    return tiling;
}

