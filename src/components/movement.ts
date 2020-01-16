import { BaseComponent } from ".";
import { GameObject } from '../core/gameobject';

export class Movement extends BaseComponent {
  constructor(readonly gameObject: GameObject, public moveSpeed: number) {
    super(gameObject);
  }
}