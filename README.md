# RecyConnect ♻️

> **E-Waste Management & Recycling Platform**  
> Connecting scrap collectors with authorized recycling facilities.

---

## 🌟 Key Features

- **Collector Portal (`/collector`)**: Field-optimized mobile app with:
  - 3-language selector (**English**, **हिन्दी**, **मराठी**) with 100% single-language rendering
  - 5-step lot creation wizard with price comparisons
  - QR code generation and offline fallback OTP for handovers
  - Interactive earnings ledger and field safety tips
- **Recycler Portal (`/recycler`)**: Authorized facility workflow with:
  - Real-time inbound processing queue
  - Intake scanner simulation and weighbridge scale calibration
  - Purity grading (Grade A / B / C) with automatic rate adjustments
  - Instant digital payout settlement and intake receipt generator
- **Admin Console (`/admin`)**: Management dashboard with:
  - Diverted weight tracking and category volume analytics
  - Recycler registry with status toggles (`AUTHORIZED`, `PENDING`, `REVOKED`)
  - Benchmark price management across all 6 material categories

---

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (White background & Cobalt Blue palette)
- **Database**: SQLite via Prisma ORM (Zero external config, serverless-ready)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Sessions**: Web Crypto HMAC-SHA256 signed session tokens

---

## 🔑 Demo Login Accounts

| Role | Portal URL | Credentials |
|---|---|---|
| **Collector** | `/collector/login` | **Phone**: `9876543210` (or any 10-digit number)<br>**OTP**: `4912` |
| **Recycler** | `/recycler/login` | **Email**: `greenloop@demo.com`<br>**Password**: `demo1234` |
| **Admin** | `/admin/login` | **Email**: `admin@demo.com`<br>**Password**: `admin1234` |

---

## 💻 Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client & Seed Database**:
   ```bash
   npm run prisma:generate
   npm run seed
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the landing screen.

---

## ☁️ Deploy to Vercel

RecyConnect is pre-configured for one-click deployment to Vercel:

1. Push this repository to GitHub.
2. Import the repository in the **Vercel Dashboard**.
3. Framework Preset will be automatically detected as **Next.js**.
4. The build command will execute `prisma generate && next build` automatically.
5. In serverless environments, RecyConnect automatically copies the seeded SQLite database to `/tmp/recyconnect.db`, enabling full write operations without requiring any external database configuration.

---

## 📄 License

MIT License.
