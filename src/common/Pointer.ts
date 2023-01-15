export const MouseButton = {
  None: -1,
  Left: 0,
  Middle: 1,
  Right: 2
} as const;

export type MouseButton = (typeof MouseButton)[keyof typeof MouseButton];

type PointerStatus = "up" | "down";

type PointerState = {
  X: number;
  Y: number;
  movementX: number;
  movementY: number;
  Button: MouseButton;
  Status: PointerStatus;
};

type PartialPointerState = {
  X?: number;
  Y?: number;
  movementX?: number;
  movementY?: number;
  Button?: number;
  Status?: PointerStatus;
};

export const Pointer: Readonly<PointerState> = {
  X: 0,
  Y: 0,
  movementX: 0,
  movementY: 0,
  Button: -1,
  Status: "up"
};

function setPointer(state: PartialPointerState): void {
  Object.assign(Pointer, { ...Pointer, ...state });
}

export function connectPointer(
  container: HTMLElement | Window = document.body
): () => void {
  container.onpointermove = (e) => {
    e.preventDefault();

    const X = (e.clientX / window.innerWidth) * 2 - 1;
    const Y = -(e.clientY / window.innerHeight) * 2 + 1;

    const movementX = (e.movementX / window.innerWidth) * 2;
    const movementY = (e.movementY / window.innerHeight) * 2;

    setPointer({ X, Y, movementX, movementY });
  };

  container.onpointerdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPointer({ Button: e.button, Status: "down" });
  };

  container.onpointerleave = () => {
    setPointer({ Button: -1, Status: "up" });
  };

  container.onpointerup = () => {
    setPointer({ Button: -1, Status: "up" });
  };

  return function () {
    container.onpointermove = null;
    container.onpointerdown = null;
    container.onpointerup = null;
    container.onpointerleave = null;
  };
}
