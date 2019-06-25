import ObjectPool from "../core/objectPool.js";

export class BasicPresenter {

    /**
	 * Create Basic presenter
	 * @param {PIXI.Container} root - container for views 
	 * @param {number} count  - initial view pool size
	 */
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
	 * @public
	 * @param {Array} modeles
	 */
	pair(modeles) {
		if (!modeles) {
			return;
		}
		this.pool.resize(modeles.length);
		this._modeles = modeles;
		this._modeles.forEach(() => {
			this.pool.get();
		});
    }
	
	/**
	 * @public
	 * Synchronize models and views
	 */
	present() {
		//filter undef
		const actual = this._modeles.filter(v => !!v);
		const modelesCount = actual.length;
		const viewsCount = this.pool.usedSize;

		//rebild pool when views and models has different size 
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
			this.presentPair(views[i], actual[i]);
		}
    }
	
	/**
	 * Synchronize specific view with specific model
	 * @protected
	 * @param {*} view 
	 * @param {*} model 
	 */
	presentPair(view, model) {
		let { position } = model;
		view.position.set(position.x, position.y);
    }
	
	/**
	 * @protected
	 * Create specific view, called from pool
	 */
	createView() {
		const basic = new PIXI.Sprite(PIXI.Texture.WHITE);
		basic.anchor.set(0.5);
		return basic;
    }
	
	/**
	 * Init view when models array changed, called from pool
	 */
	initView(view) {
		//debug
		console.log("View was be requested!");
		this.root.addChild(view);
    }
	
	/**
	 * Reset view when models array changed, called from pool
	 */
	resetView(view) {
		if (view) {
			this.root.removeChild(view);
		}
		return !!view;
	}
}
