import { BufferGeometry, Color, BufferAttribute, Math, ShaderMaterial, Points, Int8BufferAttribute, Int16BufferAttribute, AdditiveBlending, VertexColors, Float32BufferAttribute, Vector3 } from "three";
import { game } from "../main";
import { SKY } from "../constants";



const vertexShader = `
attribute float size;
varying vec3 vColor;
varying vec4 vUv;
uniform float time;
void main() {

  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size + sin(5. * time + mvPosition.x + mvPosition.y) * 1.5;
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
  uniform sampler2D pointTexture;
  uniform float time;
  
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4( vColor, 0.75 );
    gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
  }
`;

export class Stars {
  container: Points;
  time = 1.0;
  constructor() {
    const geom = new BufferGeometry();
    const mat = new ShaderMaterial({
      uniforms: {
        pointTexture: { value: game.textures.spark.texture },
        time: { type: 'f', value: 1.0 }
      },
      vertexShader,
      fragmentShader,

      blending: AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      vertexColors: VertexColors
    });
    const positions = [];
    const sizes = [];
    const colors = [];
    const color = new Color();
    // const starColors = [0xffd27d, 0xffa371, 0xffa371, 0xfffa86, 0xa87bff, 0xffffff, 0xffffff, 0xffffff];
    const starColors = [0xffd27d, 0xffa371, 0xffa371,0xffffff, 0xffffff, 0xffffff];
    for (let i = 0; i < SKY.STARS_AMOUNT; i++) {
      const math = (window as any).Math;

      // const z = Math.randFloat(-MAX_DISTANCE, MAX_DISTANCE);
      // const x = (RADIUS * math.cos(i) * Math.randFloat(1, MAX_DISTANCE));
      // const y = (RADIUS * math.sin(i) * Math.randFloat(1, MAX_DISTANCE));
      var x = -1 + math.random() * 2;
      var y = -1 + math.random() * 2;
      var z = -1 + math.random() * 2;
      var d = 1 / math.sqrt(math.pow(x, 2) + math.pow(y, 2) + math.pow(z, 2));
      x *= d;
      y *= d;
      z *= d;
      positions.push(x * SKY.RADIUS * Math.randFloat(1, SKY.MAX_DISTANCE), y * SKY.RADIUS * Math.randFloat(1, SKY.MAX_DISTANCE), z * SKY.RADIUS * Math.randFloat(1, SKY.MAX_DISTANCE));
      color.setHex(starColors[Math.randInt(0, starColors.length - 1)]);
      colors.push(color.r, color.g, color.b);
      sizes.push(Math.randFloat(3, 15));
    }

    geom.addAttribute('position', new Int16BufferAttribute(positions, 3));
    geom.addAttribute('color', new Float32BufferAttribute(colors, 3));
    geom.addAttribute('size', new Int16BufferAttribute(sizes, 1));

    this.container = new Points(geom, mat);
    game.scene.add(this.container);
  }

  private getRandomDirection() {
    const rand = Math.randInt(-1, 1);
    return rand <= 0 ? -1 : 1;
  }

  update() {
    const time = game.clock.time;
    const geom = this.container.geometry as BufferGeometry;
    const sizes = geom['attributes']['size']['array'];
    // @ts-ignore
    this.container.material.uniforms.time.value += game.clock.deltaTime;
    // for (let i = 0; i < sizes.length; i++) {
    //   // @ts-ignore
    //   sizes[i] += window.Math.sin(time) * 1;
    //   // @ts-ignore
    //   geom.attributes.size.needsUpdate = true;
    // }
  }
}
