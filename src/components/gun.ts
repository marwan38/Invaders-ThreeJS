import { SafeArray } from './../util/safeArray';
import { BaseComponent, CanDie, Stats, Model } from '.';
import { Object3D, Raycaster, Mesh, BoxBufferGeometry, MeshBasicMaterial, Vector3, Box3, Math, Color } from 'three';
import { GameObject } from '../core/gameobject';

import Managers from '../manangers';
import { game } from '../main';
import { ParticleEffects } from '../core/particles';
import { GameObjectManager } from '../manangers/gameObjectManager';
export class Gun extends BaseComponent {
  private _dtAcc = 0;
  // Shoot once every 0.5s
  private _shootLimit = 0.5;
  private bullets = new SafeArray<Object3D>();
  private _speed = 45;
  private _direction = 'up';

  constructor(readonly gameObject: GameObject) {
    super(gameObject);
    if (gameObject.name.match(/invader/)) {
      this._direction = 'down';
    }
  }

  _makeBullet(): Mesh {
    // Make container and mesh
    const bulletObject = new Object3D();
    // Position it to the gameobject thats using it
    bulletObject.position.copy(this.gameObject.transform.getWorldPosition(new Vector3()));

    const geom = new BoxBufferGeometry(0.2, 2.5, 0.2);
    const mat = new MeshBasicMaterial({ color: 0x00ff00 })
    const mesh = new Mesh(geom, mat);
    bulletObject.add(mesh);

    // Bounding box to check height during collisions
    mesh.geometry.computeBoundingBox();
    bulletObject['bounds'] = mesh.geometry.boundingBox.clone();
    mesh.updateMatrixWorld(true);
    (bulletObject['bounds'] as Box3).copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);

    // Attach the owner of the bullet to it
    bulletObject.userData.owner = this.gameObject;

    // Add it to scene
    game.scene.add(bulletObject);
    // Add to array to reference later
    this.bullets.add(bulletObject);



    return mesh;
  }

  _detectCollision(bullet: Object3D): GameObject | null {
    const bounds = bullet['bounds'] as Box3;

    // Get all game objects that are NOT the one thats firing the bullet
    const goArr = Managers.get(GameObjectManager).gameObjects.array.filter(go => !go.name.includes(this.gameObject.name.substr(0, 5)));
    for (const go of goArr) {
      const { bounds: goBounds } = go.getComponent(Model) as Model;
      if (goBounds) {
        if (
          bounds.intersectsBox(goBounds)
        ) {
          return go;
        }
      }
    }

    return null;
  }

  fire(): Mesh | void {
    if (this._dtAcc >= this._shootLimit) {
      const bul = this._makeBullet();
      this._dtAcc = 0;
      return bul;
    }
  }

  destroy() {
    this.bullets.forEach(b => this._removeBullet(b));
  }

  update() {
    if (this._dtAcc <= this._shootLimit) {
      this._dtAcc += game.clock.deltaTime;
    }

    this.bullets.forEach(bullet => {

      // Check if offscreen
      const { frustum } = game.camera;
      if (!frustum.containsPoint(bullet.position)) {
        this._removeBullet(bullet);
      }

      const mesh = bullet.getObjectByProperty('type', 'Mesh') as Mesh;
      mesh.updateMatrixWorld(true);
      const bulletBounds = bullet['bounds'] as Box3;
      bulletBounds.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);

      if (!bullet) { return; }

      bullet.position.y += this._speed * (this._direction === 'up' ? 1 : -1) * game.clock.deltaTime;

      // Collision
      const collidedObject = this._detectCollision(bullet);
      if (collidedObject) {
        const dieCmp = collidedObject.getComponent(CanDie) as CanDie;
        const statsCmp = bullet.userData.owner.getComponent(Stats) as Stats;
        if (dieCmp) {
          const bulletHeight = bulletBounds.min.y - bulletBounds.max.y;
          const hitLocationY = this._direction === 'up' ? bullet.position.y - bulletHeight / 2 : bullet.position.y - bulletHeight / 2;

          // Get color of hit object for particles
          let color = undefined;
          const modelCmp = (collidedObject.getComponent(Model) as Model);
          if (modelCmp.material) {
            color = new Color().copy(modelCmp.material.color);
          }
          // Create particles
          game.particles.createParticles({ amount: Math.randInt(5, 15), effect: ParticleEffects.InvaderHit, target: collidedObject.transform, color });
          // Deal damanage
          dieCmp.hit(statsCmp.stats.damage);
        }
        this._removeBullet(bullet);
      }
    });
  }

  private _removeBullet(bullet) {
    this.bullets.remove(bullet);
    bullet.parent.remove(bullet);
  }
}
