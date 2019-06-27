/// <reference types="./../../types/pixi.js" />

import Config from "./../config.js";
import Runtime from "./../core/runtime.js";
import { PlayerModel, BasicModel } from "./../prefabs/modeles.js";
import { LineWave, VerticalSinWave } from "./../core/wave.js";

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

		this.waves = {
			line  : new LineWave(this.runtime),
			sine : new VerticalSinWave(this.runtime)
		}

		this.backgroundY = 0;

		this.player = new PlayerModel();
		this.player.position.set(Config.renderOptions.width * 0.5, (Config.renderOptions.height * 2) / 3);
		this.player.target.copyFrom(this.player.position);
		this.runtime.add(this.player);

		this.waves.line.populate(10);
		this.waves.line.offset.y = 0;
		
		this.waves.sine.populate(10, "ufoBig", {
			rect : {
				width : Config.renderOptions.width * 0.5,
				height : 1000
			},
			period : 5,
			speed : 0.05
		});

		this.waves.sine.offset.y = -1000;
		this.waves.sine.offset.x = Config.renderOptions.width / 2;

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
				bullet.tint = Math.random() * 0xffffff;
				bullet.size = 1 + Math.random() * 2;
				bullet.vel.y -= bullet.size * 5;
				
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

		//update wave runtime
		for(let key in this.waves) {
			this.waves[key].update(delta);
			this.waves[key].offset.y += 1 * delta;
		}

		//update core runtime
		this.runtime.update(delta);

		this.app.background.offset.set(-this.player.position.x / 10, -this.player.position.y / 10);
	}
}
