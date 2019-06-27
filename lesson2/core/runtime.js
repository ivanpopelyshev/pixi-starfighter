import ShipPresenter from "./../presenters/shipPresenter.js";
import BasicPresenter from "./../presenters/basicPresenter.js";
import UfoPresenter from "./../presenters/ufoPresenter.js";

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
			ufo: new UfoPresenter(root, this.res, this)
		};

		this._modeles = [];
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
			}
		});
	}

	update(delta) {
		for (let key in this.presenters) {
			this.presenters[key].present({ delta });
		}
	}
}
