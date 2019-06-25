import ObjectPool from "../core/objectPool.js";

export default class BasicPresenter {

    /**
	 * Create Basic presenter
	 * @param {PIXI.Container} root - container for views 
	 * @param {number} count  - initial view pool size
	 */
	constructor(root, count = 1) {

		this._modeles = [];
		this.root = root;
		this._pool = new ObjectPool(
			this.createView.bind(this),
			this.initView.bind(this),
			this.resetView.bind(this),
			count
		);

		/**
		 * Actual view list. Refresh after presenting or pair
		 * @type Array
		 */
		this.actualViews = this._pool._used;
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
		this._pool.resize(modeles.length);
		this._modeles = modeles;
		this._modeles.forEach(() => {
			this._pool.get();
		});

		this.actualViews = this._pool._used;
    }
	
	/**
	 * @public
	 * Synchronize models and views
	 * @param {any} args Any arguments
	 */
	present(args = undefined) {
		//filter undef
		const actual = this._modeles.filter(v => !!v);
		const modelesCount = actual.length;
		const viewsCount = this._pool.usedSize;

		//rebild pool when views and models has different size 
		if (viewsCount > modelesCount) {
			for (let i = modelesCount; i < viewsCount; i++) {
				this._pool.releaseFirst();
			}
		} else {
			for (let i = viewsCount; i < modelesCount; i++) {
				this._pool.get();
			}
		}
		
		let views = this._pool._used;
		for (let i = 0; i < modelesCount; i++) {
			this.presentPair(views[i], actual[i], args);
		}

		this.actualViews = views;
    }
	
	/**
	 * Synchronize specific view with specific model
	 * @protected
	 * @param {*} view View
	 * @param {*} model Model
	 * @param {*} args Arguments from 'present' argumnets
	 */
	presentPair(view, model, args) {
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
