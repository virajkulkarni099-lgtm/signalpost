const fs = require("fs");
const path = require("path");
const zlib = require("zlib");


// =====================================
// FILE PATHS
// =====================================

const inputFile = path.join(
    __dirname,
    "../signalpost-company-universe-2025.jsonl.gz"
);

const outputFile = path.join(
    __dirname,
    "../companyNumbers.json"
);


// =====================================
// FIND 9-DIGIT ORGANIZATION NUMBER
// =====================================

function findOrganizationNumber(obj) {

    if (!obj || typeof obj !== "object") {
        return null;
    }

    for (const [key, value] of Object.entries(obj)) {

        // Direct value
        if (
            typeof value === "string" ||
            typeof value === "number"
        ) {

            const text =
                String(value).trim();

            // Norwegian organization numbers are 9 digits
            if (
                /^\d{9}$/.test(text)
            ) {

                return text;

            }
        }

        // Nested object
        if (
            value &&
            typeof value === "object"
        ) {

            const result =
                findOrganizationNumber(value);

            if (result) {
                return result;
            }
        }
    }

    return null;
}


// =====================================
// MAIN
// =====================================

try {

    console.log(
        "Reading company universe..."
    );


    // =====================================
    // CHECK FILE
    // =====================================

    if (!fs.existsSync(inputFile)) {

        throw new Error(
            `File not found: ${inputFile}`
        );

    }


    // =====================================
    // READ GZIP
    // =====================================

    const compressedData =
        fs.readFileSync(inputFile);


    console.log(
        "Decompressing file..."
    );


    const data =
        zlib.gunzipSync(
            compressedData
        ).toString("utf8");


    console.log(
        "File decompressed successfully."
    );


    // =====================================
    // READ JSONL
    // =====================================

    const lines =
        data
            .split("\n")
            .filter(
                line => line.trim() !== ""
            );


    console.log(
        "Total lines found:",
        lines.length
    );


    // =====================================
    // EXTRACT NUMBERS
    // =====================================

    const companyNumbers = new Set();


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        try {

            const company =
                JSON.parse(lines[i]);


            const orgNumber =
                findOrganizationNumber(
                    company
                );


            if (orgNumber) {

                companyNumbers.add(
                    orgNumber
                );

            }


            // Stop after 1000
            if (
                companyNumbers.size >= 1000
            ) {

                break;

            }


            // Show progress
            if (
                (i + 1) % 10000 === 0
            ) {

                console.log(
                    "Processed:",
                    i + 1,
                    "| Found:",
                    companyNumbers.size
                );

            }

        } catch (error) {

            console.log(
                "Skipping invalid line:",
                i + 1
            );

        }

    }


    // =====================================
    // SAVE
    // =====================================

    const numbers =
        Array.from(
            companyNumbers
        );


    fs.writeFileSync(
        outputFile,
        JSON.stringify(
            numbers,
            null,
            4
        )
    );


    // =====================================
    // RESULT
    // =====================================

    console.log(
        "\n================================"
    );

    console.log(
        "EXTRACTION COMPLETE"
    );

    console.log(
        "================================"
    );

    console.log(
        "Organization numbers:",
        numbers.length
    );

    console.log(
        "Saved to:",
        outputFile
    );


    if (
        numbers.length >= 1000
    ) {

        console.log(
            "\nSUCCESS!"
        );

        console.log(
            "1000 organization numbers are ready."
        );

    } else {

        console.log(
            "\nWARNING!"
        );

        console.log(
            "Only",
            numbers.length,
            "organization numbers found."
        );

    }


} catch (error) {

    console.error(
        "\nExtraction failed:"
    );

    console.error(
        error.message
    );

}