type EventWheelState = {
  deltaX: number;
  deltaY: number;
};

type WheelState = {
  DeltaX: number;
  DeltaY: number;
};

const WheelLocal: WheelState = {
  DeltaX: 0,
  DeltaY: 0
};

let timeOutActive = false;

function setWheelState(e: EventWheelState): void {
  WheelLocal.DeltaX = e.deltaX;
  WheelLocal.DeltaY = e.deltaY;

  console.log(WheelLocal.DeltaX);

  if (!timeOutActive) {
    timeOutActive = true;
    setTimeout(() => {
      setWheelState({ deltaX: 0, deltaY: 0 });
      timeOutActive = false;
    }, 10);
  }
}

export function connectWheel(
  container: HTMLElement | Window = window
): () => void {
  container.onwheel = (e) => {
    setWheelState(e);
  };
  return function () {
    container.onwheel = null;
  };
}

export const Wheel = WheelLocal as Readonly<WheelState>;
