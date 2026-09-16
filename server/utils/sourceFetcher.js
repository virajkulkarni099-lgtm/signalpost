const axios = require("axios");

async function fetchSource(url) {

    try {

        console.log("Fetching:", url);

        const response = await axios.post(
            "https://api.fetch.tinyfish.ai",
            {
                urls: [url],
                format: "markdown"
            },
            {
                headers: {
                    "X-API-Key": process.env.TINYFISH_API_KEY,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "TinyFish Fetch error:",
            error.response?.data || error.message
        );

        return null;
    }
}

module.exports = {
    fetchSource
};