# ✈️ Airbus Manager Application

Welkom bij de Airbus Manager! Deze Full Stack applicatie is ontworpen om een vloot van vliegtuigen te beheren. Je kunt vliegtuigen bekijken, toevoegen, bewerken en verwijderen (CRUD). De applicatie maakt gebruik van een RESTful API en een React frontend.

## 🛠️ Technologieën

**Backend:**
* Node.js & Express
* MongoDB & Mongoose
* REST API (Level 3 met HATEOAS links)
* Manual CORS Configuration

**Frontend:**
* React (Vite)
* React Router v7
* Tailwind CSS (v3)

---

## 🚀 Installatie & Starten

Deze applicatie bestaat uit twee delen: de Backend (`airbus-api`) en de Frontend (`airbus-app`). Volg onderstaande stappen om beide te starten.

### Stap 1: Backend Setup (API)

1.  Navigeer naar de api map:
    ```bash
    cd airbus-api
    ```
2.  Installeer de dependencies:
    ```bash
    npm install
    ```
3.  Controleer het `.env` bestand. Zorg dat de MongoDB connectiestring en poort correct zijn:
    ```env
    MONGODB_URI=mongodb://127.0.0.1:27017/airbus-api
    EXPRESS_PORT=8000
    BASE_URI=http://localhost:8000
    ```
4.  Start de server:
    ```bash
    npm run dev
    ```
    *De server draait nu op `http://localhost:8000`.*

### Stap 2: Frontend Setup (App)

1.  Open een **nieuwe** terminal en navigeer naar de app map:
    ```bash
    cd airbus-app
    ```
2.  Installeer de dependencies:
    ```bash
    npm install
    ```
3.  Start de applicatie:
    ```bash
    npm run dev
    ```
4.  Open je browser op de link die verschijnt (meestal `http://localhost:5173`).

---

## 📚 Features

* **Overzicht:** Bekijk een lijst van alle vliegtuigen met pagination.
* **Details:** Klik door naar een detailpagina voor specifieke informatie per vliegtuig.
* **Create:** Voeg nieuwe vliegtuigen toe via een formulier met validatie.
* **Update:** Pas bestaande vliegtuiggegevens aan.
* **Delete:** Verwijder vliegtuigen uit de database.
* **Search/Filter:** (Optioneel) Filter de lijst via URL parameters.

---

## 📝 Auteur

Gemaakt door [Jouw Naam]
Studentnummer: [Jouw Nummer]
Klas: [Jouw Klas]
