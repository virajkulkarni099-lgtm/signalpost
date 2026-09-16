const {
    getCompanyIdentity
} = require("../utils/companyResearch");

const {
    findCompanySources
} = require("../utils/sourceFinder");

const {
    fetchSource
} = require("../utils/sourceFetcher");

const {
    analyzeCompany
} = require("../utils/llmAnalyzer");

const Company = require("../models/company");


async function researchCompanies(companyNumbers) {

    const results = [];

    for (const orgNumber of companyNumbers) {

        try {

            console.log("\n================================");
            console.log("Researching:", orgNumber);
            console.log("================================");


            // =====================================
            // 1. CHECK MONGODB CACHE
            // =====================================

            const existingCompany =
                await Company.findOne({
                    companyNumber: orgNumber
                });

            if (
                existingCompany &&
                existingCompany.aiAnalysis?.summary
            ) {

                console.log(
                    "Already researched. Skipping:",
                    orgNumber
                );

                results.push({
                    success: true,
                    cached: true,
                    companyNumber: orgNumber
                });

                continue;
            }


            // =====================================
            // 2. GET COMPANY FROM BRREG
            // =====================================

            const company =
                await getCompanyIdentity(
                    orgNumber
                );

            console.log(
                "Company:",
                company.name
            );


            // =====================================
            // 3. TINYFISH SEARCH
            // =====================================

            const sources =
                await findCompanySources(
                    company.name
                );

            console.log(
                "Sources found:",
                sources.length
            );


            // =====================================
            // 4. SELECT TOP 3 SOURCES
            // =====================================

            const selectedSources =
                sources.slice(0, 3);


            // =====================================
            // 5. FETCH SOURCES
            // =====================================

            const fetchedSources = [];

            for (
                const source of selectedSources
            ) {

                try {

                    const fetched =
                        await fetchSource(
                            source.url
                        );

                    if (fetched) {

                        fetchedSources.push({

                            ...source,

                            content: fetched

                        });

                    }

                } catch (error) {

                    console.log(
                        "Failed to fetch:",
                        source.url
                    );

                }

            }


            console.log(
                "Sources fetched:",
                fetchedSources.length
            );


            // =====================================
            // 6. GROQ ANALYSIS
            // =====================================

            const report =
                await analyzeCompany(
                    company,
                    fetchedSources
                );


            console.log(
                "AI analysis completed."
            );


            // =====================================
            // 7. SAVE TO MONGODB
            // =====================================

            await Company.findOneAndUpdate(

                {
                    companyNumber:
                        company.orgNumber
                },

                {

                    companyNumber:
                        company.orgNumber,

                    name:
                        company.name,

                    organizationForm:
                        company.organizationForm || "",

                    address:
                        company.address || {},

                    industry:
                        company.industry || {},

                    aiAnalysis: {

                        summary:
                            report.description || "",

                        industry:
                            report.industry || "",

                        website:
                            report.website || "",

                        opportunities: [],

                        risks: [],

                        signals: []

                    },

                    sources:
                        fetchedSources.map(
                            source => ({

                                url:
                                    source.url,

                                title:
                                    source.title || "",

                                sourceType:
                                    "web",

                                retrievedAt:
                                    new Date()

                            })
                        ),

                    lastResearchedAt:
                        new Date(),

                    lastUpdatedAt:
                        new Date()

                },

                {
                    new: true,
                    upsert: true
                }

            );


            console.log(
                "Saved to MongoDB:",
                orgNumber
            );


            results.push({

                success: true,

                cached: false,

                companyNumber:
                    orgNumber

            });


        } catch (error) {

            console.log(
                "Research failed:",
                orgNumber,
                error.message
            );


            results.push({

                success: false,

                companyNumber:
                    orgNumber,

                error:
                    error.message

            });

        }

    }


    return results;

}


module.exports = {
    researchCompanies
};