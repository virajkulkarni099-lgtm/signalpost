# Signalpost 🚀

An AI-powered company information platform that collects, analyzes, and verifies company information using external APIs and AI.

## 🌐 Live Demo

**[Signalpost](https://signalpost-rho.vercel.app/)**

## 📌 About the Project

Signalpost helps users find useful information about companies in one place.

The application fetches company information from external sources, processes the data, and presents it through a simple web interface.

It also provides source verification to help users understand whether the available company information could be verified.

## ✨ Features

* 🔍 Search and retrieve company information
* 🏢 Company details and organization information
* 🤖 AI-powered company analysis
* 🔗 External API integration
* ✅ Source verification
* 💾 MongoDB database integration
* ⚡ REST API using Express.js
* 🎨 React-based frontend
* 🌐 Deployed frontend

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* Axios
* CSS / Tailwind CSS

### Backend

* Node.js
* Express.js
* Axios
* REST APIs

### Database

* MongoDB
* MongoDB Atlas

### AI

* LLM API integration

### Deployment

* Vercel — Frontend
* Render — Backend

## 🏗️ Project Architecture

```text
React Frontend
      ↓
Express.js Backend
      ↓
External Company APIs
      ↓
AI / LLM Processing
      ↓
Source Verification
      ↓
MongoDB
      ↓
Response to Frontend
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/virajkulkarni099-lgtm/signalpost.git
cd signalpost
```

### 2. Install dependencies

For the backend:

```bash
npm install
```

For the frontend:

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file and add the required API keys and database credentials.

Example:

```env
MONGO_URI=your_mongodb_connection_string
API_KEY=your_api_key
LLM_API_KEY=your_llm_api_key
```

Do not commit your `.env` file to GitHub.

## ▶️ Run Locally

Start the backend:

```bash
npm start
```

Start the frontend:

```bash
npm run dev
```

The frontend will then be available through the Vite development server.

## 🌍 Deployment

The frontend is deployed on Vercel:

**https://signalpost-rho.vercel.app/**

The backend is deployed separately using Render.

## 📂 Project Structure

```text
signalpost/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

## 🔮 Future Improvements

* Advanced AI-powered company research
* More company data sources
* Better source verification
* Company comparison
* Search history
* PDF report generation
* More detailed AI-generated insights
* Improved data accuracy and validation

## 👨‍💻 Author

**Viraj Kulkarni**

IT Engineering Student
MERN Stack Developer

## 📄 License

This project is created for educational and project-development purposes.
