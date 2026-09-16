# Signalpost — Company Intelligence

Signalpost is an AI-powered company intelligence platform that researches, analyzes, and verifies company information.

It takes a company organization number, retrieves official company information, performs AI-powered web research, extracts useful facts and sources, and provides source verification.

## Features

* Browse 1,000+ company profiles
* Search companies by name or organization number
* AI-powered company research
* Automatic industry identification
* AI-generated company summaries
* Extraction of key company facts
* Source collection and verification
* Confidence levels for extracted facts
* Company research status tracking
* Verified / Researched / Pending status
* Pagination and filtering
* Persistent company data using MongoDB Atlas

## Technology Stack

### Frontend

* React
* Vite
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* Axios

### Database

* MongoDB Atlas
* Mongoose

### AI

* Groq
* Model: `openai/gpt-oss-20b`

### Company Data

* Brønnøysund Register Centre (Brreg)

### Web Research

* TinyFish

## System Architecture

```text
User
  |
  v
React Frontend
  |
  v
Express Backend
  |
  +--------------------+
  |                    |
  v                    v
Brreg API          TinyFish
  |                    |
  |                    v
  |                 Web Sources
  |                    |
  +---------+----------+
            |
            v
          Groq AI
            |
            v
    Structured Company
       Intelligence
            |
            v
       MongoDB Atlas
            |
            v
       React Dashboard
```

## Research Flow

1. User selects a company.
2. Signalpost sends the company's organization number to the backend.
3. The backend retrieves company information from Brreg.
4. Web research is performed using TinyFish.
5. Relevant information and sources are collected.
6. Groq analyzes the collected information.
7. The AI generates a structured company summary and key facts.
8. Sources are stored along with the extracted information.
9. The company record is saved in MongoDB Atlas.
10. The frontend displays the research report.

## Source Verification

Signalpost provides a source verification workflow for researched company information.

The system uses the collected company facts and their associated sources to determine whether the information can be verified.

Each fact can contain:

* Fact value
* Source
* Confidence level

Verification status is displayed in the dashboard as:

* Pending
* Researched
* Verified

## Dataset

The current Signalpost database contains:

**1,051 company profiles**

The platform is designed to support large-scale company research and can process additional company profiles.

## Project Structure

```text
signalpost/
│
├── client/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

## Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
TINYFISH_API_KEY=your_tinyfish_api_key
```

Never commit the `.env` file or API keys to GitHub.

## Running Locally

### Backend

Navigate to the server directory:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Start the server:

```bash
node server.js
```

The backend runs locally on:

```text
http://localhost:5000
```

### Frontend

Open another terminal and navigate to the client directory:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at the Vite development URL shown in the terminal.

## API Endpoints

### Get Companies

```text
GET /api/companies
```

Returns the stored company profiles.

### Research Company

```text
POST /api/research/:orgNumber?refresh=true
```

Researches a company using its organization number.

### Verify Company

```text
POST /api/verification/:companyId/verify
```

Runs source verification for a researched company.

## Deployment

### Frontend

The React frontend is deployed using Vercel.

```text
Live Demo:
YOUR_VERCEL_URL
```

### Backend

The Express backend is deployed using Render.

```text
Backend:
YOUR_RENDER_URL
```

### Database

MongoDB Atlas is used for persistent company data storage.

## AI Model and APIs

### AI Model

```text
Provider: Groq
Model: openai/gpt-oss-20b
```

The model is used to analyze researched information and generate structured company intelligence.

### Brreg

Brreg provides official Norwegian company registration information.

### TinyFish

TinyFish is used for web-based company research and source discovery.

## Expected API Cost

The total cost depends on the number of companies researched and the amount of web research and AI processing performed for each company.

For the final submission, the expected cost should be calculated based on the actual API usage of one company research run.

## Security

API keys and database credentials are stored in environment variables.

The following files are excluded from Git:

```text
.env
node_modules/
dist/
```

## Submission Information

Project Name:

**Signalpost — Company Intelligence**

Company Profiles:

**1,051**

AI Model:

**Groq — openai/gpt-oss-20b**

Repository:

**YOUR_GITHUB_REPOSITORY_URL**

Live Demo:

**YOUR_VERCEL_URL**

Commit Hash:

**YOUR_FINAL_COMMIT_HASH**

## Future Improvements

* Automated scheduled company research
* More external data sources
* Advanced source verification
* Research history
* Company comparison
* Export reports as PDF
* Background job processing
* Research progress tracking
* More detailed company risk and market signals

## License

This project was created for the Signalpost hackathon.
