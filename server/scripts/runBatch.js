require("dotenv").config();

const fs = require("fs");
const path = require("path");
const dns = require("dns");
const mongoose = require("mongoose");

const {
    researchCompanies
} = require("../services/batchResearchService");

const Company = require("../models/company");


// =====================================
// DNS CONFIGURATION
// =====================================

dns.setServers([
    "8.8.8.8",
    "8.8.4.4"
]);


// =====================================
// LOAD COMPANY NUMBERS
// =====================================

const filePath = path.join(
    __dirname,
    "../companyNumbers.json"
);

const allCompanyNumbers = JSON.parse(
    fs.readFileSync(
        filePath,
        "utf8"
    )
);


// =====================================
// MONGODB CONNECTION
// =====================================

async function runBatch() {

    try {

        console.log(
            "DNS configured."
        );

        console.log(
            "Connecting to MongoDB..."
        );


        // =====================================
        // CONNECT MONGODB
        // =====================================

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB connected successfully."
        );


        // =====================================
        // FIND ALREADY RESEARCHED COMPANIES
        // =====================================

        const existingCompanies =
            await Company.find(
                {},
                {
                    companyNumber: 1,
                    _id: 0
                }
            );


        const existingNumbers =
            new Set(
                existingCompanies.map(
                    company =>
                        company.companyNumber
                )
            );


        // =====================================
        // FIND REMAINING COMPANIES
        // =====================================

        const remainingCompanies =
            allCompanyNumbers.filter(
                number =>
                    !existingNumbers.has(number)
            );


        // =====================================
        // TAKE NEXT 100
        // =====================================

        const companyNumbers =
            remainingCompanies.slice(
                0,
                100
            );


        // =====================================
        // DISPLAY BATCH INFORMATION
        // =====================================

        console.log(
            "\n================================"
        );

        console.log(
            "BATCH INFORMATION"
        );

        console.log(
            "================================"
        );

        console.log(
            "Total numbers in file:",
            allCompanyNumbers.length
        );

        console.log(
            "Already in MongoDB:",
            existingNumbers.size
        );

        console.log(
            "Remaining:",
            remainingCompanies.length
        );

        console.log(
            "This batch:",
            companyNumbers.length
        );


        // =====================================
        // NOTHING LEFT
        // =====================================

        if (
            companyNumbers.length === 0
        ) {

            console.log(
                "\nAll companies have already been researched!"
            );

            await mongoose.disconnect();

            return;
        }


        // =====================================
        // SHOW COMPANY NUMBERS
        // =====================================

        console.log(
            "\nCompanies in this batch:"
        );

        console.log(
            companyNumbers
        );


        // =====================================
        // RUN RESEARCH
        // =====================================

        console.log(
            "\nStarting research..."
        );


        const results =
            await researchCompanies(
                companyNumbers
            );


        // =====================================
        // COUNT RESULTS
        // =====================================

        const successful =
            results.filter(
                result =>
                    result.success &&
                    !result.cached
            ).length;


        const failed =
            results.filter(
                result =>
                    !result.success
            ).length;


        const cached =
            results.filter(
                result =>
                    result.cached
            ).length;


        // =====================================
        // DISPLAY RESULTS
        // =====================================

        console.log(
            "\n================================"
        );

        console.log(
            "BATCH COMPLETED"
        );

        console.log(
            "================================"
        );

        console.log(
            "Total attempted:",
            results.length
        );

        console.log(
            "New successful:",
            successful
        );

        console.log(
            "Cached:",
            cached
        );

        console.log(
            "Failed:",
            failed
        );


        // =====================================
        // SHOW FAILED COMPANIES
        // =====================================

        const failedCompanies =
            results.filter(
                result =>
                    !result.success
            );


        if (
            failedCompanies.length > 0
        ) {

            console.log(
                "\nFailed companies:"
            );


            failedCompanies.forEach(
                company => {

                    console.log(
                        company.companyNumber,
                        "-",
                        company.error
                    );

                }
            );

        }


        // =====================================
        // FINAL DATABASE COUNT
        // =====================================

        const total =
            await Company.countDocuments();


        console.log(
            "\nTotal companies in MongoDB:",
            total
        );


        // =====================================
        // DISCONNECT
        // =====================================

        await mongoose.disconnect();


        console.log(
            "MongoDB disconnected."
        );


    } catch (error) {

        console.error(
            "\n================================"
        );

        console.error(
            "BATCH ERROR"
        );

        console.error(
            "================================"
        );


        console.error(
            error
        );


        // =====================================
        // DISCONNECT IF CONNECTED
        // =====================================

        if (
            mongoose.connection.readyState !== 0
        ) {

            await mongoose.disconnect();

        }


        process.exit(1);

    }

}


// =====================================
// START BATCH
// =====================================

runBatch();