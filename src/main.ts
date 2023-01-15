import { Application } from "./Application";
import { MenuComponent } from "./ui/menu/Menu";
import { SceneName, Scenes } from "./SceneList";

customElements.define("app-menu", MenuComponent);

const app = new Application();

async function startScene(name: SceneName, updateHisotry = true) {
  if (menu.selectedItem === name) {
    return;
  }

  document.body.classList.add("loading");

  const { [name]: Scene } = await import(`./scenes/${Scenes[name]}.ts`);
  app.end();
  const scene = new Scene();
  app.setScene(scene);
  app.start();

  menu.select(name);

  if (updateHisotry) {
    history.pushState(name, "", "");
  }

  document.body.classList.remove("loading");
}

window.onpopstate = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const isStart = event.state === null;

  if (isStart) {
    menu.setVisibility(true);
    app.setScene(null);
  } else {
    startScene(event.state, false);
  }

  menu.select(isStart ? null : event.state);
};

const menu = document.querySelector("app-menu") as MenuComponent<SceneName>;
if (!menu) {
  throw new Error("No app menu found");
}
menu.createListItems(Object.keys(Scenes) as SceneName[]);

menu.addEventListener("menu-item-selected", (e) => {
  startScene(e.detail);
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Backslash" && menu.selectedItem !== null) {
    menu.toggle();
  }
});
