# Contributing to NACOSS FUOYE Portal 🤝

First off, thank you for taking the time to contribute to the official **NACOSS FUOYE Portal** for the **Department of Computer Science, Federal University Oye-Ekiti (FUOYE)**!

This platform is engineered by students, for students. Whether you are fixing a UI bug, proposing a new tool, improving documentation, or building a new arcade game, your contributions make a massive impact.

---

## 📜 Intellectual Property & Contribution Policy

Before contributing, please note the licensing model:

1. **Departmental Ownership**: The entire NACOSS FUOYE Portal is the exclusive intellectual property of the **Department of Computer Science, FUOYE**.
2. **Contributor Attribution**: By contributing, you retain credit for your work (recognized in repository commit history and in the [Portal Contributors directory](https://nacossfuoye.vercel.app/#contributors)).
3. **No Reuse or External Copying**: You may not copy, duplicate, or reuse this codebase or its proprietary design for external projects or separate institutional deployments without explicit written permission from the Head of Department (HOD).
4. **License Agreement**: All contributions submitted via Pull Requests are governed by our [**LICENSE.md**](LICENSE.md).

---

## 🛑 Golden Rule: Open an Issue First

**Before writing significant code, please open an Issue to discuss your idea.**

- **Bug Fix**: Open a [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) describing the problem, reproduction steps, and device.
- **New Feature**: Open a [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) detailing the user flow and proposed technical approach.
- **New Arcade Game**: Open a [Game Proposal](.github/ISSUE_TEMPLATE/add_game.md) detailing the mechanics and responsive controls.

Once an issue is discussed and approved by the maintainers, you'll receive the green light to implement!

---

## 🧭 The 7 Portal Hubs

When contributing, ensure your work maps to the appropriate hub:

| Hub | Route | Purpose | Key Stack |
| :--- | :--- | :--- | :--- |
| **Memos** | `/memos`, `/[reference]` | Official circulars, memos, letterhead renderer | Next.js, PDF/image export |
| **Academics** | `/academics` | Course vaults, outlines, software requests | React state, direct forms |
| **BuildLab** | `/buildlab` | Venture incubator under NDA, student showcase | Tabbed filters, intake forms |
| **Events** | `/events` | Hackathons, workshops, and tech bootcamps | Calendar cards, filters |
| **Governance** | `/governance` | Stakeholder directory, elections & ballots | Directory grids, state machines |
| **Arcade Arena** | `/games` | Web mini-games with hashed leaderboards | Custom game engines, Server Actions |
| **Graphics** | `/graphics` | Celebration flyer generator with live cropper | HTML Canvas, `@esvigy/react` |

---

## 🕹️ Adding a Game to the Arcade Arena

We love student-built games! To add a game:

1. **Review Rules**: Read the detailed guidelines in [`src/app/games/README.md`](src/app/games/README.md).
2. **Isolation**: Place all components, logic, and assets in a dedicated folder: `src/app/games/<your-game-slug>/`.
3. **Single Player & Responsiveness**: The game must be playable on both mobile touch screens and desktop keyboards.
4. **Use `GameWrapper`**: Integrate with the shared `<GameWrapper slug="..." GameComponent={...} />`.
5. **Anti-Cheat Verification**: The wrapper automatically verifies physical user interactions (`event.isTrusted`) and signs scores using cryptographically secured server session tokens (`src/app/games/actions.js`), so contributors don't need to write custom security code.
6. **Register**: Add your game metadata to `src/app/games/games.js`:
   - **`releaseDate`**: Set your release date in **`DD/MM/YYYY`** format to the **next Monday** (e.g. `releaseDate: '09/11/2026'`). All arcade games run on weekly tournament rotations starting every Monday. Your game will automatically appear as an unplayable **Coming Soon** preview on the Games Hub so students can discover it and anticipate its launch!
   - **`hidden`**: Leave `hidden: false` (or omit it) so your Coming Soon preview displays to students. Maintainers can set `hidden: true` if a game needs to be completely hidden (e.g. when multiple games are scheduled for the same week).

---

## 🎯 Pull Request Guidelines

To ensure smooth code reviews, please follow these rules:

1. **Atomic PRs (One Thing at a Time)**:
   - If fixing a bug, your PR should **only** fix that bug.
   - If adding a game, your PR should **only** contain that game.
   - Do **not** mix refactors, formatting sweeps, and features into one PR.
2. **Package Manager**:
   - Use **`pnpm`** exclusively. Do **not** commit `package-lock.json` or `yarn.lock`.
3. **Lint & Code Health Before Submitting**:
   Always run the following commands locally before opening a PR:
   ```bash
   # 1. Verify ESLint passes with 0 errors
   pnpm lint

   # 2. Verify no dead files or unused packages
   pnpm dlx knip

   # 3. Verify React health scan
   pnpm dlx react-doctor src --no-telemetry
   ```
4. **Responsive Testing**:
   - Test your changes at mobile viewport (375px) and desktop viewport (1280px+).
5. **Database Changes**:
   - If your feature requires new Supabase tables, columns, or RLS policies, update [`supabase_schema.sql`](supabase_schema.sql) in your pull request.

---

## 🛠️ Contribution Workflow Step-by-Step

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/nacossfuoye.git
cd nacossfuoye

# 2. Install dependencies with pnpm
pnpm install

# 3. Set up environment variables
cp .env.example .env

# 4. Create a dedicated feature branch
git checkout -b feat/your-feature-name
# or for bug fixes:
git checkout -b fix/issue-description

# 5. Run the dev server
pnpm dev

# 6. Commit your changes with clear, descriptive messages
git commit -m "feat(academics): add software intake request form"

# 7. Push to your fork and submit a Pull Request
git push origin feat/your-feature-name
```

Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, link the related issue, and request a review.

Thank you for helping build a world-class digital experience for NACOSSites! 🚀
