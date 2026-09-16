const axios = require("axios");

const BRREG_URL =
    "https://data.brreg.no/enhetsregisteret/api/enheter";

async function fetchCompaniesFromBrreg(limit = 1000) {

    const companies = [];

    let page = 0;

    const size = 100;


    while (companies.length < limit) {

        console.log(
            `Fetching Brreg page ${page}...`
        );


        const response = await axios.get(
            BRREG_URL,
            {
                params: {
                    page: page,
                    size: size
                },

                headers: {
                    Accept:
                        "application/vnd.brreg.enhetsregisteret.enhet.v2+json"
                }
            }
        );


        const data = response.data;


        const pageCompanies =
            data?._embedded?.enheter || [];


        if (pageCompanies.length === 0) {
            break;
        }


        for (const company of pageCompanies) {

            if (
                !company.organisasjonsnummer ||
                !company.navn
            ) {
                continue;
            }


            companies.push({

                companyNumber:
                    company.organisasjonsnummer,

                name:
                    company.navn,

                organizationForm:
                    company.organisasjonsform
                        ?.beskrivelse || "",

                address:
                    company.forretningsadresse || {},

                industry:
                    company.naeringskode1 || {}

            });


            if (companies.length >= limit) {
                break;
            }

        }


        console.log(
            `Collected ${companies.length}/${limit}`
        );


        page++;


        if (
            data.page &&
            page >= data.page.totalPages
        ) {
            break;
        }

    }


    return companies;
}


module.exports = {
    fetchCompaniesFromBrreg
};