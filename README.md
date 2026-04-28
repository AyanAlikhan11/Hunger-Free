# 🍽️ HungerFree

> **Feed People. Save Food. Change Lives.**  
> An AI-powered food redistribution platform built to support **UN SDG Goal 2: Zero Hunger**

---

## 🌍 Overview

HungerFree is a modern full-stack web application that reduces food waste and fights hunger by connecting:

- 🏢 Food Donors (restaurants, households, events)
- 🏥 NGOs
- 🚚 Volunteers
- 🌾 Farmers
- 🛡️ Admins

Instead of letting surplus food go to waste, HungerFree intelligently redistributes it to communities in need using real-time coordination and AI demand forecasting.

---

## 🎯 Problem We Solve

Every day:

- Millions sleep hungry
- Tons of edible food are wasted
- NGOs struggle to find food sources
- Volunteers lack coordination
- Farmers lose unsold produce

HungerFree bridges this gap through technology.

---


## 🚀 Key Features

### 👤 Multi-Role Authentication

Users can register/login as:

- Donor
- NGO
- Volunteer
- Farmer
- Admin

---

### 🍱 Donor Dashboard

- Donate surplus food instantly
- Add quantity, expiry time, location
- Track donation history
- View impact metrics

---

### 🏥 NGO Dashboard

- Browse nearby food donations
- Request pickups
- Manage requests
- Monitor deliveries

---

### 🚚 Volunteer Dashboard

- Accept pickup requests
- Update delivery status
- Track active deliveries
- Navigation-ready workflow

---

### 🌾 Farmer Dashboard

- Sell / donate extra produce
- Add products
- Manage listings
- Reduce farm wastage

---

### 📊 Admin Dashboard

- Total donations
- Food saved
- People served
- Top donors
- Monthly growth charts
- Platform analytics

---

### 🤖 AI Prediction System (Gemini AI)

Uses Google Gemini AI to predict:

- High hunger demand zones
- Meals required by region
- Donation shortages
- Priority resource allocation

Turns reactive food charity into proactive hunger prevention.

---
## 🛠️ Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion

### Backend

- Next.js API Routes
- Firebase Authentication
- Firestore Database

### AI Integration

- Google Gemini AI API
- Backup AI Engine (optional)

### Media & Storage

- Cloudinary

### Charts / Analytics

- Recharts

---




## 📦Installation

Install and set up HungerFree locally:

### Clone the repository
git clone https://github.com/AyanAlikhan11/Hunger-Free.git

### Open project folder
cd Hunger-Free

### Install dependencies
npm install

### Create a file named .env.local:
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

### Run development server
npm run dev

Project will run at: http://localhost:3000/


## 🌐 Live Demo

👉 https://hunger-free-mu.vercel.app/

## 📂 Project Structure

```bash
Hunger-Free/
│── app/
│── components/
│── lib/
│── hooks/
│── public/
│── styles/
│── firebase/
│── api/
│── types/
│── utils/


🤝 Contributing

Contributions are welcome!

If you'd like to improve weather UI, news layout, or add new features, feel free to open a PR or issue.


⭐ Support

If you like this project:

⭐ Star this repository
🍴 Fork this repository
🚀 Share this project
## 📬 Contact

Ayan Ali Khan

GitHub: https://github.com/AyanAlikhan11

Email: scoutayan853@gmail.com
