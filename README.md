# SolviX — Support Ticket Management System

SolviX is a modern, enterprise-grade Support Ticket Management System designed to streamline customer support operations, ticket lifecycle workflows, team management, and live collaboration. Built with **NestJS**, **React 19**, **MongoDB (Mongoose)**, and **Socket.IO**, SolviX provides strict role-based access control, deadline and overdue monitoring, soft-delete audit trails, and real-time ticket discussions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [Architecture & Responsibilities](#4-architecture--responsibilities)
5. [Project Directory Structure](#5-project-directory-structure)
6. [Authentication and Role-Based Access](#6-authentication-and-role-based-access)
7. [Ticket Lifecycle, Assignment, & Real-Time Collaboration](#7-ticket-lifecycle-assignment--real-time-collaboration)
8. [Search, Backend Filtering, Pagination, & Debouncing](#8-search-backend-filtering-pagination--debouncing)
9. [Dashboard, User Management, & Deleted Tickets](#9-dashboard-user-management--deleted-tickets)
10. [Installation and Local Setup](#10-installation-and-local-setup)
11. [Environment Variables](#11-environment-variables)
12. [How to Run Frontend and Backend](#12-how-to-run-frontend-and-backend)
13. [Available npm Scripts](#13-available-npm-scripts)
14. [API Overview with Actual Endpoints](#14-api-overview-with-actual-endpoints)
15. [Current Implementation Limitations](#15-current-implementation-limitations)

---

## 1. Project Overview

SolviX empowers support organizations to manage internal service requests and customer inquiries with clarity and efficiency.
- **Support Agents** work from an automatically scoped queue containing only their assigned tickets, update lifecycle progression, review due dates, and engage in live comment discussions.
- **Administrators** maintain organization-wide governance: creating and reassigning tickets, soft-deleting obsolete issues with audit reasons, reviewing deleted history, analyzing operational KPI charts, and managing agent team accounts.

---

## 2. Key Features

- **Strict Role-Based Access Control (RBAC):** Centralized permission matrix enforcing granular route guards on both frontend and backend.
- **Ticket Lifecycle Management:** Full state machine (`OPEN` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` &rarr; `CLOSED`) and priority categorization (`LOW`, `MEDIUM`, `HIGH`).
- **Deadline & Overdue Monitoring:** Ticket due dates validated to prevent past assignment, with dynamic badges for Overdue, Due Today, and Due Soon (&le; 48 hours).
- **Real-Time Comment Collaboration:** WebSocket rooms via Socket.IO with handshake JWT authentication, broadcasting new messages instantaneously and evicting unauthorized sockets upon reassignment or deletion.
- **Soft Deletion with Audit History:** Non-destructive ticket deletion with mandatory reason logging, timestamping, and deleter tracking.
- **Server-Side Search, Filter, & Pagination:** Fast MongoDB queries supporting text search, status/priority filtering, and pagination.
- **Debounced Input with Race-Condition Protection:** Reusable `useDebounce` hook (350 ms) paired with request-ID sequence counters to discard out-of-order stale network responses.
- **Analytics Dashboard:** Real-time KPI summary counters and interactive Recharts visualizations (ticket priority bar chart and status donut chart).
- **Concurrency-Protected Admin Governance:** In-memory mutex serialization preventing accidental deletion or demotion of the system's last remaining Administrator.
- **Profile Management:** Self-service profile updates with avatar initials and password changes.

---

## 3. Technology Stack

### Backend
- **Framework:** [NestJS 11](https://nestjs.com/) (Node.js framework with TypeScript)
- **Language & Runtime:** Node.js (v18+ or v20+ LTS recommended), TypeScript 5.7
- **Database ODM:** [Mongoose 9](https://mongoosejs.com/) with `@nestjs/mongoose`
- **Database Engine:** [MongoDB](https://www.mongodb.com/) (v6.0+)
- **Authentication & Security:** [Passport.js](http://www.passportjs.org/), `@nestjs/jwt`, `passport-jwt`, [bcrypt](https://github.com/kelektiv/node.bcrypt.js) (10 salt rounds)
- **Real-Time WebSockets:** [Socket.IO 4.8](https://socket.io/) via `@nestjs/websockets` and `@nestjs/platform-socket.io`
- **Validation & Transformation:** `class-validator` 0.15, `class-transformer` 0.5
- **Configuration & Utilities:** `@nestjs/config`, RxJS 7.8

### Frontend
- **Framework & Tooling:** [React 19.2](https://react.dev/), [Vite 8.3](https://vitejs.dev/)
- **Language:** TypeScript 6.0
- **UI Components:** [Ant Design 6.6 (`antd`)](https://ant.design/) and `@ant-design/icons`
- **Styling:** [Tailwind CSS 4.3](https://tailwindcss.com/) via `@tailwindcss/vite`
- **State Management:** [Redux Toolkit (RTK) 2.13](https://redux-toolkit.js.org/) and `react-redux`
- **Routing:** [React Router 7.18](https://reactrouter.com/)
- **Forms & Validation:** [Formik 2.4](https://formik.org/) with [Yup 1.7](https://github.com/jquense/yup)
- **HTTP Client:** [Axios 1.20](https://axios-http.com/) with centralized request/response interceptors
- **Data Visualization:** [Recharts 3.10](https://recharts.org/)
- **WebSocket Client:** `socket.io-client` 4.8

---

## 4. Architecture & Responsibilities

SolviX separates concerns between a reactive client-side Single Page Application (SPA) and a modular, stateless REST/WebSocket API server.

```text
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│   React 19 SPA + Redux Toolkit + React Router 7 + Ant Design │
└───────────────┬─────────────────────────────▲───────────────┘
                │ HTTP Requests (Bearer JWT)   │ WebSockets (Socket.IO)
                │ via Axios Interceptors       │ ticket:join / comment:created
                ▼                             │
┌─────────────────────────────────────────────┴───────────────┐
│                     NestJS Backend Server                   │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │   AuthModule   │  │   TicketsModule  │  │ UsersModule │  │
│  │ (JWT / bcrypt) │  │ (Tickets/Comments│  │ (User CRUD/ │  │
│  │                │  │  WebSocket GW)   │  │ Last-Admin) │  │
│  └────────┬───────┘  └────────┬─────────┘  └──────┬──────┘  │
│           │                   │                   │         │
│           └───────────────────┼───────────────────┘         │
│                               ▼                             │
│                     Mongoose ODM Schemas                    │
│             (UserSchema, TicketSchema, CommentSchema)       │
└───────────────────────────────┬─────────────────────────────┘
                                │ MongoDB Driver
                                ▼
                      ┌──────────────────┐
                      │ MongoDB Database │
                      │  (Indexed BSON)  │
                      └──────────────────┘
```

### Frontend Responsibilities
- **Routing & Navigation:** Declarative page routing with `ProtectedRoute` and `PermissionRoute`.
- **Global State Management:** Redux slices for `auth` (credentials, user profile), `tickets` (paginated lists, filters, active ticket), and `comments` (thread history).
- **Traffic Throttling:** Custom generic `useDebounce` hook (350 ms) regulating fast typing before API dispatch.
- **Real-Time Client:** Singleton `SocketService` managing connection lifecycles, joining ticket rooms, and receiving live comment broadcasts.

### Backend Responsibilities
- **API Guarding & Authorization:** Layered security via `JwtAuthGuard` (validates JWT signature, expiration, and user existence) and `PermissionsGuard` (checks required permissions).
- **Data Validation & Sanitization:** Global `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true` preventing property tampering.
- **Error Serialization:** Global `HttpExceptionFilter` ensuring uniform JSON error responses (`statusCode`, `message`, `error`, `timestamp`, `path`).
- **Data Integrity & Concurrency:** In-memory mutex locking (`withAdminGuardLock`) protecting critical operations on the last administrator.

---

## 5. Project Directory Structure

```text
Support_Ticket_Management_System/
├── README.md                           # Project documentation
├── backend/                            # NestJS API application
│   ├── scripts/
│   │   └── seed-admin.ts               # Idempotent Admin account seed script
│   ├── src/
│   │   ├── auth/                       # Auth module (login, register, profile)
│   │   │   ├── dto/                    # LoginDto, RegisterDto, UpdateProfileDto
│   │   │   ├── auth.controller.ts      # /auth endpoints
│   │   │   ├── auth.module.ts          # Dependency injection container
│   │   │   └── auth.service.ts         # JWT issuance and bcrypt verification
│   │   ├── common/                     # Cross-cutting concerns & security
│   │   │   ├── constants/              # ROLE_PERMISSIONS mapping
│   │   │   ├── decorators/             # @Permissions() metadata decorator
│   │   │   ├── enums/                  # UserRole, Permission, TicketStatus, TicketPriority
│   │   │   ├── filters/                # Global HttpExceptionFilter
│   │   │   ├── guards/                 # JwtAuthGuard, PermissionsGuard
│   │   │   └── strategies/             # Passport JwtStrategy & JwtPayload
│   │   ├── config/                     # Global app configuration (pipes & filters)
│   │   ├── tickets/                    # Ticket lifecycle, comments, & WebSockets
│   │   │   ├── dto/                    # Create, update, assign, delete, query DTOs
│   │   │   ├── schemas/                # Mongoose Ticket and Comment schemas
│   │   │   ├── tickets.controller.ts   # /tickets endpoints
│   │   │   ├── tickets.gateway.ts      # Socket.IO WebSocket gateway
│   │   │   ├── tickets.module.ts       # TicketsModule definition
│   │   │   └── tickets.service.ts      # Ticket CRUD, filtering, & KPI metrics
│   │   ├── users/                      # User & Agent management
│   │   │   ├── dto/                    # Create, update, and query DTOs
│   │   │   ├── schemas/                # Mongoose User schema
│   │   │   ├── users.controller.ts     # /users endpoints
│   │   │   ├── users.module.ts         # UsersModule definition
│   │   │   └── users.service.ts        # User CRUD, role updates, & mutex guard
│   │   ├── app.controller.ts           # Root health probe endpoint (GET /)
│   │   ├── app.module.ts               # Root module connecting MongoDB & Config
│   │   └── main.ts                     # Bootstrap entry point (CORS, port binding)
│   ├── .env.example                    # Backend environment template
│   ├── package.json                    # Backend dependencies and scripts
│   └── tsconfig.json                   # TypeScript configuration
└── frontend/                           # React 19 Vite application
    ├── src/
    │   ├── api/                        # Axios instance and API modules (auth, tickets, users)
    │   ├── components/
    │   │   ├── common/                 # Button, Card, Input, Modal, TicketStatusBadge, etc.
    │   │   └── layout/                 # Header, Sidebar, AppLayout, PublicLayout
    │   ├── constants/                  # Route paths, permissions, menus, storage keys
    │   ├── hooks/                      # Redux typed hooks and reusable useDebounce hook
    │   ├── pages/
    │   │   ├── admin/                  # AgentsPage (team management & role promotion)
    │   │   ├── dashboard/              # KPI cards, deadline overview, charts
    │   │   ├── public/                 # Home, About, Login, Register
    │   │   ├── shared/                 # Profile, NotFound, Unauthorized
    │   │   └── tickets/                # TicketsPage, TicketDetailsPage, DeletedTicketsPage
    │   ├── routes/                     # ProtectedRoute, PermissionRoute, AppRouter
    │   ├── schemas/                    # Yup validation schemas for Formik
    │   ├── services/                   # Singleton SocketService (Socket.IO client)
    │   ├── store/                      # Redux Toolkit store and slices (auth, tickets, comments)
    │   ├── theme/                      # Ant Design custom theme tokens
    │   ├── types/                      # Shared TypeScript data models and DTO interfaces
    │   └── utils/                      # Date formatting, avatar initials, due date utilities
    ├── .env.example                    # Frontend environment template
    ├── package.json                    # Frontend dependencies and scripts
    ├── vite.config.ts                  # Vite configuration with Tailwind CSS plugin
    └── tsconfig.json                   # TypeScript configuration
```

---

## 6. Authentication and Role-Based Access

### Authentication Flow

1. **User Sign-In:** The client sends `POST /auth/login` with `{ email, password }`.
2. **Credential Verification:** `AuthService` verifies user existence and validates the password using `bcrypt.compare`.
3. **Token Issuance:** Upon success, a signed JWT token containing `{ sub: user._id, email, role }` is returned.
4. **Token Storage:** The frontend stores the token in `localStorage` under the key `solvix_auth_token`.
5. **Request Authorization:** The Axios request interceptor attaches the token as `Authorization: Bearer <token>` on all outbound API calls.
6. **Token Validation:** `JwtAuthGuard` extracts and validates the token signature and expiration, ensuring the user still exists in the database.
7. **Permission Verification:** `PermissionsGuard` verifies that the user's role grants the permissions specified by `@Permissions(...)`.

```text
[ Browser ] ─── POST /auth/login ───► [ AuthController ]
                                              │
                                       (bcrypt.compare)
                                              ▼
[ Browser ] ◄── { accessToken, user } ────────┘
     │
     └── Subsequent Requests ─── Header: Authorization: Bearer <token>
                                         │
                                         ▼
                                  [ JwtAuthGuard ]
                                  (Passport JwtStrategy validates signature)
                                         │
                                         ▼ (req.user populated)
                                 [ PermissionsGuard ]
                                 (Checks required permission against user role)
                                         │
                                    Authorized?
                                    ├── YES ──► Route Handler executes
                                    └── NO  ──► 403 Forbidden Response
```

### Role-Based Permission Matrix

Permissions are mapped to roles via `ROLE_PERMISSIONS`:

| Permission | Description | Admin (`ADMIN`) | Support Agent (`SUPPORT_AGENT`) |
| :--- | :--- | :---: | :---: |
| `VIEW_DASHBOARD` | Access analytics dashboard and KPI metrics | Yes (Global data) | Yes (Scoped to assigned) |
| `VIEW_ASSIGNED_TICKETS` | View ticket listings and ticket details | Yes (All tickets) | Yes (Only assigned tickets) |
| `UPDATE_TICKET_STATUS` | Advance ticket status in the lifecycle | Yes | Yes |
| `MANAGE_TICKETS` | Create, edit, assign, and soft-delete tickets | Yes | No |
| `MANAGE_USERS` | View user lists, promote roles, and delete accounts | Yes | No |

- **Public Self-Registration (`POST /auth/register`):** Automatically assigns the `SUPPORT_AGENT` role. Privilege escalation via public sign-up is prevented.
- **Admin Privilege Escalation:** Only existing Administrators can promote an agent to Admin via `PATCH /users/:id`.

---

## 7. Ticket Lifecycle, Assignment, & Real-Time Collaboration

### Lifecycle State Machine

Tickets transition through 4 sequential lifecycle states:

```text
┌────────┐      ┌─────────────┐      ┌──────────┐      ┌────────┐
│  OPEN  │ ───► │ IN_PROGRESS │ ───► │ RESOLVED │ ───► │ CLOSED │
└────────┘      └─────────────┘      └──────────┘      └────────┘
```

- **`OPEN`:** Ticket created, awaiting investigation or initial triage.
- **`IN_PROGRESS`:** Support agent is actively investigating or working on a resolution.
- **`RESOLVED`:** Work is completed; pending confirmation or closure.
- **`CLOSED`:** Finalized and completed.

### Priority Levels
- **`LOW`:** Routine inquiries or minor cosmetic issues.
- **`MEDIUM`:** Standard operational issues affecting normal workflows.
- **`HIGH`:** Critical service interruptions or severe bugs requiring urgent attention.

### Due Date & Overdue Tracking
- Tickets support an optional `dueDate` field stored in UTC ISO 8601 format.
- Validation prevents creating tickets with due dates in the past.
- The UI categorizes due dates into intuitive relative statuses:
  - **Overdue:** Due date has passed and ticket is not `RESOLVED` or `CLOSED`.
  - **Due Today:** Due within the current calendar day.
  - **Due Soon:** Due within the next 48 hours.

### Real-Time Discussions (Socket.IO)

Discussion threads on ticket details update in real time without polling:
1. **Handshake Authentication:** The client connects to the WebSocket server passing the JWT token in `auth.token`. Sockets without a valid token are rejected immediately.
2. **Joining Rooms:** The client emits `ticket:join` with `{ ticketId }`.
   - Admins can join any ticket room.
   - Support Agents can only join rooms for tickets assigned to them.
3. **Broadcasting Comments:** When `POST /tickets/:id/comments` succeeds, the backend gateway emits `comment:created` to the `ticket:<id>` room, appending the message across all active browsers in that room.
4. **Room Eviction:**
   - If an agent is unassigned from a ticket, their socket is evicted from `ticket:<id>` via `revokeUserTicketRoomAccess`.
   - If a ticket is deleted, the gateway emits `ticket:deleted` to notify connected clients and closes the room.

---

## 8. Search, Backend Filtering, Pagination, & Debouncing

### Server-Side Filtering & Pagination
All ticket and user list endpoints (`GET /tickets`, `GET /tickets/deleted`, `GET /users`) support server-side query parameters:
- `page`: Page number (1-indexed, default: `1`).
- `limit`: Number of records per page (default: `10`, maximum: `50`).
- `search`: Case-insensitive text search matching titles, descriptions, names, or emails.
- `status` / `priority` / `role`: Filter by exact enum values.

### Shared `useDebounce` Hook
Search inputs utilize a custom generic hook located at `frontend/src/hooks/useDebounce.ts`:
```ts
export function useDebounce<T>(value: T, delay: number = 350): T;
```
- **Delay:** Standardized at `350 ms` across all search inputs.
- **Lifecycle Cleanup:** Automatically cancels pending timeouts when input changes or components unmount.
- **Whitespace Handling:** User input is trimmed before debouncing; entering spaces (`"   "`) evaluates to `""`, clearing previous search filters instead of leaving stale results.
- **Immediate Clear:** Deleting all input text triggers immediate query reset without waiting for the 350 ms timer.
- **Automatic Pagination Reset:** Changing search criteria or active filters automatically resets pagination to page 1.
- **Stale Response Protection:** In asynchronous search flows (`AgentsPage` and `AssignTicketModal`), incremental request-ID refs (`searchReqIdRef`) verify response freshness and discard out-of-order delayed responses.

---

## 9. Dashboard, User Management, & Deleted Tickets

### Operational Analytics Dashboard (`/dashboard`)
The dashboard aggregates operational performance metrics from `GET /tickets/summary`:
- **KPI Summary Cards:** Total Tickets, Open, In Progress, Resolved, Closed, Unassigned, Overdue, Due Today, and Due Soon.
- **Priority Distribution Chart:** Interactive Recharts BarChart visualizing ticket counts across Low, Medium, and High priorities.
- **Status Breakdown Chart:** Recharts Donut / PieChart displaying the proportion of tickets in each lifecycle stage.
- **Upcoming & Overdue Panel:** Prioritized list of active tickets requiring immediate attention.
- **Role Scoping:** Admins view organization-wide metrics; Support Agents view metrics computed exclusively from tickets assigned to them.

### User & Agent Management (`/users`)
Accessible only to Administrators (`MANAGE_USERS` permission):
- **User Directory:** Paginated table listing registered users with names, emails, roles, and join dates.
- **Account Creation:** Form modal to register new Support Agents or Administrators directly.
- **Role Promotion / Demotion:** Change a user's role between `SUPPORT_AGENT` and `ADMIN`.
- **Account Deletion:** Permanently remove an agent account. Any tickets assigned to the deleted user are automatically unassigned (`assignedToId: null`).

#### Last-Admin Mutex Protection (`withAdminGuardLock`)
To prevent system lockout, the backend wraps role updates and account deletions in an in-memory concurrency mutex:
- Prevents Administrators from demoting or deleting their own account.
- Prevents demoting or deleting the last remaining Administrator account in the system, even under concurrent requests.

### Deleted Tickets Handling (`/tickets/deleted`)
SolviX enforces a soft-deletion pattern to preserve data integrity:
- **Mandatory Deletion Reason:** Admins must supply a justification message when deleting a ticket.
- **Metadata Preserved:** Sets `isDeleted: true`, records `deletionReason`, `deletedById`, and `deletedAt`.
- **Dedicated Audit View:** Accessible at `/tickets/deleted` for Administrators to review historical records. Deleted tickets are excluded from main ticket views and active dashboard metrics.

---

## 10. Installation and Local Setup

### Prerequisites
Ensure your machine meets these requirements:
- **Node.js:** v18.0.0 or later (Node.js LTS v20+ recommended)
- **npm:** v9.0.0 or later
- **MongoDB:** v6.0 or later running locally on port `27017`, or a valid MongoDB Atlas connection string
- **Git:** For version control

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Support_Ticket_Management_System
```

### Step 2: Install Dependencies

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
2. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

### Step 3: Configure Environment Files

1. **Backend Environment:**
   ```bash
   # Windows PowerShell
   Copy-Item backend/.env.example backend/.env

   # Linux / macOS
   cp backend/.env.example backend/.env
   ```
   Open `backend/.env` and supply a secure `JWT_SECRET` and your `MONGODB_URI`.

2. **Frontend Environment:**
   ```bash
   # Windows PowerShell
   Copy-Item frontend/.env.example frontend/.env

   # Linux / macOS
   cp frontend/.env.example frontend/.env
   ```
   Ensure `VITE_API_BASE_URL=http://localhost:3000` matches your backend address.

### Step 4: Ensure MongoDB is Running
- **Windows (Service):** Ensure MongoDB service is running via `services.msc`.
- **Linux / macOS:** Run `sudo systemctl status mongod` or `brew services list`.
- **Docker:**
  ```bash
  docker run -d --name mongodb -p 27017:27017 mongo:latest
  ```

### Step 5: Seed the Initial Administrator
Run the built-in idempotent seed script to create the first Admin account:
```bash
cd backend
npm run seed:admin
cd ..
```
The script reads `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `backend/.env`. If an account with that email already exists, it exits cleanly without duplicate inserts.

---

## 11. Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example / Default Value |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | Port on which the NestJS HTTP server listens | `3000` |
| `MONGODB_URI` | **Required** | MongoDB connection string | `mongodb://localhost:27017/support_ticket_management` |
| `JWT_SECRET` | **Required** | Secret key used to sign and verify JWT authentication tokens | *Generate with Node.js crypto* |
| `JWT_EXPIRES_IN` | Optional | Validity duration for issued JWT tokens | `1d` |
| `ADMIN_NAME` | Seed Only | Full name for initial seed admin | `Admin User` |
| `ADMIN_EMAIL` | Seed Only | Email address for initial seed admin | `admin@example.com` |
| `ADMIN_PASSWORD` | Seed Only | Password for initial seed admin | `Admin@123` |

> [!TIP]
> **Generating a secure JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example / Default Value |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Optional | Base HTTP/WebSocket URL of the backend API | `http://localhost:3000` |

> [!WARNING]
> Variables prefixed with `VITE_` are embedded into client-side JavaScript bundles and publicly inspectable in browser dev tools. **Never put database connection strings, JWT secrets, or administrative credentials into `frontend/.env`**.

---

## 12. How to Run Frontend and Backend

To run the application locally, open two separate terminal windows.

### Terminal 1: Backend Server
```bash
cd backend
npm run start:dev
```
- Server starts at `http://localhost:3000`.
- Health check probe: visit `http://localhost:3000/` &rarr; returns `Hello World!`.

### Terminal 2: Frontend Client
```bash
cd frontend
npm run dev
```
- Client starts at `http://localhost:5173`.
- Open `http://localhost:5173` in your browser.

### Signing In
- **Admin Access:** Navigate to `http://localhost:5173/login` and log in with your seeded administrator credentials (e.g., `admin@example.com` / `Admin@123`).
- **Support Agent Access:** Click **Register** on the navigation bar to create a Support Agent account.

### Production Build & Preview
To test production builds locally:
```bash
# Build and run backend in production mode
cd backend
npm run build
npm run start:prod

# In a separate terminal: build and preview frontend
cd frontend
npm run build
npm run preview
```

---

## 13. Available npm Scripts

### Backend Scripts (`backend/package.json`)

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run start` | `nest start` | Starts the NestJS application directly |
| `npm run start:dev` | `nest start --watch` | Starts the server in development mode with hot-reloading |
| `npm run start:debug` | `nest start --debug --watch` | Starts the server with an attached V8 debugger |
| `npm run start:prod` | `node dist/main` | Runs the compiled production code from `dist/` |
| `npm run build` | `nest build` | Compiles TypeScript into JavaScript in `dist/` |
| `npm run seed:admin` | `ts-node -r tsconfig-paths/register scripts/seed-admin.ts` | Seeds the initial Administrator account |
| `npm run lint` | `eslint "{src,apps,libs,test}/**/*.ts" --fix` | Runs ESLint and applies automated fixes |
| `npm run format` | `prettier --write "src/**/*.ts" "test/**/*.ts"` | Formats TypeScript source files using Prettier |
| `npm run test` | `jest` | Executes unit tests |
| `npm run test:watch` | `jest --watch` | Runs unit tests in interactive watch mode |
| `npm run test:cov` | `jest --coverage` | Generates code coverage reports |
| `npm run test:e2e` | `jest --config ./test/jest-e2e.json` | Runs end-to-end integration tests |

### Frontend Scripts (`frontend/package.json`)

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm run dev` | `vite` | Starts the Vite development server with Hot Module Replacement |
| `npm run build` | `tsc -b && vite build` | Type-checks code with TypeScript and builds production bundle in `dist/` |
| `npm run lint` | `eslint .` | Runs ESLint across frontend components and hooks |
| `npm run preview` | `vite preview` | Previews the compiled production build locally |

---

## 14. API Overview with Actual Endpoints

All endpoints are mounted without a prefix (`http://localhost:3000`). Protected routes require the `Authorization: Bearer <token>` header.

### Health Probe
| Method | Endpoint | Auth | Required Permission | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/` | Public | None | Server health check; returns `"Hello World!"` |

### Authentication (`/auth`)
| Method | Endpoint | Auth | Required Permission | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/auth/login` | Public | None | Authenticate user; returns `{ accessToken, user }` |
| `POST` | `/auth/register` | Public | None | Register a new user with default `SUPPORT_AGENT` role |
| `GET` | `/auth/me` | JWT | None | Get current authenticated user profile |
| `PATCH` | `/auth/me` | JWT | None | Update current user profile (name, email, password) |

### Support Tickets (`/tickets`)
| Method | Endpoint | Auth | Required Permission | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/tickets` | JWT | `MANAGE_TICKETS` | Create a new ticket (Admin only) |
| `GET` | `/tickets` | JWT | `VIEW_ASSIGNED_TICKETS` | List active tickets (paginated, with search & filters) |
| `GET` | `/tickets/summary` | JWT | `VIEW_DASHBOARD` | Get KPI metrics and chart statistics |
| `GET` | `/tickets/deleted` | JWT | `MANAGE_TICKETS` | List soft-deleted tickets for auditing (Admin only) |
| `GET` | `/tickets/:id` | JWT | `VIEW_ASSIGNED_TICKETS` | Get detailed ticket information by ID |
| `PATCH` | `/tickets/:id` | JWT | `MANAGE_TICKETS` | Edit ticket title, description, priority, or due date |
| `PATCH` | `/tickets/:id/assign` | JWT | `MANAGE_TICKETS` | Assign or reassign ticket to a Support Agent |
| `PATCH` | `/tickets/:id/status` | JWT | `UPDATE_TICKET_STATUS` | Update ticket lifecycle status |
| `DELETE` | `/tickets/:id` | JWT | `MANAGE_TICKETS` | Soft-delete a ticket with a mandatory reason payload |
| `POST` | `/tickets/:id/comments` | JWT | `VIEW_ASSIGNED_TICKETS` | Add a comment to a ticket thread |
| `GET` | `/tickets/:id/comments` | JWT | `VIEW_ASSIGNED_TICKETS` | Retrieve all comments for a ticket |

### User Management (`/users`)
| Method | Endpoint | Auth | Required Permission | Description |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/users` | JWT | `MANAGE_USERS` | Create a new user (Admin or Support Agent) |
| `GET` | `/users` | JWT | `MANAGE_USERS` | List paginated users with role and search filters |
| `GET` | `/users/:id` | JWT | `MANAGE_USERS` | Retrieve user details by ID |
| `PATCH` | `/users/:id` | JWT | `MANAGE_USERS` | Update user name, email, or role (with last-admin lock) |
| `DELETE` | `/users/:id` | JWT | `MANAGE_USERS` | Delete user account (with last-admin lock & ticket unassign) |

### WebSocket Gateway (`TicketsGateway`)
- **Protocol:** Socket.IO over WebSocket / Polling fallback (`/socket.io/`)
- **Authentication:** Validated during handshake using `JWT_SECRET`.
- **Client Messages:**
  - `ticket:join` `{ ticketId: string }`: Join discussion room for a specific ticket.
  - `ticket:leave` `{ ticketId: string }`: Leave ticket discussion room.
- **Server Events:**
  - `comment:created` `{ _id, ticketId, message, authorId, createdAt }`: Broadcast when a new comment is posted.
  - `ticket:deleted` `{ ticketId }`: Broadcast when a ticket is soft-deleted.

---

## 15. Current Implementation Limitations

- **Soft Deletion is One-Way:** Tickets can be soft-deleted by Administrators with a mandatory justification reason, but there is currently no restore or undelete action implemented in the UI.
- **WebSocket Scope:** Real-time push events currently cover ticket comments (`comment:created`) and room eviction (`ticket:deleted`). Status transitions and ticket reassignments refresh on user navigation or action dispatch.
- **Single-Node In-Memory Mutex:** The last-admin protection lock (`withAdminGuardLock`) operates as an in-memory lock within a single Node.js process. Deploying multiple load-balanced backend replicas would require a distributed lock (e.g. Redis or MongoDB two-phase transactions).
- **No Self-Service Password Recovery:** If a user forgets their password, an Administrator must update the account or the user must update their password while authenticated via the Profile page. An automated email reset link flow is not currently implemented.
