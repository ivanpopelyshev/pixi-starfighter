import {BulletModel} from "./../prefabs/modeles.js";
/**
 * @description Model Guns config defenition
 * @typedef {Object} GunsConfig
 * @property {number} firerate
 * @property {Array} guns
 * @property {string} firemode
 */

const FIREMODE = {
	ONETIME : 'onetime',
	SEQUENTIAL : 'sequential'
};

function now() {
	return (performance || Date).now();
}

export default class Bullitizer {
	constructor(runtime) {
		this.runtime = runtime;
	}

	spawn (model) {
		if(!model) return;
		
		/**
		 * @type {GunsConfig}
		 */
		const config = model.config;
		if(!config) return;
		if(!config.guns || config.guns.length == 0) return;

		const fr = 1000 / (config.firerate || 1);

		const time = now();

		const latest = model.__bullitizer || {
			time : time - fr , gunId : 0
		};
		
		if( time - latest.time < fr) {
			return;
		}

		if(config.firemode === FIREMODE.SEQUENTIAL) {
			
			this._fire(model, config.guns[latest.gunId], config);
			latest.gunId = (latest.gunId + 1) % (config.guns.length || 1);

		} else {
			for(let i = 0; i < config.guns.length; i++) {
				this._fire(model, config.guns[i], config);
			}
			latest.gunId = 0;
		}

		latest.time = time;
		model.__bullitizer = latest;

	}
	
	_fire(model, gun, config) {
		const x = model.position.x + gun.offset.x;
		const y = model.position.y + gun.offset.y;

		const dx = gun.dir.x;
		const dy = gun.dir.y;

		const type = config.bulettype;
		const speed = config.bulletspeed;

		const b = new BulletModel({
			damage : config.bulletdamage
		});
		b.position.set(x, y);
		b.vel.set(dx * speed, dy * speed);
		b.owner = model;

		this.runtime.add(b);
	}

	makeSpawner(model) {

		const model__ = model;
		const scope__ = this;
		return  {
			bullitizer : scope__,
			update() {
				scope__.spawn(model__);
			}
		};
	}
}