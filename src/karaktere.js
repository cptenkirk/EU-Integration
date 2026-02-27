import { openCountryInfoDialog } from "./maplayout.js";
import { geojsonLayer, highlightFeature, resetHighlight } from "./maplayout.js"; // Import geojsonLayer and highlight/reset functions
const manpower './icons2/manpower2.png'; // Importiere das Icon als Modul
const handicap './icons2/handicap2.png'; // Importiere das zweite Icon als Modul
const family './icons2/family2.png';
const senior './icons2/senior2.png';
const students './icons2/students2.png';
 
export let characterMarkers = []; // Globales Array, um alle Charakter-Marker zu speichern
let characters = []; // Globale Charakterdefinitionen
let _mapInstance; // Um die Karteninstanz global im Modul zu speichern
let currentHighlightedCountryLayer = null; // Track the currently highlighted country by character drag
export function initializeCharacters(map, geojsonData) {
    console.log("Initializing characters on the map...");
    characterMarkers = []; // Array bei jeder Initialisierung leeren

    // Definiere verschiedene Icons für die Charaktere
    var characterIcon1 = L.icon({
        iconUrl: manpower, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [43, -60] // Beispiel: Wert verringern (z.B. -80), um die Blase weiter nach oben zu schieben
    });

    var characterIcon2 = L.icon({
        iconUrl: handicap, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [43, -60] // Passen Sie diesen Wert für alle Icons an, wenn sie gleich sein sollen
    });

     var characterIcon3 = L.icon({
        iconUrl: family, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [43, -60]
    });

    var characterIcon4 = L.icon({
        iconUrl: senior, // Verwende die importierte Variable
        iconSize: [200, 200],
        iconAnchor: [19, 38],
        popupAnchor: [43, -60]
    });

      var characterIcon5 = L.icon({
        iconUrl: students, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [43, -60],
       
    });  




    
    characters = [
        {
            name: "manpower",
            position: [51.5, -2.0], // Startposition nach Westen verschoben
            position: [62.0, -15.0], // Endposition des Icons im sichtbaren Bereich
            icon: characterIcon1,
        },
        {
            name: "handicap",
            position: [51.5, -2.0], // Startposition nach Westen verschoben
            position: [62.0, -15.0], // Endposition des Icons im sichtbaren Bereich
            icon: characterIcon2
        },
         {
            name: "family",
            position: [51.5, -2.0], // Startposition nach Westen verschoben
            position: [62.0, -15.0], // Endposition des Icons im sichtbaren Bereich
            icon: characterIcon3
        },
        {
            name: "senior",
            position: [51.5, -2.0], // Startposition nach Westen verschoben
            position: [62.0, -15.0], // Endposition des Icons im sichtbaren Bereich
            icon: characterIcon4
        }, 
         {
            name: "students",
            position: [51.5, -2.0], // Startposition nach Westen verschoben
            position: [62.0, -15.0], // Endposition des Icons im sichtbaren Bereich
            icon: characterIcon5
        }  
        
    ];

    // Iteriere durch die Charaktere und erstelle für jeden einen Marker
    characters.forEach(characterData => {
        var marker = L.marker(characterData.position, {
            icon: characterData.icon,
            draggable: 'true',
            autoPan: false,
            pane: 'characterPane' // Weist den Marker dem höhergelegenen Pane zu
        }).addTo(map);

        // Marker zum globalen Array hinzufügen
        characterMarkers.push(marker);

        // Event-Listener für den Start des Ziehens
        marker.on('dragstart', function(event) {
            marker.closePopup(); // Schließe das Info-Popup beim Start des Ziehens
        });

        // Event-Listener, um das Ziehen des Markers auf die Kartengrenzen zu beschränken
        marker.on('drag', function(event) {
            var latlng = event.latlng;
            var bounds = L.latLngBounds(map.options.maxBounds); // Verwende maxBounds für eine feste Begrenzung

            if (bounds) {
                // Korrigiert die Position, wenn sie außerhalb der Grenzen liegt
                latlng.lat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), latlng.lat));
                latlng.lng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), latlng.lng));
                event.target.setLatLng(latlng);
            }
            // Aktualisiert die Position des Markers
            event.target.setLatLng(latlng);

            // Check for country hover during drag
            let hoveredCountryLayer = null;
            if (geojsonLayer) { // Ensure geojsonLayer is loaded
                geojsonLayer.eachLayer(function(layer) {
                    if (turf.booleanPointInPolygon(turf.point([latlng.lng, latlng.lat]), layer.feature.geometry)) {
                        hoveredCountryLayer = layer;
                        return; // Found the country, break loop
                    }
                });
            }

            // Zeige Ländernamen als Tooltip am Icon beim Ziehen
            if (hoveredCountryLayer) {
                const englishName = hoveredCountryLayer.feature.properties.name;
                const translations = window.currentTranslations || {};
                const countryName = translations[englishName] || hoveredCountryLayer.feature.properties.name_de || englishName;
                
                // Binde Tooltip, falls noch nicht vorhanden
                if (!marker.getTooltip()) {
                    marker.bindTooltip(countryName, {
                        permanent: true, // Bleibt sichtbar
                        direction: 'top',
                        className: 'country-tooltip',
                        offset: [0, -60] // Offset anpassen, damit es über dem Icon schwebt (bei 120px Höhe)
                    });
                } else {
                    marker.setTooltipContent(countryName);
                }
                marker.openTooltip();
            } else {
                marker.closeTooltip();
                if (marker.getTooltip()) {
                    marker.unbindTooltip(); // Entfernen, wenn über keinem Land (z.B. Meer)
                }
            }

            if (hoveredCountryLayer && hoveredCountryLayer !== currentHighlightedCountryLayer) {
                if (currentHighlightedCountryLayer) {
                    resetHighlight({ target: currentHighlightedCountryLayer });
                }
                highlightFeature({ target: hoveredCountryLayer });
                currentHighlightedCountryLayer = hoveredCountryLayer;
            } else if (!hoveredCountryLayer && currentHighlightedCountryLayer) {
                resetHighlight({ target: currentHighlightedCountryLayer });
                currentHighlightedCountryLayer = null;
            }
        });
        // Pop-up für den Marker
        // Der Text hier ist ein Platzhalter. Er wird durch die Übersetzungsfunktion dynamisch ersetzt.
        marker.bindPopup("Ziehe mich auf eines der EU-Mitgliedsstaaten, oder klicke mit der Maus auf ein Land!", {
            className: 'character-popup' // Benutzerdefinierte CSS-Klasse für Styling
        });

        // Event-Listener für das Verschieben des Markers
        marker.on('dragend', function(event) {
            var draggedMarker = event.target;
            
            // Tooltip vom Ziehen entfernen, damit das Popup Platz hat
            draggedMarker.closeTooltip();
            draggedMarker.unbindTooltip();

            var latlng = draggedMarker.getLatLng();
            var feature = getCountryFeature(latlng, geojsonData);
            
            var countryNameDisplay = "";
            var countryNameEnglish = "";
            if (feature) {
                countryNameEnglish = feature.properties.name;
                const translations = window.currentTranslations || {};
                countryNameDisplay = translations[countryNameEnglish] || feature.properties.name_de || countryNameEnglish;
            }

            // Reset highlight on dragend
            if (currentHighlightedCountryLayer) {
                resetHighlight({ target: currentHighlightedCountryLayer });
                currentHighlightedCountryLayer = null;
            }

            // Aktualisiert den Inhalt des vorhandenen Pop-ups mit dem Ländernamen.
            if (countryNameDisplay) {
                draggedMarker.setPopupContent("" + countryNameDisplay).openPopup();
            }

            const supportedCountries = [
                "Germany", "Belgium", "France", "Italy", "Spain", "Poland", "Austria", 
                "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia", 
                "Finland", "Greece", "Hungary", "Ireland", "Latvia", "Lithuania", 
                "Luxembourg", "Malta", "Netherlands", "Portugal", "Romania", 
                "Slovakia", "Slovenia", "Sweden"
            ];

            // Wenn ein Land gefunden wurde, öffne den Info-Dialog dafür.
            if (feature) { 
                if (supportedCountries.includes(countryNameEnglish)) {
                    // Ermittelt die ausgewählte Sprache aus dem Local Storage.
                    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'de';
                    // Ruft die globale Funktion aus maplayout.js auf und übergibt den Charakter-Namen und die Sprache.
                    openCountryInfoDialog(countryNameDisplay, characterData.name, selectedLanguage);
                } else {
                    // Optional: Gib dem Nutzer Feedback, dass das Land nicht unterstützt wird.
                
                    const translations = window.currentTranslations || {};
                    const noInfoText = translations['noInfoAvailable'] || "Für diesen Bereich sind keine spezifischen Informationen in diesem Kontext verfügbar.";
                    const popupContent = `<b>${countryNameDisplay}</b><br>${noInfoText}`;
                    draggedMarker.setPopupContent(popupContent).openPopup();
                }
            }
        });
    });

    function getCountryFeature(latlng, geojson) {
        const point = turf.point([latlng.lng, latlng.lat]);

        for (let i = 0; i < geojson.features.length; i++) {
            const feature = geojson.features[i];
            if (turf.booleanPointInPolygon(point, feature)) {
                return feature;
            }
        }
        return null;
    }
}

export function createCharacterSelectionDialog(map, geojsonData) {
    _mapInstance = map; // Karteninstanz speichern
    const dialog = document.getElementById('character-selection-dialog');
    const optionsContainer = document.getElementById('character-options');

    // Initialisiert die Charakterdaten, ohne sie zur Karte hinzuzufügen
    initializeCharacters(map, geojsonData); 

    // Verstecke alle Marker zu Beginn
    characterMarkers.forEach(marker => marker.setOpacity(0));

    characters.forEach((character, index) => {
        const container = document.createElement('div');
        container.classList.add('character-card-container'); // Klasse für CSS-Hover hinzufügen
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';
        container.style.cursor = 'pointer';
        container.style.position = 'relative'; // Container relativ machen, damit absolute Kinder sich darauf beziehen

        const img = document.createElement('img');
        img.src = character.icon.options.iconUrl;
        img.alt = character.name;
        img.title = character.name;
        
        const label = document.createElement('div');
        label.setAttribute('data-i18n-key', character.name);
        label.style.color = 'white';
        label.style.position = 'absolute'; // Absolute Positionierung verhindert Layout-Probleme
        label.style.bottom = '100px'; // Abstand vom unteren Rand des Containers (anpassbar)
        label.style.width = '100%'; // Text über die volle Breite zentrieren
        label.style.zIndex = '10'; 
        label.style.fontSize = '1.5rem';
        label.style.fontWeight = 'bold';
        label.style.fontFamily = 'sans-serif';
        label.style.textAlign = 'center';
        label.style.textTransform = 'uppercase';
        

        container.addEventListener('click', () => {
            // Speichere den ausgewählten Charakter für die Klick-Interaktion auf der Karte
            localStorage.setItem('selectedCharacter', character.name);

            // 1. Schließe den Auswahldialog
            dialog.style.display = 'none';

            // 2. Öffne den Intro-Dialog
            const introDialog = document.getElementById('character-intro-dialog');
            const introTitle = document.getElementById('intro-title');
            const introIcon = document.getElementById('intro-icon');
            const introText = document.getElementById('intro-text');
            const introButton = document.getElementById('intro-start-button');

            if (introDialog) {
                introTitle.setAttribute('data-i18n-key', character.name);
                introIcon.src = character.icon.options.iconUrl;
                introText.setAttribute('data-i18n-key', `intro_${character.name}`);

                // Übersetzungen für den neu angezeigten Dialog anwenden, indem wir die globale Funktion
                // mit der aktuell gespeicherten Sprache aufrufen.
                const currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
                if (window.setLanguage) {
                    window.setLanguage(currentLanguage);
                }
                
                // Button-Listener zurücksetzen (Klonen entfernt alte Listener)
                const newButton = introButton.cloneNode(true);
                introButton.parentNode.replaceChild(newButton, introButton);

                newButton.addEventListener('click', () => {
                    introDialog.style.display = 'none';
                    runAnimation(index, character); // Starte die Animation erst hier
                });

                introDialog.style.display = 'flex';
                introDialog.classList.add('animate-bungee-in'); // Animation hinzufügen falls vorhanden
            } else {
                runAnimation(index, character); // Fallback, falls Dialog nicht existiert
            }
        });

        // Funktion für die Animation (ausgelagert)
        function runAnimation(index, character) {
            // Entferne alle anderen Marker von der Karte
            characterMarkers.forEach((m, i) => {
                if (i !== index) {
                    if (map.hasLayer(m)) {
                        map.removeLayer(m);
                    }
                }
            });

            // Finde den ausgewählten Marker
            const selectedMarker = characterMarkers[index];

            if (selectedMarker) {
                // Füge den Marker zur Karte hinzu, falls er (z.B. nach dem Zurückkehren) nicht mehr drauf ist
                if (!map.hasLayer(selectedMarker)) {
                    selectedMarker.addTo(map);
                }

                const targetPosition = L.latLng(character.position);
                const startPosition = map.getCenter(); // Animation startet von der aktuellen Kartenmitte
                const duration = 1500; // Dauer der Animation in Millisekunden

                const startSize = 200; // Startgröße des Icons in Pixel
                const endSize = 120;   // Endgröße des Icons in Pixel

                selectedMarker.setOpacity(1); // Mache den Marker sichtbar


                // Starte die Marker-Animation
                const startTime = performance.now();
                function animateMarker(currentTime) {
                    const elapsedTime = currentTime - startTime;
                    const progress = Math.min(elapsedTime / duration, 1);

                    // Berechne die neue Position (Interpolation)
                    const newLat = startPosition.lat + (targetPosition.lat - startPosition.lat) * progress;
                    const newLng = startPosition.lng + (targetPosition.lng - startPosition.lng) * progress;

                    // Berechne die neue Größe (Interpolation)
                    const newSize = startSize - (startSize - endSize) * progress;

                    selectedMarker.setLatLng([newLat, newLng]);
                    // Ändere die Icon-Größe direkt am DOM-Element des Markers
                    if (selectedMarker._icon) {
                        selectedMarker._icon.style.width = `${newSize}px`;
                        selectedMarker._icon.style.height = `${newSize}px`;
                    }

                    if (progress < 1) {
                        requestAnimationFrame(animateMarker);
                    } else {
                        // Animation beendet, setze finale Werte und öffne Popup
                        selectedMarker.setLatLng(targetPosition);
                        selectedMarker._icon.style.width = `${endSize}px`;
                        selectedMarker._icon.style.height = `${endSize}px`;
                        selectedMarker.openPopup();

                        // Zeige den "Zurück"-Button an
                        const backButton = document.getElementById('back-to-character-selection');
                        if (backButton) {
                            backButton.style.display = 'block';
                        }
                    }
                }
                requestAnimationFrame(animateMarker);
            }
        }

        container.appendChild(img);
        container.appendChild(label);
        optionsContainer.appendChild(container);
    });

    dialog.style.display = 'flex';

    // Wende die initiale Übersetzung auf die neu erstellten Elemente im Charakter-Auswahldialog an.
    const currentLanguage = localStorage.getItem('selectedLanguage') || 'de';
    if (window.setLanguage) {
        window.setLanguage(currentLanguage);
    }
}

export function resetToCharacterSelection() {
    // 1. Schließe den Länder-Info-Dialog, falls er offen ist
    if (window.closeCountryInfoDialog) {
        window.closeCountryInfoDialog();
    }

    // 2. Entferne alle Charakter-Marker von der Karte
    if (_mapInstance && characterMarkers.length > 0) {
        characterMarkers.forEach(marker => {
            if (_mapInstance.hasLayer(marker)) {
                _mapInstance.removeLayer(marker);
            }
        });
    }

    // 3. Zeige den Charakter-Auswahldialog wieder an
    const dialog = document.getElementById('character-selection-dialog');
    dialog.style.display = 'flex';
    dialog.classList.add('animate-bungee-in');

    // 4. Verstecke den "Zurück"-Button wieder
    const backButton = document.getElementById('back-to-character-selection');
    if (backButton) {
        backButton.style.display = 'none';
    }
}


