export const Button = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  View: 8,
  Menu: 9,
  LSB: 10,
  RSB: 11,
  Up: 12,
  Down: 13,
  Left: 14,
  Right: 15,
  Xbox: 16,
  Cross: 0,
  Circle: 1,
  Square: 2,
  Triangle: 3,
  L1: 4,
  R1: 5,
  L2: 6,
  R2: 7,
  Share: 8,
  Options: 9,
  L3: 10,
  R3: 11,
  PS: 16,
  Touchpad: 17
} as const;

type ButtonName = keyof typeof Button;
type ButtonIndex = (typeof Button)[ButtonName];

type ButtonState = {
  [key in ButtonName]: boolean;
};

type ButtonLayoutEntry = [ButtonName, ButtonIndex];

export const Axes = {
  LHorizontal: 0,
  LVertical: 1,
  RHorizontal: 2,
  RVertical: 3
} as const;

export function getEmptyButtonState(): ButtonState {
  const v = {} as ButtonState;
  for (const key of Object.keys(Button) as ButtonName[]) {
    v[key] = false;
  }
  return v;
}

export function setButtonState(state: ButtonState, gamepad: Gamepad): void {
  for (const [key, index] of Object.entries(Button) as ButtonLayoutEntry[]) {
    const button = gamepad.buttons[index];
    if (button) {
      state[key] = gamepad.buttons[index].pressed;
    }
  }
}
