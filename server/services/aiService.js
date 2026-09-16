const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


async function analyzeCompany(company) {

  const prompt = `
You are a company research assistant.

You must analyze ONLY the information provided below.

Do NOT invent facts.

========================
COMPANY INFORMATION
========================

Company name:
${company.name || "Unknown"}

Organization number:
${company.companyNumber || "Unknown"}

Organization form:
${company.organizationForm || "Unknown"}

Industry:
${company.industry?.beskrivelse || "Unknown"}

========================
OFFICIAL WEBSITE
========================

Website:
${company.website || "Not available"}

Website content:
${company.websiteText || "Not available"}

========================
TASK
========================

Create a short research analysis.

Return ONLY valid JSON.

The JSON must have exactly these fields:

{
  "summary": "short company summary based only on the provided information",

  "industry": "company industry",

  "opportunities": [
    "opportunity 1",
    "opportunity 2"
  ],

  "risks": [
    "risk 1",
    "risk 2"
  ],

  "signals": [
    "important signal 1",
    "important signal 2"
  ]
}

IMPORTANT:

- Do not invent financial information.
- Do not invent revenue.
- Do not invent employees.
- Do not invent customers.
- Do not invent funding.
- Do not invent products that are not mentioned.
- If information is unavailable, say "Not available".
- Use only the provided company and website information.
- Do not add markdown.
- Return JSON only.
  `;


  const response =
    await groq.chat.completions.create({

      model:
        "openai/gpt-oss-120b",

      messages: [

        {
          role: "user",

          content: prompt,
        },

      ],

      temperature: 0.2,
    });


  const content =
    response.choices[0].message.content;


  try {

    return JSON.parse(content);

  } catch (error) {

    console.log(
      "AI returned invalid JSON:"
    );

    console.log(content);

    throw new Error(
      "AI returned invalid JSON"
    );
  }
}


module.exports = {
  analyzeCompany,
};