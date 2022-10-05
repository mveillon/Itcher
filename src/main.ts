/**
 * Itcher
 * Michael Veillon, 2022
 * https://github.com/mveillon
 */

import { initBug } from "./ui/scorebug.js";
import { usingNode } from "./utils/usingNode.js";

export const init = () => {
    if (!usingNode()) initBug();
}

export * from "./ui/buttons.js";
export * from "./ui/scorebug.js";
