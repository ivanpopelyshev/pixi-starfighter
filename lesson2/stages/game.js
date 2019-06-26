/// <reference types="./../../types/pixi.js" />

import Config from "./../config.js";
import Runtime from "./../core/runtime.js";

//basic data model
class BasicModel {
	constructor(tag = "basic") {
		this.position = new PIXI.Point(0, 0);
		this.vel = new PIXI.Point(0, 0);
		this.tag = tag;
	}
}

//player data model
class PlayerModel extends BasicModel {
	constructor() {
		super("ship");
		this.target = new PIXI.Point(0, 0);
	}
}

export default class Game extends PIXI.Container {
	/**
	 * Create game stage
	 * @param {PIXI.Application} app
	 */
	constructor(app) {
		super();
		this.app = app;
		let shipsContainer = new PIXI.Container();

		this.runtime = new Runtime(app, shipsContainer);

		this.backgroundY = 0;

		this.player = new PlayerModel();
		this.player.position.set(Config.renderOptions.width * 0.5, (Config.renderOptions.height * 2) / 3);
		this.player.target.copyFrom(this.player.position);
		this.runtime.add(this.player);

		this.bindInput();

		this.addChild(shipsContainer);
	}

	bindInput() {
		this.interactive = true;
		this.hitArea = new PIXI.Rectangle(0, 0, Config.renderOptions.width, Config.renderOptions.height);

		this.on("pointermove", event => {
			let pos = event.data.global;

			//clamp target position
			pos.x = Math.max(64, Math.min(pos.x, Config.renderOptions.width - 64));
			pos.y = Math.max(
				Config.renderOptions.height - Config.renderOptions.width - 64 * 3,
				Math.min(pos.y, Config.renderOptions.height - 64)
			);

			this.player.target.copyFrom(pos);
		});

		let fire;
		this.on("pointerdown", event => {

			clearInterval(fire);
			fire = setInterval(() => {
				const bullet = new BasicModel();
				bullet.vel.y -= 20;
				bullet.position.copyFrom(this.player.position);
				this.runtime.add(bullet);
				setTimeout(() => {
					this.runtime.remove(bullet);
				}, 2000);
			}, 100);
			
		});

		this.on("pointerup", event => {
			clearInterval(fire);
		});
	}

	/**
	 * Update stage
	 * @param {number} delta
	 */
	update(delta) {
		this.runtime.update(delta);

		this.app.background.offset.set(-this.player.position.x / 10, -this.player.position.y / 10);
	}
}
