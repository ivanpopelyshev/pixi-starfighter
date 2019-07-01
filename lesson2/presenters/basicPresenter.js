import ObjectPool from "../core/objectPool.js";

export default class BasicPresenter {
	/**
	 * Basic presenter
	 * @param {PIXI.Container} root 
	 * @param {PIXI.IResourceDictionary} resourceDict 
	 * @param {*} runtime 
	 */
	constructor(root, resourceDict, runtime) {

		this.modeles = [];
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
	 * @param {Array} modeles
	 */
	pair(modeles) {
		if (!modeles) {
			return;
		}

		this._pool.resize(modeles.length);
		this.modeles = [];

		this.add(...modeles);

		this.actualViews = this._pool._used;
	}

	/**
	 * Add model to presenter
	 * @param  {...any} model Model for pairing
	 */
	add(...model) {
		for(let m of model) {
			if(this.modeles.indexOf(m) == -1) {
				const view = this._pool.get();
				m.view = view;
				view.model = m;
				this.modeles.push(m);
				return true;
			}
		}
		return false;
	}

	remove(idOrModel) {
		
		let model;
		if(typeof idOrModel == "number") {
			model = this.modeles.find((e) => e.id == idOrModel);
		}else if(idOrModel.id !== undefined) {
			model = idOrModel;
		}

		if(model) {
			const index = this.modeles.indexOf(model);
			delete this.modeles[index];
		}
	}

	/**
	 * @public
	 * Synchronize models and views
	 * @param {any} args Any arguments
	 */
	present(args = undefined) {
		//filter undef
		const actual = this.modeles.filter(v => !!v);
		const modelesCount = actual.length;
		const viewsCount = this._pool.usedSize;

		let needRebuildRefs = false;
		//rebild pool when views and models has different size
		if (viewsCount > modelesCount) {
			for (let i = modelesCount; i < viewsCount; i++) {
				this._pool.releaseFirst();
			}
			needRebuildRefs = true;
		} else {
			for (let i = viewsCount; i < modelesCount; i++) {
				this._pool.get();
			}
			needRebuildRefs = true;
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
