import style from "./XRPanelComponent.css?raw";

const templateString = /* html */ `
  <div class="panel"/>
    <button id="vr" class="button invisible">VR</button>
    <button id="ar" class="button invisible">AR</button>
  </div>
`;

const arSelectedEvent = "ar-selected";
const vrSelectedEvent = "vr-selected";

interface XRPanelEventMap extends HTMLElementEventMap {
  [arSelectedEvent]: CustomEvent;
  [vrSelectedEvent]: CustomEvent;
}

class XRPanelComponent extends HTMLElement {
  #arButton: Element;
  #vrButton: Element;

  static Template: HTMLTemplateElement;

  static {
    const template = document.createElement("template") as HTMLTemplateElement;
    template.innerHTML = `<style>${style}</style> ${templateString}`;

    XRPanelComponent.Template = template;
  }

  static get observedAttributes() {
    return ["ar", "vr"];
  }

  constructor() {
    super();

    const templateContent = XRPanelComponent.Template.content;
    const shadowRoot = this.attachShadow({ mode: "open" });

    const templateNodeCopy = templateContent.cloneNode(
      true
    ) as DocumentFragment;

    shadowRoot.appendChild(templateNodeCopy);

    this.#vrButton = shadowRoot.querySelector("#vr") as Element;
    this.#arButton = shadowRoot.querySelector("#ar") as Element;

    this.#vrButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent(vrSelectedEvent));
    });

    this.#arButton.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent(arSelectedEvent));
    });
  }

  attributeChangedCallback(name: string) {
    if (!this.shadowRoot) {
      return;
    }

    if (name === "vr") {
      this.#vrButton.classList.toggle("invisible");
    } else if (name === "ar") {
      this.#arButton.classList.toggle("invisible");
    }
  }

  setXRState(xrState: { vr?: boolean; ar?: boolean } | undefined) {
    if (xrState) {
      const { ar, vr } = xrState;

      this.style.display = "";

      if (ar) {
        if (this.getAttribute("ar") === null) {
          this.toggleAttribute("ar");
        }
      } else {
        this.removeAttribute("ar");
      }

      if (vr) {
        if (this.getAttribute("vr") === null) {
          this.toggleAttribute("vr");
        }
      } else {
        this.removeAttribute("vr");
      }
    } else {
      this.style.display = "none";
    }
  }

  addEventListener<K extends keyof XRPanelEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: XRPanelEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    const listenerElementEvent = listener as EventListenerOrEventListenerObject;
    super.addEventListener(type, listenerElementEvent, options);
  }
}

export { XRPanelComponent };
