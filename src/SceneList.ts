export const Scenes = {
  KeyboardMouse: "KeyboardMouse",
  GamepadScene: "GamepadScene"
} as const;

export type SceneName = keyof typeof Scenes;
