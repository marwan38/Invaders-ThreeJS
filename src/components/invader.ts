import { BaseComponent,Model, Gun } from ".";
import { GameObject } from '../core/gameobject';
import { MeshStandardMaterial, Vector3, Color, Math } from "three";
import { game } from "../main";
import Managers from '../manangers';
import { InvadersManager } from "../manangers/invadersManager";

export class Invader extends BaseComponent {
  shootLimit = 1;
  _dtAcc = 0;

  constructor(readonly gameObject: GameObject, private type: 1 | 2 | 3, private startingPos: Vector3) {
    super(gameObject);
    let model;
    const material = new MeshStandardMaterial({
      // map: mesh.material['map'],
      roughness: 0.7,
      metalness: 0.5
    });
    switch (type) {
      case 1:
        model = game.models.Invader1.gltf;
        material.color = new Color('#55D6BE');
        break;
      case 2:
        model = game.models.Invader2.gltf;
        material.color = new Color('#46237A');
        break;
      case 3:
        model = game.models.Invader3.gltf;
        material.color = new Color('#22223B');
        break;
    }
    gameObject.transform.position.copy(startingPos);
    gameObject.addComponent(Model, model, material);
    gameObject.addComponent(Gun);
  }

  shoot() {
    const gunCmp = this.gameObject.getComponent(Gun) as Gun;
    gunCmp.fire();
  }


  update() {
    this._dtAcc += game.clock.deltaTime;
    if (this._dtAcc >= this.shootLimit) {
      // Increase chance of firing as invaders decrease
      if (Math.randFloat(0, 1) < 1 / Managers.get(InvadersManager).container.children.length) {
        this.shoot();
      }
      this._dtAcc = 0;
    }
  }
}
