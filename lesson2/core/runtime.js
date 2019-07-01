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
		this.presenters = {
			basic: new BasicPresenter(root, this.res, this),
			ship: new ShipPresenter(root, this.res, this),
			ufo: new UfoPresenter(root, this.res, this),
			bullet : new BulletPresenter(root, this.res, this)
		};

		this.bullitizer = new Bullitizer(this);
		this._modeles = [];
		this._needsRemove = [];

		setInterval(()=>{
			let all = Object.values(this.presenters);
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
			let presenter = this.presenters[element.tag || "basic"];
			if (!presenter) {
				presenter = this.presenters.basic;
			}

			if (presenter.add(element)) {
				element.id = Indexator.next();
				element.__presenter = presenter;
				this._modeles.push(element);
			}
		});
	}

	remove(...idOrModels) {
		idOrModels.forEach(idOrModel => {
			let model;
			if (typeof idOrModel == "number") {
				model = this._modeles.find(e => e.id == idOrModel);
			} else if (idOrModel.id !== undefined) {
				model = idOrModel;
			}

			if (model) {
				const p = model.__presenter;
				p.remove(model);
				const index = this._modeles.indexOf(model);
				if(index > -1) {
					this._modeles.slice(index, 0);
				}
			}
		});
	}

	update(delta) {
		for (let key in this.presenters) {
			this.presenters[key].present({ delta });
		}

		for(let i = this._modeles.length - 1; i >= 0; i --) {

			const m = this._modeles[i];
			if(this._modeles[i].__markedForRemoving) {
				continue;
			}

			if(m.killMe) {
				this._needsRemove.push(m);
				m.__markedForRemoving = true;
				continue;
			}

			this.bullitizer.spawn(this._modeles[i]);
		}

		const trashSize = 50;
		if(this._needsRemove.length > trashSize) {
			this.remove(...this._needsRemove);
			this._needsRemove = [];
		}
	}
}
