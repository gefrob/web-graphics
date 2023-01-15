abstract class Scene {
  lastTime = 0;
  delta = 0;
  elapsed = 0;
  running = false;

  start(time: DOMHighResTimeStamp): void {
    this.lastTime = time;
    this.elapsed = 0;
    this.running = true;
  }

  update(time: DOMHighResTimeStamp, xrFrame?: XRFrame): void {
    if (xrFrame) {
      console.log(xrFrame);
    }

    this.delta = time - this.lastTime;
    this.elapsed += this.delta;
    // TODO: restrict max elapsed time
    this.lastTime = time;
  }

  abstract destroy(): void;
}

export { Scene };
