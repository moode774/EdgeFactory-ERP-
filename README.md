# 🌲 Forest Edge Factory - Inventory Management System

A comprehensive inventory management system built with React, TypeScript, and Firebase.

## 🚀 Features

- **Manufacturing Management** - Complete work order system with multi-step workflow
- **Inventory Control** - Real-time stock tracking and management
- **Customer & Supplier Management** - Comprehensive CRM features
- **Warehouse Management** - Multi-location inventory tracking
- **Bilingual Support** - Full Arabic/English language support with RTL
- **Firebase Integration** - Real-time database with offline support
- **Electron Desktop App** - Standalone desktop application

## 🛠️ Technologies

- **Frontend:** React 19, TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Firestore, Hosting)
- **Build Tool:** Vite
- **Desktop:** Electron
- **Icons:** Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/forest-edge-factory.git

# Navigate to project directory
cd forest-edge-factory

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run deploy` - Build and deploy to Firebase Hosting
- `npm run electron:dev` - Run Electron app in development
- `npm run package` - Create portable executable
- `npm run installer` - Create Windows installer

## 🌐 Live Demo

**Live Application:** [https://forestedge-666b0.web.app](https://forestedge-666b0.web.app)

**Default Login:**
- Username: `admin`
- Password: `admin123`

## 📁 Project Structure

```
forest-edge-factory/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── services/       # Firebase & storage services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── contexts/       # React contexts (Language, etc.)
├── electron/           # Electron main process
├── public/             # Static assets
└── dist/               # Production build
```

## 🔑 Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Firebase Hosting
4. Update `.env.local` with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 🌍 Language Support

The application supports both Arabic and English with full RTL (Right-to-Left) support for Arabic.

Toggle language using the language switcher in the header.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 👨‍💻 Author

Forest Edge Factory Team

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

**Built with ❤️ using React & Firebase**
