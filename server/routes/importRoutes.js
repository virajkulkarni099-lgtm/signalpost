const express = require("express");
const fs = require("fs");
const path = require("path");

const {
    importCompanies
} = require("../utils/companyImporter");

const {
    fetchCompaniesFromBrreg
} = require("../utils/brregImporter");

const Company =
    require("../models/company");

const router = express.Router();


// ======================================
// IMPORT COMPANIES FROM REQUEST
// ======================================

router.post("/", async (req, res) => {

    try {

        console.log("Request body:", req.body);

        const companyNumbers =
            req.body?.companyNumbers;


        if (
            !Array.isArray(companyNumbers) ||
            companyNumbers.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "companyNumbers must be a non-empty array"

            });

        }


        console.log(
            `Importing ${companyNumbers.length} companies`
        );


        const result =
            await importCompanies(
                companyNumbers
            );


        return res.json({

            success: true,

            message:
                "Companies imported successfully",

            ...result

        });


    } catch (error) {

        console.error(
            "Import error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Company import failed",

            error:
                error.message

        });

    }

});


// ======================================
// IMPORT COMPANIES FROM JSON FILE
// ======================================

router.post("/file", async (req, res) => {

    try {

        const filePath =
            path.join(
                __dirname,
                "../data/companies.json"
            );


        console.log(
            "Reading:",
            filePath
        );


        const file =
            fs.readFileSync(
                filePath,
                "utf8"
            );


        const companyNumbers =
            JSON.parse(file);


        if (
            !Array.isArray(companyNumbers) ||
            companyNumbers.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "companies.json must contain a non-empty array"

            });

        }


        console.log(
            `Found ${companyNumbers.length} companies`
        );


        const result =
            await importCompanies(
                companyNumbers
            );


        return res.json({

            success: true,

            message:
                "Companies imported from file",

            total:
                companyNumbers.length,

            ...result

        });


    } catch (error) {

        console.error(
            "File import error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Company import failed",

            error:
                error.message

        });

    }

});

// ======================================
// IMPORT 1000 COMPANIES FROM BRREG
// ======================================

router.post("/brreg", async (req, res) => {

    try {

        console.log(
            "Starting Brreg company import..."
        );

        const companies =
            await fetchCompaniesFromBrreg(1000);

        console.log(
            `Brreg returned ${companies.length} companies`
        );

        let added = 0;
        let existing = 0;

        for (const company of companies) {

            const alreadyExists =
                await Company.findOne({
                    companyNumber:
                        company.companyNumber
                });

            if (alreadyExists) {
                existing++;
                continue;
            }

            await Company.create({

                companyNumber:
                    company.companyNumber,

                name:
                    company.name,

                organizationForm:
                    company.organizationForm,

                address:
                    company.address,

                industry:
                    company.industry,

                facts: [],

                sources: [],

                verification: {
                    verified: false,
                    reason:
                        "Company imported from Brreg. Research pending.",
                    checkedAt: null
                },

                aiAnalysis: {
                    summary: "",
                    industry: "",
                    website: "",
                    opportunities: [],
                    risks: [],
                    signals: []
                },

                lastResearchedAt: null,

                lastUpdatedAt: new Date()
            });

            added++;

            console.log(
                `Added ${added}: ${company.name}`
            );
        }

        return res.json({

            success: true,

            message:
                "Companies imported from Brreg",

            totalFetched:
                companies.length,

            added:
                added,

            existing:
                existing
        });

    } catch (error) {

        console.error(
            "Brreg import error:",
            error.response?.data ||
            error.message
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to import companies from Brreg",

            error:
                error.response?.data ||
                error.message
        });
    }
});


module.exports = router;


module.exports = router;