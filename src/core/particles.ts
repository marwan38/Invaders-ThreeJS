import { TextureLoader, ShaderMaterial, AdditiveBlending, BufferGeometry, Color, Float32BufferAttribute, Points, VertexColors, SubtractiveBlending, BlendingEquation, SubtractEquation, Vector3, MultiplyBlending, NormalBlending, Mesh, Object3D } from "three";
import { SafeArray } from "../util/safeArray";
import { game } from "../main";

export enum ParticleEffects {
  InvaderHit = 'invader got hit'
}

export interface IParticleOpts {
  amount: number;
  effect: ParticleEffects;
  target?: Object3D | Mesh;
  color?: Color;
}

const vertexShader = `
attribute float size;
varying vec3 vColor;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform sampler2D pointTexture;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4( vColor, 1.0 );
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  }
`;
export class ParticleSystem {
  particles = new SafeArray<Points>();
  uniforms = {};

  constructor() {
    this.uniforms['pointTexture'] = {
      value: game.textures.spark.texture,
    }
  }

  removeParticle(particle: Points) {
    this.particles.remove(particle);
    game.scene.remove(particle);
  }

  createParticles(opts: IParticleOpts) {
    const { amount, effect, target, color } = opts;

    const shaderMaterial = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,

      blending: AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      vertexColors: VertexColors
    });

    const radius = 1;

    const geometry = new BufferGeometry();
    const positions = [];
    const colors = [];
    const sizes = [];
    const thisColor = new Color();

    for (var i = 0; i < amount; i++) {
      positions.push((Math.random() * 2 - 1) * radius);
      positions.push((Math.random() * 2 - 1) * radius);
      positions.push((Math.random() * 2 - 1) * radius);
      if (color) {
        thisColor.copy(color);
      } else {
        thisColor.setHSL(i / amount, 1.0, 0.5);
      }
      colors.push(thisColor.r, thisColor.g, thisColor.b);
      sizes.push(7.5);
    }

    geometry.addAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.addAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.addAttribute('size', new Float32BufferAttribute(sizes, 1));

    const particleSystem = new Points(geometry, shaderMaterial);
    particleSystem.position.copy(target.getWorldPosition(new Vector3()));

    particleSystem.userData.amount = amount;
    particleSystem.userData.effect = effect;
    particleSystem.userData.target = target;
    this.particles.add(particleSystem);
    game.scene.add(particleSystem);
  }

  update() {
    this.particles.forEach(p => {
      if (p.userData.effect === ParticleEffects.InvaderHit) {
        this._invaderGotHitEffect(p);
      }
    })
  }

  private _invaderGotHitEffect(p: Points) {
    const geom = p.geometry as BufferGeometry;

    // @ts-ignore
    const target = p.userData.target as Object3D;
    const positions = geom.attributes.position.array;
    const sizes = geom.attributes.size.array;
    const distance = 1.5 * game.clock.deltaTime;
    const center = new Vector3(0, 0, 0);
    const direction = new Vector3();
    const newPos = new Vector3();
    const currPos = new Vector3();

    // Positions
    for (let i = 0; i < positions.length; i++) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      currPos.set(x, y, z);
      direction.copy(currPos).normalize();
      newPos.copy(currPos).addScaledVector(direction, distance);

      // @ts-ignore
      positions[i] = newPos.x;
      // @ts-ignore
      positions[i + 1] = newPos.y;
      // @ts-ignore
      positions[i + 2] = newPos.z;
    }
    // @ts-ignore
    geom.attributes.position.needsUpdate = true;

    // Size
    for (let i = 0; i < sizes.length; i++) {
      if (sizes[i] <= 0) {
        this.removeParticle(p);
      }
      // @ts-ignore
      sizes[i] -= 9 * game.clock.deltaTime;

    }
    // @ts-ignore
    geom.attributes.size.needsUpdate = true;

  }
}