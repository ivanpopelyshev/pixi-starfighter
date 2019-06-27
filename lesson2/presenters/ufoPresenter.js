import BasicPresenter from "./basicPresenter.js";
import { createEnemy } from "./../core/fabrics.js";

export default class UfoPresenter extends BasicPresenter {
	createView() {
		return createEnemy(this.res);
	}
}
