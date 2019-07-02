import ShipPresenter from "./../presenters/shipPresenter.js";
import BasicPresenter from "./../presenters/basicPresenter.js";
import UfoPresenter from "./../presenters/ufoPresenter.js";
import BulletPresenter from "./../presenters/bulletPresenter.js";
import DebugPresenter from "./../presenters/debugPresenter.js";
import PhysicSystem from "./../presenters/physicSystem.js";

import Bullitizer from "./bullitizer.js";

export const Indexator = {
	index: 0,
	next() {
		return this.index++;
	}
};

export default class Runtime {
	/**
	 * Create runtime for objects processing
	 * @param {PIXI.Application} app
	 * @param {PIXI.Container} root
	 */
	constructor(app, root) {

		this.res = app.loader.resources;
		this.systems = [
			
			//update views
			new BasicPresenter(this, ["basic"], root, this.res),
			new ShipPresenter(this, ["ship"], root, this.res),
			new UfoPresenter(this, ["ufo"], root, this.res),
			new BulletPresenter(this, ["bullet"], root, this.res),

			//compute physics 
			new PhysicSystem(this, ["bullet", "ufo", "ship"]),
			
			//render debug info
			new DebugPresenter(this, [], root)
		];

		this.bullitizer = new Bullitizer(this);
		this.models = [];

		setInterval(() => {
			let all = this.systems;
			const total = all.reduce((acc, e) => {
				return acc + (e._pool ? e._pool.fullSize : 0);
			}, 0);

			const used = all.reduce((acc, e) => {
				return acc + (e._pool ? e._pool.fullSize : 0);
			}, 0);

			console.log("Pools:" + used + "/" + total);
		}, 1000);
	}

	/**
	 * @public
	 * Add modeles to runtime
	 * @param  {...any} models
	 */
	add(...models) {
		models.forEach(element => {
			if (!element.__id) {
				element.__id = Indexator.next();
				this.models.push(element);
			}
		});
	}

	/**
	 * @public
	 * Remove modelse from runtime
	 * @param  {...any} idOrModels
	 */
	remove(...idOrModels) {
		// external remove
		let needFlush = false;
		idOrModels.forEach(idOrModel => {
			let model;
			if (typeof idOrModel == "number") {
				model = this.models.find(e => e.__id == idOrModel);
			} else if (idOrModel.__id !== undefined) {
				model = idOrModel;
			}

			if (model) {
				const index = this.models.indexOf(model);
				if (index > -1) {
					this.models.splice(index, 0);
					needFlush = true;
				}
			}
		});

		if (needFlush) {
			for (let p of this.systems) {
				//only BasicPresenter and inherited can be flushable
				if (p.flush) {
					p.flush();
				}
			}
		}
	}

	/**
	 * @private
	 * remove all marked to kill
	 */
	processKill() {
		const models = this.models;
		const len = models.length;

		let j = 0;
		for (let i = 0; i < len; i++) {
			const m = models[i];
			if (!m.killMe) {
				models[j++] = m;
			}
		}

		models.length = j;

		if (j !== len) {
			for (let p of this.systems) {
				//only BasicPresenter and inherited can be flushable
				if (p.flush) {
					p.flush();
				}
			}
		}
	}

	beforeUpdate(delta) {
		for (let p of this.systems) {
			p.beforeProcess({ delta });
		}
	}

	/**
	 * Update runtime
	 * @param {number} delta
	 */
	update(delta) {
		const models = this.models;
		let len = models.length;

		for (let i = 0; i < len; i++) {
			const m = models[i];
			for (let p of this.systems) {
				p.process(m, { delta });
			}

			if (!m.killMe) {
				this.bullitizer.spawn(m);
			}
		}

		this.processKill();
	}

	afterUpdate(delta) {
		//
		for (let p of this.systems) {
			p.afterProcess({ delta });
		}
	}
}
