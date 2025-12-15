# FarmConnect Setup Instructions

## Prerequisites
- Node.js 16+ installed
- PostgreSQL/Neon database configured
- Git (optional)

## Backend Setup

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Update `backend/.env` with your Neon database connection string:
```env
DATABASE_URL=postgresql://neondb_owner:npg_jrNXMJ0sK4TY@ep-frosty-field-ahgmof8k-pooler.c-3.us-east-1.aws.neon.tech/digital-farm-db?sslmode=require&channel_binding=require
```

### 3. Run Database Migrations
```bash
npm run migrate
```

This will create all necessary tables:
- users
- farmers
- farmer_verifications
- otp_verifications
- audit_logs

### 4. Start Backend Server
```bash
npm run dev
```

Backend will run on: `http://localhost:5000`

Health check: `http://localhost:5000/health`

## Frontend Setup

### 1. Install Frontend Dependencies
```bash
# From project root
npm install
```

### 2. Configure Environment Variables
Frontend uses: `VITE_API_BASE_URL=http://localhost:5000/api/v1` (already set in `.env`)

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173` (or another available port)

## Testing the Complete Flow

### Test Sign Up (Farmer)
1. Go to http://localhost:5173/auth?signup=true
2. Click "Sign up" mode
3. Fill in:
   - Full Name: "John Farmer"
   - Email: "farmer@example.com"
   - Password: "TestPassword123"
   - Select "Farmer"
4. Click "Create Account"
5. You'll be redirected to farmer verification

### Test Sign Up (Buyer)
1. Go to http://localhost:5173/auth?signup=true
2. Click "Sign up" mode
3. Fill in:
   - Full Name: "Jane Buyer"
   - Email: "buyer@example.com"
   - Password: "TestPassword123"
   - Select "Buyer"
4. Click "Create Account"
5. You'll be redirected to buyer dashboard

### Test Sign In
1. Go to http://localhost:5173/auth
2. Email: "farmer@example.com"
3. Password: "TestPassword123"
4. Click "Sign In"
5. You'll be redirected to farmer verification or dashboard

### Test with Demo Credentials (Non-Farmer Roles)
```
Admin: admin@test.com / admin123
Buyer: buyer@test.com / buyer123
Delivery: delivery@test.com / delivery123
Warehouse: warehouse@test.com / warehouse123
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/me` - Get current user

### Farmer Verification
- `POST /api/v1/farmers/verify/initiate` - Start verification
- `POST /api/v1/farmers/verify/step/:step` - Submit verification step (0-5)
- `POST /api/v1/farmers/verify/otp/send` - Send OTP
- `POST /api/v1/farmers/verify/otp/verify` - Verify OTP
- `GET /api/v1/farmers/verify/status` - Get verification status
- `POST /api/v1/farmers/verify/submit` - Submit verification

## Troubleshooting

### Backend won't start
- Check if port 5000 is in use: `lsof -i :5000`
- Verify DATABASE_URL in `backend/.env` is correct
- Check internet connection (Neon is cloud-hosted)

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check browser console for CORS errors

### Database migration fails
- Verify Neon credentials are correct
- Check that the database exists
- Make sure SSL connection is enabled (sslmode=require)

## What's Implemented

✅ Backend server with Express.js
✅ PostgreSQL database schema
✅ User registration and login
✅ JWT authentication
✅ Password hashing with bcrypt
✅ Farmer verification initiation
✅ OTP generation and verification
✅ Error handling and validation
✅ Frontend auth pages
✅ API service layer

## Next Steps

1. Complete farmer verification form submission to backend
2. Implement file uploads for verification documents (S3)
3. Add admin verification review dashboard
4. Implement payment processing
5. Add product listing and ordering
6. Implement delivery tracking

## Database Schema

### Users Table
- id (UUID, PK)
- email, password_hash
- first_name, last_name, phone_number
- user_type, verification_status
- is_verified, email_verified, phone_verified
- login_attempts, locked_until
- created_at, updated_at

### Farmers Table
- id (UUID, PK)
- user_id (FK to users)
- farm_name, farm_size, years_of_experience
- region, district
- rating, rating_count
- is_approved, suspension_reason

### Farmer Verifications Table
- id (UUID, PK)
- farmer_id, user_id (FK)
- Personal info (full_name, DOB, national_id_number, etc.)
- Farm details (farm_name, region, farming_types, produce_categories, etc.)
- Banking details (mobile_money_name, number, etc.)
- Document URLs
- Status (pending, approved, rejected)
- Level 1 & 2 verification fields

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://...
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

### Frontend (.env)
```
VITE_PUBLIC_BUILDER_KEY=...
VITE_API_BASE_URL=http://localhost:5000/api/v1
```
