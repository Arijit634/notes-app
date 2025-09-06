# 📝 Notes App

<div align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen?style=for-the-badge&logo=spring&logoColor=white" alt="Spring Boot" />
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/AWS-Deployed-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white" alt="AWS" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" />
</div>

<div align="center">
  <h3>🚀 A Modern Full-Stack Notes Application</h3>
  <p><em>Secure note-taking platform with 2FA authentication and cloud deployment</em></p>
</div>

---

## 🌟 **Overview**

**Notes App** is a full-stack note-taking application built with Spring Boot and React. It provides secure user authentication, note management with categories and favorites, and is deployed on AWS cloud infrastructure.

### ✨ **Key Features**

- 🔐 **Secure Authentication**: JWT tokens + Two-Factor Authentication (2FA)
- 🌐 **OAuth2 Integration**: Login with Google and GitHub
- 📝 **Note Management**: Create, edit, delete, and organize notes
- ⭐ **Favorites System**: Mark notes as favorites for quick access
- 🌍 **Public Notes**: Share notes publicly with other users
- 🔄 **Seamless Username Updates**: Change username without logout
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ☁️ **Cloud Deployed**: Frontend on S3/CloudFront, Backend on Elastic Beanstalk

---

## 🏗️ **Architecture**

```
User Browser → CloudFront CDN → S3 (React App) → API → Elastic Beanstalk (Spring Boot) → RDS PostgreSQL
```

### 🎯 **Tech Stack**

#### **Frontend**

- ⚛️ **React 19.1.0** - Modern React with hooks
- 🎨 **Tailwind CSS** - Utility-first styling
- 🔄 **Redux Toolkit** - State management
- 📱 **React Router 7** - Client-side routing
- 🎭 **Framer Motion** - Animations
- 🏗️ **Vite** - Fast build tool
- 🔥 **React Hot Toast** - Notifications

#### **Backend**

- ☕ **Spring Boot 3.5.3** - Java backend framework
- 🔒 **Spring Security 6** - Authentication & authorization
- 🗄️ **Spring Data JPA** - Database operations
- 🎯 **PostgreSQL** - Primary database
- 🔑 **JWT + 2FA** - Multi-layer security
- 📊 **Spring Actuator** - Health monitoring

#### **Cloud Infrastructure**

- 🌐 **Amazon S3** - Static website hosting
- ⚡ **CloudFront** - Content delivery network
- 🚀 **Elastic Beanstalk** - Application hosting
- 🗄️ **Amazon RDS** - Managed PostgreSQL database

---

## 🚀 **Implemented Features**

### 🔐 **Authentication & Security**

- User registration and login with JWT tokens
- Two-Factor Authentication (2FA) with TOTP
- OAuth2 login with Google and GitHub
- Profile picture upload and management
- Password change functionality
- Seamless username updates with automatic token refresh

### 📝 **Note Management**

- Create, read, update, and delete notes
- Mark notes as favorites
- Public notes sharing
- Note search and filtering
- Categories for organization
- Rich text content support

### 👤 **User Profile**

- Profile information management
- Profile picture upload/delete
- 2FA setup and management
- Password change (for non-OAuth users)
- Account settings

### 📊 **Dashboard**

- User statistics overview
- Recent notes display
- Quick access to favorites
- Activity summary

---

## 🌐 **Live Demo**

### **Production URLs**

- **Frontend**: [https://d32vmhhwyy81ba.cloudfront.net](https://d32vmhhwyy81ba.cloudfront.net)
- **API**: Backend deployed on AWS Elastic Beanstalk

---

## 🛠️ **Local Development Setup**

### 📋 **Prerequisites**

- ☕ **Java 21**
- 🟢 **Node.js 18+**
- 🐘 **PostgreSQL**
- 🔧 **Maven**

### ⚡ **Quick Start**

1. **Clone Repository**

   ```bash
   git clone https://github.com/Arijit634/notes-app.git
   cd notes-app
   ```
2. **Backend Setup**

   ```bash
   cd notes-backend

   # Configure application-dev.properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/notesdb
   spring.datasource.username=your_username
   spring.datasource.password=your_password

   # Run application
   ./mvnw spring-boot:run
   ```
3. **Frontend Setup**

   ```bash
   cd notes-frontend
   npm install
   npm run dev
   ```
4. **Access Application**

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

## 📁 **Project Structure**

```
📦 notes-app/
├── 🗂️ notes-backend/                 # Spring Boot API
│   ├── 📂 src/main/java/
│   │   └── 📂 com/project/notes_backend/
│   │       ├── 📂 config/             # Security configuration
│   │       ├── 📂 controller/         # REST endpoints
│   │       ├── 📂 dto/                # Data transfer objects
│   │       ├── 📂 entity/             # JPA entities
│   │       ├── 📂 repository/         # Data repositories
│   │       ├── 📂 security/           # JWT & 2FA security
│   │       └── 📂 service/            # Business logic
│   └── 📄 pom.xml
├── 🗂️ notes-frontend/                # React Application
│   ├── 📂 src/
│   │   ├── 📂 components/             # Reusable components
│   │   ├── 📂 pages/                  # Page components
│   │   ├── 📂 store/                  # Redux store
│   │   └── 📂 services/               # API services
│   └── 📄 package.json
└── 📄 README.md
```

---

## 🔧 **API Endpoints**

### 🔐 **Authentication**

```http
POST   /api/auth/login              # User login
POST   /api/auth/register           # User registration  
POST   /api/auth/2fa/setup          # Setup 2FA
POST   /api/auth/2fa/verify         # Verify 2FA
GET    /oauth2/authorization/google # Google OAuth
GET    /oauth2/authorization/github # GitHub OAuth
```

### 📝 **Notes**

```http
GET    /api/notes                   # Get user notes
POST   /api/notes                   # Create note
GET    /api/notes/{id}              # Get specific note
PUT    /api/notes/{id}              # Update note
DELETE /api/notes/{id}              # Delete note
POST   /api/notes/{id}/favorite     # Toggle favorite
GET    /api/notes/public            # Get public notes
```

### 👤 **Profile**

```http
GET    /api/profile                 # Get profile
PUT    /api/profile                 # Update profile
PUT    /api/profile/change-password # Change password
POST   /api/profile/picture         # Upload profile picture
DELETE /api/profile/picture         # Delete profile picture
```

---

## 🚀 **Deployment**

The application uses AWS services:

- **Frontend**: Deployed to S3 with CloudFront distribution
- **Backend**: Deployed on Elastic Beanstalk with RDS PostgreSQL
- **Build**: Automated with Maven (backend) and Vite (frontend)

---

## 👨‍💻 **Author**

**Arijit Guin**

- 🔗 GitHub: [@Arijit634](https://github.com/Arijit634)

---

<div align="center">
  <h3>⭐ Star this repository if you found it helpful! ⭐</h3>
</div>
