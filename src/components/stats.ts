import { BaseComponent } from ".";
import { GameObject } from '../core/gameobject';

interface IStats {
  hp: number;
  damage: number;
}
export class Stats extends BaseComponent {
  constructor(readonly gameObject: GameObject, public readonly stats: IStats) {
    super(gameObject);
  }
}