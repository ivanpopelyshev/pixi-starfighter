const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
document.querySelector('.container').appendChild(app.view);

app.loader.baseUrl = '../assets';
app.loader
    .add('enemy', '48_enemy.png');
app.loader
    .add('ship_straight', 'ship_straight.png')
    .add('ship_turn', 'ship_turn.png')
    .add('bg_tiled_layer1', 'bg_tiled_layer1.png')
    .add('bg_tiled_layer2', 'bg_tiled_layer2_stars.png');

app.loader.load(initLevel);

function initLevel() {
    let enemy = createEnemy();
    enemy.position.set(160, 100);

    let bg2 = createBg(app.loader.resources['bg_tiled_layer2'].texture);
    let bg1 = createBg(app.loader.resources['bg_tiled_layer1'].texture);
    let backgroundY = 0;
    const bgSpeed = 1;

    let ship = createSpriteShip();
    ship.position.set(210, 1100);
    ship.tint = 0xffff66;

    let animateShip = createAnimatedShip();
    animateShip.position.set(510, 1100);
    animateShip.tint = 0xff66ff;

    const shipSpeed = 10;
    let movableShip = createAnimatedShip();
    movableShip.position.set(360, 800);
    movableShip.interactive = true;
    const targetMovablePos = movableShip.position.clone();

    app.stage.interactive = true;
    app.stage.on("pointermove", shipMove);
    app.ticker.add(updateLevel);

    function shipMove(event) {
       
        targetMovablePos.copyFrom(event.data.global); 
        if( targetMovablePos.x < 64 ) {
            targetMovablePos.x = 64;
        }
        if( targetMovablePos.x > 720 - 64 ){
            targetMovablePos.x = 702 - 64;
        }
    }

    function updateMovabelShip(delta) {
        
        // ship input
        const dx = targetMovablePos.x - movableShip.position.x;
        if (dx > 0) {
            if (dx < shipSpeed * delta) {
                movableShip.position.x = targetMovablePos.x;
            } else {
                movableShip.position.x += shipSpeed * delta;
            }
            movableShip.gotoAndStop(3);
        } else if (dx < 0) {
            if (dx > -shipSpeed * delta) {
                movableShip.position.x = targetMovablePos.x;
            } else {
                movableShip.position.x -= shipSpeed * delta;
            }
            movableShip.gotoAndStop(1);
        } else {
            movableShip.gotoAndStop(2);
        }
    }

    function updateLevel(delta) {
        enemy.rotation += delta * 0.01;

        enemy.phase += delta * 0.1;
        enemy.position.x = 160 + 100 * Math.cos(enemy.phase);
        enemy.position.y = 120 + 60 * Math.sin(enemy.phase);

        backgroundY = (backgroundY + delta * bgSpeed) % 2048;
        bg1.tilePosition.y = backgroundY / 2;
        bg2.tilePosition.y = backgroundY;

        animateShip.update(delta);

        updateMovabelShip(delta);
    }
}

function createEnemy() {
    let obj = new PIXI.Sprite(app.loader.resources['enemy'].texture);
    obj.anchor.set(0.5);
    obj.scale.set(2);
    app.stage.addChild(obj);
    obj.phase = 0;
    return obj;
}

function createBg(tex) {
    let tiling = new PIXI.TilingSprite(tex, 600, 800);
    tiling.position.set(60, 200);
    app.stage.addChildAt(tiling, 0);
    return tiling;
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