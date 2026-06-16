# Implementation Plan — Order Management System (OMS) Prototype Website

**Project:** He & She Coffee — Order Management System  
**Agency:** BIC21003 SAD  
**Version:** 1.0  
**Date:** 15 June 2026  
**Prepared by:** Development Team  

---

## 1. Overview

This document outlines the implementation plan for building a prototype website for the **Order Management System (OMS)** for He & She Coffee. The prototype is based on requirements gathered from stakeholder interviews (conducted 27 April 2026 with Puan Emilia binti Roslan, Supervisor of He & She) and formalised in the System Requirements Specification (SRS).

The prototype will demonstrate the core ordering workflow — from menu browsing to order tracking — and allow stakeholders to validate the system design before full development begins.

---

## 2. Goals of the Prototype

- Demonstrate the end-to-end customer ordering flow
- Validate the UI with café staff and the supervisor
- Confirm data model assumptions (USER, MENU, ORDER, PAYMENT entities)
- Address open items raised in the interview:
  - High-traffic handling (peak period simulation)
  - Offline/WiFi fallback behaviour (graceful degradation)
  - Kitchen slip format with total quantity count (e.g., "Latte ×1, Matcha Latte ×3")

---

## 3. Technology Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | HTML5 / CSS3 / JavaScript (Vanilla or React) | Lightweight, fast to prototype |
| Styling | Tailwind CSS | Utility-first, responsive by default |
| Backend (Mock) | JSON Server or Firebase | Simulates REST API without a real server |
| Database (Mock) | Local JSON files / Firestore | Matches ERD entities in SRS |
| Payment (Mock) | Simulated FPX / E-wallet flow | No real gateway in prototype |
| Hosting | Netlify / Vercel | Free, fast deployment |

---

## 4. System Actors & Pages

Based on Section 1.3 of the SRS, the prototype must support four actors. Each maps to a distinct portal or page set.

### 4.1 Customer Portal

| Page | Description |
|---|---|
| `/register` | Customer registration form (name, email, phone, password) |
| `/login` | Login screen — authenticates against USER entity |
| `/menu` | Browse menu with real-time availability indicator (Available / Unavailable) |
| `/cart` | Add to cart, update quantity, remove items, view running total |
| `/checkout` | Order summary + payment method selection (FPX / E-wallet) |
| `/payment` | Mock payment confirmation screen |
| `/orders` | Order history list |
| `/track/:order_id` | Real-time order status tracker (Pending → Confirmed → Preparing → Ready → Completed) |

### 4.2 Café Staff Portal

| Page | Description |
|---|---|
| `/staff/login` | Staff login (staff_id + password, role = Staff) |
| `/staff/orders` | View incoming order queue — sorted by time, filtered by status='pending' |
| `/staff/orders/:order_id` | Order detail view + status update buttons (Confirm / Preparing / Ready) |
| `/staff/kitchen-slip` | Printable kitchen slip showing order items with **total quantity count** per item |

### 4.3 Admin Portal

| Page | Description |
|---|---|
| `/admin/login` | Admin login (admin_id + password, role = Admin) |
| `/admin/menu` | CRUD for menu items (name, price, category, availability toggle) |
| `/admin/users` | View and manage user accounts |
| `/admin/promotions` | Create / edit / delete promotions |
| `/admin/reports` | Generate sales reports filtered by date range and report type |

### 4.4 Payment Gateway (Simulated)

The prototype will mock the FPX/E-wallet flow:
1. Customer selects payment method on `/checkout`
2. System generates a mock `payment_request` with `order_id` and `amount`
3. A simulated gateway response returns `transaction_id` and `status='success'`
4. Payment record is saved to DS-04 (PAYMENT data store)
5. ORDER status updates to `payment_status = Paid`

---

## 5. Data Model (ERD Implementation)

Based on Section 4.2 and 4.3 of the SRS, the following entities will be implemented as JSON/database collections.

### 5.1 USER
```json
{
  "user_id": 1001,
  "name": "Ahmad bin Ali",
  "email": "ahmad@email.com",
  "password": "<hashed>",
  "role": "Customer",
  "phone": "0123456789",
  "registration_date": "2026-06-15T09:00:00"
}
```
Roles: `Customer` | `Staff` | `Admin`

### 5.2 MENU
```json
{
  "item_id": "ITM001",
  "item_name": "Matcha Latte",
  "category": "Drink",
  "price": 12.00,
  "availability": true,
  "description": "Premium matcha with steamed milk"
}
```
Categories: `Drink` | `Food` | `Dessert`

### 5.3 ORDER
```json
{
  "order_id": 20260001,
  "customer_id": 1001,
  "order_date": "2026-06-15",
  "total_amount": 36.00,
  "order_status": "Pending",
  "payment_status": "Unpaid"
}
```
Order statuses: `Pending` → `Confirmed` → `Preparing` → `Ready` → `Completed`

### 5.4 ORDER_ITEM (Junction table)
```json
{
  "order_id": 20260001,
  "item_id": "ITM001",
  "quantity": 3,
  "subtotal": 36.00
}
```

### 5.5 PAYMENT
```json
{
  "payment_id": 50001,
  "order_id": 20260001,
  "amount": 36.00,
  "method": "FPX",
  "transaction_id": "TXN-ABC123",
  "payment_date": "2026-06-15T09:15:00"
}
```

### 5.6 USER_ROLE
```json
{
  "role_id": 1,
  "role_name": "Customer"
}
```
Seed data: `1 = Customer`, `2 = Staff`, `3 = Admin`

---

## 6. Module Implementation Plan

Based on the System Functional Hierarchy (Figure 1, SRS Section 2.2), implementation is divided into five modules.

### Module 1 — User Management (SF-OM-UM)

| Function ID | Feature | Implementation Notes |
|---|---|---|
| SF-OM-UM-01 | Customer Registration | POST `/api/users` — validate email uniqueness, hash password |
| SF-OM-UM-02 | Login | POST `/api/auth/login` — return JWT token, store role in session |
| SF-OM-UM-03 | Profile Management | GET/PUT `/api/users/:id` — allow name, phone, password update |

### Module 2 — Order Management (SF-OM-OM)

| Function ID | Feature | Implementation Notes |
|---|---|---|
| SF-OM-OM-01 | Browse Menu | GET `/api/menu` — filter by category, show availability badge |
| SF-OM-OM-02 | Add to Cart | Client-side session cart (SESSION CART data store) |
| SF-OM-OM-03 | Submit Order | POST `/api/orders` — save order + order_items, set status = Pending |
| SF-OM-OM-04 | Track Order Status | GET `/api/orders/:id` — poll every 10 seconds or use WebSocket |

### Module 3 — Payment Processing (SF-OM-PA)

| Function ID | Feature | Implementation Notes |
|---|---|---|
| SF-OM-PA-01 | Online Payment | Display FPX / E-wallet options from PAYMENT data store |
| SF-OM-PA-02 | Payment Confirmation | POST to mock gateway → save PAYMENT record → update ORDER |

### Module 4 — Staff Order Management (SF-OM-SM)

| Function ID | Feature | Implementation Notes |
|---|---|---|
| SF-OM-SM-01 | View Orders | GET `/api/orders?status=pending` — real-time refresh |
| SF-OM-SM-02 | Update Order Status | PUT `/api/orders/:id/status` — restricted to Staff role |

**Kitchen Slip Format** (addresses interview open item):
```
ORDER #20260001 — 15 Jun 2026, 09:15 AM
────────────────────────────────
  Latte          × 1
  Matcha Latte   × 3
────────────────────────────────
  TOTAL ITEMS: 4
  TOTAL AMOUNT: RM 48.00
```

### Module 5 — Admin Management (SF-OM-AM)

| Function ID | Feature | Implementation Notes |
|---|---|---|
| SF-OM-AM-01 | Manage Menu | CRUD `/api/menu` — toggle availability, update price/category |
| SF-OM-AM-02 | Manage Users | GET/PUT/DELETE `/api/users` — view all roles |
| SF-OM-AM-03 | Manage Promotions | CRUD `/api/promotions` — apply discount to order total |
| SF-OM-AM-04 | Generate Reports | GET `/api/reports?type=sales&from=2026-06-01&to=2026-06-15` |

---

## 7. API Endpoint Summary

| Method | Endpoint | Actor | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Customer | Create new user account |
| POST | `/api/auth/login` | All | Authenticate and get token |
| GET | `/api/menu` | Customer, Staff | List all menu items |
| PUT | `/api/menu/:id` | Admin | Update menu item |
| POST | `/api/orders` | Customer | Place new order |
| GET | `/api/orders` | Staff, Admin | List all orders |
| GET | `/api/orders/:id` | Customer, Staff | Get single order |
| PUT | `/api/orders/:id/status` | Staff | Update order status |
| POST | `/api/payments` | Customer | Initiate payment |
| GET | `/api/reports` | Admin | Generate reports |

---

## 8. Non-Functional Requirements Implementation

Based on Section 5.0 of the SRS (Table 13):

| ID | Requirement | Prototype Implementation |
|---|---|---|
| NF-AS-01 | Interoperability (web + mobile) | Responsive design using Tailwind CSS; tested on Chrome (desktop) and mobile viewport |
| NF-AS-02 | Modularity | Each module in a separate folder/component; shared API service layer |
| NF-AS-03 | Accountability | Route guards per role; admin-only routes protected by middleware |
| NF-AS-04 | Scalability | Prototype uses pagination on order list; architecture is stateless for future scaling |
| NF-AS-05 | Transaction Response Time ≤ 5s | Mock API responses under 500ms; loading spinners on all async actions |
| NF-AO-01 | Expandability | Menu categories and payment methods loaded from config, not hardcoded |
| NF-AL-01 | PCI-DSS Compliance | Prototype uses HTTPS (Netlify); passwords hashed with bcrypt; no real card data stored |

---

## 9. Proposed Improvements (from Interview)

The following improvements raised in the 27 April 2026 interview are addressed in the prototype:

| Improvement | Implementation |
|---|---|
| **Mobile Application/Web System** | Responsive web prototype accessible on smartphone browsers |
| **Quantity Tracking on Kitchen Slips** | Kitchen slip view aggregates ORDER_ITEM quantities and shows total count per item and grand total |
| **Menu Availability (real-time)** | Menu page polls `/api/menu` every 30 seconds; unavailable items are greyed out with an "Out of Stock" badge |

### Open Items to Validate with Stakeholder

| Open Item | Prototype Approach |
|---|---|
| Technical specs for peak traffic | Prototype load-tested with 50 concurrent mock users; document bottlenecks for handoff |
| Offline POS capability during WiFi outages | Show graceful error banner; cache last-known menu in localStorage for read-only browsing |
| Standardised kitchen slip format | Staff portal includes a "Print Slip" button with the agreed format (see Section 6, Module 4) |

---

## 10. Folder Structure

```
/oms-prototype
│
├── /public
│   └── index.html
│
├── /src
│   ├── /assets           # logos, icons, images
│   ├── /components       # shared UI components (Navbar, Button, Badge)
│   ├── /pages
│   │   ├── /customer     # Menu, Cart, Checkout, Track, Orders
│   │   ├── /staff        # Staff login, Order Queue, Kitchen Slip
│   │   └── /admin        # Menu CRUD, User Mgmt, Reports
│   ├── /services         # API calls (menu.js, orders.js, payment.js)
│   ├── /store            # Cart state management
│   └── /utils            # Auth helpers, formatters
│
├── /mock-api
│   ├── db.json           # Mock database (users, menu, orders, payments)
│   └── routes.json       # JSON Server route config
│
├── README.md
└── implementation.md     # This document
```

---

## 11. Implementation Phases

### Phase 1 — Core Setup (Week 1)
- Project scaffold, routing, mock API setup
- USER entity: registration, login, role-based access

### Phase 2 — Customer Flow (Week 2)
- Menu browsing, cart, order submission
- Mock payment flow

### Phase 3 — Staff & Admin Portals (Week 3)
- Order queue, status updates, kitchen slip
- Admin: menu management, user management

### Phase 4 — Reporting & Polish (Week 4)
- Sales report generation
- Responsive UI polish
- Stakeholder review and feedback session

---

## 12. Sign-Off

This implementation plan will be reviewed by the project team before development begins. Stakeholder review of the prototype is expected by end of Phase 4.

| Role | Name | Date |
|---|---|---|
| Project Leader | Muhammad Faris Ikhwan bin Ishak | |
| Supervisor (He & She) | Ms. Emilia Binti Roslan | |
| Approval Committee | Dr. Norfaradilla Binti Wahid | |
