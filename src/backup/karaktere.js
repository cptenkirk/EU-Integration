import { openCountryInfoDialog } from "./maplayout.js";
/* import { getAIResponseForCountry } from "./aiprompt.js"; */
import manpower from './icons2/manpower.png'; // Importiere das Icon als Modul
import handicap from './icons2/handicap.png'; // Importiere das zweite Icon als Modul
import family from './icons2/family.png';
import senior from './icons2/senior.png';
import students from './icons2/students.png';
var characterMarkers = []; // Globales Array, um alle Charakter-Marker zu speichern
let characters = []; // Globale Charakterdefinitionen
export function initializeCharacters(map, geojsonData) {
    console.log("Initializing characters on the map...");
    characterMarkers = []; // Array bei jeder Initialisierung leeren

    // Definiere verschiedene Icons für die Charaktere
    var characterIcon1 = L.icon({
        iconUrl: manpower, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [11, -45]
    });

    var characterIcon2 = L.icon({
        iconUrl: handicap, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [11, -45]
    });

     var characterIcon3 = L.icon({
        iconUrl: family, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [11, -45]
    });

    var characterIcon4 = L.icon({
        iconUrl: senior, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [11, -45]
    });

      var characterIcon5 = L.icon({
        iconUrl: students, // Verwende die importierte Variable
        iconSize: [120, 120],
        iconAnchor: [19, 38],
        popupAnchor: [11, -45],
       
    });  




    // Erstelle eine Liste von Charakteren mit ihren Eigenschaften
    characters = [
        {
            name: "manpower",
            position: [60.0, -15.0], // Startposition (z.B. Mitte von Deutschland)
            icon: characterIcon1
        },
        {
            name: "handicap",
            position: [60.0, -15.0], // Startposition (z.B. Paris)
            icon: characterIcon2
        },
         {
            name: "family",
            position: [60.0, -15.0], // Startposition (z.B. Berlin)
            icon: characterIcon3
        },
        {
            name: "senior",
            position: [60.0, -15.0], // Startposition (z.B. Budapest)
            icon: characterIcon4
        }, 
         {
            name: "students",
            position: [60.0, -15.0], // Startposition (z.B. Zagreb)
            icon: characterIcon5
        }  
        // Füge hier weitere Charaktere hinzu
    ];

    // Iteriere durch die Charaktere und erstelle für jeden einen Marker
    characters.forEach(characterData => {
        var marker = L.marker(characterData.position, {
            icon: characterData.icon,
            draggable: true,
            autoPan: true,
            pane: 'characterPane' // Weist den Marker dem höhergelegenen Pane zu
        }).addTo(map);

        // Marker zum globalen Array hinzufügen
        characterMarkers.push(marker);

        // Event-Listener, um das Ziehen des Markers auf die Kartengrenzen zu beschränken
        marker.on('drag', function(event) {
            var latlng = event.latlng;
            var bounds = map.options.maxBounds;

            if (bounds) {
                // Korrigiert die Position, wenn sie außerhalb der Grenzen liegt
                latlng.lat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), latlng.lat));
                latlng.lng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), latlng.lng));
            }
            // Aktualisiert die Position des Markers
            event.target.setLatLng(latlng);
        });
        // Pop-up für den Marker
        marker.bindPopup("Ziehe mich auf eines der EU-Mitgliedsstaaten!").openPopup();

        // Event-Listener für das Verschieben des Markers
        marker.on('dragend', function(event) {
            var draggedMarker = event.target;
            var latlng = draggedMarker.getLatLng();
            var countryName = getCountryName(latlng, geojsonData);

            // Aktualisiert den Inhalt des vorhandenen Pop-ups mit dem Ländernamen.
            draggedMarker.setPopupContent("" + countryName).openPopup();

            const supportedCountries = [
                "Deutschland", "Frankreich", "Italien", "Spanien", "Polen", "Österreich",
                "Bulgarien", "Kroatien", "Zypern", "Tschechien", "Dänemark", "Estland",
                "Finnland", "Griechenland", "Ungarn", "Irland", "Lettland", "Litauen",
                "Luxemburg", "Malta", "Niederlande", "Portugal", "Rumänien", "Slowakei",
                "Slowenien", "Schweden"
            ];

            // Wenn ein Land gefunden wurde, öffne den Info-Dialog dafür.
            if (countryName && countryName !== "Ziehe mich auf eines der EU-Mitgliedsstaaten!") { 
                if (supportedCountries.includes(countryName)) {
                // Ruft die globale Funktion aus maplayout.js auf und übergibt den Charakter-Namen
                openCountryInfoDialog(countryName, characterData.name);
                } else {
                    // Optional: Gib dem Nutzer Feedback, dass das Land nicht unterstützt wird.
                    const popupContent = `<b>${countryName}</b><br>Für dieses nicht EU-Mitgliedsstaat, sind keine spezifischen Informationen in diesem Kontext verfügbar.`;
                    draggedMarker.setPopupContent(popupContent).openPopup();
                }
            }
        });
    });

    function getCountryName(latlng, geojson) {
        const point = turf.point([latlng.lng, latlng.lat]);

        for (let i = 0; i < geojson.features.length; i++) {
            const feature = geojson.features[i];
            if (turf.booleanPointInPolygon(point, feature)) {
                return feature.properties.name_de || feature.properties.name;
            }
        }
        return "Stay in Europe!!!";
    }
}

export function createCharacterSelectionDialog(map, geojsonData) {
    const dialog = document.getElementById('character-selection-dialog');
    const optionsContainer = document.getElementById('character-options');

    // Initialisiert die Charakterdaten, ohne sie zur Karte hinzuzufügen
    initializeCharacters(map, geojsonData); 

    // Verstecke alle Marker zu Beginn
    characterMarkers.forEach(marker => marker.setOpacity(0));

    characters.forEach((character, index) => {
        const img = document.createElement('img');
        img.src = character.icon.options.iconUrl;
        img.alt = character.name;
        img.title = character.name;
        
        img.addEventListener('click', () => {
            // Schließe den Dialog
            dialog.style.display = 'none';

            // Finde den ausgewählten Marker
            const selectedMarker = characterMarkers[index];

            if (selectedMarker) {
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
                    }
                }
                requestAnimationFrame(animateMarker);
            }
        });

        optionsContainer.appendChild(img);
    });

    dialog.style.display = 'flex';
}
