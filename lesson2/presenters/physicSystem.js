import EmptySystem from "./emptySystem.js";

const 
	tmpRect_a = new PIXI.Rectangle(),
	tmpRect_b = new PIXI.Rectangle(),
	tmpRect_result = new PIXI.Rectangle(),
	tmpCircle = new PIXI.Circle()
	
/**
 * Test Rect Rect intersection
 * @param {PIXI.Rectangle} a 
 * @param {PIXI.Rectangle} b 
 */
function checkRectRect(a, b) {
	
	tmpRect_result.copyFrom(a);
	tmpRect_result.enlarge(b);

	const dw = a.width + b.width - tmpRect_result.width;
	const dh = a.height + b.height - tmpRect_result.height;
	
	return dh < 0 || dw < 0;
}

/**
 * Test Rect Point intersection
 * @param {PIXI.Rectangle} a 
 * @param {{x: number, y: number}} b 
 */
function checkRectPoint(a, b) {
	return a.contains(b.x, b.y);
}

/**
 * Test Circle Point intersection
 * @param {PIXI.Rectangle} a 
 * @param {{x: number, y: number}} b 
 */
function checkCiclePoint(a, b) {
	
	tmpCircle.x = a.x + a.width / 2;
	tmpCircle.y = a.y + a.height / 2;
	//middle radius
	tmpCircle.radius = (a.width + a.height)  / 4;
	
	return tmpCircle.contains(b.x, b.y);
}

/**
 * Test Circle Circle intersection
 * @param {PIXI.Rectangle} a 
 * @param {PIXI.Rectangle} b 
 */
function checkCicleCircle(a, b) {
	tmpRect_a.copyFrom(a);
	tmpRect_b.copyFrom(b);

	const ax = tmpRect_a.x + tmpRect_a.width / 2;
	const ay = tmpRect_a.y + tmpRect_a.height / 2;
	const aradius = (tmpRect_a.width + tmpRect_a.height)  / 4;

	const bx = tmpRect_a.x + tmpRect_a.width / 2;
	const by = tmpRect_a.y + tmpRect_a.height / 2;
	const bradius = (tmpRect_a.width + tmpRect_a.height)  / 4;

	const sqrDist = (ax - bx) ** 2 + (ay - by) ** 2;
	return sqrDist < aradius + bradius;
}

export default class PhysicSystem extends EmptySystem {
	constructor(runtime, allows) {
		super(runtime, allows);
		this._testedPairs = {};
	}

	beforeProcess() {
		this._testedPairs = {};
	}

	process(entity, args) {

	}

}
