import style from "./Menu.css?raw";

const templateString = /* html */ `
  <div id="menu">
    <input class="toggle-block checkbox" type="checkbox" id="checkbox"/>
    <div class="toggle-block">
      <div class="line" id="line1"></div>
      <div class="line" id="line2"></div>
      <div class="line" id="line3"></div>
    </div>  
    <ul class="list"></ul>
  </div>
`;

const menuSelectedEvent = "menu-item-selected";
const menuToggleEvent = "menu-toggle";

interface MenuEventMap<T> extends HTMLElementEventMap {
  [menuSelectedEvent]: CustomEvent<T>;
  [menuToggleEvent]: CustomEvent<boolean>;
}

class MenuComponent<T> extends HTMLElement {
  static Template: HTMLTemplateElement;

  static {
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = `<style>${style}</style> ${templateString}`;

    MenuComponent.Template = template;
  }

  static get observedAttributes() {
    return ["active"];
  }

  #list: HTMLUListElement;
  #checkbox: HTMLInputElement;
  #highlightListener: (this: Window, evt: PointerEvent) => void;
  #lastSelectedLI: HTMLLIElement | null = null;

  selectedItem: T | null = null;

  constructor() {
    super();

    const templateContent = MenuComponent.Template.content;
    const shadowRoot = this.attachShadow({ mode: "open" });

    const templateNodeCopy = templateContent.cloneNode(
      true
    ) as DocumentFragment;

    this.#list = templateNodeCopy.querySelector(".list") as HTMLUListElement;

    this.#highlightListener = (e: PointerEvent) => {
      if (this.#visible) {
        const listRect = this.#list.getBoundingClientRect();
        this.#list.style.setProperty("--x-pos", String(e.x - listRect.x));
        this.#list.style.setProperty("--y-pos", String(e.y - listRect.y));
      }
    };
    window.addEventListener("pointermove", this.#highlightListener);

    this.#checkbox = templateNodeCopy.querySelector(
      "#checkbox"
    ) as HTMLInputElement;

    this.#checkbox.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent<boolean>(menuToggleEvent, {
          detail: this.#checkbox.checked
        })
      );
    });

    shadowRoot.appendChild(templateNodeCopy);
  }

  disconnectedCallback() {
    const listener = this.#highlightListener;
    window.removeEventListener("pointermove", listener);
  }

  createListItems(items: T[]) {
    for (const name of items) {
      const listItem = document.createElement("li");

      listItem.textContent = name as string;

      listItem.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        this.dispatchEvent(
          new CustomEvent<T>(menuSelectedEvent, { detail: name })
        );
      });

      this.#list.appendChild(listItem);
    }
  }

  select(name: T | null) {
    if (this.#lastSelectedLI) {
      this.#lastSelectedLI.classList.remove("selected");
    }

    let li = null;
    if (name) {
      for (const child of this.#list.children) {
        if (child.textContent === name) {
          li = child as HTMLLIElement;
          break;
        }
      }
    }

    if (li) {
      li.classList.add("selected");
    }

    this.#lastSelectedLI = li;
    this.selectedItem = name;
  }

  get #visible() {
    return this.#checkbox.checked;
  }

  setVisibility(visible: boolean): void {
    this.#checkbox.checked = visible;
  }

  toggle(): void {
    this.setVisibility(!this.#visible);
  }

  attributeChangedCallback(
    name: string,
    _: null | string,
    newValue: null | string
  ) {
    if (!this.shadowRoot) {
      return;
    }

    if (name === "active") {
      this.#checkbox.checked = newValue !== null;
    }
  }

  addEventListener<K extends keyof MenuEventMap<T>>(
    type: K,
    listener: (this: HTMLElement, ev: MenuEventMap<T>[K]) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    const listenerElementEvent = listener as EventListenerOrEventListenerObject;
    super.addEventListener(type, listenerElementEvent, options);
  }
}

export { MenuComponent };
