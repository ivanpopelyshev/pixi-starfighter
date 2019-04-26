const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
document.querySelector('.container').appendChild(app.view);

app.loader.baseUrl = '../assets';
app.loader.add('enemy', '48_enemy.png');
app.loader.add('ship_straight', 'ship_straight.png');

app.loader.load(initLevel);

function initLevel() {
    let enemy = createEnemy();
    enemy.position.set(160, 100);

    app.ticker.add(updateLevel);

    function updateLevel(delta) {
        enemy.rotation += delta * 0.01;

        enemy.phase += delta * 0.1;
        enemy.position.x = 160 + 100 * Math.cos(enemy.phase);
        enemy.position.y = 100 + 50 * Math.sin(enemy.phase);
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
