const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
document.querySelector('.container').appendChild(app.view);

app.stage.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
