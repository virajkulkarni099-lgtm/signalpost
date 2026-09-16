const Company = require("../models/company");

async function importCompanies(companyNumbers) {

    let added = 0;
    let existing = 0;

    for (const number of companyNumbers) {

        const companyNumber =
            String(number).trim();

        if (!companyNumber) {
            continue;
        }

        const alreadyExists =
            await Company.findOne({
                companyNumber
            });

        if (alreadyExists) {

            existing++;

            continue;
        }

        await Company.create({

            companyNumber,

            name: "Pending Research",

            organizationForm: "",

            address: {},

            industry: {},

            facts: [],

            sources: [],

            aiAnalysis: {

                summary: "",

                industry: "",

                website: "",

                opportunities: [],

                risks: [],

                signals: []
            },

            verification: {

                verified: false,

                reason: "Company not researched yet.",

                checkedAt: null
            },

            lastResearchedAt: null,

            lastUpdatedAt: new Date()
        });

        added++;

        console.log(
            "Imported:",
            companyNumber
        );
    }

    return {
        added,
        existing
    };
}

module.exports = {
    importCompanies
};