import * as bug from "./ui/scorebug.js";
import * as buttons from "./ui/buttons.js";

const init = () => {
    bug.initBug();
}

module.exports = {
    init: init,
    ...bug,
    ...buttons
}
