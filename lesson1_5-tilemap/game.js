const app = new PIXI.Application({
    width: 720,
    height: 1280
});

const container = document.querySelector('.container');
container.appendChild(app.view);
let shots = [];

app.loader.baseUrl = '../assets';
app.loader.add('ship_straight', 'ship_straight.png')
    .add('ship_turn', 'ship_turn.png')
    .add('bg_tiled_layer1', 'bg_tiled_layer1.png')
    .add('bg_tiled_layer2', 'bg_tiled_layer2_stars.png')
    .add('projectile_yellow', 'projectile_yellow.png')
    .add('enemy', '48_enemy.png')
    .add('1x1_terrain', '1x1_terrain.png')
    .add('1x3_terrain', '1x3_terrain.png')
    .add('3x1_terrain', '3x1_terrain.png')
    .add('3x3_terrain', '3x3_terrain.png')
    .add('snake', 'snake.png')
    .load(initLevel);

function createEnemy() {
    let obj = new PIXI.Sprite(app.loader.resources['enemy'].texture);
    obj.anchor.set(0.5);
    obj.scale.set(2);
    app.stage.addChild(obj);
    obj.phase = 0;
    return obj;
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

function createTilemap() {
    let obj = new Tilemap(app.loader.resources, 300, 300);
    obj.position.set(350, 150);
    app.stage.addChildAt(obj, 2);
    return obj;
}

function createSnake() {
    let tex = app.loader.resources['snake'].texture;
    let points = [];
    let segmentCount = 20;
    let segmentLength = tex.width / segmentCount;
    for (let i = 0; i < 20; i++) {
        points.push(new PIXI.Point(i * segmentLength, 0));
    }
    let snake = new PIXI.SimpleRope(app.loader.resources['snake'].texture, points);
    let phase = 0.0;
    snake.update = function(delta) {
        phase += 0.1 * delta;
        for (let i = 0; i < points.length; i++) {
            points[i].y = Math.sin((i * 0.5) + phase) * segmentCount;
        }
    };
    snake.rotation = Math.PI/2;
    app.stage.addChild(snake);

    return snake;
}

function initLevel() {
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

    let inputFire = false;
    let cannons = [new PIXI.Point(-24, -20), new PIXI.Point(24, -20)];

    const tileSpeedX = 1;
    const tileSpeedY = 2;
    let tilemap;

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

    let snake = createSnake();
    snake.position.set(100, 200);

    tilemap = createTilemap();

    app.ticker.add(updateLevel);

    function updateLevel(delta) {
        enemy.phase += delta * 0.1;
        enemy.position.x = 160 + 100 * Math.cos(enemy.phase);
        enemy.position.y = 100 + 50 * Math.sin(enemy.phase);

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

        tilemap.offset.x += tileSpeedX * delta;
        tilemap.offset.y += tileSpeedY * delta;
        tilemap.updateView();

        snake.update(delta);
    }
}

class Tilemap extends PIXI.Container {
    constructor(resources, width, height) {
        super();
        this.initTiles(resources);
        this.inner = new PIXI.Graphics();
        this.debugGraphics = new PIXI.Graphics();
        this.viewRect = new PIXI.Rectangle(0, 0, width, height);
        this.filledRect = new PIXI.Rectangle();
        this.padding = 50;
        this.offset = new PIXI.Point();
        this.addChild(this.inner);
        this.addChild(this.debugGraphics);

        this.field = [
            [0, 1, 1, 0, 0],
            [0, 1, 0, 1, 1],
            [0, 1, 1, 1, 1],
            [0, 0, 0, 1, 0],
            [0, 0, 1, 1, 0],
            [1, 0, 1, 1, 0],
            [1, 0, 1, 0, 0],
            [1, 0, 0, 0, 0],
            [0, 0, 0, 1, 1],
            [0, 0, 1, 1, 0],
            [0, 1, 1, 1, 0],
        ];
    }

    initTiles(resources) {
        const _31 = resources['3x1_terrain'].texture.baseTexture;
        const _13 = resources['1x3_terrain'].texture.baseTexture;
        const _33 = resources['3x3_terrain'].texture.baseTexture;

        const w = 64;
        this.tileTextures = [
            /* 3 2 1 0 BIT ORDER */
            /* U L D R DIRECTION */
            /* 0 0 0 0 */ resources['1x1_terrain'].texture,
            /* 0 0 0 1 */ new PIXI.Texture(_31, new PIXI.Rectangle(0, 0, w, w)),
            /* 0 0 1 0 */ new PIXI.Texture(_13, new PIXI.Rectangle(0, 0, w, w)),
            /* 0 0 1 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(0, 0, w, w)),
            /* 0 1 0 0 */ new PIXI.Texture(_31, new PIXI.Rectangle(w * 2, 0, w, w)),
            /* 0 1 0 1 */ new PIXI.Texture(_31, new PIXI.Rectangle(w, 0, w, w)),
            /* 0 1 1 0 */ new PIXI.Texture(_33, new PIXI.Rectangle(w * 2, 0, w, w)),
            /* 0 1 1 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(w, 0, w, w)),
            /* 1 0 0 0 */ new PIXI.Texture(_13, new PIXI.Rectangle(0, w * 2, w, w)),
            /* 1 0 0 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(0, w * 2, w, w)),
            /* 1 0 1 0 */ new PIXI.Texture(_13, new PIXI.Rectangle(0, w, w, w)),
            /* 1 0 1 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(0, w, w, w)),
            /* 1 1 0 0 */ new PIXI.Texture(_33, new PIXI.Rectangle(w * 2, w * 2, w, w)),
            /* 1 1 0 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(w, w * 2, w, w)),
            /* 1 1 1 0 */ new PIXI.Texture(_33, new PIXI.Rectangle(w * 2, w, w, w)),
            /* 1 1 1 1 */ new PIXI.Texture(_33, new PIXI.Rectangle(w, w, w, w)),
        ];
    }

    fill() {
        const tileSize = 64;
        const viewRect = this.viewRect;
        const offset = this.offset;
        const inner = this.inner;
        const padding = this.padding;

        let i1 = Math.floor((offset.x + viewRect.x - padding) / tileSize);
        let j1 = Math.floor((offset.y + viewRect.y - padding) / tileSize);
        let i2 = Math.ceil((offset.x + viewRect.x + viewRect.width + padding) / tileSize);
        let j2 = Math.ceil((offset.y + viewRect.y + viewRect.height + padding) / tileSize);

        inner.position.set(i1 * tileSize, j1 * tileSize);
        inner.roundPixels = true;
        inner.clear();

        const field = this.field;

        const rows = field.length, cols = field[0].length;

        for (let i = i1; i <= i2; i++) {
            for (let j = j1; j <= j2; j++) {
                let xx = (i - i1) * tileSize, yy = (j - j1) * tileSize;

                let tileX = i - Math.floor(i / cols) * cols;
                let tileY = j - Math.floor(j / rows) * rows;
                let tile = field[tileY][tileX];
                if (tile) {
                    let right = field[tileY][(tileX + 1) % cols];
                    let down = field[(tileY + 1) % rows][tileX];
                    let left = field[tileY][(tileX + cols - 1) % cols];
                    let up = field[(tileY + rows - 1) % rows][tileX];

                    let mask = right | (down << 1) | (left << 2) | (up << 3);
                    inner.beginTextureFill(this.tileTextures[mask]);
                    inner.drawRect(xx, yy, tileSize, tileSize);
                    inner.endFill();
                }
            }
        }

        this.filledRect.x = i1 * tileSize;
        this.filledRect.y = j1 * tileSize;
        this.filledRect.width = (i2 - i1 + 1) * tileSize;
        this.filledRect.height = (j2 - j1 + 1) * tileSize;
    }

    updateView() {
        if (!isInside(this.viewRect, this.filledRect, this.offset)) {
            this.fill();
        }
        this.inner.pivot.copyFrom(this.offset);
        this.debugGraphics.clear();
        this.debugGraphics.lineStyle(2.0, 0x00ff00);
        this.debugGraphics.drawRect(0, 0, this.viewRect.width, this.viewRect.height);
        this.debugGraphics.lineStyle(2.0, 0x00000ff);
        this.debugGraphics.drawRect(this.filledRect.x - this.offset.x, this.filledRect.y - this.offset.y, this.filledRect.width, this.filledRect.height);
        this.debugGraphics.closePath();
    }
}

let tempRect = new PIXI.Rectangle();

function isInside(rect1, rect2, offset) {
    tempRect.copyFrom(rect1);
    tempRect.x += offset.x;
    tempRect.y += offset.y;
    tempRect.enlarge(rect2);
    return tempRect.width === rect2.width
        && tempRect.height === rect2.height;
}
