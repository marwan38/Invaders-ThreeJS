import { BaseComponent, Stats } from '.';
import { GameObject } from '../core/gameobject';

export class CanDie extends BaseComponent {
  hp: number;
  constructor(readonly gameObject: GameObject) {
    super(gameObject);
    const stats = this.gameObject.getComponent(Stats) as Stats;
    if (!stats) {
      throw Error('CanDie component must be added after stats component');
    }

    this.hp = stats.stats.hp;
  }

  hit(amount: number) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this._die();
    }
  }

  private _die() {
    this.gameObject.destroy();
  }
}
