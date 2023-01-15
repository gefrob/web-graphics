export const Scenes = {
  KeyboardMouse: "KeyboardMouse"
} as const;

export type SceneName = keyof typeof Scenes;
