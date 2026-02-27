delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { getAIResponseForCountry } from "./aiprompt.js";
import { europa } from './europa.js';
import { initializeMap, openCountryInfoDialog, closeCountryInfoDialog, updateMapLabels } from './maplayout.js';
import { createCharacterSelectionDialog, characterMarkers, resetToCharacterSelection } from './karaktere.js';

// Globale Zuweisungen für HTML-Zugriff
window.openCountryInfoDialog = openCountryInfoDialog;
window.closeCountryInfoDialog = closeCountryInfoDialog;
window.getAIResponseForCountry = getAIResponseForCountry;

// Icon Fix (siehe oben)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

window.updateDynamicTexts = function(translations) {
    window.currentTranslations = translations; 
    if (characterMarkers && characterMarkers.length > 0) {
        const popupText = translations['bindPopup'];
        if (popupText) {
            characterMarkers.forEach(marker => {
                marker.setPopupContent(popupText);
            });
        }
        updateMapLabels(translations);
    }
}

// Karte mit den Daten aus europa.js initialisieren
const map = initializeMap(L, europa);
createCharacterSelectionDialog(map, europa);

const backButton = document.getElementById('back-to-character-selection');
if (backButton) {
    backButton.addEventListener('click', () => {
        resetToCharacterSelection();
    });
}
