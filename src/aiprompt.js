import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";
// Wir deklarieren genAI hier, initialisieren es aber erst später
let genAI = null;

/**
 * Hilfsfunktion, um den Key von deinem Nginx Proxy Manager zu holen
 */
/**
 * Hilfsfunktion, um den Key von deinem Nginx Proxy Manager zu holen
 */
async function getApiKey() {
    try {
        const response = await fetch('https://eujourney.aifellers.com/api/get-key');
        if (!response.ok) throw new Error('Key-Abruf fehlgeschlagen');
        const data = await response.json();
        return data.gemini_api_key;
    } catch (error) {
        console.error("Fehler beim Laden des Keys:", error);
        return null;
    }
}

/**
 * Generiert eine KI-Antwort für ein bestimmtes Land.
 */
export async function getAIResponseForCountry(countryName, characterName) {
    
    // 1. Key holen
    const apiKey = await getApiKey();
    if (!apiKey) {
        return "Fehler: API-Schlüssel konnte nicht geladen werden.";
    }

    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'de';
    const translations = window.currentTranslations || {}; 

    const germanToEnglishMap = {
        "Deutschland": "Germany", "Belgien": "Belgium", "Frankreich": "France",
        "Italien": "Italy", "Spanien": "Spain", "Polen": "Poland",
        "Österreich": "Austria", "Bulgarien": "Bulgaria", "Kroatien": "Croatia",
        "Zypern": "Cyprus", "Tschechien": "Czechia", "Dänemark": "Denmark",
        "Estland": "Estonia", "Finnland": "Finland", "Griechenland": "Greece",
        "Ungarn": "Hungary", "Irland": "Ireland", "Lettland": "Latvia",
        "Litauen": "Lithuania", "Luxemburg": "Luxembourg", "Malta": "Malta",
        "Niederlande": "Netherlands", "Portugal": "Portugal", "Rumänien": "Romania",
        "Slowakei": "Slovakia", "Slowenien": "Slovenia", "Schweden": "Sweden"
    };

    const allowedCountries = [
        "Germany", "Belgium", "France", "Italy", "Spain", "Poland",
        "Austria", "Bulgaria", "Croatia", "Cyprus", "Czechia", "Denmark",
        "Estonia", "Finland", "Greece", "Hungary", "Ireland", "Latvia",
        "Lithuania", "Luxembourg", "Malta", "Netherlands", "Portugal",
        "Romania", "Slovakia", "Slovenia", "Sweden"
    ];

    const englishCountryName = germanToEnglishMap[countryName] || countryName;

    if (!allowedCountries.includes(englishCountryName)){
       throw new Error(`Ungültiger oder nicht unterstützter Ländername: ${countryName}`);
    }

    const baseStatement = translations[`prompt_${characterName}`] || `Gib eine allgemeine Zusammenfassung der wichtigsten Gesetze und Regelungen für ${characterName}.`;

    const questions = [];
    let i = 1;
    const countryKey = englishCountryName.toLowerCase();
    while (translations[`q_${countryKey}_${i}`]) {
        questions.push(translations[`q_${countryKey}_${i}`]);
        i++;
    }

    let prompt = `Antworte in ${selectedLanguage}: ` + baseStatement;
    if (questions.length > 0) {
        prompt += "\n\nBeantworte dabei auch die folgenden Fragen:\n";
        questions.forEach(q => {
            prompt += `- ${q}\n`;
        });
    }

    prompt += "\n\nWichtige Anweisungen für deine Antwort: Bleibe sachlich und konzentriere dich auf Gesetze und offizielle Regelungen. Formatiere deine Antwort mit Absätzen. Jeder Absatz darf maximal 5 Zeilen lang sein. Die gesamte Antwort darf maximal 10 Sätze umfassen. Wenn es mehr Informationen gibt, gib einen Quell-Link(aktuellste) in einer neuen Zeile am Ende an, der mit 'Quelle:' beginnt und nur die URL enthält (z.B. Quelle: https://example.com).";
    
    console.log("Generierter KI-Prompt:", prompt);

    // --- API CALL MIT FETCH ---
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [{
            parts: [{ text: prompt + ` Gib die Antwort für das Land ${englishCountryName}.` }]
        }],
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Fehler Details:", data);
            throw new Error(data.error?.message || 'API Request fehlgeschlagen');
        }

        if (data.candidates && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            return "Die KI hat keine Antwort geliefert. Möglicherweise wurde die Antwort durch Sicherheitsfilter blockiert.";
        }
    } catch (error) {
        console.error("Fehler beim Abrufen der KI-Antwort:", error);
        return "Fehler: " + error.message;
    }
}


















