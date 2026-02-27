import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// Initialisiere die KI mit deinem API-Schlüssel
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
/**
 * Generiert eine KI-Antwort für ein bestimmtes Land.
 * @param {string} countryName Der Name des Landes (z.B. "Deutschland").
 * @param {string} characterName Der Name des Charakters (z.B. "human").
 * @returns {Promise<string>} Ein Promise, das mit dem KI-generierten Text aufgelöst wird.
 */
export async function getAIResponseForCountry(countryName, characterName) {
 
    const selectedLanguage = localStorage.getItem('selectedLanguage') || 'de';
    const translations = window.currentTranslations || {}; // Hole die geladenen Übersetzungen
    const germanToEnglishMap = {
        "Deutschland": "Germany",
        "Belgien": "Belgium",
        "Frankreich": "France",
        "Italien": "Italy",
        "Spanien": "Spain",
        "Polen": "Poland",
        "Österreich": "Austria",
        "Bulgarien": "Bulgaria",
        "Kroatien": "Croatia",
        "Zypern": "Cyprus",
        "Tschechien": "Czechia",
        "Dänemark": "Denmark",
        "Estland": "Estonia",
        "Finnland": "Finland",
        "Griechenland": "Greece",
        "Ungarn": "Hungary",
        "Irland": "Ireland",
        "Lettland": "Latvia",
        "Litauen": "Lithuania",
        "Luxemburg": "Luxembourg",
        "Malta": "Malta",
        "Niederlande": "Netherlands",
        "Portugal": "Portugal",
        "Rumänien": "Romania",
        "Slowakei": "Slovakia",
        "Slowenien": "Slovenia",
        "Schweden": "Sweden"
    };

    const allowedCountries = [
        "Germany",
        "Belgium",
        "France",
        "Italy",
        "Spain",
        "Poland",
        "Austria",
        "Bulgaria",
        "Croatia",
        "Cyprus",
        "Czechia",
        "Denmark",
        "Estonia",
        "Finland",
        "Greece",
        "Hungary",
        "Ireland",
        "Latvia",
        "Lithuania",
        "Luxembourg",
        "Malta",
        "Netherlands",
        "Portugal",
        "Romania",
        "Slovakia",
        "Slovenia",
        "Sweden"

    ];

    // Übersetze den deutschen Namen ins Englische, falls nötig
    const englishCountryName = germanToEnglishMap[countryName] || countryName;

    if (!allowedCountries.includes(englishCountryName)){
       throw new Error(`Ungültiger oder nicht unterstützter Ländername: ${countryName}`);
    }

    if (typeof genAI === 'undefined') {
        return Promise.reject("GoogleGenerativeAI ist nicht initialisiert. Bitte überprüfe dein Setup in index.html. (genAI)");
    }

    // Hole die Anweisung für den Charakter aus den Übersetzungen
    const baseStatement = translations[`prompt_${characterName}`] || `Gib eine allgemeine Zusammenfassung der wichtigsten Gesetze und Regelungen für ${characterName}.`;

    // Baue die Fragenliste dynamisch aus den Übersetzungen zusammen
    const questions = [];
    let i = 1;
    const countryKey = englishCountryName.toLowerCase();
    while (translations[`q_${countryKey}_${i}`]) {
        questions.push(translations[`q_${countryKey}_${i}`]);
        i++;
    }

    // Baue den Prompt modular zusammen
    let prompt = `Antworte in ${selectedLanguage}: ` + baseStatement;
    if (questions.length > 0) {
        prompt += "\n\nBeantworte dabei auch die folgenden Fragen:\n";
        questions.forEach(q => {
            prompt += `- ${q}\n`;
        });
    }

    prompt += "\n\nWichtige Anweisungen für deine Antwort: Bleibe sachlich und konzentriere dich auf Gesetze und offizielle Regelungen. Formatiere deine Antwort mit Absätzen. Jeder Absatz darf maximal 5 Zeilen lang sein. Die gesamte Antwort darf maximal 10 Sätze umfassen. Wenn es mehr Informationen gibt, gib einen Quell-Link(aktuellste) in einer neuen Zeile am Ende an, der mit 'Quelle:' beginnt und nur die URL enthält (z.B. Quelle: https://example.com).";
    
    console.log("Generierter KI-Prompt:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt + ` Gib die Antwort für das Land ${englishCountryName}.`);
    const response = await result.response;
    const text = response.text();
    return text;


}

