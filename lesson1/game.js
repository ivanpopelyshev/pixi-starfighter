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
    .add('bg_tiled_layer1', 'bg_tiled_layer1.png')
    .add('bg_tiled_layer2', 'bg_tiled_layer2_stars.png')
    .add('projectile_yellow', 'projectile_yellow.png')
    .add('enemy', '48_enemie_temp.png')
    .load(init);

function init() {
    enemy = createEnemy();
    enemy.position.set(160, 100);

    let ship = createSpriteShip();
    ship.position.set(160, 1100);
    ship.tint = 0xffff66;

    animatedShip = createAnimatedShip();
    animatedShip.position.set(360, 1100);
    animatedShip.tint = 0xff66ff;

    inputShip = createAnimatedShip();
    inputShip.position.set(560, 900);
    inputPos = new PIXI.Point();
    inputPos.copyFrom(inputShip.position);
    inputShip.interactive = true;
    
    // interaction plugin, stage, or background is fine
    app.renderer.plugins.interaction.on('pointermove', shipMove, this);

    app.renderer.plugins.interaction.on('pointerdown', (event) => {
        inputFire = true;
        shipMove(event);
    });
    app.renderer.plugins.interaction.on('pointerup', (event) => {
        inputFire = false;
    });

    bg2 = createBg(app.loader.resources['bg_tiled_layer2'].texture);
    bg1 = createBg(app.loader.resources['bg_tiled_layer1'].texture);
    backgroundY = 0;

    app.ticker.start();
}

function createEnemy() {
    let ship = new PIXI.Sprite(app.loader.resources['enemy'].texture);
    ship.anchor.set(0.5);
    ship.scale.set(2);
    app.stage.addChild(ship);
    ship.phase = 0;
    return ship;
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
    let textures = [texForward, texLeft, texForward, texRight];

    let ship = new PIXI.AnimatedSprite(textures, false);
    ship.play();
    ship.animationSpeed = 0.05;
    app.stage.addChild(ship);

    ship.scale.set(2);
    ship.anchor.set(0.5);

    return ship;
}

function createBg(tex) {
    let tiling = new PIXI.TilingSprite(tex, 600, 800);
    tiling.position.set(60, 200);
    app.stage.addChildAt(tiling, 0);
    return tiling;
}

function createShot() {
    let sprite = new PIXI.Sprite(app.loader.resources['projectile_yellow'].texture);
    sprite.anchor.set(0.5);
    sprite.velocityY = -10.0;
    shots.push(sprite);
    app.stage.addChild(sprite);
    return sprite;
}

let enemy;

let animatedShip;

let inputShip;
let inputPos;
const shipSpeed = 10;

function shipMove(event) {
    inputPos.copyFrom(event.data.global);
    if (inputPos.x < 64) {
        inputPos.x = 64;
    }
    if (inputPos.x > 720 - 64) {
        inputPos.x = 720 - 64;
    }
}

let bg1, bg2;
let backgroundY;
const bgSpeed = 1;

const reloadSpeed = 0.2;
let reload = 0.0;

let shots = [];
let inputFire = false;
let cannons = [new PIXI.Point(-24, -20), new PIXI.Point(24, -20)];

function update(delta) {
    enemy.phase += delta * 0.1;
    enemy.position.x = 160 + 100* Math.cos(enemy.phase);
    enemy.position.y = 100 + 50* Math.sin(enemy.phase);

    // animated ship, if autoUpdate is false

    if (animatedShip.playing) {
        animatedShip.update(delta);
    }

    // ship input

    let dx = inputPos.x - inputShip.position.x;
    if (dx > 0) {
        if (dx < shipSpeed * delta) {
            inputShip.position.x = inputPos.x;
        } else {
            inputShip.position.x += shipSpeed * delta;
        }
        inputShip.gotoAndStop(3);
    } else if (dx < 0) {
        if (dx > -shipSpeed * delta) {
            inputShip.position.x = inputPos.x;
        } else {
            inputShip.position.x -= shipSpeed * delta;
        }
        inputShip.gotoAndStop(1);
    } else {
        inputShip.gotoAndStop(2);
    }

    backgroundY = (backgroundY + delta * bgSpeed) % 2048;
    bg1.tilePosition.y = backgroundY / 2;
    bg2.tilePosition.y = backgroundY;

    if (reload > 0) {
        reload -= reloadSpeed * delta;
    }
    if (inputFire && reload <= 0.0) {
        reload = 1.0;
        let leftShot = createShot();
        inputShip.toGlobal(cannons[0], leftShot.position);
        let rightShot = createShot();
        inputShip.toGlobal(cannons[1], rightShot.position);
    }

    // velocity update
    for (let i = 0; i < shots.length; i++) {
        shots[i].position.y += shots[i].velocityY * delta;
        if (shots[i].position.y < 150) {
            shots[i].dead = true;
        }
    }
    // despawning
    let j = 0;
    for (let i = 0; i < shots.length; i++) {
        if (shots[i].dead) {
            app.stage.removeChild(shots[i]);
        } else {
            shots[j++] = shots[i];
        }
    }
    shots.length = j;
}
