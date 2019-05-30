const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
document.querySelector('.container').appendChild(app.view);

let enemy = new PIXI.Sprite(PIXI.Texture.from('../assets/48_enemy.png'));
enemy.anchor.set(0.5);
enemy.scale.set(2);
enemy.position.set(160, 120);
app.stage.addChild(enemy);

app.ticker.add(update);

enemy.phase = 0;

function update(delta) {
    enemy.rotation += delta * 0.01;

    enemy.phase += delta * 0.1;
    enemy.position.x = 160 + 100 * Math.cos(enemy.phase);
    enemy.position.y = 120 + 60 * Math.sin(enemy.phase);
}
