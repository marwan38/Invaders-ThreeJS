import { BaseComponent,Movement, Gun } from ".";
import { GameObject } from '../core/gameobject';
import { game } from "../main";
import Managers from '../manangers';
import { InputManager } from "../manangers/inputManager";

export class InputComponent extends BaseComponent {
  constructor(readonly gameObject: GameObject) {
    super(gameObject);
    if (!gameObject.getComponent(Movement)) {
      throw Error('Input component requires movement component to be added before');
    }
  }

  update() {
    const inputManager = Managers.get(InputManager);
    if (inputManager.isDown('left')) {
      this.gameObject.transform.position.x -= 2 * game.clock.deltaTime * this.gameObject.getComponent(Movement)['moveSpeed'];
    } else if (inputManager.isDown('right')) {
      this.gameObject.transform.position.x += 2 * game.clock.deltaTime * this.gameObject.getComponent(Movement)['moveSpeed'];
    }

    if (inputManager.isDown('space')) {
      (this.gameObject.getComponent(Gun) as Gun).fire();
    }
  }
}
