const axios = require("axios");

async function findCompanySources(companyName) {
    try {
        console.log("Searching TinyFish for:", companyName);

        const response = await axios.get(
            "https://api.search.tinyfish.ai",
            {
                params: {
                    query: `"${companyName}" Norway`
                },
                headers: {
                    "X-API-Key": process.env.TINYFISH_API_KEY
                }
            }
        );

        const results = response.data.results || [];

        console.log("TinyFish results:", results.length);

        return results.map((result) => ({
            position: result.position,
            title: result.title,
            url: result.url,
            snippet: result.snippet,
            source: "TinyFish"
        }));

    } catch (error) {

        console.error(
            "TinyFish Search error:",
            error.response?.data || error.message
        );

        return [];
    }
}

module.exports = {
    findCompanySources
};