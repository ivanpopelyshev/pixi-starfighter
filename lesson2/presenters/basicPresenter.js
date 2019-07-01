import ObjectPool from "../core/objectPool.js";

export default class BasicPresenter {
	/**
	 * Basic presenter
	 * @param {PIXI.Container} root 
	 * @param {PIXI.IResourceDictionary} resourceDict 
	 * @param {*} runtime,
	 * @param {Array} allowedTags
	 */
	constructor(root, resourceDict, runtime, allowedTags) {

		this.selector = [...allowedTags];
		this.root = root;
		this.runtime = runtime;
		this.res = resourceDict;
		
		this._pool = new ObjectPool(
			this.createView.bind(this),
			this.initView.bind(this),
			this.resetView.bind(this),
			0
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
	 * @deprecated Use runtime.Add instead
	 * @param {Array} modeles
	 */
	
	pair(modeles) {
		if (!modeles) {
			return;
		}
		this.add(...modeles);
	}

	/**
	 * Add model to presenter
	 * @deprecated Use Runtime.add instead
	 * @param  {...any} model Model for pairing
	 */
	add(...model) {
		this.runtime.add(...model);
		this.actualViews = this._pool._used;
	}

	/**
	 * Remove model from presenter
	 * @deprecated Use Runtime.remove instead
	 * @param {*} idOrModel 
	 */
	remove(idOrModel) {
		this.runtime.remove(idOrModel);
	}

	/**
	 * @public
	 * @deprecated
	 * Synchronize models and views
	 * @param {any} args Any arguments
	 */
	present(args = undefined) {

		//filter undef and linked tag
		const actual = this.runtime.modeles.filter(v => {
			return v && this.selector.indexOf(v.tag) > -1;
		});
		
		const modelesCount = actual.length;
		const viewsCount = this._pool.usedSize;

		let needRebuildRefs = viewsCount !== modelesCount;
		//rebild pool when views and models has different size
		if (viewsCount > modelesCount) {
			for (let i = modelesCount; i < viewsCount; i++) {
				this._pool.releaseFirst();
			}
		} else if(modelesCount > viewsCount) {
			for (let i = viewsCount; i < modelesCount; i++) {
				this._pool.get();
			}
		}
	
		let views = [...this._pool._used];
		for (let i = 0; i < modelesCount; i++) {
			if(needRebuildRefs) {
				views[i].model = actual[i];
				actual[i].view = views[i];
			}
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
		let {delta = 1} = args;
		
		model.position.x += model.vel.x * delta;
		model.position.y += model.vel.y * delta;
		view.position.set(position.x, position.y);
		view.tint = model.tint || 0xffffff;
		view.scale.set(model.size || 1);
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
