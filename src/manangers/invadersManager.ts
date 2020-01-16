import { INVADER_ROWS, INVADER_COLUMNS, INVADER_SPACING, DEBUG, PLAYER_START_Y } from '../constants';
import { Invader, CanDie, Stats, Model } from '../components';
import { Object3D, Box3, Vector3, Scene, Box3Helper, Color } from "three";
import { GameObject } from "../core/gameobject";
import Managers from '.';
import { game } from '../main';
import { GameObjectManager } from './gameObjectManager';

export class InvadersManager {
  // The object itself
  public readonly container = new Object3D();
  // Starting poisition Y
  private START_Y = 5;
  // How much to move per move tick
  private _movementX = 10;
  private _movementY = 2.5;
  // Max movement state
  private MAX_MOVE_LEFT;
  private MAX_MOVE_RIGHT;
  // Last detected collision with walls (limit of movement)
  private LAST_DETECTED_COLLISION: 'right' | 'left' = 'left';
  private _active = true;
  // Deltatime accumulator
  private _dtAcc = 0;

  // Original bounding box of invaders (start of the game)
  private _box: Box3;
  private _boxHelper: Box3Helper;
  // Original Size of invaders (start of the game)
  private _size: Vector3 = new Vector3();

  constructor() {
    this._createInvaders();
    this._setBounds();
    this._setMaxMovementRange();
    // Initial position
    this.container.position.set(0, this.START_Y, 0);
    game.scene.add(this.container);
  }

  private _createInvaders() {
    for (let y = INVADER_ROWS; y > 0; y--) {
      let invaderType = 1;
      switch (y) {
        case 5:
        case 6:
          invaderType = 1;
          break;
        case 3:
        case 4:
          invaderType = 2;
          break;
        case 1:
        case 2:
          invaderType = 3;
          break;
      }
      for (let x = 0; x < INVADER_COLUMNS; x++) {
        const pos = new Vector3(
          (x - INVADER_COLUMNS / 2.25) * INVADER_SPACING,
          Math.abs((y) * INVADER_SPACING),
          0
        );
        const invader = Managers.get(GameObjectManager).createGameObject(this.container, `invader${x}${y}`);
        invader.addComponent(Invader, invaderType, pos);
        const stats = this._returnInvaderStats(invaderType);
        invader.addComponent(Stats, stats);
        invader.addComponent(CanDie);
      }
    }
  }

  private _returnInvaderStats(type: number) {
    const stats = { hp: 0, damage: 0 };
    switch (type) {
      case 1:
        stats.hp = 3;
        stats.damage = 3;
        break;
      case 2:
        stats.hp = 2;
        stats.damage = 2;
        break;
      case 3:
        stats.hp = 1;
        stats.damage = 1;
        break;
      default:
        stats.hp = 10;
        stats.damage = 10;
    }
    return stats;
  }

  private _setMaxMovementRange() {
    this._box.getSize(this._size);
    const _maxMovement = this._size.x / 4;
    this.MAX_MOVE_RIGHT = _maxMovement;
    this.MAX_MOVE_LEFT = _maxMovement - this._size.x / 2;
  }

  // Called after all invaders have been init
  private _setBounds() {
    this._box = new Box3().setFromObject(this.container);

    if (DEBUG && !this._boxHelper) {
      this._boxHelper = new Box3Helper(this._box, new Color('red'));
      this.container.add(this._boxHelper);
    }
  }

  private _collisionDetection(): 'right' | 'left' {
    let collision;
    if (this.container.position.x < this.MAX_MOVE_LEFT) {
      collision = 'left';
    } else if (this.container.position.x > this.MAX_MOVE_RIGHT) {
      collision = 'right';
    }

    if (collision) {
      this.LAST_DETECTED_COLLISION = collision;
    }

    return collision;
  }

  private _move() {
    const shouldMoveRight = this.LAST_DETECTED_COLLISION === 'left';
    const shouldMoveLeft = this.LAST_DETECTED_COLLISION === 'right';

    if (shouldMoveRight) {
      this.container.position.x += game.clock.deltaTime * this._movementX;
    } else if (shouldMoveLeft) {
      this.container.position.x -= game.clock.deltaTime * this._movementX;
    }
  }

  private _moveDown() {
    this.container.position.y -= this._movementY;
  }

  update() {
    if (!this._active) {
      return;
    }
    this._move();
    // Move down every time invaders hit the left wall (1 cycle)
    if (this._collisionDetection() === 'left') {
      this._moveDown();

      // When invaders are low enough we start checking for collision between them
      // and the player
      if (this.container.position.y <= PLAYER_START_Y) {
        for (const invader of this.container.children) {
          const gameObject = invader.userData.gameObject as GameObject;
          // Can be the bounding box of the container
          // we dont want that
          if (gameObject) {
            const playerBounds = (Managers.get(GameObjectManager).playerGORef.getComponent(Model) as Model).bounds;
            const invaderBounds = (gameObject.getComponent(Model) as Model).bounds;

            if (invaderBounds.intersectsBox(playerBounds)) {
              alert(' GAME OVER ');
            }
          }
        }
      }
    }
  }
}