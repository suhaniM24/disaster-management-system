# 🚨 Cloud-Based Disaster Management & Emergency Response System

A real-time, production-ready web application for monitoring and managing disaster reports using Firebase Firestore, Leaflet.js, and EmailJS.

## 🚀 Key Features
- **Real-time Admin Dashboard**: Add, edit, delete, and resolve disaster reports.
- **Interactive Live Map**: Visualize active disasters with color-coded severity circles and markers.
- **Public Alert Feed**: Real-time stats and incident cards for the general public.
- **Email Notifications**: Immediate alerts for subscribers via EmailJS when new disasters are reported.
- **Dark Emergency UI**: Premium, mobile-responsive design with smooth animations.

---

## 🛠️ Setup Instructions

### 0. Local Testing (CRITICAL)
Because this project uses **JavaScript Modules** (`import/export`), it **cannot** be run by simply double-clicking the HTML files. You must serve it via a local web server to avoid CORS blocks.
- **Option A (Node.js):** Run `npm install` then `npm start`.
- **Option B (Python):** Run `python -m http.server` in the project folder.
- **Option C (VS Code):** Install the **Live Server** extension and click "Go Live".

### 1. Firebase Firestore Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Add a **Web App** to your project.
4. Copy the `firebaseConfig` object into `js/firebase-config.js`.
5. Enable **Firestore Database** in the console.
6. Create two collections:
   - `disasters`: For storing incident reports.
   - `subscribers`: For storing user emails.
7. Set Firestore Rules to Allow Read/Write (Only for testing! In production, use Firebase Auth and proper rules):
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

### 2. EmailJS Setup
1. Create an account at [EmailJS](https://www.emailjs.com/).
2. Add a **Email Service** (e.g., Gmail).
3. Create an **Email Template** with variables: `disaster_type`, `location`, `severity`, `description`, `affected_population`, `map_link`.
4. In `js/admin.js`, update the `notifySubscribers` function with your `USER_ID`, `SERVICE_ID`, and `TEMPLATE_ID`.

### 3. Change Admin Credentials
- Open `js/auth.js`.
- Modify the `ADMIN_CREDENTIALS` object:
  ```javascript
  const ADMIN_CREDENTIALS = {
      username: "your_username",
      password: "your_secure_password"
  };
  ```

---

## 📂 Project Structure
```
/disaster-response-system
├── index.html              → Landing Page
├── admin-login.html        → Admin Login Page
├── admin-dashboard.html    → Admin Dashboard
├── user.html               → Public User Dashboard
├── map.html                → Live Disaster Map
├── /css
│   └── style.css           → Custom styles (Dark Theme)
├── /js
│   ├── firebase-config.js  → Firebase Initialization
│   ├── auth.js             → Admin Auth Logic (Hardcoded)
│   ├── admin.js            → Admin CRUD & Alerts logic
│   ├── user.js             → User View & Subscribe logic
│   └── map.js              → Leaflet Map logic
└── /assets
    └── icons/              → Disaster type icons (Optional)
```

## 🌐 Deployment (Firebase Hosting)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Deploy: `firebase deploy`

---

## 🔒 Security Note
This project uses hardcoded credentials and open Firestore rules for demonstration purposes. **Always** transition to Firebase Authentication and secured Firestore Security Rules before public production deployment.
