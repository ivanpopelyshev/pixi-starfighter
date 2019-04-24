const app = new PIXI.Application({
	width: 720,
	height: 1280
});

const container = document.querySelector(".container");
container.appendChild(app.view);

app.ticker.add(update);
app.loader.add("ship","./../assets/ship.png").load(load);

var ship;

function load(loader) {
    ship = new PIXI.Sprite(loader.resources["ship"].texture);
    ship.anchor.set(.5);
    ship.position.x = 720 / 2;
    ship.position.y = 1200;
    app.stage.addChild(ship);

}

function update() {
}
