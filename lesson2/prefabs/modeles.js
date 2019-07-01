//basic data model
export class BasicModel {
	constructor(tag = "basic") {
		this.position = new PIXI.Point(0, 0);
		this.vel = new PIXI.Point(0, 0);
		this.tag = tag;
		this.tint = 0xffffff;
		this.size = 1;
	}
}


//player data model
export class EnemyModel extends BasicModel {
	constructor(type, dict) {
		super(type);
		this.config = dict;
		this.lPosition = new PIXI.Point();
		this.size = this.config.size;
	}
}
//player data model
export class PlayerModel extends EnemyModel {
	constructor(dict) {
		super("ship", dict);
		this.target = new PIXI.Point(0, 0);
	}
}


//player data model
export class BulletModel extends BasicModel {
	constructor(dict) {
		super("bullet");
		this.config = dict;
		this.size = this.config.size || 1;
		this.damage = this.config.damage || 1;
		this.owner = undefined;
		this.lifetime = this.config.lifetime || 1000;
		this.spawntime = (performance || Date).now();
	}
}
