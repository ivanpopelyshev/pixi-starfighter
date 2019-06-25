import ObjectPool from "../core/objectPool.js";

export class BasicPresenter {
    
	constructor(root, count = 1) {
		this._modeles = [];
		this.root = root;
		this.pool = new ObjectPool(
			this.createView.bind(this),
			this.initView.bind(this),
			this.resetView.bind(this),
			count
		);
    }
    
	/**
	 * Pair models and presenter
	 * @param {Array} modeles
	 */
	pair(modeles) {
		if (!modeles || !modeles.length) {
			return;
		}
		this.pool.resize(modeles.length);
		this._modeles = modeles;
		this._modeles.forEach(() => {
			this.pool.get();
		});
    }
    
	present() {
		//filter undef
		const actual = this._modeles.filter(v => !!v);
		const modelesCount = actual.length;
		const viewsCount = this.pool.usedSize;
		if (viewsCount > modelesCount) {
			for (let i = modelesCount; i < viewsCount; i++) {
				this.pool.releaseFirst();
			}
		} else {
			for (let i = viewsCount; i < modelesCount; i++) {
				this.pool.get();
			}
		}
		let views = this.pool._used;
		for (let i = 0; i < modelesCount; i++) {
			this.presentPair(views[i], this._modeles[i]);
		}
    }
    
	presentPair(view, model) {
		let { position } = model;
		view.position.set(position.x, position.y);
    }
    
	createView() {
		const basic = new PIXI.Sprite(PIXI.Texture.WHITE);
		basic.anchor.set(0.5);
		return basic;
    }
    
	initView(view) {
		//debug
		console.log("View was be requested!");
		this.root.addChild(view);
    }
    
	resetView(view) {
		if (view) {
			this.root.removeChild(view);
		}
		return !!view;
	}
}
