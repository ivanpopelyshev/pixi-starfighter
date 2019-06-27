import Prefabs from "./../prefabs/dataPrefabs.js";
import Config from "./../config.js";
import {EnemyModel} from "./../prefabs/modeles.js";

class Wave {
    
    constructor(runtime) {
        this.runtime = runtime;
        this.offset = new PIXI.Container();
        this.childs = [];
    }

    populate(size, type) {
    }
    update(delta) {
        for(let m of this.childs) {
            if(m){
                m.position.x = m.lPosition.x + this.offset.x;
                m.position.y = m.lPosition.y + this.offset.y
            }
        }
    }
}


export class LineWave extends Wave {

    populate(size = 5, type = "ufo") {
        
        this.runtime.remove(...this.childs);        
        this.childs = [];

        type = Prefabs[type] ? type : "ufo";
        const ufo = Object.assign( {}, Prefabs[type] );
        const {height, width} = Config.renderOptions;
        const step = width / (size + 1);

        for(let i = 0; i < size; i ++) {
            const m = new EnemyModel(type, ufo);
            
            m.lPosition.x = (i + 1)  * step;
            this.childs.push(m);
        }

        this.runtime.add(...this.childs);
    }
}

export class VerticalSinWave extends Wave {
    
    constructor(...args) {
        super(...args);
        this.phase = 0;
    }

    populate(size = 10, type = "ufo", config) {
        
        this.runtime.remove(...this.childs);        
        this.childs = [];

        type = Prefabs[type] ? type : "ufo";
        const ufo = Object.assign( {}, Prefabs[type] );

        config = config || {
            rect : {}, period : size, speed : 0.02
        };
        
        this.populateConf = config;

        const { height = 400, width = 200 } = config.rect || {};
        const step = height / (size + 1);

        for(let i = 0; i < size; i ++) {
            const m = new EnemyModel(ufo.view, ufo);
            
            m.lPosition.x = Math.sin( 2 * i * Math.PI / config.period) * width * 0.5;
            m.lPosition.y = i * step;

            this.childs.push(m);
        }

        this.runtime.add(...this.childs);
    }

    update(delta) {
        
        if(this.childs.length == 0) {
            return;
        }

        const {
            period, rect, speed
        } = this.populateConf;
        
        this.phase += delta * speed;

        for(let i = 0; i < this.childs.length; i ++) {

            const m = this.childs[i];
            
            if(m) { 
                m.lPosition.x = Math.sin( this.phase  + 2 * i * Math.PI / period) * rect.width * 0.5;
            }
        }

        super.update(delta);
    }
}