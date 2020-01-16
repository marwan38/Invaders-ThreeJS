import { DEBUG } from './../constants';
import { BaseComponent } from ".";
import { Box3, Box3Helper, Mesh, MeshStandardMaterial, Color } from "three";
import { GameObject } from '../core/gameobject';
import { game } from '../main';

export class Model extends BaseComponent {
  bounds: Box3;
  helper: Box3Helper;

  constructor(readonly gameObject: GameObject, public modelMesh: Mesh, public material?: MeshStandardMaterial) {
    super(gameObject);
    const mesh = modelMesh.clone();

    if (material)
      mesh.material = material;


    gameObject.transform.add(mesh);
    this.generateBounds();
  }

  generateBounds() {
    this.bounds = new Box3().setFromObject(this.gameObject.transform);
    if (DEBUG) {
      this.helper = new Box3Helper(this.bounds, new Color('green'));
      game.scene.add(this.helper);
    }
  }
  update() {
    // heavy on cpu?
    this.bounds.setFromObject(this.gameObject.transform)
  }

  destroy() {
    game.scene.remove(this.helper);
  }
}