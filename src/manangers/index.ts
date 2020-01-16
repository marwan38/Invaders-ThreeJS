import { GameObjectManager } from "./gameObjectManager";
import { InputManager } from "./inputManager";
import { InvadersManager } from "./invadersManager";


type types = GameObjectManager | InputManager | InvadersManager;
class Managers {
  static types: types;
  managers = {};

  constructor() { }

  get<T>(mngr: {new(): T}): T {
    const { name } = mngr;

    if (!this.managers[name]) {
      this.managers[name] = new mngr();
    }
    return this.managers[name];
  }

}

export default new Managers();