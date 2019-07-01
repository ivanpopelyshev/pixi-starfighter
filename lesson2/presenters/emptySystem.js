export default class EmptySystem {
	/**
	 * Empty System
	 * @abstract
	 * @param {*} runtime
	 * @param {Array} allows Allowed tags
	 */
	constructor(runtime, allows) {
		this.runtime = runtime;
		
		this.selector = {};
		if (!Array.isArray(allows)) {
			throw new Error("allowedTags must be Array and can't be empty!");
		}
		allows.forEach(e => (this.selector[e] = true));
	}

	/**
	 * Called before per-entity process
	 * @param {*} args
	 */
	beforeProcess(args) {}

	/**
	 * Called when entity interated
	 * @param {*} enity
	 * @param {*} args
	 */
	process(enity, args) {}

	/**
	 * Called after any processing by entity
	 * @param {*} args
	 */
	afterProcess(args) {}
}
