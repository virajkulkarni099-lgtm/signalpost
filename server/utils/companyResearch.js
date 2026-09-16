
const axios = require("axios");

async function getCompanyIdentity(orgNumber) {
    try {
        const response = await axios.get(
            `https://data.brreg.no/enhetsregisteret/api/enheter/${orgNumber}`
        );

        const company = response.data;

        return {
            // =========================
            // BASIC COMPANY INFORMATION
            // =========================

            orgNumber:
                company.organisasjonsnummer?.toString() || "",

            name:
                company.navn || "",

            organizationForm:
                company.organisasjonsform?.kode || "",

            registrationDate:
                company.registreringsdatoEnhetsregisteret || "",

            // =========================
            // WEBSITE
            // =========================

            website:
                company.hjemmeside || "",

            // =========================
            // ADDRESS
            // =========================

            address: {
                addressLines:
                    company.forretningsadresse?.adresse || [],

                postalCode:
                    company.forretningsadresse?.postnummer || "",

                city:
                    company.forretningsadresse?.poststed || "",

                country:
                    company.forretningsadresse?.land || "Norway",
            },

            // =========================
            // INDUSTRY
            // =========================

            industry: {
                code:
                    company.naeringskode1?.kode || "",

                description:
                    company.naeringskode1?.beskrivelse || "",
            },
        };

    } catch (error) {
        console.error(
            "Error getting company identity:",
            error.message
        );

        if (error.response) {
            console.error(
                "Brreg status:",
                error.response.status
            );

            console.error(
                "Brreg response:",
                error.response.data
            );
        }

        throw error;
    }
}

module.exports = {
    getCompanyIdentity,
};

