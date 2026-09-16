require("dotenv").config();

const axios = require("axios");

console.log(
    "API key loaded:",
    !!process.env.TINYFISH_API_KEY
);

async function testTinyFish() {
    try {
        const response = await axios.get(
            "https://api.search.tinyfish.ai",
            {
                params: {
                    query: "Microsoft company"
                },
                headers: {
                    "X-API-Key": process.env.TINYFISH_API_KEY
                }
            }
        );

        console.log(
            JSON.stringify(response.data, null, 2)
        );

    } catch (error) {
        console.log(
            "Status:",
            error.response?.status
        );

        console.log(
            "TinyFish error:",
            error.response?.data || error.message
        );
    }
}

testTinyFish();