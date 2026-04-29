# 🏟️ Athletic Facilities Booking Web Application

<p align="center">
  A production-ready full-stack web application for managing athletic facility reservations, featuring secure authentication, role-based access control, and real-time booking workflows.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Backend-green" />
  <img src="https://img.shields.io/badge/Express.js-API-lightgrey" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green" />
  <img src="https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-blue" />
  <img src="https://img.shields.io/badge/Auth-Sessions%20%2B%20reCAPTCHA-orange" />
  <img src="https://img.shields.io/badge/Deployment-Render-purple" />
</p>

---

## 🌐 Live Demo

🚀 **Production URL:**
👉 https://athleticfacilitiesbookingwebpage.onrender.com

> Deployed on Render with MongoDB Atlas and secure environment configuration.

---

## 📌 Overview

This application allows users to register, authenticate, and manage reservations for athletic facilities in a secure and intuitive environment.

### Key capabilities:

* 🔐 Secure authentication with sessions & reCAPTCHA
* 📅 Real-time reservation system with availability control
* 👤 Role-based access (User / Admin)
* 📧 Automated email notifications
* 🛠 Admin Back Office for system management

---

## 🖼️ Application Preview

---

### 🔐 Authentication

<p align="center">
  <img src="https://github.com/user-attachments/assets/7d64d35e-f8c2-4e05-b249-34636e836fe6" width="400"/>
  <img src="https://github.com/user-attachments/assets/3255017c-3d30-46d1-a77c-5e65af324050" width="300"/>
</p>

* Secure login with Google reCAPTCHA
* User registration stored in MongoDB Atlas

---

### 🧭 Dashboard & Navigation

<p align="center">
  <img src="https://github.com/user-attachments/assets/c7c28dab-0f96-40fe-988a-cd15f1d6c27f" width="850"/>
</p>

* Personalized user interface
* Dynamic navigation based on authentication state
* Dropdown account management

---

### 📅 Reservation System

<p align="center">
  <img src="https://github.com/user-attachments/assets/60acaa95-1585-4fec-8c8a-ab664c8588b1" width="300"/>
  <img src="https://github.com/user-attachments/assets/a352e521-ce02-4f11-bd49-3597b1424e68" width="700"/>
</p>

* Create reservations with time-slot selection
* Prevent double bookings via availability checks
* Edit and cancel reservations

---

### 🔍 Search & Filtering

<p align="center">
  <img src="https://github.com/user-attachments/assets/d18c9c4c-7272-417c-a7a0-f4545bdecf83" width="850"/>
</p>

* Search by user, facility, or date
* Dynamic filtering of reservation results

---

### 🛠 Admin Back Office

<p align="center">
  <img src="https://github.com/user-attachments/assets/cb836aed-bd70-4b42-9ed0-64320791d153" width="500"/>
</p>

* View canceled reservations
* Restore reservations
* Export data to PDF
* Access restricted to admin users

---

### 📧 Email Notifications

<p align="center">
  <img src="https://github.com/user-attachments/assets/8e2fe0f7-ee2a-45c2-8028-a464ef4c85c7" width="400"/>
</p>

* Reservation confirmation emails
* Cancellation notifications
* Password reset emails with secure tokens

---

### 👤 User Profile

<p align="center">
  <img src="https://github.com/user-attachments/assets/10803599-dee1-4533-ae37-7409316d2b15" width="350"/>
</p>

* View account details
* Role-based UI rendering

---

## 🧠 Architecture

### Frontend

* Vanilla JavaScript (ES6+)
* Bootstrap 5 (responsive UI)
* Client-side validation + reCAPTCHA

### Backend

* Node.js + Express.js
* RESTful API architecture
* Session-based authentication

### Database

* MongoDB Atlas
* Mongoose ODM

### Infrastructure

* Render (deployment)
* Environment variables (.env)
* Nodemailer (email service)

---

## 🔐 Authentication & Security

* Session-based authentication (cookies)
* Google reCAPTCHA (bot protection)
* Password hashing via Mongoose middleware
* Role-based access control (RBAC)

---

## 🚀 Deployment

Deployed on **Render** with:

* Environment variables for:

  * MongoDB URI
  * Session secret
  * Email credentials
  * reCAPTCHA secret key

### Production fixes applied:

* Removed hardcoded `localhost` API URLs
* Configured secure cookies for production
* Used dynamic port binding (`process.env.PORT`)
* Proper static file serving via Express

---

## ⚙️ Local Development

```bash
git clone https://github.com/thomasbeo/AthleticFacilitiesBookingWebpage.git
cd AthleticFacilitiesBookingWebpage
npm install
```

Create a `.env` file:

```env
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_app_password
ADMIN_EMAIL=your_admin_email
RECAPTCHA_SECRET_KEY=your_secret_key
```

Run the server:

```bash
node server.js
```

Open:

```
http://localhost:3000
```

---

## 🧪 Key Technical Challenges Solved

* Migrating from local development → production (Render)
* Handling session cookies across environments
* Eliminating hardcoded API endpoints
* Implementing server-side reCAPTCHA verification
* Debugging deployment/runtime issues (dotenv, port binding)

---

## 🔮 Future Improvements

* 📱 Mobile-first UI optimization
* 🔔 Real-time notifications (WebSockets)
* 📊 Admin analytics dashboard
* 🌍 Multi-language support
* ⚡ Migration to React frontend

---

## 👨‍💻 Author

**Thomas Beopoulos**

Full-stack developer focused on building real-world, production-ready web applications with strong backend architecture and deployment experience.

---
