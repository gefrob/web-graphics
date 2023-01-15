const keycodes = [
  "Escape",
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",
  "Minus",
  "Equal",
  "Backspace",
  "Tab",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyT",
  "KeyY",
  "KeyU",
  "KeyI",
  "KeyO",
  "KeyP",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV",
  "KeyB",
  "KeyN",
  "KeyM",
  "BracketLeft",
  "BracketRight",
  "ControlLeft",
  "Enter",
  "Semicolon",
  "Quote",
  "Backquote",
  "ShiftLeft",
  "ShiftRight",
  "Backslash",
  "Comma",
  "Period",
  "Slash",
  "NumpadMultiply",
  "AltLeft",
  "Space",
  "CapsLock",
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
  "F6",
  "F7",
  "F8",
  "F9",
  "F10",
  "F11",
  "F12",
  "F13",
  "F14",
  "F15",
  "F16",
  "F17",
  "F18",
  "F19",
  "F20",
  "F21",
  "F22",
  "F23",
  "F24",
  "Pause",
  "ScrollLock",
  "NumpadSubtract",
  "NumpadAdd",
  "NumpadDecimal",
  "Numpad7",
  "Numpad8",
  "Numpad9",
  "Numpad4",
  "Numpad5",
  "Numpad6",
  "Numpad1",
  "Numpad2",
  "Numpad3",
  "Numpad0",
  "PrintScreen",
  "IntlBackslash",
  "NumpadEqual",
  "KanaMode",
  "Lang2",
  "Lang1",
  "IntlRo",
  "Lang4",
  "Lang3",
  "Convert",
  "NonConvert",
  "IntlYen",
  "NumpadComma",
  "Undo",
  "Paste",
  "MediaTrackPrevious",
  "Cut",
  "Copy",
  "MediaTrackNext",
  "NumpadEnter",
  "ControlRight",
  "LaunchMail",
  "AudioVolumeMute",
  "LaunchApp2",
  "MediaPlayPause",
  "MediaStop",
  "Eject",
  "VolumeDown",
  "AudioVolumeDown",
  "VolumeUp",
  "AudioVolumeUp",
  "BrowserHome",
  "NumpadDivide",
  "AltRight",
  "Help",
  "NumLock",
  "Home",
  "ArrowUp",
  "PageUp",
  "ArrowLeft",
  "ArrowRight",
  "End",
  "ArrowDown",
  "PageDown",
  "Insert",
  "Delete",
  "OSLeft",
  "MetaLeft",
  "OSRight",
  "MetaRight",
  "ContextMenu",
  "Power",
  "Sleep",
  "WakeUp",
  "BrowserSearch",
  "BrowserFavorites",
  "BrowserRefresh",
  "BrowserStop",
  "BrowserForward",
  "BrowserBack",
  "LaunchApp1",
  "MediaSelect",
  "Fn",
  "AudioVolumeUp ",
  "VolumeMute",
  "Lang5",
  "Abort",
  "Again",
  "Props",
  "Select",
  "Open",
  "Find",
  "NumpadParenLeft",
  "NumpadParenRight",
  "BrightnessUp"
] as const;

type KeyCode = (typeof keycodes)[number];

type KeyInfo = {
  [key in KeyCode]: boolean;
};

const KeyPressedLocal = {} as KeyInfo;
const KeyRepeatingLocal = {} as KeyInfo;

for (const code of keycodes) {
  KeyPressedLocal[code] = false;
  KeyRepeatingLocal[code] = false;
}

function setKeyState(code: KeyCode, pressed: boolean, repeat: boolean): void {
  if (!(code in KeyPressedLocal)) {
    console.error(`Key code "${code}" is not supported`);
  }
  KeyPressedLocal[code] = pressed;
  KeyRepeatingLocal[code] = repeat;
}

export function connectKeyboard(
  container: HTMLElement | Window = window
): () => void {
  container.onkeydown = (e) => {
    e.stopPropagation();

    const code = e.code as KeyCode;
    setKeyState(code, true, e.repeat);
  };

  container.onkeyup = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const code = e.code as KeyCode;
    setKeyState(code, false, false);
  };

  return function (): void {
    container.onkeydown = null;
    container.onkeyup = null;
    for (const code of keycodes) {
      setKeyState(code, false, false);
    }
  };
}

export const KeyPressed = KeyPressedLocal as Readonly<KeyInfo>;
export const KeyRepeating = KeyRepeatingLocal as Readonly<KeyInfo>;
