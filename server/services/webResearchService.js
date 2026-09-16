const axios = require("axios");
const cheerio = require("cheerio");


async function fetchWebsite(url) {
  try {
    console.log("Fetching website:", url);

    const response = await axios.get(url, {
      timeout: 10000,

      headers: {
        "User-Agent":
          "Mozilla/5.0 Signalpost Research Agent",
      },
    });

    const html = response.data;

    const $ = cheerio.load(html);

    $("script").remove();
    $("style").remove();
    $("noscript").remove();

    const title =
      $("title").text().trim();

    const text =
      $("body")
        .text()
        .replace(/\s+/g, " ")
        .trim();

    const cleanedText =
      text.substring(0, 15000);


    return {
      success: true,

      url: url,

      title: title,

      text: cleanedText,

      retrievedAt: new Date(),
    };


  } catch (error) {

    console.log(
      "Website fetch failed:",
      error.message
    );

    return {
      success: false,

      url: url,

      title: "",

      text: "",

      retrievedAt: new Date(),
    };
  }
}


// ========================================
// VERIFY COMPANY IDENTITY
// ========================================

function verifyCompanyIdentity(
  company,
  websiteData
) {

  if (
    !websiteData ||
    !websiteData.success
  ) {
    return {
      verified: false,

      reason:
        "Website could not be accessed.",
    };
  }


  const websiteText =
    websiteData.text.toLowerCase();


  const companyName =
    (company.navn || "").toLowerCase();


  const companyNumber =
    (company.organisasjonsnummer || "")
      .toString()
      .toLowerCase();


  // Check organization number
  const numberFound =
    websiteText.includes(
      companyNumber
    );


  // Check company name
  const nameFound =
    websiteText.includes(
      companyName
    );


  if (numberFound) {

    return {
      verified: true,

      reason:
        "Organization number found on website.",
    };
  }


  if (nameFound) {

    return {
      verified: true,

      reason:
        "Company name found on website.",
    };
  }


  return {
    verified: false,

    reason:
      "Company name or organization number was not found on the website.",
  };
}


module.exports = {
  fetchWebsite,
  verifyCompanyIdentity,
};