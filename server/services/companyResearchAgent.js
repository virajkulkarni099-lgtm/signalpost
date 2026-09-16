const {
  getCompanyByNumber,
} = require("./brregService");

const {
  analyzeCompany,
} = require("./aiService");

const {
  fetchWebsite,
  verifyCompanyIdentity,
} = require("./webResearchService");


// ============================================
// RESEARCH COMPANY
// ============================================

async function researchCompany(orgNumber) {
  try {

    console.log(
      "===================================="
    );

    console.log(
      "Research agent started:",
      orgNumber
    );


    // ============================================
    // STEP 1: Get company from Brreg
    // ============================================

    const company =
      await getCompanyByNumber(orgNumber);


    if (!company) {
      throw new Error(
        "Company not found"
      );
    }


    console.log(
      "Company found:",
      company.navn
    );


    // ============================================
    // STEP 2: Create Brreg source URL
    // ============================================

    const brregSourceUrl =
      `https://data.brreg.no/enhetsregisteret/enhet/${orgNumber}`;


    // ============================================
    // STEP 3: Create verified facts
    // ============================================

    const facts = [

      {
        field: "Company name",

        value:
          company.navn || "",

        source:
          brregSourceUrl,

        retrievedAt:
          new Date(),

        confidence:
          "high",
      },


      {
        field: "Organization number",

        value:
          company.organisasjonsnummer
            ?.toString() || "",

        source:
          brregSourceUrl,

        retrievedAt:
          new Date(),

        confidence:
          "high",
      },


      {
        field: "Organization form",

        value:
          company.organisasjonsform
            ?.beskrivelse || "",

        source:
          brregSourceUrl,

        retrievedAt:
          new Date(),

        confidence:
          "high",
      },


      {
        field: "Industry",

        value:
          company.naeringskode1
            ?.beskrivelse || "",

        source:
          brregSourceUrl,

        retrievedAt:
          new Date(),

        confidence:
          "high",
      },

    ];


    // ============================================
    // STEP 4: Find company website
    // ============================================

    let website = "";

    let websiteData = null;


    if (company.hjemmeside) {

      website =
        company.hjemmeside;

    } else if (company.www) {

      website =
        company.www;

    } else if (company.website) {

      website =
        company.website;

    }


    console.log(
      "Company website:",
      website || "Not found"
    );


    // ============================================
    // STEP 5: Normalize website URL
    // ============================================

    if (website) {

      website =
        website.trim();


      if (
        !website.startsWith("http://") &&
        !website.startsWith("https://")
      ) {

        website =
          `https://${website}`;

      }

    }


    // ============================================
    // STEP 6: Fetch company website
    // ============================================

    if (website) {

      console.log(
        "Fetching company website..."
      );


      websiteData =
        await fetchWebsite(website);


      if (
        websiteData &&
        websiteData.success
      ) {

        console.log(
          "Website fetched successfully"
        );

        console.log(
          "Website title:",
          websiteData.title
        );

        console.log(
          "Website text length:",
          websiteData.text?.length || 0
        );

      } else {

        console.log(
          "Could not fetch company website"
        );

      }

    } else {

      console.log(
        "No company website available"
      );

    }


    // ============================================
    // STEP 7: VERIFY COMPANY IDENTITY
    // ============================================

    let verification = {

      verified: false,

      reason:
        "No company website available.",

    };


    if (
      websiteData &&
      websiteData.success
    ) {

      verification =
        verifyCompanyIdentity(
          company,
          websiteData
        );

    }


    console.log(
      "Company verification:",
      verification
    );


    // ============================================
    // STEP 8: Add website as a fact
    // ============================================

    if (website) {

      facts.push({

        field:
          "Company website",

        value:
          website,

        source:
          website,

        retrievedAt:
          new Date(),

        confidence:
          verification.verified
            ? "high"
            : "medium",

      });

    }


    // ============================================
    // STEP 9: Prepare sources
    // ============================================

    const sources = [

      {

        url:
          brregSourceUrl,

        title:
          "Brønnøysund Register Centre",

        sourceType:
          "official_registry",

        retrievedAt:
          new Date(),

      },

    ];


    // ============================================
    // Add website source
    // ============================================

    if (website) {

      sources.push({

        url:
          website,

        title:
          `${company.navn} Official Website`,

        sourceType:
          "official_website",

        retrievedAt:
          new Date(),

      });

    }


    // ============================================
    // STEP 10: Prepare AI input
    // ============================================

    console.log(
      "Sending company information to AI..."
    );


    const aiAnalysis =
      await analyzeCompany({

        name:
          company.navn,

        companyNumber:
          company.organisasjonsnummer,

        organizationForm:
          company.organisasjonsform
            ?.beskrivelse,

        industry:
          company.naeringskode1,

        website:
          website,

        websiteText:
          websiteData?.text || "",

      });


    console.log(
      "AI analysis completed"
    );


    // ============================================
    // STEP 11: Return complete research
    // ============================================

    return {

      company,

      website,

      facts,

      sources,

      verification,

      aiAnalysis,

      lastResearchedAt:
        new Date(),

    };


  } catch (error) {

    console.log(
      "Research agent error:",
      error
    );

    throw error;

  }
}


// ============================================
// EXPORT
// ============================================

module.exports = {

  researchCompany,

};