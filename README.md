# 🌍 PRO-MOUTE Mobility Footprint Calculator

A lightweight, mobile-first web application designed for the **PRO-MOUTE** training course[cite: 12, 13]. This tool is used as an interactive workshop activity to help participants estimate the CO₂ emissions they generated commuting to the session.

## 🎯 Context
This calculator is part of an educational course aimed at professionals from public and private companies in Barcelona. The overarching goal of the course is to teach participants how to design and implement a "Pla de Desplaçaments d'Empresa (PDE)" and promote sustainable mobility within the workplace. 

**Disclaimer:** *The calculations provided by this tool are rough estimations based on standard urban transport emission factors (adapted from Our World in Data). They are intended for educational and discussion purposes during the workshop, rather than precise scientific measurement.*

## 🤝 Project Partners
The PRO-MOUTE edition is proudly organized and supported by:
* **FACTUAL** 
* **Cambra de Comerç de Barcelona** 
* **EIT Urban Mobility** (Co-funded by the European Union) 

## 🤖 Built with AI
This project (HTML, CSS, and JavaScript logic) was generated using Google's Gemini 3.1 Pro AI as a fast, "no-code/low-code" solution to build a fully functional, multilingual tool for the workshop.

## ✨ Features
* **Zero Friction:** No server, no database, and no app downloads required. It's a Single Page Application (SPA) that runs entirely in the browser.
* **Multilingual:** Instantly switches between Spanish (ES), Catalan (CAT), and English (EN).
* **Mobile-First Design:** Optimized with large, tap-friendly elements for mobile phone users.

## ⚙️ How to Update the Data 
To add a new transport mode or update the emissions math:
1. Open the `modes.csv` file in Excel or any text editor.
2. Edit existing rows or add a new one using the exact semicolon-separated format: `id;co2;icon;es;cat;en`
3. Save the file. The web app will automatically build the new dropdown menu, apply the translations, and update the math calculations the next time it is loaded!

## 🚀 How to Try It

[Link to Live App](https://cyclingmoritz.github.io/factual_emission_calculator/)

Alternatively, you can run it locally by downloading this repository and opening the `index.html` file in any web browser.