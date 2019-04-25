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
    let ship = createShip();
    ship.position.set(720 / 2, 1000);

    let ship2 = createShip();
    ship2.position.set(720 / 2 - 200, 800);

    app.ticker.start();
}

function createShip() {
    let resources = app.loader.resources;

    let texLeft = resources['ship_turn'].texture;
    let texForward = resources['ship_straight'].texture;
    let texRight = new PIXI.Texture(texLeft.baseTexture, texLeft.frame);
    texRight.rotate = 12;
    let textures = [texLeft, texForward, texRight, texForward];

    ship = new PIXI.AnimatedSprite(textures);
    ship.play();
    ship.animationSpeed = 0.05;
    app.stage.addChild(ship);

    ship.scale.set(2);
    ship.anchor.set(0.5);

    return ship;
}

function update(delta) {
    // if autoUpdate is false

    // if (ship.playing) {
    //     ship.update(delta);
    // }
}
