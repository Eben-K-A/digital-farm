# FarmConnect Backend Specification Document

## Table of Contents
1. [System Overview](#system-overview)
2. [Database Schema](#database-schema)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Endpoints](#api-endpoints)
5. [Payment & Financial Flow](#payment--financial-flow)
6. [Farmer Verification Process](#farmer-verification-process)
7. [Business Logic](#business-logic)
8. [Error Handling](#error-handling)
9. [Deployment & Infrastructure](#deployment--infrastructure)

---

## System Overview

### Platform Architecture
FarmConnect is a multi-role agricultural marketplace connecting:
- **Farmers** - Sell agricultural products
- **Buyers** - Purchase fresh produce
- **Delivery Personnel** - Handle logistics
- **Warehouse Staff** - Manage inventory
- **Admin** - Platform management and financial oversight

### Core Features
- User authentication & role-based access control
- Farmer verification (KYC with 3-level verification)
- Product marketplace with approvals
- Order management & delivery tracking
- Escrow-based payment system with 5% platform commission
- Financial dashboard for admin
- Dispute resolution & refund management

---

## Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    profile_picture_url VARCHAR(500),
    user_type ENUM('farmer', 'buyer', 'delivery', 'warehouse', 'staff', 'admin'),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status ENUM('unverified', 'pending', 'approved', 'rejected') DEFAULT 'unverified',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_type ON users(user_type);
```

### 2. Farmers Table
```sql
CREATE TABLE farmers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(255) NOT NULL,
    farm_size DECIMAL(10, 2), -- in acres
    years_of_experience INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_farmers_user_id ON farmers(user_id);
```

### 3. Farmer Verification Table
```sql
CREATE TABLE farmer_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Personal Information
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    national_id_number VARCHAR(100) NOT NULL UNIQUE,
    national_id_type ENUM('ghana_card', 'ecowas_card') NOT NULL,
    photograph_url VARCHAR(500),
    
    -- Farm Details
    farm_name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    town_community VARCHAR(100) NOT NULL,
    gps_address VARCHAR(255) NOT NULL,
    farming_types JSONB, -- Array: ['crops', 'livestock', 'mixed', 'aquaculture']
    produce_categories JSONB, -- Array of categories
    
    -- Banking Details
    mobile_money_name VARCHAR(255) NOT NULL,
    mobile_money_number VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    preferred_payment_method VARCHAR(50), -- 'Mobile Money', 'Bank Transfer'
    
    -- Documents
    ghana_card_front_url VARCHAR(500),
    ghana_card_back_url VARCHAR(500),
    farm_photo_1_url VARCHAR(500),
    farm_photo_2_url VARCHAR(500),
    business_registration_url VARCHAR(500),
    
    -- Compliance
    confirm_ownership BOOLEAN DEFAULT FALSE,
    agree_to_terms BOOLEAN DEFAULT FALSE,
    consent_to_verification BOOLEAN DEFAULT FALSE,
    
    -- Verification Status
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    current_step INT DEFAULT 0, -- 0-5 for 6-step wizard
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    rejected_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Level 1 Verification (Automated)
    otp_verified BOOLEAN DEFAULT FALSE,
    otp_verified_at TIMESTAMP,
    id_format_valid BOOLEAN DEFAULT FALSE,
    mobile_money_name_matched BOOLEAN DEFAULT FALSE,
    
    -- Level 2 Verification (Manual Review)
    reviewed_by_admin_id UUID REFERENCES users(id),
    manual_verification_completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(farmer_id)
);

CREATE INDEX idx_farmer_verifications_farmer_id ON farmer_verifications(farmer_id);
CREATE INDEX idx_farmer_verifications_status ON farmer_verifications(status);
CREATE INDEX idx_farmer_verifications_user_id ON farmer_verifications(user_id);
```

### 4. Products Table
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    unit_type VARCHAR(50), -- kg, bag, crate, etc.
    quantity_available INT NOT NULL,
    harvest_date DATE,
    location VARCHAR(255),
    region VARCHAR(100),
    images JSONB, -- Array of image URLs
    
    -- Approval Status
    status ENUM('pending', 'approved', 'rejected', 'delisted') DEFAULT 'pending',
    approved_by_admin_id UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    
    -- Metadata
    rating DECIMAL(3, 2) DEFAULT 0.0,
    rating_count INT DEFAULT 0,
    total_sold INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

CREATE INDEX idx_products_farmer_id ON products(farmer_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_region ON products(region);
```

### 5. Orders Table
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    
    -- Order Details
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    
    -- Payment Info (Escrow Model)
    payment_status ENUM('pending', 'received', 'released', 'refunded') DEFAULT 'pending',
    paid_at TIMESTAMP,
    payment_method VARCHAR(100), -- Mobile Money, Bank Transfer
    admin_transaction_id VARCHAR(255),
    
    -- Delivery Info
    delivery_person_id UUID REFERENCES users(id),
    delivery_address VARCHAR(500),
    delivery_region VARCHAR(100),
    estimated_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_farmer_id ON orders(farmer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
```

### 6. Order Items Table
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    price_per_unit DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
```

### 7. Transactions Table (Financial)
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type ENUM('deposit', 'withdrawal', 'refund', 'payout', 'commission') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'on_hold') DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GHS',
    description TEXT,
    payment_method VARCHAR(100),
    
    -- Related Records
    order_id UUID REFERENCES orders(id),
    farmer_id UUID REFERENCES farmers(id),
    payout_id UUID REFERENCES farmer_payouts(id),
    initiated_by_user_id UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_farmer_id ON transactions(farmer_id);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);
```

### 8. Farmer Payouts Table
```sql
CREATE TABLE farmer_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Payout Details
    total_amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 5.00, -- Platform commission percentage
    commission_amount DECIMAL(10, 2) NOT NULL, -- Calculated: total * (commission_rate / 100)
    net_amount DECIMAL(10, 2) NOT NULL, -- total - commission
    
    -- Holding Period (Escrow)
    holding_period_days INT DEFAULT 7,
    requested_at TIMESTAMP NOT NULL,
    release_date TIMESTAMP NOT NULL, -- requested_at + holding_period_days
    
    -- Payment Method
    payment_method VARCHAR(100),
    account_number VARCHAR(100),
    account_name VARCHAR(255),
    
    -- Status Workflow
    status ENUM('pending_approval', 'approved', 'processing', 'completed', 'failed') DEFAULT 'pending_approval',
    approved_at TIMESTAMP,
    approved_by_admin_id UUID REFERENCES users(id),
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Additional Info
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_farmer_payouts_farmer_id ON farmer_payouts(farmer_id);
CREATE INDEX idx_farmer_payouts_status ON farmer_payouts(status);
CREATE INDEX idx_farmer_payouts_release_date ON farmer_payouts(release_date);
```

### 9. Disputes & Refunds Table
```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    buyer_id UUID NOT NULL REFERENCES users(id),
    farmer_id UUID NOT NULL REFERENCES farmers(id),
    
    -- Dispute Details
    reason VARCHAR(500) NOT NULL,
    description TEXT,
    evidence_urls JSONB, -- Array of image/document URLs
    
    -- Status
    status ENUM('open', 'investigating', 'resolved', 'refunded') DEFAULT 'open',
    amount DECIMAL(10, 2) NOT NULL,
    
    -- Resolution
    investigated_by_admin_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    should_refund BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
```

### 10. Delivery Personnel Table
```sql
CREATE TABLE delivery_personnel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Vehicle Info
    vehicle_type VARCHAR(100), -- Motorcycle, Tricycle, Car, Van
    license_plate VARCHAR(50),
    
    -- Service Area
    region VARCHAR(100),
    
    -- Performance
    total_deliveries INT DEFAULT 0,
    successful_deliveries INT DEFAULT 0,
    failed_deliveries INT DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    
    -- Status
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_delivery_personnel_user_id ON delivery_personnel(user_id);
CREATE INDEX idx_delivery_personnel_region ON delivery_personnel(region);
```

### 11. Warehouse Table
```sql
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    
    -- Capacity Management
    capacity INT NOT NULL, -- units
    current_stock INT DEFAULT 0,
    
    -- Contact
    contact_person_name VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(255),
    
    -- Staff
    staff_count INT DEFAULT 0,
    
    -- Status
    status ENUM('operational', 'maintenance', 'closed') DEFAULT 'operational',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warehouses_region ON warehouses(region);
CREATE INDEX idx_warehouses_status ON warehouses(status);
```

### 12. Audit Logs Table
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

---

## Authentication & Authorization

### 1. Authentication Flow

#### Sign Up (Farmer)
```
POST /api/auth/register
{
    "email": "farmer@example.com",
    "password": "hashedPassword",
    "first_name": "Kofi",
    "last_name": "Mensah",
    "phone_number": "0501234567",
    "user_type": "farmer"
}

Response:
{
    "user_id": "uuid",
    "email": "farmer@example.com",
    "user_type": "farmer",
    "verification_status": "unverified",
    "message": "Account created. Proceed to farmer verification."
}
```

#### Sign Up (Buyer)
```
POST /api/auth/register
{
    "email": "buyer@example.com",
    "password": "hashedPassword",
    "first_name": "Abena",
    "last_name": "Owusu",
    "phone_number": "0502345678",
    "user_type": "buyer"
}

Response:
{
    "user_id": "uuid",
    "email": "buyer@example.com",
    "user_type": "buyer",
    "access_token": "jwt_token",
    "refresh_token": "jwt_token"
}
```

#### Login
```
POST /api/auth/login
{
    "email": "farmer@example.com",
    "password": "password"
}

Response:
{
    "user_id": "uuid",
    "email": "farmer@example.com",
    "user_type": "farmer",
    "verification_status": "pending|approved|rejected",
    "access_token": "jwt_token",
    "refresh_token": "jwt_token",
    "requires_verification": true/false
}
```

### 2. JWT Token Structure
```
Header: {
    "alg": "HS256",
    "typ": "JWT"
}

Payload: {
    "user_id": "uuid",
    "email": "email@example.com",
    "user_type": "farmer|buyer|delivery|warehouse|staff|admin",
    "permissions": ["read:products", "create:products", ...],
    "iat": 1234567890,
    "exp": 1234571490
}

Signature: HMAC_SHA256(header + payload, secret_key)
```

### 3. Role-Based Permissions

#### Farmer
- Create/edit products (requires verification)
- View orders
- View earnings/payouts
- Request verification
- Manage profile

#### Buyer
- Browse products
- Place orders
- Track deliveries
- Leave reviews
- Manage addresses
- Manage favorites

#### Delivery
- View assigned deliveries
- Update delivery status
- Track earnings
- View routes

#### Warehouse
- View inventory
- Manage stock levels
- View dropoffs
- Track movements

#### Staff
- User management (assign roles)
- Audit logs
- Settings management

#### Admin
- All operations
- Farmer verification approval
- Product approvals
- Financial management (payouts, disputes)
- User management
- Warehouse/Delivery management

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login user
POST   /api/auth/refresh-token         - Refresh access token
POST   /api/auth/logout                - Logout user
POST   /api/auth/forgot-password       - Request password reset
POST   /api/auth/reset-password        - Reset password with token
GET    /api/auth/verify-email          - Verify email with OTP
```

### Farmer Management Endpoints

```
POST   /api/farmers/verify/initiate              - Start farmer verification
POST   /api/farmers/verify/step/:step            - Submit verification step
POST   /api/farmers/verify/otp/send              - Send OTP to phone
POST   /api/farmers/verify/otp/verify            - Verify OTP code
GET    /api/farmers/verify/status                - Get verification status
GET    /api/farmers/:farmer_id/verification      - Get full verification data

POST   /api/farmers/:farmer_id/documents         - Upload verification documents
GET    /api/farmers/:farmer_id/documents         - Get uploaded documents
```

### Product Management Endpoints

```
POST   /api/products                   - Create product (farmer only)
GET    /api/products                   - List all products (paginated)
GET    /api/products/:product_id       - Get product details
PUT    /api/products/:product_id       - Update product (farmer only)
DELETE /api/products/:product_id       - Delete product (farmer only)
GET    /api/products/farmer/:farmer_id - Get farmer's products

POST   /api/products/:product_id/review      - Add product review
GET    /api/products/:product_id/reviews     - Get product reviews
```

### Product Approval (Admin)

```
GET    /api/admin/products/pending            - Get pending products
POST   /api/admin/products/:product_id/approve - Approve product
POST   /api/admin/products/:product_id/reject  - Reject product
```

### Order Management Endpoints

```
POST   /api/orders                            - Create order
GET    /api/orders                            - Get user's orders (pagination)
GET    /api/orders/:order_id                  - Get order details
PUT    /api/orders/:order_id/status           - Update order status
GET    /api/orders/:order_id/tracking         - Get delivery tracking

POST   /api/orders/:order_id/cancel           - Cancel order (if eligible)
```

### Payment Endpoints

```
POST   /api/payments/initiate                 - Initiate payment (buyer pays admin)
POST   /api/payments/confirm                  - Confirm payment received
GET    /api/payments/status/:payment_id       - Get payment status

POST   /api/payments/dispute                  - Raise payment dispute
GET    /api/payments/transactions             - Get payment history
```

### Farmer Payout Endpoints

```
GET    /api/payouts                           - Get farmer's payout history
POST   /api/payouts/request                   - Request payout (farmer)
GET    /api/payouts/:payout_id/status         - Get payout status

# Admin Only
GET    /api/admin/payouts                     - Get all pending payouts
POST   /api/admin/payouts/:payout_id/approve  - Approve payout
POST   /api/admin/payouts/:payout_id/process  - Process payout
POST   /api/admin/payouts/:payout_id/complete - Mark payout complete
POST   /api/admin/payouts/:payout_id/reject   - Reject payout
```

### Financial Management Endpoints (Admin)

```
GET    /api/admin/financial/dashboard         - Get financial overview
GET    /api/admin/financial/transactions      - Get all transactions
GET    /api/admin/financial/revenue           - Get revenue analytics
GET    /api/admin/financial/commissions       - Get commission details

GET    /api/admin/disputes                    - Get all disputes
POST   /api/admin/disputes/:dispute_id/resolve - Resolve dispute
```

### Farmer Verification (Admin)

```
GET    /api/admin/verifications                    - Get all pending verifications
GET    /api/admin/verifications/:verification_id  - Get verification details
POST   /api/admin/verifications/:verification_id/approve - Approve farmer
POST   /api/admin/verifications/:verification_id/reject  - Reject farmer
```

### Delivery Management (Admin)

```
GET    /api/admin/delivery                    - Get all delivery personnel
POST   /api/admin/delivery                    - Add delivery person
PUT    /api/admin/delivery/:delivery_id       - Update delivery person
GET    /api/admin/delivery/:delivery_id/routes - Get delivery routes
POST   /api/admin/delivery/:delivery_id/suspend - Suspend delivery
```

### Warehouse Management (Admin)

```
GET    /api/admin/warehouses                  - Get all warehouses
POST   /api/admin/warehouses                  - Add warehouse
PUT    /api/admin/warehouses/:warehouse_id    - Update warehouse
GET    /api/admin/warehouses/:warehouse_id/inventory - Get inventory
```

### User Management (Admin)

```
GET    /api/admin/users                       - Get all users
GET    /api/admin/users/:user_id              - Get user details
PUT    /api/admin/users/:user_id              - Update user
DELETE /api/admin/users/:user_id              - Delete user
POST   /api/admin/users/:user_id/roles        - Assign role to user
```

### Audit Logs (Admin)

```
GET    /api/admin/audit-logs                  - Get audit logs
GET    /api/admin/audit-logs/:user_id         - Get user's actions
```

---

## Payment & Financial Flow

### Escrow Model (5% Commission)

```
Buyer Places Order:
1. Order created with status: "pending"
2. Payment request sent to buyer
3. Buyer pays ₵100 to admin (escrow)

Order Confirmed (by farmer):
1. Order status: "confirmed"
2. Payment status: "received"
3. Fund held in admin account

Order Delivered:
1. Order status: "delivered"
2. Payment status: "released"
3. Admin sends to farmer: ₵95 (100 - 5% commission)
4. Transaction created for ₵5 commission

Farmer Requests Payout:
1. Farmer initiates payout request
2. Payout created with status: "pending_approval"
3. 7-day holding period starts (security measure)
4. After 7 days, available for admin approval

Admin Approves Payout:
1. Admin reviews payout request
2. Payout status: "approved"

Admin Processes Payout:
1. Admin initiates payment to farmer's account
2. Payout status: "processing"
3. Transaction record created for payout

Payout Completed:
1. Money transferred to farmer's mobile money/bank
2. Payout status: "completed"
3. Farmer notification sent
```

### Transaction Types

```
1. DEPOSIT
   - Buyer makes payment to platform
   - Status: pending -> completed
   
2. WITHDRAWAL
   - Farmer requests payout
   - Status: pending -> completed
   
3. REFUND
   - Dispute resolution with refund
   - Status: pending -> completed
   
4. PAYOUT
   - Admin processes farmer payout
   - Status: pending -> completed
   
5. COMMISSION
   - Platform takes 5% fee
   - Status: auto-completed
```

### Payment Flow API Calls

```
1. Buyer initiates payment:
   POST /api/payments/initiate
   {
       "order_id": "uuid",
       "amount": 100,
       "payment_method": "mobile_money",
       "phone_number": "0501234567"
   }

2. Payment gateway processes (external: Stripe, Flutterwave, etc.)

3. Confirm payment:
   POST /api/payments/confirm
   {
       "transaction_id": "external_txn_id",
       "order_id": "uuid",
       "amount": 100,
       "status": "success"
   }

4. Order confirmed and payment marked as "received"

5. After delivery, payment "released" to farmer

6. Farmer requests payout:
   POST /api/payouts/request
   {
       "amount": 1500,
       "payment_method": "mobile_money",
       "account_number": "0501234567"
   }

7. Admin approves:
   POST /api/admin/payouts/:payout_id/approve
   {}

8. Admin processes (after 7 days):
   POST /api/admin/payouts/:payout_id/process
   {}

9. Payment processed and marked complete
```

---

## Farmer Verification Process

### Level 1: Automated Verification (Instant)

**Step 1: Personal Information**
- Validate: Full name, Phone number, Email, DOB
- Check: All fields required
- Output: Store in farmer_verifications table

**Step 2: ID Format Validation**
- Validate Ghana Card: `GHA-XXXXXXX-X` format
- Check: Format regex matching
- Database: Update `id_format_valid` = true

**Step 3: OTP Verification**
- Generate 6-digit OTP
- Send via SMS to phone_number
- Validate user enters correct OTP
- Database: Update `otp_verified` = true, `otp_verified_at` = now()

**Step 4: Mobile Money Name Matching**
- Extract name parts from full_name
- Check if mobile_money_name contains any name part
- Database: Update `mobile_money_name_matched` = true/false
- If no match: Flag for manual review

**Result: Status = BASIC_VERIFIED (Level 1 Complete)**

```sql
UPDATE farmer_verifications 
SET status = 'pending'
WHERE id = ?
AND id_format_valid = true
AND otp_verified = true
AND mobile_money_name_matched = true
```

### Level 2: Manual Verification (24-72 hours)

**Admin Reviews:**
1. Identity verification (ID photo vs actual photo match)
2. Farm authenticity (check farm photos)
3. GPS location verification (verify location is rural/agricultural)
4. Business documents (if provided)
5. Overall credibility assessment

**Admin Actions:**
- APPROVE: Sets status = 'approved', approved_at = now()
- REJECT: Sets status = 'rejected', rejection_reason = 'reason'

**Result: Status = VERIFIED_FARMER (Level 2 Complete)**

```sql
UPDATE farmer_verifications 
SET 
    status = 'approved',
    approved_at = now(),
    reviewed_by_admin_id = ?,
    manual_verification_completed_at = now()
WHERE id = ?
```

### Level 3: Advanced Verification (Optional)

**Features:**
- Virtual video inspection
- Community verification (local leader confirmation)
- Supply reliability assessment
- Bulk supplier certification

```sql
-- Not required in MVP, but structure for future
CREATE TABLE advanced_verifications (
    id UUID PRIMARY KEY,
    farmer_verification_id UUID REFERENCES farmer_verifications(id),
    verification_type ENUM('video_call', 'community_verification', 'supply_assessment'),
    status ENUM('pending', 'completed', 'failed'),
    verified_by_id UUID REFERENCES users(id),
    notes TEXT,
    completed_at TIMESTAMP
)
```

### Verification API Flow

```
1. Farmer registers -> User created with verification_status = 'unverified'

2. Farmer starts verification:
   POST /api/farmers/verify/initiate
   Response: verification_id, current_step = 0

3. Farmer submits Step 0 (Personal Info):
   POST /api/farmers/verify/step/0
   {
       "full_name": "...",
       "phone_number": "...",
       "date_of_birth": "...",
       "national_id_number": "GHA-1234567-8",
       "national_id_type": "ghana_card"
   }
   
   Backend validates and stores data
   Response: success, proceed to step 1

4. Farmer sends OTP:
   POST /api/farmers/verify/otp/send
   Backend: Generate OTP -> Send SMS
   Response: OTP sent to 0501234567

5. Farmer verifies OTP:
   POST /api/farmers/verify/otp/verify
   {
       "otp_code": "123456"
   }
   Backend: Validate OTP
   Response: OTP verified OR Invalid OTP

6. ... Steps 1-5 for all form data ...

7. Farmer submits verification:
   POST /api/farmers/verify/submit
   Backend:
   - Run Level 1 automated checks
   - Update farmer_verifications.status = 'pending'
   - Create audit log
   - Send notification to admin
   
8. Admin reviews verification:
   GET /api/admin/verifications/pending
   
9. Admin approves/rejects:
   POST /api/admin/verifications/:id/approve
   Backend:
   - Update farmer_verifications.status = 'approved'
   - Update users.verification_status = 'approved'
   - Notify farmer
   - Farmer can now list products

10. Farmer accesses dashboard:
    - If status = 'approved': Full access
    - If status = 'pending': Limited access (can't list products)
    - If status = 'rejected': Must re-verify
```

---

## Business Logic

### 1. Product Approval Workflow

```
Farmer Creates Product:
1. POST /api/products -> status = 'pending'
2. Product not visible to buyers

Admin Reviews:
1. GET /api/admin/products/pending
2. Check product details, images, prices
3. POST /api/admin/products/:id/approve
   - status = 'approved'
   - approved_at = now()
   - approved_by_admin_id = admin_id
   - Product visible to buyers

OR

3. POST /api/admin/products/:id/reject
   - status = 'rejected'
   - rejection_reason = 'reason'
   - Notify farmer
   - Farmer can edit and resubmit
```

### 2. Order Fulfillment Workflow

```
1. Buyer places order (creates Order + OrderItems)
   - status: pending
   - payment_status: pending

2. Buyer pays (Payment Processing)
   - POST /api/payments/initiate
   - Payment processor (Stripe/Flutterwave)
   - Payment confirmed -> payment_status: received

3. Farmer confirms order
   - Farmer receives notification
   - Farmer confirms or declines
   - If confirmed: order status: confirmed

4. Admin assigns delivery
   - SELECT delivery_personnel in same region
   - Assign delivery_person_id
   - Create delivery tracking record

5. Delivery person picks up from farmer
   - Update delivery status: picked_up

6. Delivery person delivers to buyer
   - Update delivery status: delivered
   - actual_delivery_date = now()
   - order status: delivered
   - payment_status: released
   - Funds released to farmer (minus commission)

7. Buyer receives product
   - Can leave review
   - Can dispute if issues
```

### 3. Dispute Resolution Workflow

```
Buyer Opens Dispute:
1. POST /api/disputes
   {
       "order_id": "uuid",
       "reason": "product_quality",
       "description": "...",
       "evidence_urls": [...]
   }
   - status: open

Admin Reviews:
1. GET /api/admin/disputes
2. Investigate evidence
3. POST /api/admin/disputes/:id/resolve
   {
       "resolution_notes": "...",
       "should_refund": true/false
   }

If Refund = True:
- Create refund transaction
- Order payment_status: refunded
- Funds returned to buyer
- Commission also reversed

If Refund = False:
- Dispute closed without refund
- Buyer keeps product (or returns at own cost)
```

### 4. Commission Calculation

```
Sale Amount: ₵100
Platform Commission: 5%
Commission Amount: ₵5
Farmer Net: ₵95

Calculation Logic:
commission = total_amount * (commission_rate / 100)
net_amount = total_amount - commission

Database Records:
1. Transaction: type='deposit', amount=100, status='received'
2. Payout: total_amount=100, commission=5, net_amount=95
3. Transaction: type='commission', amount=5
```

### 5. Holding Period Logic

```
When Payout Requested:
holding_period_days = 7
requested_at = now()
release_date = requested_at + (7 * 24 * 60 * 60) seconds

Example:
requested_at = 2024-01-15 10:00:00
release_date = 2024-01-22 10:00:00

Admin can only process after release_date:
if (current_time >= release_date):
    can_approve = true
else:
    can_approve = false
    days_remaining = (release_date - current_time) / 86400
```

---

## Error Handling

### HTTP Status Codes

```
200 OK              - Successful request
201 Created         - Resource created successfully
204 No Content      - Successful deletion
400 Bad Request     - Invalid input/parameters
401 Unauthorized    - Missing/invalid authentication
403 Forbidden       - Insufficient permissions
404 Not Found       - Resource not found
409 Conflict        - Duplicate resource/invalid state
422 Unprocessable   - Validation failed
429 Too Many        - Rate limit exceeded
500 Server Error    - Internal error
503 Service Unavailable - Maintenance/overload
```

### Standard Error Response

```json
{
    "success": false,
    "error": {
        "code": "INVALID_EMAIL",
        "message": "Email format is invalid",
        "details": {
            "field": "email",
            "value": "invalid-email"
        }
    }
}
```

### Validation Rules

```
Email:
- Required, must be valid format
- Unique across users table
- Regex: ^[^\s@]+@[^\s@]+\.[^\s@]+$

Password:
- Min 8 characters
- Must contain uppercase, lowercase, number
- Regex: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$

Phone Number:
- Valid Ghana number format
- Regex: ^0\d{9}$

Ghana Card:
- Format: GHA-XXXXXXX-X
- Regex: ^GHA-\d{7}-\d$

Order Quantity:
- Must be > 0
- Must be <= product.quantity_available

Product Price:
- Must be > 0
- Must be decimal(10,2)
```

---

## Deployment & Infrastructure

### Technology Stack Recommendations

**Backend Framework:**
- Node.js + Express.js (JavaScript/TypeScript)
- OR Python + FastAPI/Django

**Database:**
- PostgreSQL (relational, excellent for e-commerce)
- Redis (caching, session management)
- ElasticSearch (product search - optional)

**Payment Processing:**
- Stripe (international)
- Flutterwave (Africa-focused)
- PayU (Africa-focused)
- Custom Mobile Money integration (MTN, Vodafone, AirtelTigo)

**File Storage:**
- AWS S3 or
- Google Cloud Storage or
- Digital Ocean Spaces

**API Documentation:**
- Swagger/OpenAPI 3.0

**Authentication:**
- JWT tokens
- OAuth 2.0 (optional for social login)

**Email Service:**
- SendGrid or
- AWS SES or
- Mailgun

**SMS Service:**
- Twilio or
- AWS SNS or
- Africa's Talking (for Ghana)

### Environment Variables

```
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=farmconnect
DB_USER=farmconnect_user
DB_PASSWORD=secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# OTP
OTP_LENGTH=6
OTP_EXPIRES_IN=600 (seconds)

# Commission
PLATFORM_COMMISSION_RATE=5

# Holding Period
PAYOUT_HOLDING_PERIOD_DAYS=7

# Payment Gateway
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...

# File Storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=farmconnect-uploads
AWS_REGION=us-east-1

# Email
SENDGRID_API_KEY=...
SENDER_EMAIL=noreply@farmconnect.com

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# App
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://farmconnect.com
LOG_LEVEL=info
```

### Docker Setup

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Database Migrations

Use a migration tool:
- Knex.js
- Sequelize
- TypeORM
- Alembic (Python)

Example migration:
```javascript
exports.up = function(knex) {
    return knex.schema.createTable('farmers', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users');
        table.string('farm_name').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('farmers');
};
```

### Rate Limiting

```
- Login: 5 attempts per 15 minutes
- API calls: 100 requests per hour per user
- Password reset: 3 attempts per hour
- OTP verification: 5 attempts per hour
```

### Caching Strategy

```
Cache Keys:
- products:list:page:{page} -> 1 hour
- products:{id} -> 2 hours
- farmer:{id}:profile -> 1 hour
- user:{id}:permissions -> 30 minutes

Invalidate on:
- Product created/updated/deleted
- User profile updated
- Permission changed
```

### Monitoring & Logging

```
Logs to capture:
- All API requests (method, path, status, response time)
- Authentication attempts (success/failure)
- Payment transactions
- Database errors
- Unhandled exceptions

Tools:
- Winston (Node.js)
- Sentry (Error tracking)
- DataDog (Monitoring)
- ELK Stack (Log aggregation)
```

### Security Measures

```
1. HTTPS/TLS for all communications
2. SQL injection protection: Use parameterized queries
3. CSRF protection: CSRF tokens for state-changing requests
4. XSS protection: Sanitize user inputs
5. Rate limiting: Prevent brute force attacks
6. Password hashing: bcrypt with salt rounds = 10
7. Secrets management: Environment variables, no hardcoding
8. CORS: Whitelist only trusted origins
9. Input validation: Validate all user inputs
10. API versioning: /api/v1/, /api/v2/, etc.
```

---

## Summary

This specification covers:
✅ Complete database schema (12 tables)
✅ Authentication & authorization system
✅ 50+ API endpoints
✅ Payment flow & escrow model
✅ 3-level farmer verification process
✅ Business logic for all workflows
✅ Error handling & validation
✅ Deployment & infrastructure recommendations

Use this document to build your backend API. Each endpoint should follow REST conventions and return structured JSON responses.

For questions or clarifications, refer back to the specific section.

Good luck with your FarmConnect backend! 🚀
