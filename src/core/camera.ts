import { PerspectiveCamera, Matrix4, Frustum } from "three";
import { aspect } from "../constants";

export class Camera extends PerspectiveCamera {
  public readonly projScreenMatrix = new Matrix4();
  public readonly frustum = new Frustum();

  constructor(private _fov = 45, private _near = 1, private _far = 1000) {
    super(_fov, aspect, _near, _far);
    this.position.set(0, 10, 100);
  }

  update() {
    this.projScreenMatrix.multiplyMatrices(
      this.projectionMatrix,
      this.matrixWorldInverse);
    this.frustum.setFromMatrix(this.projScreenMatrix);
  }
}