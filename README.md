# Elctro - Modern Food Ordering Platform

Elctro is a professional full-stack food ordering application built with a focus on speed, real-time interactivity, and a seamless user experience. It features a bilingual (English/Arabic) interface, a secure authentication system, and a robust administrative suite.

## 🌐 Live Demo

- **Frontend**: [https://elctro.ahmed15ayman7.com/](https://elctro.ahmed15ayman7.com/)
- **API Documentation**: [https://api.ahmed15ayman7.com/api-docs/](https://api.ahmed15ayman7.com/api-docs/)

### Admin Credentials (Demo)
- **Email**: `admin@elctro.com`
- **Password**: `123456789`

## 🚀 Features

### Customer Experience
- **Interactive Menu**: Browse products by category with a fast, searchable interface.
- **Real-time Tracking**: Watch order status updates live via Socket.io without refreshing.
- **Authentication**: Secure login/register system using JWT (Access + HttpOnly Refresh tokens) and Google OAuth.
- **Bilingual (i18n)**: Full support for English and Arabic, including Right-to-Left (RTL) layout switching.
- **Web Push Notifications**: Stay updated on order status even when the tab is closed.
- **Immersive Visuals**: High-performance animations with Framer Motion and a 3D hero scene using React Three Fiber.
- **Progressive Web App**: Mobile-first design for a native-like experience on all devices.

### Administrative Tools
- **Comprehensive Dashboard**: Real-time analytics charts for revenue, order volume, and status distribution.
- **Catalog Management**: Effortlessly create, update, and manage products and categories.
- **Order Fulfillment**: Action-based interface for managing the delivery pipeline from pending to delivered.
- **User Management**: Role-based access control to promote or manage user accounts.

---

## 🛠️ Tech Stack

**Frontend:**
- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://docs.pmnd.rs/zustand) (State Management)
- [Framer Motion](https://www.framer.com/motion/) & [Three.js](https://threejs.org/)
- [Socket.io-client](https://socket.io/)

**Backend:**
- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/) (PostgreSQL/MySQL)
- [Socket.io](https://socket.io/) (Real-time communication)
- [Redis](https://redis.io/) (for socket scaling)
- [Web-Push](https://www.npmjs.com/package/web-push) (Notifications)
- [Swagger/OpenAPI](https://swagger.io/) (API Documentation)

---

## ⚙️ Installation

### 1. Prerequisites
- Node.js (v18.0 or higher)
- A running database (PostgreSQL recommended)
- A Redis instance (optional, for multi-instance socket support)

### 2. Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Run migrations and seed data
npx prisma migrate dev
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`.

---

## 📖 Usage

- **Browse & Order**: Visit the [Live Menu](https://elctro.ahmed15ayman7.com/menu) as a guest or logged-in user.
- **Admin Access**: Log in with an admin account and navigate to the [Admin Dashboard](https://elctro.ahmed15ayman7.com/admin).
- **API Documentation**: Access interactive documentation at [https://api.ahmed15ayman7.com/api-docs/](https://api.ahmed15ayman7.com/api-docs/).

---

## 🤝 Contribution Guidelines

We welcome contributions! To contribute:

1. **Fork** the repository.
2. **Clone** your fork (`git clone ...`).
3. **Branch** off `main` for your feature (`git checkout -b feature/amazing-feature`).
4. **Commit** your changes with clear messages.
5. **Push** to your fork and submit a **Pull Request**.

Please ensure your code follows the existing TypeScript patterns and includes necessary documentation updates.

---

## ⚖️ License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

---
*Built with ❤️ by [Ahmed Ayman](mailto:ahmed15ayman7ahmed2002@gmail.com)*
*Contact: [+201097395668](tel:+201097395668) ([WhatsApp](https://wa.me/201097395668)) / [+201284959694](tel:+201284959694) ([WhatsApp](https://wa.me/201284959694))*
