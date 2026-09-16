function verifySource(source, company) {

    const text = `
        ${source.title || ""}
        ${source.url || ""}
        ${source.snippet || ""}
    `.toLowerCase();

    const companyName = company.name.toLowerCase();

    // Remove AS / ASA / common company suffixes
    const cleanCompanyName = companyName
        .replace(/\b(as|asa)\b/g, "")
        .trim();

    const nameWords = cleanCompanyName
        .split(/\s+/)
        .filter(word => word.length > 2);

    let matchedWords = 0;

    for (const word of nameWords) {
        if (text.includes(word)) {
            matchedWords++;
        }
    }

    const matchPercentage =
        nameWords.length > 0
            ? matchedWords / nameWords.length
            : 0;

    let verified = false;

    if (matchPercentage >= 0.5) {
        verified = true;
    }

    return {
        ...source,
        verified: verified,
        verification: {
            matchedWords,
            totalWords: nameWords.length,
            matchPercentage
        }
    };
}

module.exports = {
    verifySource
};