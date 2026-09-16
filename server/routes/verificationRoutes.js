const express = require("express");

const Company = require("../models/company");

const router = express.Router();

router.post("/:id/verify", async (req, res) => {

    try {

        const company =
            await Company.findById(req.params.id);

        if (!company) {

            return res.status(404).json({
                success: false,
                message: "Company not found"
            });
        }

        if (!company.facts ||
            company.facts.length === 0) {

            return res.status(400).json({
                success: false,
                message: "No facts available for verification"
            });
        }

        let verifiedCount = 0;

        for (const fact of company.facts) {

            if (fact.source) {
                verifiedCount++;
            }
        }

        const verified =
            verifiedCount === company.facts.length;

        company.verification = {

            verified: verified,

            reason: verified
                ? "All extracted facts have source references."
                : "Some extracted facts do not have source references.",

            checkedAt: new Date()
        };

        await company.save();

        res.json({

            success: true,

            verified: verified,

            verifiedFacts: verifiedCount,

            totalFacts:
                company.facts.length,

            verification:
                company.verification
        });

    } catch (error) {

        console.error(
            "Verification error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Verification failed",

            error:
                error.message
        });
    }
});

module.exports = router;