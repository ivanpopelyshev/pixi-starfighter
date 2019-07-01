import ShipPresenter from "./../presenters/shipPresenter.js";
import BasicPresenter from "./../presenters/basicPresenter.js";
import UfoPresenter from "./../presenters/ufoPresenter.js";
import BulletPresenter from "./../presenters/bulletPresenter.js";

import Bullitizer from "./bullitizer.js";

export const Indexator = {
	index: 0,
	next() {
		return this.index++;
	}
};

export default class Runtime {
	constructor(app, root) {
		this.res = app.loader.resources;
		this.presenters = [
			new BasicPresenter(root, this.res, this, ["basic"]),
			new ShipPresenter(root, this.res, this, ["ship"]),
			new UfoPresenter(root, this.res, this, ["ufo"]),
			new BulletPresenter(root, this.res, this, ["bullet"])
		];

		this.bullitizer = new Bullitizer(this);
		this.modeles = [];

		setInterval(() => {

			let all = this.presenters;
			const total = all.reduce((acc, e) => {
				return acc + e._pool.fullSize;
			}, 0);

			const used = all.reduce((acc, e) => {
				return acc + e._pool.usedSize;
			}, 0);

			console.log("Pools:" + used + "/" + total);
		}, 1000);
	}

	add(...modeles) {
		modeles.forEach(element => {
			if (!element.__id) {
				element.__id = Indexator.next();
				this.modeles.push(element);
			}
		});
	}

	remove(...idOrModels) {

		// external remove
		let needFlush = false;
		idOrModels.forEach(idOrModel => {
			let model;
			if (typeof idOrModel == "number") {
				model = this.modeles.find(e => e.__id == idOrModel);
			} else if (idOrModel.__id !== undefined) {
				model = idOrModel;
			}

			if (model) {
				const index = this.modeles.indexOf(model);
				if (index > -1) {
					this.modeles.splice(index, 0);
					needFlush = true;
				}
			}
		});

		if(needFlush){
			for (let p of this.presenters) {
				p.flush();
			}
		}
	}
	
	processKill() {
		// remove all marked to kill
		const models = this.modeles;
		const len = models.length;
		
		let j = 0;
		for (let i = 0; i < len; i++) {
			const m = models[i];
			if (!m.killMe) {
				models[ j++ ] = m;
			}
		}

		models.length = j;
		if(j !== len) {
			for (let p of this.presenters) {
				p.flush();
			}
		}
	}

	update(delta) {
		const models = this.modeles;
		let len = models.length;

		for (let i = 0; i < len; i++) {
			
			const m = models[i];
			for (let p of this.presenters) {
				p.present(m, {delta});
			}

			if(!m.killMe) {
				this.bullitizer.spawn(m);
			}
		}
		
		this.processKill();
	}
}
