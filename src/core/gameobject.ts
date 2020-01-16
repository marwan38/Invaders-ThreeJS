import { Object3D, Scene, Box3, Box3Helper, Color, Mesh } from "three";
import { BaseComponent } from "../components";
import Managers from '../manangers';
import { GameObjectManager } from "../manangers/gameObjectManager";


export class GameObject {
  readonly transform = new Object3D();
  private components: BaseComponent[] = [];

  constructor(public parent: Scene | Object3D, public readonly name: string) {
    this.transform.name = name;
    // For reference later
    this.transform.userData.gameObject = this;
    parent.add(this.transform)
  }

  addComponent(ComponentType: any, ...args: any[]) {
    const cmp = new ComponentType(this, ...args);
    this.components.push(cmp);
    return cmp;
  }

  removeComponent(component) {
    removeArrayElement(this.components, component);
  }

  getComponent(ComponentType: any) {
    return this.components.find(c => c instanceof ComponentType);
  }
  update() {
    for (const component of this.components) {
      component.update();
    }
  }

  destroy() {
    Managers.get(GameObjectManager).removeGameObject(this);
    for (const component of this.components) {
      component.destroy();
    }
    this.parent.remove(this.transform);
  }

}

function removeArrayElement(array, element) {
  const ndx = array.indexOf(element);
  if (ndx >= 0) {
    array.splice(ndx, 1);
  }
}