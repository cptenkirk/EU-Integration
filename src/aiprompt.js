// HINWEIS: Das Importieren des Google-SDKs oben ist NICHT mehr nötig, 
// da n8n die Arbeit mit Google übernimmt!

/**
 * Generiert eine KI-Antwort über den n8n-Webhook auf deinem vServer.
 */
export async function getAIResponseForCountry(countryName, characterName) {
    
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

    prompt += "\n\nWichtige Anweisungen für deine Antwort: Bleibe sachlich und konzentriere dich auf Gesetze und offizielle Regelungen. Formatiere deine Antwort mit Absätzen. Jeder Absatz darf maximal 5 Zeilen lang sein. Die gesamte Antwort darf maximal 10 Sätze umfassen. Wenn es mehr Informationen gibt, giv einen Quell-Link(aktuellste) in einer neuen Zeile am Ende an, der mit 'Quelle:' beginnt und nur die URL enthält (z.B. Quelle: https://example.com).";
    
    console.log("Generierter KI-Prompt:", prompt);

    // --- AB JETZT ALLES AN DEINEN n8n WEBHOOK SCHICKEN ---
    // Ersetze diese URL mit deiner echten n8n-Webhook-URL (Production oder Test)
    const n8nWebhookUrl = 'https://n8n.aifellers.com/webhook-test/1dc782e5-80d8-4e8f-a4cd-66d127fd3541';

    const requestBody = {
        prompt: prompt,
        country: englishCountryName
    };

    try {
        const response = await fetch(n8nWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error('Fehler beim Abruf vom n8n-Server');
        }

        // n8n gibt uns den reinen Text der KI zurück
        const aiResponseText = await response.text();
        return aiResponseText;

    } catch (error) {
        console.error("Fehler beim Abrufen der KI-Antwort via n8n:", error);
        return "Fehler: " + error.message;
    }
}
