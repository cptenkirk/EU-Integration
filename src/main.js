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
window.openCountryInfoDialog = openCountryInfoDialog;
window.closeCountryInfoDialog = closeCountryInfoDialog;
window.getAIResponseForCountry = getAIResponseForCountry;

// Diese Funktion wird von index.html aufgerufen, um dynamisch erstellte Texte (wie die Popups) zu aktualisieren.
window.updateDynamicTexts = function(translations) {
    window.currentTranslations = translations; // Übersetzungen global speichern für Zugriff in anderen Modulen
    if (characterMarkers && characterMarkers.length > 0) {
        // Holt den übersetzten Text für das Popup aus der geladenen Sprachdatei.
        const popupText = translations['bindPopup'];
        if (popupText) {
            characterMarkers.forEach(marker => {
                marker.setPopupContent(popupText);
            });
        }
        
        // Aktualisiere auch die Ländernamen auf der Karte
        updateMapLabels(translations);
    }
}

const map = initializeMap(L, europa);
createCharacterSelectionDialog(map, europa);

// Event Listener für den "Zurück zur Charakterauswahl"-Button
const backButton = document.getElementById('back-to-character-selection');
if (backButton) {
    backButton.addEventListener('click', () => {
        resetToCharacterSelection();
    });
}
