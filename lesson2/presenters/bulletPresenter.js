import BasicPresenter from "./basicPresenter.js";

export default class BulletPresenter extends BasicPresenter {
	
	createView() {
		return super.createView();
	}

	presentPair(view, model, args) {

		if(model.spawntime) {
			const delta = (performance || Date).now() - model.spawntime;

			if(delta > model.lifetime) {
				model.killMe = true;
			}
		}

		super.presentPair(view, model, args);
	}

}