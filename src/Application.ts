import { Scene } from "./common/Scene";

type ModeSupport = {
  vr: boolean;
  ar: boolean;
};

export async function getSupportedSessions() {
  const modes: ModeSupport = { vr: false, ar: false };

  if (!navigator.xr) {
    return modes;
  }

  modes.vr = await navigator.xr.isSessionSupported("immersive-vr");
  modes.ar = await navigator.xr.isSessionSupported("immersive-ar");

  return modes;
}

class Application {
  autoUpdate = true;
  needsUpdate = false;
  #xrSession: XRSession | null = null;
  #scene: Scene | null = null;
  #frameHanlde: number | null = null;
  #running = false;

  setScene(scene: Scene | null) {
    if (this.#scene) {
      this.#scene.destroy();
    }

    this.#scene = scene;
  }

  setXRSession(session: XRSession | null) {
    this.cancelRender();

    if (session) {
      session.addEventListener("end", () => {
        this.cancelRender();
        this.#xrSession = null;
        this.#setRenderCallback();
      });
    }
    this.#xrSession = session;

    this.#setRenderCallback();
  }

  start() {
    this.#running = true;

    if (this.#scene) {
      const time = performance.now();
      this.#scene.start(time);
    }

    this.cancelRender();
    this.#setRenderCallback();
  }

  stop() {
    this.#running = false;
    this.cancelRender();
  }

  end() {
    this.stop();
    this.setScene(null);
  }

  cancelRender() {
    if (this.#frameHanlde !== null) {
      if (this.#xrSession) {
        this.#xrSession.cancelAnimationFrame(this.#frameHanlde);
      } else {
        window.cancelAnimationFrame(this.#frameHanlde);
      }

      this.#frameHanlde = null;
    }
  }

  render(time: DOMHighResTimeStamp, xrFrame?: XRFrame) {
    if (!this.#running) {
      return;
    }

    if (this.autoUpdate || this.needsUpdate) {
      if (this.#scene) {
        this.#scene.update(time, xrFrame);
        if (this.needsUpdate) {
          this.needsUpdate = false;
        }
      }
    }
  }

  #setRenderCallback() {
    const renderCallback = this.#getRenderCallback();
    if (this.#xrSession) {
      this.#xrSession.requestAnimationFrame(renderCallback);
    } else {
      window.requestAnimationFrame(renderCallback);
    }
  }

  #getRenderCallback() {
    if (this.#xrSession) {
      const callback = (time: DOMHighResTimeStamp, xrFrame?: XRFrame) => {
        this.render(time, xrFrame);
        if (this.#xrSession) {
          this.#frameHanlde = this.#xrSession.requestAnimationFrame(callback);
        }
      };
      return callback;
    } else {
      const callback = (time: DOMHighResTimeStamp, xrFrame?: XRFrame) => {
        this.render(time, xrFrame);
        this.#frameHanlde = window.requestAnimationFrame(callback);
      };
      return callback;
    }
  }
}

export { Application };
