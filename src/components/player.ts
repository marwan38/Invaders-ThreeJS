import { BaseComponent, Model, Stats, CanDie } from ".";
import { GameObject } from '../core/gameobject';
import { PLAYER_START_Y } from "../constants";
import { game } from "../main";


export class Player extends BaseComponent {
  constructor(readonly gameObject: GameObject) {
    super(gameObject);
    gameObject.transform.position.set(0, PLAYER_START_Y, 0);
    gameObject.addComponent(Model, game.models.Player.gltf);
    gameObject.addComponent(Stats, { hp: 999999, damage: 1 });
    gameObject.addComponent(CanDie);
  }

}