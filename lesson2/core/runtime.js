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
		this._needsRemove = [];

		setInterval(()=>{

			let all = this.presenters;
			const total = all.reduce((acc, e)=> {
				return acc + e._pool.fullSize;
			}, 0);

			const used = all.reduce((acc, e)=> {
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
		idOrModels.forEach(idOrModel => {
	
			let model;
			if (typeof idOrModel == "number") {
				model = this.modeles.find(e => e.__id == idOrModel);
			} else if (idOrModel.id !== undefined) {
				model = idOrModel;
			}

			if (model) {
				const index = this.modeles.indexOf(model);
				if(index > -1) {
					this.modeles.splice(index, 0);
				}
			}
		});
	}

	update(delta) {
		for (let key in this.presenters) {
			this.presenters[key].present({ delta });
		}

		for(let i = this.modeles.length - 1; i >= 0; i --) {

			const m = this.modeles[i];
			if(this.modeles[i].__markedForRemoving) {
				continue;
			}

			if(m.killMe) {
				this._needsRemove.push(m);
				m.__markedForRemoving = true;
				continue;
			}

			this.bullitizer.spawn(this.modeles[i]);
		}

		const trashSize = 50;
		if(this._needsRemove.length > trashSize) {
			this.remove(...this._needsRemove);
			this._needsRemove = [];
		}
	}
}
