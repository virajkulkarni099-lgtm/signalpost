
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const cors = require("cors");

// ===============================
// ROUTES
// ===============================

const researchRoutes =
    require("./routes/researchRoutes");

const verificationRoutes =
    require("./routes/verificationRoutes");

const importRoutes =
    require("./routes/importRoutes");


// ===============================
// SERVICES
// ===============================

const {
    analyzeCompany
} = require("./services/aiService.js");

const {
    getCompanyByNumber
} = require("./services/brregService.js");


// ===============================
// MODEL
// ===============================

const Company =
    require("./models/company.js");


// ===============================
// APP
// ===============================

const app = express();
app.use("/api/import", importRoutes);
const PORT = 5000;


// ===============================
// DNS
// ===============================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


// ===============================
// MIDDLEWARE
// ===============================

// CORS
app.use(cors());

// IMPORTANT:
// JSON middleware MUST come
// BEFORE the routes.
app.use(express.json());


// ===============================
// ENV CHECK
// ===============================

console.log(
    "Mongo URI exists:",
    !!process.env.MONGODB_URI
);

console.log(
    "TinyFish API key exists:",
    !!process.env.TINYFISH_API_KEY
);

console.log(
    "Groq API key exists:",
    !!process.env.GROQ_API_KEY
);


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.json({

        message:
            "Signalpost API is running"

    });

});


// ===============================
// RESEARCH ROUTE
// ===============================

app.use(
    "/api/research",
    researchRoutes
);


// ===============================
// VERIFICATION ROUTE
// ===============================

app.use(
    "/api/verification",
    verificationRoutes
);


// ===============================
// IMPORT ROUTE
// ===============================

app.use(
    "/api/import",
    importRoutes
);


// ===============================
// GET COMPANY FROM BRREG
// SAVE TO MONGODB
// ===============================

app.get(
    "/api/company/:orgNumber",
    async (req, res) => {

        try {

            const orgNumber =
                req.params.orgNumber;


            // ===============================
            // GET COMPANY FROM BRREG
            // ===============================

            const company =
                await getCompanyByNumber(
                    orgNumber
                );


            // ===============================
            // SAVE / UPDATE MONGODB
            // ===============================

            const savedCompany =
                await Company.findOneAndUpdate(

                    {
                        companyNumber:
                            company.organisasjonsnummer
                    },

                    {

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

                    },

                    {

                        new: true,

                        upsert: true

                    }

                );


            // ===============================
            // RESPONSE
            // ===============================

            res.json(
                savedCompany
            );


        } catch (error) {

            console.log(
                "Company API error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch/save company information",

                error:
                    error.response?.data ||
                    error.message

            });

        }

    }
);


// ===============================
// GET COMPANIES
// ===============================

app.get(
    "/api/companies",
    async (req, res) => {

        try {

            const companies =
                await Company.find()
                    .sort({
                        createdAt: -1
                    });


            res.json(
                companies
            );


        } catch (error) {

            console.log(
                "Get companies error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to fetch the companies",

                error:
                    error.message

            });

        }

    }
);


// ===============================
// ANALYZE COMPANY
// ===============================

app.post(
    "/api/company/:id/analyze",
    async (req, res) => {

        try {

            const company =
                await Company.findById(
                    req.params.id
                );


            if (!company) {

                return res.status(404).json({

                    message:
                        "Company not found"

                });

            }


            // ===============================
            // AI ANALYSIS
            // ===============================

            const analysis =
                await analyzeCompany(
                    company
                );


            company.aiAnalysis =
                analysis;


            await company.save();


            // ===============================
            // RESPONSE
            // ===============================

            res.json({

                message:
                    "Company analyzed successfully",

                analysis:
                    analysis

            });


        } catch (error) {

            console.log(
                "AI analysis error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to analyze company",

                error:
                    error.message

            });

        }

    }
);


// ===============================
// COMPANY COUNT
// ===============================

app.get(
    "/api/companies/count",
    async (req, res) => {

        try {

            const count =
                await Company.countDocuments();


            res.json({

                totalCompanies:
                    count

            });


        } catch (error) {

            console.log(
                "Company count error:",
                error
            );


            res.status(500).json({

                message:
                    "Failed to count companies",

                error:
                    error.message

            });

        }

    }
);


// ===============================
// 404 HANDLER
// ===============================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found"

        });

    }
);


// ===============================
// MONGODB
// ===============================

mongoose
    .connect(
        process.env.MONGODB_URI
    )

    .then(() => {

        console.log(
            "MongoDB connected successfully"
        );


        // ===============================
        // START SERVER
        // ===============================

        app.listen(
            PORT,
            () => {

                console.log(
                    `Server running on port ${PORT}`
                );

            }
        );

    })

    .catch((error) => {

        console.log(
            "MongoDB connection error:",
            error
        );

    });

