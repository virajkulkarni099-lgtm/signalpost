const express = require("express");

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

const router = express.Router();


// ======================================
// RESEARCH COMPANY
// POST /api/research/:orgNumber
// ======================================

router.post("/:orgNumber", async (req, res) => {

    try {

        const { orgNumber } = req.params;

        console.log("\n==============================");
        console.log("Researching:", orgNumber);
        console.log("==============================");


        // ======================================
        // STEP 1: CHECK MONGODB
        // ======================================

        const existingCompany =
            await Company.findOne({
                companyNumber: orgNumber
            });

        const forceResearch =
            req.query.refresh === "true";

        if (
            existingCompany &&
            existingCompany.aiAnalysis?.summary &&
            !forceResearch
        ) {

            console.log(
                "Company already researched. Returning cached result."
            );

            return res.json({
                success: true,
                cached: true,
                company: existingCompany
            });
        }


        // ======================================
        // STEP 2: GET COMPANY FROM BRREG
        // ======================================

        console.log(
            "Getting company information from Brreg..."
        );

        const company =
            await getCompanyIdentity(orgNumber);

        console.log(
            "Company found:",
            company.name
        );


        // ======================================
        // STEP 3: FIND EXTERNAL SOURCES
        // ======================================

        console.log(
            "Finding external sources..."
        );

        const sources =
            await findCompanySources(
                company.name
            );

        console.log(
            "Sources found:",
            sources.length
        );


        // ======================================
        // STEP 4: SELECT TOP 3 SOURCES
        // ======================================

        const selectedSources =
            sources.slice(0, 3);

        console.log(
            "Selected sources:",
            selectedSources.length
        );


        // ======================================
        // STEP 5: FETCH SOURCE CONTENT
        // ======================================

        const fetchedSources = [];

        for (const source of selectedSources) {

            try {

                console.log(
                    "Fetching:",
                    source.url
                );

                const fetched =
                    await fetchSource(
                        source.url
                    );

                fetchedSources.push({
                    ...source,
                    content: fetched
                });

            } catch (error) {

                console.error(
                    "Failed to fetch source:",
                    source.url
                );

                console.error(
                    "Source fetch error:",
                    error.message
                );
            }
        }


        console.log(
            "Sources successfully fetched:",
            fetchedSources.length
        );


        // ======================================
        // STEP 6: AI ANALYSIS
        // ======================================

        console.log(
            "Sending information to Groq AI..."
        );

        const report =
            await analyzeCompany(
                company,
                fetchedSources
            );

        console.log(
            "AI analysis completed."
        );

        console.log(
            "Facts generated:",
            report.keyFacts?.length || 0
        );


        // ======================================
        // STEP 7: CONVERT AI FACTS
        // ======================================

        const facts =
            (report.keyFacts || [])
                .filter(
                    fact =>
                        fact.fact &&
                        fact.sourceUrl
                )
                .map(
                    fact => ({

                        field:
                            "company_fact",

                        value:
                            fact.fact,

                        source:
                            fact.sourceUrl,

                        retrievedAt:
                            new Date(),

                        confidence:
                            ["high", "medium", "low"]
                                .includes(
                                    fact.confidence
                                )
                                ? fact.confidence
                                : "medium"
                    })
                );


        console.log(
            "Valid facts:",
            facts.length
        );


        // ======================================
        // STEP 8: PREPARE SOURCES
        // ======================================

        const savedSources =
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
            );


        // ======================================
        // STEP 9: SAVE TO MONGODB
        // ======================================

        console.log(
            "Saving research to MongoDB..."
        );

        const savedCompany =
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


                    // ==================================
                    // AI ANALYSIS
                    // ==================================

                    aiAnalysis: {

                        summary:
                            report.description || "",

                        industry:
                            report.industry || "",

                        website:
                            report.website || "",

                        opportunities:
                            [],

                        risks:
                            [],

                        signals:
                            []
                    },


                    // ==================================
                    // FACTS
                    // ==================================

                    facts:
                        facts,


                    // ==================================
                    // SOURCES
                    // ==================================

                    sources:
                        savedSources,


                    // ==================================
                    // VERIFICATION
                    // ==================================

                    verification: {

                        verified:
                            false,

                        reason:
                            "AI research completed. Independent verification pending.",

                        checkedAt:
                            new Date()
                    },


                    // ==================================
                    // RESEARCH STATUS
                    // ==================================

                    researchStatus:
                        "completed",


                    // ==================================
                    // TIMESTAMPS
                    // ==================================

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
            "Company saved to MongoDB."
        );


        // ======================================
        // STEP 10: RETURN RESULT
        // ======================================

        return res.json({

            success: true,

            cached: false,

            company:
                savedCompany,

            report:
                report,

            sources:
                fetchedSources
        });


    } catch (error) {

        // ======================================
        // ERROR DETAILS
        // ======================================

        console.error(
            "\n=============================="
        );

        console.error(
            "RESEARCH ERROR"
        );

        console.error(
            "=============================="
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "URL:",
            error.config?.url
        );

        console.error(
            "Method:",
            error.config?.method
        );

        console.error(
            "Response:",
            error.response?.data
        );

        console.error(
            "=============================="
        );


        return res.status(500).json({

            success: false,

            message:
                "Company research failed",

            error:
                error.message,

            status:
                error.response?.status,

            failedUrl:
                error.config?.url
        });
    }
});


module.exports = router;