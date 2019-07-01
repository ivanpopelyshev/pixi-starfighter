
import Config from "./../config.js";
import EmptySystem from "./emptySystem.js";

const DRAW_DATA = {
	basic : {
		draw : drawRect,
		color : 0xcccccc
	},
	ufo : {
		draw : drawCircle,
		color : 0xff2222
	},
	ship : {
		draw : drawRect,
		color : 0x22ff22
	},
	snake : {
		draw : drawMesh,
		color : 0xff2222
	}
};

function drawRect(target, obj) {
	let bounds = obj.getBounds();
	target.drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
}

function drawCircle(target, obj) {
	let bounds = obj.getBounds();
	let radius = Math.max(bounds.width, bounds.height) / 2;
	target.drawCircle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, radius);
}

function drawMesh(target, obj){
	if(!obj.geometry || !obj.indices) {
		return;
	}

	obj.updateTransform();
	obj.calculateVertices();

	let verts = obj.vertexData;
	let indices = obj.indices;
	let count = indices.length;

	let points = [];
	
	for (let i = 0; i < count; i += 3) {
		
		points = [];

		for( let j = 0; j < 3; j ++) {
			points.push( verts[ indices[ j + i ] * 2 + 0 ] );
			points.push( verts[ indices[ j + i ] * 2 + 1 ] );
		}

		target.drawPolygon(points);
	
	}

}

export default class DebugPresenter extends EmptySystem {
	/**
	 * Debug presenter
	 * @param {*} runtime
	 * @param {*} allows
	 * @param {PIXI.Container} root 
	 */
	constructor(runtime, allows, root) {
		super(runtime, allows);

		this.graphics = new PIXI.Graphics();
		this.graphics.zIndex = 1000;
		root.sortableChildren = true;
		root.addChild(this.graphics);
	}

	beforeProcess(args) {
		this.graphics.clear();
	}

	process(model, args) {
		if(!model.view || !Config.settings.DEBUG) return;

		const draw_data = DRAW_DATA[model.tag];
		
		if(!draw_data) {
			return;
		}

		this.graphics.lineStyle(2, model.color || draw_data.color || 0x22ff22);
		draw_data.draw(this.graphics, model.view);
	}

	afterProcess() {}

	flush() {}
}
