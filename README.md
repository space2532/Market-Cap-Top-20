# 📈 Market Cap Top 20 Visualization

A personal portfolio project that dynamically visualizes the top 20 global companies by market capitalization on a year-by-year basis. Users can interactively observe ranking changes through smooth animations and record personal insights for each company and year.

## 🚀 Live Demo

> **[Enter your deployed Vercel URL here]** (e.g., `market-cap-portfolio.vercel.app`)

## 📸 Screenshot

[Add a great screenshot or animated GIF of your project here]
![Project Screenshot](placeholder.png)

## ✨ Features

* **Dynamic Bar Chart Race:** Utilizes D3.js's General Update Pattern for smooth, animated transitions of rankings and bar lengths when the year changes.
* **Entry/Exit Comparison:** Instantly compare which companies entered or dropped out of the Top 20 list compared to the previous year.
* **Company-Specific Notes:** Click on any company to write, edit, and delete detailed notes on its industry, business model, and recent issues (powered by MongoDB).
* **Annual Theme & Trend Notes:** Record high-level insights on market themes and paradigms for each specific year.
* **Responsive Design:** Optimized UI/UX for all devices, including desktops, tablets, and mobile phones.

## 🛠️ Tech Stack

* **Frontend**: Next.js, React, D3.js, TailwindCSS
* **Backend**: Next.js API Routes
* **Database**: MongoDB Atlas
* **Deployment**: Vercel

## ⚙️ Getting Started

To run this project on your local machine, follow these steps.

### 1. Clone the Repository

```bash
git clone [https://github.com/YourUsername/market-cap-portfolio.git](https://github.com/YourUsername/market-cap-portfolio.git)
cd market-cap-portfolio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root of the project and add your MongoDB Atlas Connection String.

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 4. Run the Development Server

```bash
npm run dev
```

Now, you can open your browser and navigate to `http://localhost:3000` to see the project.