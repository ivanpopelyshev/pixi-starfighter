const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
document.querySelector('.container').appendChild(app.view);

app.loader.baseUrl = '../assets';
app.loader.add('enemy', '48_enemy.png');
app.loader.add('ship_straight', 'ship_straight.png')
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


    app.ticker.add(updateLevel);

    function updateLevel(delta) {
        enemy.rotation += delta * 0.01;

        enemy.phase += delta * 0.1;
        enemy.position.x = 160 + 100 * Math.cos(enemy.phase);
        enemy.position.y = 120 + 60 * Math.sin(enemy.phase);

        backgroundY = (backgroundY + delta * bgSpeed) % 2048;
        bg1.tilePosition.y = backgroundY / 2;
        bg2.tilePosition.y = backgroundY;
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
    app.stage.addChildAt(tiling, 1);
    return tiling;
}
