export const Scenes = {
  KeyboardMouse: "KeyboardMouse",
  GamepadScene: "GamepadScene",
  WebGPUTriangle: "WebGPU"
} as const;

export type SceneName = keyof typeof Scenes;
