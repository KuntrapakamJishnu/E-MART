# E-MART - Premium Student Marketplace

A modern, full-stack e-commerce platform built for the student community. E-MART provides a seamless shopping and authentication experience with a professional design and robust backend infrastructure.

## 🌟 Features

### Authentication System
- **Email + OTP Registration**: Secure email verification with one-time passwords
- **Google OAuth Integration**: Quick login with Google accounts
- **Password Authentication**: Secure password-based login
- **Professional Auth Pages**: Beautifully designed login and registration pages with clothing imagery backgrounds

### Frontend Features
- **React + Vite**: Fast, modern frontend with instant hot module replacement
- **Responsive Design**: Tailwind CSS for mobile-first responsive layout
- **Google OAuth**: Seamless Google account integration
- **Product Catalog**: Browse and filter products
- **Shopping Cart**: Add/remove items with cart management
- **User Dashboard**: Profile management and order history

### Backend Features
- **Node.js + Express**: Scalable backend server
- **MongoDB**: NoSQL database for flexible data storage
- **RESTful API**: Clean API endpoints for all operations
- **Payment Integration**: Razorpay payment gateway support
- **Image Upload**: Cloudinary integration for image hosting
- **Redis Caching**: Fast data access with Redis cache
- **Analytics**: Track user activity and orders

## 📁 Project Structure

```
e-mart/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── Pages/
│   │   │   ├── Auth/          # Login & Register pages
│   │   │   ├── Admin/         # Admin panel
│   │   │   └── User/          # User pages (Home, etc)
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── Api/               # API client calls
│   │   └── Routes/            # Route configuration
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── backend/                  # Node.js + Express server
│   ├── src/
│   │   ├── config/            # Configuration files (DB, OAuth, etc)
│   │   ├── controller/        # Route controllers
│   │   ├── middleware/        # Custom middleware
│   │   ├── model/             # MongoDB models
│   │   └── routes/            # API routes
│   ├── index.js              # Server entry point
│   ├── package.json
│   └── .gitignore
│
├── .gitignore                # Root level git ignore
└── README.md                 # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn package manager
- Google OAuth credentials
- Cloudinary account (optional, for image uploads)
- Razorpay account (optional, for payments)

### Installation

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
REDIS_URL=your_redis_url
SMTP_SERVICE=gmail
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with the following variables:
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email
- `POST /api/auth/send-otp` - Send OTP to email
- `POST /api/auth/verify-otp` - Verify OTP and complete registration
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/google-callback` - Google OAuth callback
- `POST /api/auth/logout` - Logout user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove` - Remove item from cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details

## 🎨 Design Features

### Authentication Pages
- **Login Page**: Green VIT-AP hoodie background image positioned on the right
- **Register Page**: Professional clothing background with teal/cyan color scheme
- **Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **Glass Effect**: Modern glassmorphism design with blur effects

### Color Schemes
- **Login**: Amber/Orange/Blue gradient theme
- **Register**: Teal/Cyan/Blue gradient theme
- **Professional**: Dark backgrounds with accent colors for contrast

## 🔐 Security

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: JSON Web Tokens for authentication
- **OAuth**: Google OAuth for secure third-party login
- **Environment Variables**: Sensitive data stored in .env files
- **CORS**: Configured to allow frontend requests only

## 📦 Build & Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

Output is in `frontend/dist/`

### Build Backend
```bash
cd backend
npm run build  # if configured
```

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Commit with clear messages
4. Push to your branch
5. Create a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Authors

- **Kuntrapakami Jishnu** - Full Stack Developer

## 📞 Support

For issues and questions, please reach out through GitHub issues.

## 🙏 Acknowledgments

- React and Vite for the frontend framework
- Express.js for the backend framework
- Tailwind CSS for styling
- MongoDB for database
- Google for OAuth integration
- Unsplash for background images
