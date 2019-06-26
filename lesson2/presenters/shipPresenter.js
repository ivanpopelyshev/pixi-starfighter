import BasicPresenter from "./basicPresenter.js";
import { createAnimatedShip } from "./../core/fabrics.js";

export default class ShipPresenter extends BasicPresenter {
	/**
	 * Create Presenter for animated ships
	 * @override
	 * @param {PIXI.Container} root
	 * @param {PIXI.IResourceDictionary} resources
	 */
	constructor(root, resources) {
		super(root, 0);
		this.res = resources;
	}

	createView() {
		return createAnimatedShip(this.res);
	}

	/**
	 * @override
	 */
	presentPair(view, model, args) {
		let { position, target, speed = 5 } = model;

		let { delta = 1 } = args;

		let frame = 0;
		let dx = target.x - position.x;
		let dy = target.y - position.y;

		if (Math.abs(dx) < speed * delta) {
			position.x = target.x;
			dx = 0;
		} else {
			position.x += speed * delta * Math.sign(dx);
		}

		if (Math.abs(dy) < speed * delta) {
			position.y = target.y;
			dy = 0;
		} else {
			position.y += speed * delta * Math.sign(dy);
		}

		if (dx > 0) {
			frame = 3; // turn right
		} else if (dx < 0) {
			frame = 1; //turn left
		}

		view.position.copyFrom(position);
		view.gotoAndStop(frame);
	}
}
