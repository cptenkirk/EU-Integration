import { getAIResponseForCountry } from "./aiprompt.js";
 
export let geojsonLayer; // Declare geojsonLayer globally and export it

function initializeMapLayout(map, geojsonData) {
    // --- Hauptstädte als Labels hinzufügen ---
    const capitals = [
        // Westeuropa
        { name: "Berlin", coords: [52.52, 13.40] },
        { name: "Paris", coords: [48.85, 2.35] },
        { name: "London", coords: [51.50, -0.12] },
        { name: "Dublin", coords: [53.35, -6.26] },
        { name: "Brüssel", coords: [50.85, 4.35] },
        { name: "Amsterdam", coords: [52.36, 4.90] },
        { name: "Wien", coords: [48.20, 16.37] },
        { name: "Bern", coords: [46.94, 7.44] },
        { name: "Luxembourg", coords: [49.61, 6.13] },
        { name: "Tallinn", coords: [59.44, 24.75] },
        { name: "Riga", coords: [56.95, 24.10] },
        { name: "Vilnius", coords: [54.69, 25.31] },
        // Südeuropa
        { name: "Madrid", coords: [40.41, -3.70] },
        { name: "Rom", coords: [41.90, 12.49] },
        { name: "Lissabon", coords: [38.72, -9.14] },
        { name: "Athen", coords: [37.98, 23.72] },
        // Osteuropa
        { name: "Warschau", coords: [52.22, 21.01] },
        { name: "Prag", coords: [50.07, 14.43] },
        { name: "Budapest", coords: [47.50, 19.04] },
        { name: "Bratislava", coords: [48.15, 17.11] },
        { name: "Ljubljana", coords: [46.06, 14.51] },
        { name: "Zagreb", coords: [45.81, 15.98] },
        { name: "Belgrad", coords: [44.79, 20.45] },
        { name: "Sofia", coords: [42.70, 23.32] },
        { name: "Bukarest", coords: [44.43, 26.10] },
        { name: "Kiew", coords: [50.45, 30.52] },
        // Nordeuropa
        { name: "Kopenhagen", coords: [55.68, 12.57] },
        { name: "Stockholm", coords: [59.33, 18.07] },
        { name: "Oslo", coords: [59.91, 10.75] },
        { name: "Helsinki", coords: [60.17, 24.94] },
        { name: "Reykjavik", coords: [64.14, -21.93]},
        { name: "Moscow", coords: [55.74, 37.61]},
        { name: "Istanbul", coords: [41.01, 28.96]},
    ];

    capitals.forEach(capital => {
        // Standard-Optionen für das Tooltip (Label)
        const tooltipOptions = {
            permanent: true,
            direction: 'right', // Standardmäßig rechts vom Punkt
            offset: [10, 0],    // Standard-Abstand
            className: 'capital-label',
            interactive: false
        };

        // Regeln um die Position der Hauptstadtnamen zu ändern
        if (capital.name === 'Wien') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-10, 0]; // Negativer Offset für die linke Seite
        }

        if (capital.name === 'Zagreb') {
            tooltipOptions.direction = 'bottom';
            tooltipOptions.offset = [1, 8]; // Negativer Offset für den unteren Rand

        }

        if (capital.name === 'Amsterdam') {
            tooltipOptions.direction = 'top';
            tooltipOptions.offset = [0, -8]; // Negativer Offset für den oberen Rand
        }

        if (capital.name === 'London') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-10, 0]; // Negativer Offset für die linke Seite
        }
        
        if (capital.name === 'Lissabon') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-10, 0]; // Negativer Offset für die linke Seite
        }

        if (capital.name === 'Helsinki') {
            tooltipOptions.direction = 'top';
            tooltipOptions.offset = [0, -8]; // Negativer Offset für den oberen Rand
        }

        if (capital.name === 'Reykjavik') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-10, 0]; // Negativer Offset für die linke Seite
        }

         if (capital.name === 'Oslo') {
            tooltipOptions.direction = 'top';
            tooltipOptions.offset = [0, -8]; // Negativer Offset für den oberen Rand
        }

         if (capital.name === 'Paris') {
            tooltipOptions.direction = 'bottom';
            tooltipOptions.offset = [0, 8]; // Negativer Offset für den oberen Rand
        }

         if (capital.name === 'Rom') {
            tooltipOptions.direction = 'bottom';
            tooltipOptions.offset = [0, 8]; // Negativer Offset für den oberen Rand
        }

         if (capital.name === 'Prag') {
            tooltipOptions.direction = 'right';
            tooltipOptions.offset = [9, 0]; // Negativer Offset für den oberen Rand
        }

        if (capital.name === 'Moscow') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-9, 0]; // Negativer Offset für den oberen Rand
        }
        if (capital.name === 'Stockholm') {
            tooltipOptions.direction = 'top-left';
            tooltipOptions.offset = [9, 0]; // Negativer Offset für den oberen Rand
        }

         if (capital.name === 'Berlin') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-9, 0]; // Negativer Offset für den oberen Rand
        }

        if (capital.name === 'Warschau') {
            tooltipOptions.direction = 'left';
            tooltipOptions.offset = [-9, 0]; // Negativer Offset für den oberen Rand
        }
        
        // Erstellt einen unsichtbaren Marker und bindet ein permanentes Tooltip als Label daran.
        L.marker(capital.coords, { icon: L.divIcon({className: 'hidden-icon', iconSize: [0, 0]}) })
        .bindTooltip(`<b>${capital.name}</b>`, tooltipOptions).addTo(map);

        // Fügt einen kleinen, roten Punkt für die Hauptstadt hinzu
        L.circleMarker(capital.coords, {
            radius: 4,
            fillColor: "#000000", // Rote Farbe
            color: "#fff", // Weißer Rand
            weight: 1,
            fillOpacity: 1
        }).addTo(map);
    });

    // --- Funktion zur Farbauswahl basierend auf dem Ländernamen ---
    function getColor(countryName) {
        // Du kannst hier beliebige Logik einbauen.
        // Zum Beispiel Farben basierend auf Regionen, Bevölkerungsdichte etc.
        switch (countryName) {
            case 'Germany': return '#FDEE21'; // Gelb
            case 'France':  return '#0152A4'; // Blau
            case 'Spain':   return '#fffb00ff'; // Rot
            case 'Poland':  return '#FFFFFF'; // Weiß
            case 'Belgium': return'#FE0000';
            case 'Austria': return'#EC1A23';
            case 'Bulgaria': return'#00976B';
            case 'Croatia': return'#18159A';
            case 'Cyprus': return'#D37803';
            case 'Czechia': return'#2D3192';
            case 'Denmark': return'#C60C31';
            case 'Estonia': return'#212121';
            case 'Finland': return'#013581';
            case 'Greece': return'#075DB0';
            case 'Hungary': return'#009343';
            case 'Ireland': return'#47a84bff';
            case 'Italy': return'#85098aff';
            case 'Latvia': return'#006836';
            case 'Lithuania': return'#C1262C';
            case 'Luxembourg': return'#01A1DF';
            case 'Malta': return'#FFFFFF';
            case 'Netherlands': return'#b3ff00ff';
            case 'Portugal': return'#E91D26';
            case 'Romania': return'#FDEE21';
            case 'Slovakia': return'#843fdfff';
            case 'Slovenia': return'#FDFCF6';
            case 'Sweden': return'#016BA7';
            
            default:        return '#FF9900'; // Standard-Grau für andere Länder
        }
    }

    
    // `highlightFeature` und `resetHighlight` sind jetzt exportiert, damit sie in `karaktere.js` verwendet werden können.

    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds()); // Auf das Land zoomen bei Klick
    }

    // New function to handle country click, combining zoom and dialog
    function handleCountryClick(e) {
        zoomToFeature(e); // Keep the existing zoom functionality

        const englishName = e.target.feature.properties.name;
        const translations = window.currentTranslations || {};
        const countryNameDisplay = translations[englishName] || e.target.feature.properties.name_de || englishName;
        const selectedCharacter = localStorage.getItem('selectedCharacter');

        if (countryNameDisplay && selectedCharacter) {
            const selectedLanguage = localStorage.getItem('selectedLanguage') || 'de';
            // Öffne den Dialog mit dem Land, dem ausgewählten Charakter und der Sprache
            openCountryInfoDialog(countryNameDisplay, selectedCharacter, selectedLanguage);
        }
    }
    // Diese Funktion wird für jedes Land aufgerufen
    function onEachFeature(feature, layer) {
        const euCountries = [
            "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
            "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland",
            "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
            "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden"
        ];

        if (!euCountries.includes(feature.properties.name)) return;

        // Tooltip (Sprechblase) mit dem Ländernamen hinzufügen, der der Maus folgt
        if (feature.properties && feature.properties.name_de) {
            const englishName = feature.properties.name;
            const translations = window.currentTranslations || {};
            const displayName = translations[englishName] || feature.properties.name_de;
            
            layer.bindTooltip(displayName, {
                sticky: true, // Folgt dem Mauszeiger
                direction: 'top', // Erscheint oberhalb des Zeigers
                className: 'country-tooltip' // Klasse für CSS-Styling
            });
        }

        // Maus-Events hinzufügen
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: handleCountryClick // Klick-Event aktivieren
        });
    }

    // Vektor-Karte 
    geojsonLayer = L.geoJSON(geojsonData, {
        style: function(feature) {
            return {
                fillColor: getColor(feature.properties.name), // Füllfarbe dynamisch setzen
                weight: 2, // Randdicke
                opacity: 1,
                color: 'white', // Randfarbe
                fillOpacity: 0.7
            };
        },
        onEachFeature: onEachFeature // Interaktionen für jedes Land hinzufügen
    }).addTo(map);
}

// Neue Funktion zum Aktualisieren der Karten-Labels bei Sprachwechsel
export function updateMapLabels(translations) {
    if (!geojsonLayer) return;
    geojsonLayer.eachLayer(layer => {
        if (layer.feature && layer.feature.properties) {
            const englishName = layer.feature.properties.name;
            const translatedName = translations[englishName] || layer.feature.properties.name_de || englishName;
            
            // Aktualisiere den Tooltip-Inhalt
            if (layer.getTooltip()) {
                layer.setTooltipContent(translatedName);
            }
        }
    });
}

export function highlightFeature(e) { // Export this function
            var layer = e.target;
            layer.setStyle({
                weight: 5, // Rand noch dicker für einen stärkeren "Schatten"-Effekt
                color: '#222', // Ein dunkleres Grau, das wie ein Schatten wirkt
                dashArray: '',
                fillOpacity: 0.9
            });

            // Das Land in den Vordergrund bringen, um den "stufigen" Effekt zu erzeugen
            layer.bringToFront();
        }

export function resetHighlight(e) { // Export this function
    var layer = e.target;
    geojsonLayer.resetStyle(layer); // Stil auf den ursprünglichen Zustand zurücksetzen

    // Das Land wieder in den Hintergrund schieben, damit andere Länder darüber erscheinen können
    layer.bringToBack();
}

export function openCountryInfoDialog(countryName, characterName, language) {
            const dialog = document.getElementById('country-info-dialog');
            const title = document.getElementById('country-info-title');
            const content = document.getElementById('country-info-content');

            // Initialer Inhalt, während die KI-Antwort geladen wird
            content.innerHTML = `<p i18n="countryInfoTitle"> <strong>${countryName}</strong>.</p>
                                 <div class="loader"></div>
                                 <p style="color: #666; margin-top: 1rem;" i18n="loadingAIInfo"> </p>
                                 <p style="color: #666; margin-top: 1rem;"></p>`; // Behalte die Größeninfo bei

            dialog.style.display = 'flex';

            // Annahme: Eine Funktion `getAIResponseForCountry` existiert in aiprompt.js
            // und gibt ein Promise zurück, das mit dem KI-generierten Text aufgelöst wird.
           if (typeof getAIResponseForCountry === 'function') {
                getAIResponseForCountry(countryName, characterName)
                    .then(fullResponse => {
                        let displayText = fullResponse;
                        let sourceUrl = null;

                        // Extrahiere die URL, falls vorhanden
                        const urlRegex = /Quelle:\s*(https?:\/\/[^\s]+)/;
                        const match = fullResponse.match(urlRegex);

                        if (match && match[1]) {
                            sourceUrl = match[1];
                            // Entferne die Quellenzeile aus dem Anzeigetext
                            displayText = fullResponse.replace(urlRegex, '').trim();
                        }

                        // Richte den Container für die Antwort ein
                        content.innerHTML = `<p i18n="countryInfoTitle"> <strong>${countryName}</strong>.</p>
                                             <p id="ai-response-text" style="margin-top: 1rem;"></p>
                                             <div id="qrcode-container" style="display: flex; flex-direction: column; align-items: center; margin-top: 1rem;"></div>
                                             `;
                        
                        const aiResponseElement = document.getElementById('ai-response-text');
                        let i = 0;
                        const speed = 5; // Geschwindigkeit in Millisekunden pro Zeichen

                        function typeWriter() {
                            if (i < displayText.length) {
                                // Ersetze Zeilenumbrüche durch <br> für die HTML-Anzeige
                                const char = displayText.charAt(i) === '\n' ? '<br>' : displayText.charAt(i);
                                aiResponseElement.innerHTML += char;
                                i++;
                                setTimeout(typeWriter, speed);
                            } else {
                                // Wenn der Text fertig getippt ist, generiere den QR-Code
                                if (sourceUrl) {
                                    const qrcodeContainer = document.getElementById('qrcode-container');
                                    qrcodeContainer.innerHTML = '<p style="color: #000000ff; margin-top: 1rem; font-size: 20px;">Für mehr Informationen, scannen sie bitte den QR-Code.<br><br><br></p>'; // Füge den Hinweistext hinzu
                                    new QRCode(qrcodeContainer, {
                                        text: sourceUrl,
                                        width: 128,
                                        height: 128,
                                        colorDark : "#000000",
                                        colorLight : "#ffffff",
                                        correctLevel : QRCode.CorrectLevel.H
                                    });
                                }
                            }
                        }

                        typeWriter();
                    })

                    .catch(error => {
    console.error("Fehler beim Abrufen der KI-Antwort:", error);
    // Zeige dem User den genauen Fehler (hilft uns beim Debuggen enorm!)
    content.innerHTML = `
        <p i18n="countryInfoTitle"><strong>${countryName}</strong></p>
        <div style="color: #d9534f; background: #fdf7f7; border: 1px solid #d9534f; padding: 10px; margin-top: 1rem; border-radius: 4px;">
            <strong>API-Fehler:</strong><br>
            ${error.message}<br><br>
            <small>Tipp: Prüfe die Konsole für Details (F12).</small>
        </div>
    `;
});
                    /* .catch(error => {
                        console.error("Fehler beim Abrufen der KI-Antwort:", error);
                        content.innerHTML = `<p i18n="countryInfoTitle"> <strong>${countryName}</strong>.</p>
                                             <p style="color: red; margin-top: 1rem;">Fehler beim Laden der KI-Informationen.</p>
                                             <p style="color: #666; margin-top: 1rem;">Diese Box ist 800px breit und 600px hoch.</p>`; */
                    });
            } else {
                console.warn("Die Funktion 'getAIResponseForCountry' wurde nicht gefunden. Stellen Sie sicher, dass sie in aiprompt.js definiert ist.");
                content.innerHTML = `<p i18n="countryInfoTitle"> <strong>${countryName}</strong>.</p>
                                     <p style="color: red; margin-top: 1rem;" i18n="noInfoAvailable"></p>
                                     <p style="color: #666; margin-top: 1rem;">Diese Box ist 800px breit und 600px hoch.</p>`;
            }
        }


export function closeCountryInfoDialog() {
            const dialog = document.getElementById('country-info-dialog');
            dialog.style.display = 'none';

        }

export function initializeMap(L, geojsonData) {
    var map = L.map('map', {
        minZoom: 4.70, // Verhindert, dass weiter herausgezoomt wird
        maxZoom: 4.70,  // Verhindert, dass weiter hineingezoomt wird
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        zoomControl: false // Zoom-Steuerelemente ausblenden
    }).setView([51.5, -4.0], 4.7);

    // Pane für die Labels erstellen
    map.createPane('labels');
    map.getPane('labels').style.zIndex = 650;
    map.getPane('labels').style.pointerEvents = 'none';

    // Pane für den Charakter-Marker erstellen (höher als die Labels)
    map.createPane('characterPane');
    map.getPane('characterPane').style.zIndex = 700;

    // Basiskarte ohne Labels hinzufügen
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(map);

    // Kartensichtbereich beschränken
    map.setMaxBounds([
        [65, -50], // Nordwesten (horizontal enger gefasst)
        [40, 40]   // Südost (weiter nach unten und rechts)
    ]);

    initializeMapLayout(map, geojsonData);

    return map;
}

