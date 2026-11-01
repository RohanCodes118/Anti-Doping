# Clean Quest — Demo / Test Accounts

This document contains credentials and details for the three real Supabase Auth demo accounts created for Clean Quest. Each account has completely separate progress stored in the Supabase database.

---

## Quick Setup

To activate these demo accounts in your Supabase project:

1. Open your [Supabase Dashboard](https://supabase.com/dashboard) -> Select your Project.
2. Go to **SQL Editor** -> Click **New Query**.
3. Copy & paste the contents of [seed_demo_accounts.sql](file:///c:/Users/rohan/Downloads/Anti-Doping/seed_demo_accounts.sql).
4. Click **Run**.
5. All three accounts are now created with confirmed emails, realistic progress, XP, levels, learning paths, and quiz histories.

---

## Demo Accounts Credentials & Profiles

### 1. 🟢 Beginner Athlete (New User)
*Ideal for demonstrating the initial athlete onboarding experience and fresh state.*

| Field | Value |
|---|---|
| **Email** | `beginner@cleanquest.io` |
| **Password** | `CleanSport#2026` |
| **Name** | Sam Rivera |
| **Sport** | Athletics |
| **Level** | Level 1 |
| **Current XP** | 0 XP / 500 XP |
| **Total XP** | 0 XP |
| **Streak** | 1 Day |
| **Rank** | Rookie 🌱 |
| **Completed Quizzes** | 0 |
| **Completed Challenges** | 0 |
| **Badges Earned** | 0 |
| **What it demonstrates** | Clean empty dashboard state, onboarding flow, Level 1 progression, first quiz taking experience, earning the "Clean Start" badge from scratch. |

---

### 2. 🟡 Active Learner (Mid-Level User)
*Ideal for demonstrating typical active platform usage, ongoing challenges, and partial progress.*

| Field | Value |
|---|---|
| **Email** | `learner@cleanquest.io` |
| **Password** | `CleanSport#2026` |
| **Name** | Maya Lin |
| **Sport** | Swimming |
| **Level** | Level 8 |
| **Current XP** | 850 XP / 1,500 XP |
| **Total XP** | 4,200 XP |
| **Streak** | 5 Days 🔥 |
| **Rank** | Contender ⚡ |
| **Completed Quizzes** | 3 (Anti-Doping Basics, Athlete Responsibilities, Prohibited Substances) |
| **Completed Challenges** | 3 completed, 1 in-progress |
| **Badges Earned** | Clean Start, Week Warrior (in progress), Speed Reader |
| **Learning Paths** | Anti-Doping Fundamentals (100% Complete), Prohibited Substances (33%), Ethics (33%) |
| **What it demonstrates** | Realistic mid-tier progress, continue-learning modules, historical quiz review, moderate leaderboard placement, multi-category knowledge. |

---

### 3. 🟣 Clean Sport Champion (Advanced Power User)
*Ideal for demonstrating full platform capabilities, advanced analytics, top leaderboard rank, and completed curriculum.*

| Field | Value |
|---|---|
| **Email** | `champion@cleanquest.io` |
| **Password** | `CleanSport#2026` |
| **Name** | Elena Rostova |
| **Sport** | Cycling |
| **Level** | Level 18 |
| **Current XP** | 2,400 XP / 4,800 XP |
| **Total XP** | 28,900 XP |
| **Streak** | 14 Days 🔥 |
| **Rank** | Elite Athlete 🌟 |
| **Completed Quizzes** | 6 across all categories (100% scores on Advanced TUEs, Ethics, Testing, Substances) |
| **Completed Challenges** | 6/6 Challenges completed |
| **Badges Earned** | 8 Badges unlocked (Clean Start, Week Warrior, Rule Scholar, Ethics Champion, Speed Reader, Community Voice, Knowledge Explorer, Clean Sport Champion) |
| **Learning Paths** | All 4 learning modules 100% completed |
| **Community** | 12 interactions (milestones, answers, likes) |
| **What it demonstrates** | Top of global leaderboard, full badge showcase, comprehensive Quiz History charts and AI recommendations, completed learning curriculum, mastery of advanced topics (TUE, Whereabouts). |

---

## Testing Separate Progress & Isolation

1. **Sign in as Beginner (`beginner@cleanquest.io`)**: Observe 0 XP and empty history.
2. **Log out** -> **Sign in as Active Learner (`learner@cleanquest.io`)**: Observe Level 8, 4,200 XP, and 3 quiz attempts.
3. **Log out** -> **Sign in as Champion (`champion@cleanquest.io`)**: Observe Level 18, 28.9k XP, 8 badges, and all modules finished.
4. **Log back in as Beginner**: Verify their progress remains cleanly isolated at 0 XP.
