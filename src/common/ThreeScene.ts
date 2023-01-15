import { Scene } from "./Scene";
import { PerspectiveCamera, Scene as THREEScene, WebGLRenderer } from "three";
import { connectKeyboard } from "./Keyboard";
import { connectPointer } from "./Pointer";
import { connectWheel } from "./Wheel";

abstract class ThreeScene extends Scene {
  renderer: WebGLRenderer;
  scene: THREEScene;
  camera: PerspectiveCamera;

  #disconnectKB: () => void;
  #disconnectP: () => void;
  #disconnectW: () => void;

  #resizeListener: () => void;

  constructor(canvas?: HTMLCanvasElement) {
    super();

    const { innerWidth: width, innerHeight: height } = window;

    const renderer = new WebGLRenderer({ canvas });
    renderer.setSize(width, height);
    if (!canvas) {
      document.body.appendChild(renderer.domElement);
    }

    const scene = new THREEScene();
    const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.#disconnectKB = connectKeyboard();
    this.#disconnectP = connectPointer();
    this.#disconnectW = connectWheel();

    this.#resizeListener = () => {
      const width = window.innerWidth * window.devicePixelRatio;
      const height = window.innerHeight * window.devicePixelRatio;
      const aspect = width / height;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };
    window.addEventListener("resize", this.#resizeListener);
  }

  destroy(): void {
    document.body.removeChild(this.renderer.domElement);
    window.removeEventListener("resize", this.#resizeListener);

    this.#disconnectKB();
    this.#disconnectP();
    this.#disconnectW();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }
}

export { ThreeScene };
