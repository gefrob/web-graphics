import {
  BoxGeometry,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Plane,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector3
} from "three";
import { KeyPressed } from "../common/Keyboard";
import { Pointer, MouseButton } from "../common/Pointer";
import { Wheel } from "../common/Wheel";
import { ThreeScene } from "../common/ThreeScene";

const size = 0.1;
const sphere = new SphereGeometry(size, 8, 8);
const cube = new BoxGeometry(size * 1.5, size * 1.5, size * 1.5);
const torus = new TorusGeometry(size, size / 2, 8, 8);
const geometries = [sphere, cube, torus];

const dragging = new Color("yellow");
const red = new Color("red");
const green = new Color("green");
const blue = new Color("blue");
const colors = [red, green, blue];

type pointerStatus = "none" | "down" | "dragging";

type pointerInfo = {
  status: pointerStatus;
  holdElapsed: number;
  holdDuration: number;
};

const pointer: pointerInfo = {
  status: "none",
  holdElapsed: 0,
  holdDuration: 200
};

const baseSpeed = 1;
const shiftMultiplier = 2;
const altMultiplier = 0.5;
const wheelConstant = 0.001;
const pointerRadius = 0.02;

class KeyboardMouse extends ThreeScene {
  #colorIndex = 0;
  #geometryIndex = 0;
  #mainMaterial: MeshBasicMaterial;

  #mainMesh: Mesh;
  #draggingMesh: Mesh;
  #reticle: Mesh;
  #line: Line;

  #raycaster: Raycaster = new Raycaster();
  #lastPointerStatus: pointerStatus;
  #lastMouseButton: MouseButton;

  #plane: Plane = new Plane();
  #projectedVector: Vector3 = new Vector3();
  #movementVector: Vector3 = new Vector3();

  constructor() {
    super();

    this.renderer.domElement.style.cursor = "none";

    this.#plane.normal.set(0, 0, 1);
    this.#lastPointerStatus = pointer.status;
    this.#lastMouseButton = Pointer.Button;

    const mainMaterial = new MeshBasicMaterial({
      color: colors[this.#colorIndex],
      wireframe: true
    });
    const mainGeometry = geometries[this.#geometryIndex];

    const mainMesh = new Mesh(mainGeometry, mainMaterial);
    const draggingMesh = new Mesh(mainGeometry, mainMaterial);

    const reticleGeo = new SphereGeometry(pointerRadius);
    const reticleMaterial = new MeshBasicMaterial({ color: "purple" });
    const reticle = new Mesh(reticleGeo, reticleMaterial);

    const material = new LineBasicMaterial({
      color: 0x0000ff
    });
    const points = [];
    points.push(new Vector3(-0.3, 0.1, 0));
    points.push(new Vector3(0.1, 0.3, 0));
    const geometry = new BufferGeometry().setFromPoints(points);
    const line = new Line(geometry, material);

    draggingMesh.visible = false;
    line.visible = false;

    this.scene.add(mainMesh, draggingMesh, reticle, line);

    this.#mainMesh = mainMesh;
    this.#draggingMesh = draggingMesh;
    this.#reticle = reticle;
    this.#line = line;
    this.#mainMaterial = mainMaterial;

    this.camera.position.z = 1;

    document.body.oncontextmenu = () => false;
  }

  getMovementVector(): Vector3 {
    this.#movementVector.set(0, 0, 0);

    const offset = (this.delta / 1000) * baseSpeed;

    if (KeyPressed.KeyA) {
      this.#movementVector.x -= 1;
    }

    if (KeyPressed.KeyD) {
      this.#movementVector.x += 1;
    }

    if (KeyPressed.KeyW) {
      this.#movementVector.y += 1;
    }

    if (KeyPressed.KeyS) {
      this.#movementVector.y -= 1;
    }

    this.#movementVector.normalize();
    this.#movementVector.multiplyScalar(offset);

    if (KeyPressed.AltLeft || KeyPressed.AltRight) {
      this.#movementVector.multiplyScalar(altMultiplier);
    } else if (KeyPressed.ShiftLeft || KeyPressed.ShiftRight) {
      this.#movementVector.multiplyScalar(shiftMultiplier);
    }

    return this.#movementVector;
  }

  update(time: number, xrFrame?: XRFrame): void {
    super.update(time, xrFrame);

    this.#mainMesh.rotation.x += Wheel.DeltaX * this.delta * wheelConstant;
    this.#mainMesh.rotation.y += Wheel.DeltaY * this.delta * wheelConstant;
    this.#draggingMesh.rotation.copy(this.#mainMesh.rotation);

    if (pointer.status !== "dragging") {
      const moveVector = this.getMovementVector();
      this.#mainMesh.position.add(moveVector);

      if (KeyPressed.KeyR) {
        this.#mainMesh.position.set(0, 0, 0);
        this.#mainMesh.rotation.set(0, 0, 0);
      }
    }

    this.#raycaster.setFromCamera({ x: Pointer.X, y: Pointer.Y }, this.camera);

    this.#raycaster.ray.intersectPlane(this.#plane, this.#projectedVector);
    this.#reticle.position.copy(this.#projectedVector);
    this.#reticle.updateMatrix();
    this.#reticle.updateMatrixWorld(true);

    const intersects = this.#raycaster.intersectObjects([this.#mainMesh]);
    const nonEmptyIntersection = intersects.length !== 0;

    if (Pointer.Button === MouseButton.None) {
      pointer.status = "none";
      pointer.holdElapsed = 0;
    }

    // TODO: count holdElapsed only after the first left click on the mesh
    pointer.holdElapsed += this.delta;

    this.#mainMaterial.wireframe = intersects.length === 0;

    if (nonEmptyIntersection && Pointer.Button !== this.#lastMouseButton) {
      if (Pointer.Button === MouseButton.Left) {
        this.#colorIndex = this.#colorIndex !== 2 ? this.#colorIndex + 1 : 0;
      } else if (Pointer.Button === MouseButton.Right) {
        this.#geometryIndex =
          this.#geometryIndex !== 2 ? this.#geometryIndex + 1 : 0;
      }

      if (Pointer.Button !== MouseButton.None) {
        this.#mainMesh.geometry = geometries[this.#geometryIndex];
        this.#draggingMesh.geometry = geometries[this.#geometryIndex];
      }
    }

    this.#mainMaterial.color.copy(colors[this.#colorIndex]);

    if (
      nonEmptyIntersection &&
      pointer.holdElapsed >= pointer.holdDuration &&
      Pointer.Button === MouseButton.Left
    ) {
      pointer.status = "dragging";
      this.#mainMaterial.color.copy(dragging);
    }

    this.#draggingMesh.visible = pointer.status === "dragging";
    this.#line.visible = pointer.status === "dragging";
    if (pointer.status === "dragging") {
      this.#draggingMesh.position.copy(this.#projectedVector);

      {
        const { x, y, z } = this.#mainMesh.position;
        this.#line.geometry.attributes.position.setXYZ(0, x, y, z);
      }
      {
        const { x, y, z } = this.#draggingMesh.position;
        this.#line.geometry.attributes.position.setXYZ(1, x, y, z);
      }

      this.#line.geometry.attributes.position.needsUpdate = true;
    }

    if (
      this.#lastPointerStatus === "dragging" &&
      pointer.status !== "dragging"
    ) {
      this.#mainMesh.position.copy(this.#draggingMesh.position);
    }

    this.#lastMouseButton = Pointer.Button;
    this.#lastPointerStatus = pointer.status;

    this.render();
  }
}

export { KeyboardMouse };
