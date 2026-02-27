import { GoogleGenerativeAI } from "@google/generative-ai";
import { countryData } from "./countrydata.js";

// Initialisiere die KI mit deinem API-Schlüssel
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
/**
 * Generiert eine KI-Antwort für ein bestimmtes Land.
 * @param {string} countryName Der Name des Landes (z.B. "Deutschland").
 * @param {string} characterName Der Name des Charakters (z.B. "human").
 * @returns {Promise<string>} Ein Promise, das mit dem KI-generierten Text aufgelöst wird.
 */
export async function getAIResponseForCountry(countryName, characterName) {
 
    const germanToEnglishMap = {
        "Deutschland": "Germany",
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

    const characterPrompts = {
        "manpower": "Fasse die wichtigsten Gesetze und Regelungen für Arbeitskräfte und Arbeitnehmer zusammen. Bleibe dabei sachlich und konzentriere dich auf offizielle Bestimmungen. Vermische keine Themen, z.B. mische keines der Themen: Ausbildung, Studenten, Senioren, Familien oder Behinderungen mit dem Thema Arbeitskräfte.",
        "handicap": "Gib einen Überblick über die gesetzlichen Rahmenbedingungen für Menschen mit Behinderungen. Konzentriere dich auf offizielle Regelungen und Unterstützungsangebote. Vermische keine Themen, z.B. mische keines der Themen: Ausbildung, Studenten, Senioren, Familien oder Arbeitskräfte mit dem Thema Behinderungen.",
        "family": "Beschreibe die Rechtslage und Unterstützungsangebote für Familien. Fokussiere dich auf offizielle Gesetze und Programme. Vermische keine Themen, z.B. mische keines der Themen: Ausbildung, Studenten, Senioren, Arbeitskräfte oder Behinderungen mit dem Thema Familien.",
        "senior": "Erläutere die wichtigsten gesetzlichen Regelungen und Programme für Senioren und Rentner. Bleibe sachlich und konzentriere dich auf offizielle Bestimmungen. Vermische keine Themen, z.B. mische keines der Themen: Ausbildung, Studenten, Familien, Arbeitskräfte oder Behinderungen mit dem Thema Senioren.",
        "students": "Fasse die Gesetzgebung und die Möglichkeiten für Studierende und Auszubildende zusammen, füge auch informationen für menschen mit Behinderung und ohne hinzu."
    };

    // Übersetze den deutschen Namen ins Englische, falls nötig
    const englishCountryName = germanToEnglishMap[countryName] || countryName;

    if (!allowedCountries.includes(englishCountryName)){
       throw new Error(`Ungültiger oder nicht unterstützter Ländername: ${countryName}`);
    }
  
    if (typeof genAI === 'undefined') {
        return Promise.reject("GoogleGenerativeAI ist nicht initialisiert. Bitte überprüfe dein Setup in index.html. (genAI)");
    }

    // Hole die spezifischen Daten für das Land oder nutze den Standard-Fallback
    // const data = countryData[englishCountryName] || countryData.default;
    const baseStatement = characterPrompts[characterName] || "Gib eine allgemeine Zusammenfassung der wichtigsten Gesetze und Regelungen.";
    const countrySpecificData = countryData[englishCountryName];
    const data = { statement: baseStatement, questions: countrySpecificData ? countrySpecificData.questions : [] };

    // Baue den Prompt modular zusammen
    let prompt = data.statement;
    if (data.questions.length > 0) {
        prompt += "\n\nBeantworte dabei auch die folgenden Fragen:\n";
        data.questions.forEach(q => {
            prompt += `- ${q}\n`;
        });
    }

    prompt += "\n\nWichtige Anweisungen für deine Antwort: Antworte auf Deutsch. Bleibe sachlich und konzentriere dich auf Gesetze und offizielle Regelungen. Formatiere deine Antwort mit Absätzen. Jeder Absatz darf maximal 5 Zeilen lang sein. Die gesamte Antwort darf maximal 10 Sätze umfassen. Wenn es mehr Informationen gibt, gib einen Quell-Link(aktuellste) in einer neuen Zeile am Ende an, der mit 'Quelle:' beginnt und nur die URL enthält (z.B. Quelle: https://example.com).";

    console.log("Generierter KI-Prompt:", prompt);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt + ` Gib die Antwort für das Land ${englishCountryName}.`);
    const response = await result.response;
    const text = response.text();
    return text;


}
