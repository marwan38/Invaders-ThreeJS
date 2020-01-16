import { ParticleSystem } from './core/particles';
import * as THREE from 'three';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { Camera } from './core/camera';
import { DEBUG, GRID_SIZE, INVADER_SPACING } from './constants';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass';
import Managers from './manangers';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Stars } from './core/background';
import {
  Player,
  Movement,
  Gun,
  InputComponent
} from './components';
import { InvadersManager } from './manangers/invadersManager';
import { GameObjectManager } from './manangers/gameObjectManager';
import { InputManager } from './manangers/inputManager';
const OrbitControls = require('three-orbit-controls')(THREE);

export class Game {
  clock = {
    time: 0,
    deltaTime: 0,
    lastRequestedFrame: 0
  };

  // ThreeJS
  public readonly scene: THREE.Scene;
  private _canvas: HTMLCanvasElement;
  private _renderer: THREE.WebGLRenderer;
  private _stats: Stats;
  private _camera: Camera;
  get camera() { return this._camera; }
  private _composer: EffectComposer;
  private _particles: ParticleSystem;
  get particles() { return this._particles; }
  private _models: { [key: string]: { url: string, gltf: THREE.Mesh, animations: any } } = {
    Player: {
      url: '../src/assets/player.gltf',
      gltf: undefined,
      animations: undefined
    },
    Invader1: {
      url: '../src/assets/invader1.gltf',
      gltf: undefined,
      animations: undefined
    },
    Invader2: {
      url: '../src/assets/invader2.gltf',
      gltf: undefined,
      animations: undefined
    },
    Invader3: {
      url: '../src/assets/invader3.gltf',
      gltf: undefined,
      animations: undefined
    },
    Shield: {
      url: '../src/assets/shield.gltf',
      gltf: undefined,
      animations: undefined
    }
  };
  get models() {
    return this._models;
  }
  private _textures = {
    spark: {
      url: '../src/assets/textures/spark1.png',
      texture: undefined
    }
  };
  get textures() {
    return this._textures;
  }

  // Game related
  private _stars: Stars;

  constructor() {
    // Renderer
    this._canvas = document.querySelector('#c') as HTMLCanvasElement;
    this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas, antialias: true });
    this._renderer.setSize(window.innerWidth, window.innerHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);

    // Stats
    this._stats = new Stats();
    document.body.appendChild(this._stats.dom);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('black');

    // Camera
    this._camera = new Camera();
    this.scene.add(this._camera);
    // Camera controls
    const controls = new OrbitControls(this._camera, this._canvas);
    controls.enableKeys = false;
    controls.target.set(0, 5, 0);
    controls.update();

    // Light
    const color = 0xFFFFFF;
    const intensity = 1.5;
    const width = GRID_SIZE * INVADER_SPACING;
    const height = GRID_SIZE * INVADER_SPACING;
    const light = new THREE.PointLight(color, intensity);
    light.position.set(0, 10, 10);
    light.rotation.x = THREE.Math.degToRad(360);
    this.scene.add(light);
    if (DEBUG) {
      const helper = new THREE.PointLightHelper(light);
      light.add(helper);
    }
    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    this._postProcessing();
    this._preInit();
  }

  private _preInit() {
    // Loading
    const manager = new THREE.LoadingManager();
    manager.onLoad = this._init;
    const loader = new GLTFLoader(manager);
    const textureLoader = new THREE.TextureLoader(manager);

    for (const model of Object.values(this.models)) {
      loader.load(model.url, gltf => {
        gltf.scene.traverse(o => {
          if (o.type === 'Mesh') {
            model.gltf = o as THREE.Mesh;
          }
        });
      });
    }

    for (const texture of Object.values(this._textures)) {
      textureLoader.load(texture.url, loadedTexture => {
        texture.texture = loadedTexture
      })
    }
  }

  private _postProcessing() {
    // Post processing
    const params = {
      exposure: 1.4,
      bloomStrength: 1.5,
      bloomThreshold: 0,
      bloomRadius: 0
    };
    const renderScene = new RenderPass(this.scene, this._camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    this._composer = new EffectComposer(this._renderer);
    this._composer.addPass(renderScene);
    this._composer.addPass(bloomPass);
  }

  private _init = () => {
    this._particles = new ParticleSystem();
    this._stars = new Stars();
    // box.setFromObject(models.Player.gltf.scene);
    // box.getSize(size);

    const player = Managers.get(GameObjectManager).createGameObject(this.scene, 'player');
    player.addComponent(Player)
    player.addComponent(Movement, 7.5);
    player.addComponent(Gun, this.scene);
    player.addComponent(InputComponent);
    Managers.get(GameObjectManager).playerGORef = player;

    requestAnimationFrame(this._render);
  }

  private _rendererToDisplaySize() {
    const canvas = this._renderer.domElement;
    const width = canvas.clientWidth * window.devicePixelRatio | 0;
    const height = canvas.clientHeight * window.devicePixelRatio | 0;
    const needResize = canvas.height !== width || canvas.height !== height;
    if (needResize) {
      this._renderer.setSize(width, height, false);
    }

    return needResize;
  }

  private _render = (now) => {
    requestAnimationFrame(this._render);
    // convert to seconds
    this.clock.time = now * 0.001;
    this.clock.deltaTime = Math.min(this.clock.time - this.clock.lastRequestedFrame, 1 / 60);
    this.clock.lastRequestedFrame = this.clock.time;

    // Responsive check
    if (this._rendererToDisplaySize()) {
      const canvas = this._renderer.domElement;
      this._camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this._camera.updateProjectionMatrix();
    }

    // Update objects
    Managers.get(InputManager).update()
    Managers.get(GameObjectManager).update();
    Managers.get(InvadersManager).update();
    this._camera.update();
    this._particles.update();
    this._stars.update();

    // Render
    this._renderer.render(this.scene, this._camera);
    this._composer.render();

    this._stats.update();
  }
}