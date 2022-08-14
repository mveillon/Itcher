import { bindButtons } from "./ui/buttons.js";
import { bindToggles } from "./ui/scorebug.js";

export const init = () => {
    bindButtons();
    bindToggles();
}