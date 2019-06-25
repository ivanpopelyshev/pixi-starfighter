export default class ObjectPool {
	/**
	 * Classical object pool
	 * @param {Function} generator Object generator
	 * @param {(arg0 : any) => void} beforeGet Called before getting from pool for initialisation
	 * @param {(arg0 : any) => boolean} beforeRelease Called before release. Must return True for saving in pool
	 * @param {number} count Pool initial size
	 */
	constructor(generator, beforeGet, beforeRelease, count = 0) {
		if (!generator || !(generator instanceof Function)) {
			throw new Error("Generator was be Function");
		}

		if (!beforeRelease || !(beforeRelease instanceof Function)) {
			throw new Error("beforeRelease was be Function");
		}

		if (!beforeGet || !(beforeGet instanceof Function)) {
			throw new Error("beforeGet was be Function");
		}
		this._generator = generator;

		this._beforeGet = beforeGet;
		this._onRelease = beforeRelease;

		//populate initial pool
		this._free = Array.from({ length: count }).map(() => {
			let obj = generator();
			beforeRelease(obj);
			return obj;
		});

		this._used = [];
	}
	/**
	 * Get existed or new object from pool
	 * @return {*} Object from pool
	 */
	get() {
		let obj;
		if (this._free.length !== 0) {
			obj = this._free.shift();
		} else {
			obj = this._generator();
		}

		this._beforeGet(obj);
		this._used.push(obj);

		return obj;
	}
	/**
	 * Release object. Call reseter for reseting object state before saving.
	 * @param {*} obj
	 */
	release(obj) {
		let index = this._used.indexOf(obj);
		if (index == -1) {
			return false;
		}
		this._used.splice(index, 1);
		if (this._onRelease(obj)) {
			this._free.push(obj);
		}
		return true;
	}

	/**
	 * Release first used element, like as Array.shift
	 */
	releaseFirst() {
		if(!this._used.length) {
			return;
		}
		const obj = this._used[0];
		return this.release(obj);
	}

	/**
	 * Release used objects
	 */
	releaseAll() {
		for (let i = this._used.length - 1; i >= 0; i--) {
			this.release(this._used[i]);
		}
	}
	/**
	 * Resize pool. Release all used objects!
	 * @param {number} count Target pool size
	 */
	resize(count = 0) {
		if (count < 0) return;

		this.releaseAll();

		const delta = count - this._free.length;
		if (delta > 0) {
			for (let i = 0; i < delta; i++) {
				this._free.push(this._generator());
			}
		} else {
			this._free.length = count;
		}
	}
	/**
	 * Full size of pool (used and free objects)
	 */
	get fullSize() {
		return this._free.length + this._used.length;
	}
	/**
	 * Size of free objects. How many you can get before generator will be called
	 */
	get freeSize() {
		return this._free.length;
	}
	/**
	 * How many polled objects is used
	 */
	get usedSize() {
		return this._used.length;
	}
}
