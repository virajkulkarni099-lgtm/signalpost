const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
    {
        // =========================
        // BASIC COMPANY INFORMATION
        // =========================

        companyNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
            required: true,
            index: true,
        },

        organizationForm: {
            type: String,
            default: "",
        },

        address: {
            type: Object,
            default: {},
        },

        industry: {
            type: Object,
            default: {},
        },

        // =========================
        // VERIFIED COMPANY FACTS
        // =========================

        facts: [
            {
                field: {
                    type: String,
                    required: true,
                },

                value: {
                    type: String,
                    required: true,
                },

                source: {
                    type: String,
                    default: "",
                },

                retrievedAt: {
                    type: Date,
                    default: Date.now,
                },

                confidence: {
                    type: String,
                    enum: ["high", "medium", "low"],
                    default: "medium",
                },
            },
        ],

        // =========================
        // SOURCES
        // =========================

        sources: [
            {
                url: {
                    type: String,
                    required: true,
                },

                title: {
                    type: String,
                    default: "",
                },

                sourceType: {
                    type: String,
                    default: "web",
                },

                retrievedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        // =========================
        // AI ANALYSIS
        // =========================
        verification: {
            verified: {
                type: Boolean,
                default: false,
            },

            reason: {
                type: String,
                default: "",
            },

            checkedAt: {
                type: Date,
                default: null,
            },
        },

        aiAnalysis: {
            summary: {
                type: String,
                default: "",
            },

            industry: {
                type: String,
                default: "",
            },
            website: {
                type: String,
                default: "",
            },

            opportunities: {
                type: [String],
                default: [],
            },

            risks: {
                type: [String],
                default: [],
            },

            signals: {
                type: [String],
                default: [],
            },
        },

        // =========================
        // RESEARCH INFORMATION
        // =========================

        lastResearchedAt: {
            type: Date,
            default: null,
        },

        lastUpdatedAt: {
            type: Date,
            default: Date.now,
        },
        researchStatus: {
            type: String,
            enum: [
                "pending",
                "researching",
                "completed",
                "failed"
            ],
            default: "pending"
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Company", companySchema);