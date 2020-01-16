import { Scene, Object3D } from 'three';
import { GameObject } from '../core/gameobject';
import { SafeArray } from '../util/safeArray';
export class GameObjectManager {
  gameObjects = new SafeArray<GameObject>();
  _playerGORef: GameObject;
  get playerGORef() {
    return this._playerGORef;
  }
  set playerGORef(go: GameObject) {
    if (!this._playerGORef) {
      this._playerGORef = go;
    }
  }
  constructor() {
  }
  getGameObjectByName(name: string): GameObject | undefined {
    return this.gameObjects.array.find(go => go.name === name);
  }
  createGameObject(parent: Scene | Object3D, name: string): GameObject {
    const gameObject = new GameObject(parent, name);
    this.gameObjects.add(gameObject);
    return gameObject;
  }
  removeGameObject(gameObject) {
    this.gameObjects.remove(gameObject);
  }
  update() {
    this.gameObjects.forEach(gameObject => gameObject.update());
  }
}