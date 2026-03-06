# Greivex – AI-Powered Civic Grievance Management Platform

## 🚀 Overview

Greivex is an innovative, AI-driven platform designed to revolutionize the way civic grievances are reported, managed, and resolved. The system empowers citizens to seamlessly communicate public service issues to the appropriate authorities, while leveraging advanced artificial intelligence to ensure efficient, transparent, and timely resolution.

Greivex bridges the gap between citizens and service providers, fostering a more responsive, accountable, and technology-enabled governance ecosystem.

---

## ✨ Key Features

### 🧠 AI-Based Department Classification
- Users can submit complaints by uploading live photos or detailed descriptions.
- Integrates **Google Cloud Vision API** for image analysis.
- Uses advanced language models via **OpenRouter (DeepSeek, Gemini)** for text processing.
- Automatically identifies the correct government department (Water, Electricity, Roads, etc.).
- Reduces manual intervention and routing errors.

---

### ⚡ Intelligent Prioritization
- AI-powered Natural Language Processing evaluates complaint urgency.
- Automatically assigns priority levels:
  - 🔴 Critical  
  - 🟠 High  
  - 🟡 Medium  
  - 🟢 Low  
- Ensures high-impact and emergency issues are resolved first.

---

### 🔍 Duplicate & Fake Complaint Detection
- AI-driven similarity checks detect repeated or spam complaints.
- Prevents misuse and reduces administrative overhead.
- Ensures genuine issues receive focused attention.

---

### 📍 Automated Location Detection
- Captures GPS location during complaint submission.
- Uses reverse geocoding to auto-fill area/locality.
- Improves jurisdiction accuracy and speeds up reporting.

---

### 📊 Role-Based Dashboards
- 👤 **Citizens:** Track complaints in real time.
- 🛠 **Service Providers:** Manage tasks and update statuses.
- 📈 **Management:** Monitor analytics and department performance.

---

### 📦 Amazon-Style Status Timeline
Each complaint follows a clear workflow:

- Real-time updates
- Transparent tracking
- User notifications at every stage

---

### 📧 Automated Email Notifications
- OTP-based verification during registration/login.
- Status updates sent via email.
- Keeps users informed throughout the lifecycle.

---

### 🎨 Modern Responsive UI/UX
- Built with **React.js**
- Mobile responsive design
- Live feedback and smooth interactions
- Clean and intuitive interface

---

### 🔐 Secure Authentication & Access Control
- JWT-based authentication
- Role-Based Access Control (RBAC)
- Secure data handling and privacy protection

---

## 🛠 Technical Stack

### 🌐 Frontend
- React.js  
- Context API  
- Modern Hooks  
- Responsive Design  

### ⚙ Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  

### 🤖 AI/ML Integration
- Google Cloud Vision API  
- OpenRouter (DeepSeek, Gemini)  
- Custom NLP fallback (offline scenarios)  

### 🔧 Additional Technologies
- JWT Authentication  
- RESTful APIs  
- Nodemailer (Email Services)  
- GPS & Reverse Geocoding  
- Role-Based Dashboards  

---

## 💡 Impact & Innovation

Greivex transforms civic grievance redressal by harnessing artificial intelligence to streamline the entire complaint lifecycle — from submission and classification to prioritization, resolution, and feedback.

By automating department detection, urgency assessment, and duplicate filtering, the platform:

- Reduces manual workload for government staff  
- Improves complaint resolution speed  
- Enhances transparency and accountability  
- Strengthens trust between citizens and authorities  

The result is a smarter, faster, and more citizen-centric public service system.

---

## 📌 Vision

To build a transparent, AI-powered civic infrastructure that empowers citizens and enables governments to respond efficiently, intelligently, and responsibly.

---

## 📜 License

This project is licensed under the MIT License.
