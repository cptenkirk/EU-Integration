import { getAIResponseForCountry } from "./aiprompt.js";
import { europa } from './europa.js';
import { initializeMap, openCountryInfoDialog, closeCountryInfoDialog } from './maplayout.js';
import { createCharacterSelectionDialog } from './karaktere.js';
window.openCountryInfoDialog = openCountryInfoDialog;
window.closeCountryInfoDialog = closeCountryInfoDialog;
window.getAIResponseForCountry = getAIResponseForCountry;

const map = initializeMap(L, europa);
createCharacterSelectionDialog(map, europa);
