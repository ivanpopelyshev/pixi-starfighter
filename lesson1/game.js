const app = new PIXI.Application({
	width: 720,
	height: 1280,
    autoStart: false
});

const container = document.querySelector('.container');
container.appendChild(app.view);

app.ticker.add(update);
app.loader.baseUrl = '../assets';
app.loader.add('ship_straight', 'ship_straight.png')
    .add('ship_turn', 'ship_turn.png')
    .load(init);

function init() {
    let ship = createSpriteShip();
    ship.position.set(160, 900);

    animatedShip = createAnimatedShip();
    animatedShip.position.set(360, 900);

    app.ticker.start();
}

function createSpriteShip() {
    let ship = new PIXI.Sprite(app.loader.resources['ship_straight'].texture);
    ship.anchor.set(0.5);
    ship.scale.set(2);
    app.stage.addChild(ship);
    return ship;
}

function createAnimatedShip() {
    let resources = app.loader.resources;

    let texLeft = resources['ship_turn'].texture;
    let texForward = resources['ship_straight'].texture;
    let texRight = new PIXI.Texture(texLeft.baseTexture, texLeft.frame);
    texRight.rotate = 12;
    let textures = [texLeft, texForward, texRight, texForward];

    let ship = new PIXI.AnimatedSprite(textures, false);
    ship.play();
    ship.animationSpeed = 0.05;
    app.stage.addChild(ship);

    ship.scale.set(2);
    ship.anchor.set(0.5);

    return ship;
}

let animatedShip;

function update(delta) {
    // if autoUpdate is false

    if (animatedShip.playing) {
        animatedShip.update(delta);
    }
}
