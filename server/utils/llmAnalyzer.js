const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function analyzeCompany(company, sources) {

    const allowedUrls = sources.map(source => source.url);

    const evidence = sources
        .map((source, index) => {

            let content = "";

            if (typeof source.content === "string") {
                content = source.content;
            } else if (source.content) {
                content = JSON.stringify(source.content);
            }

            return `
SOURCE ${index + 1}

TITLE:
${source.title || ""}

URL:
${source.url || ""}

SNIPPET:
${source.snippet || ""}

CONTENT:
${content}
`;
        })
        .join("\n\n");

    const prompt = `
You are a factual company research assistant.

TARGET COMPANY:

Name:
${company.name}

Organization number:
${company.orgNumber}

WEB EVIDENCE:

${evidence}

IMPORTANT RULES:

1. Use ONLY the supplied company identity and web evidence.

2. Never invent information.

3. Never guess financial information.

4. Never mix information from another company.

5. If information is unavailable, return an empty string.

6. Every key fact MUST be supported by one of the supplied URLs.

7. sourceUrl MUST be one of these URLs:

${allowedUrls.join("\n")}

8. Maximum 10 key facts.

9. Keep facts concise.

10. Do not provide opinions.

11. Do not provide predictions.

Return ONLY valid JSON.

Use exactly this structure:

{
    "companyName": "",
    "organizationNumber": "",
    "description": "",
    "industry": "",
    "website": "",
    "address": "",
    "keyFacts": [
        {
            "fact": "",
            "sourceUrl": "",
            "confidence": "high"
        }
    ]
}
`;

    try {

        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content:
                            "You are a factual company research assistant. Never fabricate information."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0,

                response_format: {
                    type: "json_object"
                },

                include_reasoning: false
            });

        const result =
            completion.choices[0].message.content;

        console.log("Groq response received.");

        return JSON.parse(result);

    } catch (error) {

        console.error(
            "Groq error:",
            error.response?.data || error.message
        );

        throw error;
    }
}

module.exports = {
    analyzeCompany
};