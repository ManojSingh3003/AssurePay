# AssurePay 💳

AssurePay is a flagship, highly secure digital wallet and peer-to-peer payment platform. It is built as a scalable monorepo, featuring a stunning Next.js user interface, robust transaction processing, and a dedicated microservice for handling third-party webhooks.

<div align="center">
  <!-- TODO: Add a stunning 16:9 hero screenshot of the dashboard here -->
  <img src="https://via.placeholder.com/1200x675/0B0B0B/00B4D8?text=AssurePay+Dashboard+Screenshot" alt="AssurePay Dashboard" width="800"/>
</div>

## ✨ Key Features

* **Premium User Experience:** A meticulously crafted UI featuring "Liquid Glass" components, dynamic grid backgrounds, and a flawless "Flagship Dark Mode" leveraging Tailwind CSS v4.
* **Instant Peer-to-Peer Transfers:** Securely send money to other registered AssurePay users using just their phone number. 
* **Wallet On-Ramping (Razorpay):** Add funds to your AssurePay wallet using the Razorpay payment gateway integration.
* **Resilient Transaction Handling:** Features a standalone Express.js microservice (`bank_webhook_handler`) that safely catches Razorpay webhooks and processes database transactions without blocking the Next.js frontend servers.
* **Race-Condition Protection:** Utilizes direct API reconciliation to prevent transaction state corruption when users abandon checkout flows.
* **ACID Compliant Database:** Built on PostgreSQL and Prisma ORM with strict transactional guarantees to ensure financial data integrity.

## 🏗️ Architecture & Tech Stack

AssurePay is structured as a **Turborepo** monorepo to isolate concerns while sharing configurations and UI components.

* **Frontend:** Next.js (App Router), React, Tailwind CSS v4, NextAuth.js
* **Backend:** Next.js Server Actions, Express.js (Webhook Microservice)
* **Database:** PostgreSQL, Prisma ORM
* **Payments:** Razorpay API
* **Tooling:** Turborepo, TypeScript, ESLint, Prettier

### Monorepo Structure

```text
assurepay/
├── apps/
│   ├── user-app/               # The main Next.js consumer-facing application
│   ├── merchant-app/           # Next.js app for merchants (WIP)
│   └── bank_webhook_handler/   # Express.js microservice for processing bank/Razorpay webhooks
├── packages/
│   ├── db/                     # Shared Prisma schema, migrations, and generated client
│   └── ui/                     # Shared React component library (Cards, Buttons, Appbar)
```

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Light Mode & Dark Mode
<!-- TODO: Add split-screen or side-by-side screenshots of Light vs Dark mode -->
<img src="https://via.placeholder.com/1200x675/F8FAFC/000000?text=Light+Mode+vs+Dark+Mode" alt="Theme Support" width="800"/>

### Transfer Flow
<!-- TODO: Add screenshot of the P2P transfer interface -->
<img src="https://via.placeholder.com/1200x675/09090B/00B4D8?text=P2P+Transfer+Flow" alt="P2P Transfer Flow" width="800"/>

</details>

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher)
* PostgreSQL database (Local or Docker)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/assurepay.git
   cd assurepay
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Duplicate the `.env.example` files (if present) to `.env` in the root and in the respective apps (`apps/user-app` and `apps/bank_webhook_handler`), and fill in your PostgreSQL URL and Razorpay keys.
   ```bash
   # packages/db/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/assurepay"
   ```

4. **Initialize the Database:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   This will concurrently start the `user-app` on `http://localhost:3000` and the `bank_webhook_handler` on its assigned port.

## 🔒 Security

* **Database Transactions:** All financial transfers use Prisma's `$transaction` API to ensure ACID compliance (money is never created or destroyed, only moved).
* **NextAuth:** Secure session management for users and merchants.
* **Server-Side Validation:** All inputs and states are verified server-side before interacting with the database.

## 🤝 Contributing
Contributions are welcome! Please open an issue or submit a pull request.

---
*Built with Turborepo and Next.js.*
