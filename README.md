# NACOSS FUOYE Digital Portal 🚀

[![Department of Computer Science](https://img.shields.io/badge/Department-Computer%20Science-039133?style=for-the-badge&logo=codeforces)](https://fuoye.edu.ng)
[![Next.js 16](https://img.shields.io/badge/Next.js-16%20App%20Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Package Manager: pnpm](https://img.shields.io/badge/pnpm-v12-f69220?style=for-the-badge&logo=pnpm)](https://pnpm.io)
[![License: Department of Computer Science](https://img.shields.io/badge/License-Dept%20of%20Computer%20Science%20FUOYE-039133?style=for-the-badge)](LICENSE.md)

The official digital infrastructure for the **Department of Computer Science, Federal University Oye-Ekiti (FUOYE)**, built in collaboration with the **Nigeria Association of Computing Students (NACOSS), FUOYE Chapter**.

This comprehensive full-stack platform unifies departmental communications, academic repositories, student venture incubation, event management, live student elections, interactive games, and financial ledger governance into seven specialized hubs.

---

## 🌟 The 7 Unified Portal Hubs

1. **📄 Official Memos ([`/memos`](https://nacossfuoye.vercel.app/memos))**  
   Verified executive communications, presidential circulars, electoral decrees, and SRC bulletins with rich typography, letterhead scaling, and high-resolution PDF/image export.

2. **📚 Academic & Software Materials ([`/academics`](https://nacossfuoye.vercel.app/academics))**  
   Curated departmental course syllabi, past questions, registered semester units, and a direct intake form to request or contribute lab software, IDEs, and developer toolkits.

3. **💡 BuildLab & Student Venture Incubator ([`/buildlab`](https://nacossfuoye.vercel.app/buildlab))**  
   A platform to showcase peer-built projects or submit early-stage tech ideas for departmental mentorship and engineering support protected under full mutual non-disclosure (NDA).

4. **🏆 Events & Hackathons ([`/events`](https://nacossfuoye.vercel.app/events))**  
   Curated calendar of departmental tech conferences, coding bootcamps, and national hackathons with direct registration links and schedule breakdowns.

5. **🏛️ Governance & Elections ([`/governance`](https://nacossfuoye.vercel.app/governance))**  
   Verified directory of executive officers, academic level advisers, SRC representatives, society constitution, and live ballot voting during election cycles.

6. **🕹️ Arcade Arena & Games ([`/games`](https://nacossfuoye.vercel.app/games))**  
   Single-player mini-games (Reaction Timer, Memory Match, Blind Timer) with live weekly leaderboards and anti-cheat hashed score verification.

7. **🎨 Graphics Studio ([`/graphics`](https://nacossfuoye.vercel.app/graphics))**  
   Official celebration flyer generators (including the Student Birthday Flyer with interactive photo crop and export) producing pixel-perfect, on-brand graphics.

8. **🔐 Executive Admin Dashboard ([`/admin`](https://nacossfuoye.vercel.app/admin))**  
   Role-based operational dashboard for authenticated departmental executives to draft memos, manage financial treasury ledgers, and oversee portal assets.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with modern CSS variables, glassmorphism, and responsive design
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security policies)
- **Editor**: [TipTap](https://tiptap.dev/) rich text editor with custom styling and node extensions
- **Icons & Graphics**: [Lucide React](https://lucide.dev/), [@esvigy/react](https://www.npmjs.com/package/@esvigy/react)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17+ or v20+)
- [pnpm](https://pnpm.io/installation) (`npm install -g pnpm`)
- A free [Supabase](https://supabase.com) account

### 1. Clone the Repository
```bash
git clone https://github.com/nickfrostech/nacossfuoye.git
cd nacossfuoye
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your `.env` with your project keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GAME_SALT=the_binaries_weekly_game
```

### 4. Database Setup
1. In your [Supabase Dashboard](https://supabase.com/dashboard), open the **SQL Editor**.
2. Run [`supabase_schema.sql`](supabase_schema.sql) to create all tables, indexes, and Row Level Security (RLS) policies.
3. *(Optional)* Run [`supabase_seed.sql`](supabase_seed.sql) to populate initial sample memos, quotes, and stakeholders.

### 5. Run Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧪 Code Quality & Health Scripts

Always ensure your work passes code quality checks before submitting pull requests:

```bash
# Run ESLint validation
pnpm lint

# Check for unused code and dead dependencies
pnpm dlx knip

# Run React Doctor health scan
pnpm dlx react-doctor src --no-telemetry
```

---

## 🤝 Contributing

We welcome student engineers, designers, and open-source contributors from the NACOSS FUOYE community!

Please read our [**Contributing Guide (CONTRIBUTING.md)**](CONTRIBUTING.md) for details on opening issues, pull request standards, and adding new games to the Arcade Arena.

- [🐛 Report a Bug](.github/ISSUE_TEMPLATE/bug_report.md)
- [💡 Propose a Feature](.github/ISSUE_TEMPLATE/feature_request.md)
- [🎮 Propose a New Game](.github/ISSUE_TEMPLATE/add_game.md)

---

## 📜 Intellectual Property & License

**Copyright (c) 2026 Department of Computer Science, Federal University Oye-Ekiti (FUOYE). All rights reserved.**

This project is licensed under the **Department of Computer Science, FUOYE Source-Available & Educational Contribution License**:
- **Contribution Permitted**: You are encouraged to inspect the source code, run it locally, and submit contributions/PRs for the benefit of the Department. Contributors receive full attribution in the portal.
- **No Reuse or Replication**: You **MAY NOT** copy, duplicate, replicate, extract, or reuse this codebase (in whole or in part) in external projects, commercial products, or independent institutional deployments.
- **Departmental Property**: The entire codebase, database schemas, and digital assets remain the exclusive intellectual property of the Department of Computer Science, FUOYE unless explicit written access or exemption is granted by the Head of Department (HOD).

Read the complete terms in [**LICENSE.md**](LICENSE.md).
