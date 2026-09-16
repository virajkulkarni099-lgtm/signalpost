const axios = require("axios");

async function getCompanyByNumber(orgNumber) {
  const response = await axios.get(
    `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`
  );

  const data = response.data;

  console.log(
    "BRREG COMPANY DATA:",
    JSON.stringify(data, null, 2)
  );

  return data;
}

module.exports = {
  getCompanyByNumber,
};