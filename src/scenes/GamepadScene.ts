import {
  BoxGeometry,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial
} from "three";
import {
  Axes,
  Button,
  getEmptyButtonState,
  setButtonState
} from "../common/Gamepad";
import { ThreeScene } from "../common/ThreeScene";

/**
 * Move with left stick, press left stick to reset
 * Rotate with right stick
 * Left bumper to toggle wireframe
 * Triggers to scale
 * X + A to rumble. Works only in chrome
 * PS Touchpad - make cube wider
 */

const DeadZone = 0.15;

class GamepadScene extends ThreeScene {
  #mesh: Mesh;
  #material: MeshStandardMaterial;
  #lastBState = getEmptyButtonState();

  constructor() {
    super();

    const s = 0.1;
    this.#material = new MeshStandardMaterial();
    this.#mesh = new Mesh(new BoxGeometry(s, s, s), this.#material);
    this.scene.add(this.#mesh);

    const light = new HemisphereLight(0xffffbb, 0x080820, 1);
    this.scene.add(light);

    this.camera.position.z = 1;
  }

  update(time: number, xrFrame?: XRFrame): void {
    super.update(time, xrFrame);

    const [gamepad] = navigator.getGamepads();
    if (gamepad) {
      const lbPressed = gamepad.buttons[Button.LB].pressed;
      if (lbPressed && this.#lastBState.LB !== lbPressed) {
        this.#material.wireframe = !this.#material.wireframe;
      }

      const scaleSmaller = gamepad.buttons[Button.LT].value;
      const scaleBigger = gamepad.buttons[Button.RT].value;

      this.#mesh.scale.setScalar(1 - scaleSmaller * 0.9 + scaleBigger * 0.9);

      const x = gamepad.axes[Axes.LHorizontal];
      const y = gamepad.axes[Axes.LVertical];

      if (Math.abs(x) > DeadZone) {
        this.#mesh.position.x += x * 0.02;
      }

      if (Math.abs(y) > DeadZone) {
        this.#mesh.position.y -= y * 0.02;
      }

      if (gamepad.buttons[Button.LSB].pressed) {
        this.#mesh.position.set(0, 0, 0);
      }

      const xR = gamepad.axes[Axes.RVertical] * Math.PI;
      const yR = gamepad.axes[Axes.RHorizontal] * Math.PI;

      this.#mesh.rotation.set(xR, yR, 0);

      const A = gamepad.buttons[Button.A].pressed;
      const X = gamepad.buttons[Button.X].pressed;

      if (A && X && (!this.#lastBState.X || !this.#lastBState.A)) {
        // vibrationActuator is non standard. Works only in chrome and fails the type check
        // eslint-disable-next-line
        // @ts-ignore
        const { vibrationActuator } = gamepad;

        const [actuator] = gamepad.hapticActuators || [];
        const motor = vibrationActuator || actuator;

        if (motor) {
          motor.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 1.0,
            strongMagnitude: 1.0
          });
        }
      }

      const touchpad = gamepad.buttons[Button.Touchpad];
      if (touchpad && touchpad.pressed) {
        this.#mesh.scale.x *= 2;
      }

      setButtonState(this.#lastBState, gamepad);
    }

    this.render();
  }
}

export { GamepadScene };
