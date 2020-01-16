import { GameObject } from '../core/gameobject';

/**
 * Base component class
 */
export class BaseComponent {
  constructor(readonly gameObject: GameObject, private args?: any[]) {
  }

  update() { }

  destroy() { }
}