# ⚡ Instant — Talent. Trust. Time.

> A full-stack web platform connecting MSMEs (businesses) with agencies that provide services through skilled workers.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd instant

# 2. Install all dependencies
npm run setup

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# → Edit both .env files with your actual credentials

# 4. Start both servers
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **API Health**: http://localhost:5000/api/health

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + React Router + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcrypt |
| Real-time | Socket.io |
| Payments | Razorpay |
| HTTP Client | Axios |

---

## 📁 Folder Structure

```
instant/
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile
│   │   ├── requestController.js    # Service request CRUD
│   │   ├── proposalController.js   # Proposal management
│   │   ├── messageController.js    # Chat messages
│   │   └── paymentController.js    # Razorpay integration
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT + role-based auth
│   ├── models/
│   │   ├── User.js
│   │   ├── AgencyProfile.js
│   │   ├── ServiceRequest.js
│   │   ├── Proposal.js
│   │   ├── Message.js
│   │   └── Payment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── proposalRoutes.js
│   │   ├── messageRoutes.js
│   │   └── paymentRoutes.js
│   ├── utils/
│   │   └── socket.js               # Socket.io setup
│   ├── server.js                   # Express entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── Navbar/Navbar.jsx
│       │   ├── Sidebar/Sidebar.jsx
│       │   └── ChatBox/ChatBox.jsx
│       ├── context/
│       │   └── AuthContext.js      # Global auth state
│       ├── pages/
│       │   ├── Home/
│       │   ├── Login/
│       │   ├── Register/
│       │   ├── BusinessDashboard/
│       │   ├── AgencyDashboard/
│       │   ├── PostRequest/
│       │   ├── ViewRequests/
│       │   ├── Proposals/
│       │   ├── Chat/
│       │   └── Payments/
│       ├── services/
│       │   └── api.js              # Axios API client
│       ├── App.js                  # Router + protected routes
│       └── index.js
│
└── package.json                    # Root scripts (runs both)
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/instant

# JWT (use a long random string in production)
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Frontend (`frontend/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/update` | Private | Update profile |

### Service Requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/requests/create` | Business | Create request |
| GET | `/api/requests` | Private | Get all requests |
| GET | `/api/requests/:id` | Private | Get single request |
| PUT | `/api/requests/:id` | Business | Update request |
| DELETE | `/api/requests/:id` | Business | Delete request |

### Proposals
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/proposals/send` | Agency | Submit proposal |
| GET | `/api/proposals/my` | Agency | My proposals |
| GET | `/api/proposals/request/:id` | Business | Proposals for request |
| PUT | `/api/proposals/accept/:id` | Business | Accept proposal |
| PUT | `/api/proposals/reject/:id` | Business | Reject proposal |

### Messages
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/messages/conversations` | Private | Get conversations |
| GET | `/api/messages/:conversationId` | Private | Get messages |
| POST | `/api/messages/send` | Private | Send message |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments/create-order` | Business | Create Razorpay order |
| POST | `/api/payments/verify` | Business | Verify payment |
| GET | `/api/payments/history` | Private | Payment history |

---

## 💬 Socket.io Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `user:online` | `userId` | Announce user is online |
| `conversation:join` | `conversationId` | Join a chat room |
| `conversation:leave` | `conversationId` | Leave a chat room |
| `message:send` | `{senderId, receiverId, content, conversationId}` | Send a message |
| `typing:start` | `{conversationId, userId}` | Typing indicator on |
| `typing:stop` | `{conversationId, userId}` | Typing indicator off |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message:receive` | Message object | New message in room |
| `notification:message` | `{from, preview, conversationId}` | Notification |
| `typing:start` | `{userId}` | Someone is typing |
| `typing:stop` | `{userId}` | Stopped typing |
| `users:online` | `[userId]` | Updated online users |

---

## 💳 Payment Flow

1. Business accepts an agency proposal
2. Business navigates to `/payments?proposalId=<id>`
3. Frontend calls `POST /api/payments/create-order` → gets Razorpay order ID
4. Razorpay checkout modal opens
5. User completes payment
6. Frontend calls `POST /api/payments/verify` with Razorpay signatures
7. Backend verifies HMAC signature
8. Payment record updated, service request marked completed

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Business** | Post jobs, receive proposals, accept/reject, pay, chat |
| **Agency** | Browse jobs, submit proposals, chat, receive payments |
| **Admin** | Approve agencies, monitor transactions |

---

## 🛡️ Security Features

- JWT authentication on all private routes
- bcrypt password hashing (12 salt rounds)
- Role-based authorization middleware
- CORS configured to frontend URL only
- Input validation on all endpoints
- Payment signature verification (HMAC SHA256)
- Password field excluded from all queries by default

---

## 🏃 Running Individual Servers

```bash
# Backend only
cd backend
npm install
cp .env.example .env  # fill in your values
npm run dev

# Frontend only
cd frontend
npm install
cp .env.example .env  # fill in your values
npm run dev
```

---

## 📦 Dependencies

### Backend
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `socket.io` - Real-time communication
- `razorpay` - Payment gateway SDK
- `cors` - CORS middleware
- `dotenv` - Environment variables

### Frontend
- `react` + `react-dom` - UI library
- `react-router-dom` - Client-side routing
- `axios` - HTTP requests
- `socket.io-client` - Real-time client
- `tailwindcss` - Utility-first CSS

---

## 🚀 Deployment

### Backend (e.g. Railway / Render / EC2)
```bash
cd backend
npm install
npm start
```
Set `NODE_ENV=production` and all env vars in your hosting platform.

### Frontend (e.g. Vercel / Netlify)
```bash
cd frontend
npm install
npm run build
```
Deploy the `build/` folder. Set `REACT_APP_API_URL` to your backend URL.

---

## 📝 License

MIT © Instant Platform 2024
