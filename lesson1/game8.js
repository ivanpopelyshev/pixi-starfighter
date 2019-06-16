/// <reference types="./../types/pixi.js" />

const app = new PIXI.Application({
    width: 720,
    height: 1280
});
 
let settings = {
    SHOW_DEBUG : true
}

document.querySelector('.container').appendChild(app.view);

app.loader.baseUrl = '../assets';
app.loader
    .add('enemy', '48_enemy.png');
app.loader
    .add('ship_straight', 'ship_straight.png')
    .add('ship_turn', 'ship_turn.png')
    .add('bg_tiled_layer1', 'bg_tiled_layer1.png')
    .add('bg_tiled_layer2', 'bg_tiled_layer2_stars.png')
    .add('projectile_yellow', 'projectile_yellow.png')
    .add('snake', 'snake.png')
    .add('turel_base', 'rail_gun_base.png')
    .add('turel_gun', 'rail_gun.png')
    

app.loader.load(initLevel);

function initLevel() {
    let debugEntries = [];

    let score = 0;
    let enemy = createEnemy();
    enemy.position.set(160, 100);

    enemy._debug = {
        color : 0xff2222,
        shape : "circle"
    };
    debugEntries.push(enemy);

    let bg2 = createBg(app.loader.resources['bg_tiled_layer2'].texture);
    let bg1 = createBg(app.loader.resources['bg_tiled_layer1'].texture);
    let backgroundY = 0;
    const bgSpeed = 1;

    let ship = createSpriteShip();
    ship.position.set(210, 1100);
    ship.tint = 0xffff66;

    ship._debug = {
        color : 0x22ff22,
        shape : "rect"
    };
    debugEntries.push(ship);

    let animateShip = createAnimatedShip();
    animateShip.position.set(510, 1100);
    animateShip.tint = 0xff66ff;

    animateShip._debug = {
        color : 0x22ff22,
        shape : "rect"
    };
    debugEntries.push(animateShip);

    const shipSpeed = 10;
    const reloadSpeed = 0.2;
    let reloading = 0;
    let inputFire = false;

    let movableShip = createAnimatedShip();
    movableShip.position.set(360, 800);
    movableShip.interactive = true;
    const targetMovablePos = movableShip.position.clone();
    
    movableShip._debug = {
        color : 0x22ff22,
        shape : "rect"
    };
    debugEntries.push(movableShip);

    let cannons = [new PIXI.Point(-24, -20), new PIXI.Point(24, -20)];
    let bullets = [];
    
    app.stage.interactive = true;
    app.stage.on("pointermove", shipMove);
    app.stage.on("pointerdown", (event)=>{
        shipMove(event);
        inputFire = true;
    });

    app.stage.on("pointerup", (event)=>{
        inputFire = false;
    });

    let snake = createSnake();
    snake.position.set(100, 300);
    
    snake._debug = {
        color : 0x2222ff,
        shape : "mesh"
    };
    debugEntries.push(snake);

    let leftTurel = createTurel({turnSpeed: 0.01});
    leftTurel.position.set(200, 300);

    leftTurel._debug = {
        color : 0xff2222,
        shape : "rect"
    };
    debugEntries.push(leftTurel);

    let rightTurel = createTurel({turnSpeed : 0.025});
    rightTurel.position.set(520, 300);
    
    rightTurel._debug = {
        color : 0xff2222,
        shape : "rect"
    };
    debugEntries.push(rightTurel);
    
    rightTurel.targetObject = movableShip;
    rightTurel.phase = 0;

    leftTurel.targetObject = movableShip;
    
    let scoreText = createScoreText();
    let introText = createIntroText();

    let debugGraphics = new PIXI.Graphics();
    app.stage.addChild(debugGraphics);

    app.ticker.add(updateLevel);

    function shipMove(event) {
       
        targetMovablePos.copyFrom(event.data.global); 
        if( targetMovablePos.x < 64 ) {
            targetMovablePos.x = 64;
        }
        if( targetMovablePos.x > 720 - 64 ){
            targetMovablePos.x = 720 - 64;
        }
    }

    function drawRect(obj) {
        let bounds = obj.getBounds();
        debugGraphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
    }
    
    function drawCircle(obj) {
        let bounds = obj.getBounds();
        let radius = Math.sqrt(bounds.width * bounds.width + bounds.height * bounds.height) / 2;
        debugGraphics.drawCircle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, radius);
    }

    function drawMesh(obj){
        if(!obj.geometry || !obj.indices) {
            return;
        }

        obj.updateTransform();
        obj.calculateVertices();

        let verts = obj.vertexData;
        let indices = obj.indices;
        let count = indices.length;

        let points = [];
        
        for (let i = 0; i < count; i += 3) {
            
            points = [];

            for( let j = 0; j < 3; j ++) {
                points.push( verts[ indices[ j + i ] * 2 + 0 ] );
                points.push( verts[ indices[ j + i ] * 2 + 1 ] );
            }

            debugGraphics.drawPolygon(points);
        
        }

    }

    function updateShapeDebugger() {
        debugGraphics.clear();

        if(!settings.SHOW_DEBUG) {
            return;
        }

        for(let key in debugEntries) {
            
            let entry = debugEntries[key];
            let debugInfo = entry._debug;
            
            if(debugInfo === undefined){
                debugInfo = { color : 0x22ff22, shape: "rect"};
            }

            debugGraphics.lineStyle(2, debugInfo.color || 0x22ff22);

            switch(debugInfo.shape){
                case "mesh":
                    drawMesh(entry);
                    break;
                case "circle":
                    drawCircle(entry);
                    break;
                default:
                    drawRect(entry);
            }
        }

    }

    function updateTurels(delta) {
        leftTurel.update(delta);
        
        rightTurel.phase += delta * 0.001;
        rightTurel.position.y = 500 + Math.sin(rightTurel.phase * 2 * Math.PI) * 400;

        rightTurel.update(delta);
    }

    function updateIntroText(delta) {
        if(introText.position.y + introText.height > 0 ) {
            introText.position.y -= delta * 2;
        } else {
            app.stage.removeChild(introText);   
        }
    }

    function updateBullets(delta) {
        
        if (reloading > 0) {
            reloading -= reloadSpeed * delta;
        }

        if (inputFire && reloading <= 0.0) {
            reloading = 1.0;
            let leftShot = createBullet();
            movableShip.toGlobal(cannons[0], leftShot.position);
            let rightShot = createBullet();
            movableShip.toGlobal(cannons[1], rightShot.position);
            bullets.push(leftShot);
            bullets.push(rightShot);
        }

        // velocity update
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].position.y += bullets[i].velocityY * delta;
            if (bullets[i].position.y < 150) {
                bullets[i].dead = true;
            }
        }

        //despawning
        for (let i = bullets.length - 1; i >= 0; i --) {
            if (bullets[i].dead) {
                app.stage.removeChild(bullets[i]);
                bullets.splice(i, 1);
            }
        }
    }

    function updateMovableShip(delta) {
        
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
        updateMovableShip(delta);
        updateBullets(delta);
        updateIntroText(delta);
        snake.update(delta);
        updateTurels(delta)
        scoreText.text = "Score: " + score;

        updateShapeDebugger();
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

function createBullet() {
    let sprite = new PIXI.Sprite(app.loader.resources['projectile_yellow'].texture);
    sprite.anchor.set(0.5);
    sprite.velocityY = -10.0;
    app.stage.addChild(sprite);
    return sprite;
}

function createScoreText() {
    const style = new PIXI.TextStyle({
        align: "left",
        dropShadow: true,
        dropShadowAlpha: 0.4,
        dropShadowAngle: -2.7,
        dropShadowBlur: 5,
        dropShadowDistance: 4,
        fill: "#cccccc",
        fontFamily: "Impact",
        fontSize: 40,
        miterLimit: 2,
        padding: 14,
        stroke: "#414141",
        strokeThickness: 5,
    });

    let text = new PIXI.Text("Score : 0", style);
    text.position.set(20,20);
    app.stage.addChild(text);
    return text;
}

function createIntroText() {
    const intro = `Давным-давно в далекой Галактике...\nСтарая Республика пала. На ее руинах Орден ситов создал галактическую Империю,\nподчиняющую одну за другой планетные системы.`;

    const style = new PIXI.TextStyle({
        align: "left",
        breakWords: true,
        dropShadowAlpha: 0.4,
        dropShadowAngle: -2.7,
        dropShadowBlur: 5,
        dropShadowDistance: 4,
        fill: "#dde6f7",
        fontFamily: "Courier New",
        fontSize: 32,
        miterLimit: 2,
        padding: 14,
        stroke: "#414141",
        strokeThickness: 3,
        wordWrap: true,
        wordWrapWidth: 600
    });
    let text = new PIXI.Text(intro, style);
    
    text.anchor.set( 0.5, 0 );
    text.position.set(
        360,
        1280
    )
    app.stage.addChild(text);
    return text;
}

function createSnake() {
    let tex = app.loader.resources['snake'].texture;
    let points = [];
    let segmentCount = 20;
    let segmentLength = tex.width / segmentCount;
    
    for (let i = 0; i < 20; i++) {
        points.push(new PIXI.Point(i * segmentLength, 0));
    }

    let snake = new PIXI.SimpleRope(tex, points);
    
    snake.rotation = Math.PI/2;

    let phase = 0.0;
    snake.update = function(delta) {
        phase += 0.1 * delta;
        for (let i = 0; i < points.length; i++) {
            points[i].y = Math.sin((i * 0.5) + phase) * segmentCount;
        }
    };

    app.stage.addChild(snake);

    return snake;
}

function createTurel(options) {
    
    let baseTex = app.loader.resources['turel_base'].texture;
    let gunTex = app.loader.resources['turel_gun'].texture;
    let base = new PIXI.Sprite(baseTex);
    let gun = new PIXI.Sprite(gunTex);

    gun.anchor.set(0.5, 0.5);
    base.anchor.set(0.5, 0.5);

    base.addChild(gun);

    //radians in frame 
    const turnSpeed = options.turnSpeed || 0.025;

    base.targetObject = undefined;  
    base.update = function(delta) {
   
        if(base.targetObject) {

            let dx = base.targetObject.position.x - base.position.x ;
            let dy = base.targetObject.position.y - base.position.y;
            let rads = Math.atan2( -dx, dy);
            let dr =  rads - gun.rotation;

            if( Math.abs(dr) < delta * turnSpeed) {
                gun.rotation = rads;
            }else {
                if(dr > 0){
                    gun.rotation += turnSpeed * delta;
                }else {
                    gun.rotation -= turnSpeed * delta;
                }
            }
        }
    }

    app.stage.addChild(base);
    return base;
}
