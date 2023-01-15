import style from "./Menu.css?raw";

const templateString = /* html */ `
  <div id="menu">
    <input class="invis-checkbox" type="checkbox" id="checkbox" checked/>
    <div id="toggle">
      <div class="hamburger-lines">
        <span class="line line1"></span>
        <span class="line line2"></span>
        <span class="line line3"></span>
      </div>
    </div>  
    <ul class="list"></ul>
  </div>
`;

const menuSelectedEvent = "menu-item-selected";

interface MenuEventMap<T> extends HTMLElementEventMap {
  [menuSelectedEvent]: CustomEvent<T>;
}

class MenuComponent<T> extends HTMLElement {
  static Template: HTMLTemplateElement;

  static {
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = `<style>${style}</style> ${templateString}`;

    MenuComponent.Template = template;
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
