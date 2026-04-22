# Post2Win Development Roadmap

## Phase 1: Core Flow Completion (MVP-Critical)

### 1.1 Campaign Creation Steps 2-3
- **Step 2 (Rules):** Form for `maxSubmissions`, `allowedTypes` checkboxes, `maxFileSize` dropdown, date pickers for `startDate`, `endDate`, `votingEndDate`
- **Step 3 (Review):** Summary card of all form data, cover image preview, "Create Campaign" submit button
- After creation: redirect to campaign detail page

### 1.2 Campaign Editing (DRAFT only)
- Edit page at `/campaigns/[id]/edit` pre-populated with existing data
- Only accessible for campaigns in DRAFT status
- Reuses creation form components

### 1.3 Status Auto-Transitions
- Vercel Cron route (`/api/cron/transition-campaigns`) running every 15 minutes
- ACTIVE campaigns past `endDate` → VOTING
- VOTING campaigns past `votingEndDate` → COMPLETED
- Protected with `CRON_SECRET` header

---

## Phase 2: Voting System

### 2.1 Vote Model
- New Prisma model: `Vote` (userId + submissionId unique constraint)
- One vote per user per submission

### 2.2 Voting API
- `POST /api/submissions/[id]/vote` — Cast vote
- `DELETE /api/submissions/[id]/vote` — Remove vote
- Only allowed when campaign status is VOTING

### 2.3 Voting UI
- Vote buttons on submissions during VOTING phase
- Vote count display
- "Voting Phase" banner with countdown on campaign detail

---

## Phase 3: User Experience

### 3.1 Profile Page (`/profile`)
- Edit name and avatar (upload to Cloudinary)
- View submission history and total winnings
- Stripe Connect onboarding button

### 3.2 Stripe Connect Onboarding
- `POST /api/stripe/connect` — Create Express account link
- `GET /api/stripe/connect` — Check onboarding status
- Required for winners to receive payouts

### 3.3 Legal Pages
- `/terms` — Terms of Service
- `/privacy` — Privacy Policy
- Links already exist in login page

---

## Phase 4: Reliability & Security

### 4.1 Rate Limiting
- In-memory or Redis-based rate limiting
- Critical routes: submissions POST, campaigns POST, payments

### 4.2 Error Handling
- Shared `src/lib/api-error.ts` helper
- Standardize all responses to `{ error: string, details?: string }`

### 4.3 Auth Middleware
- `src/middleware.ts` to protect `/dashboard/*` at edge layer
- Reduces per-route boilerplate

---

## Phase 5: Growth

### 5.1 Social Sharing
- Web Share API + clipboard fallback on campaign/submission pages

### 5.2 SEO
- `generateMetadata` on campaign detail pages
- Dynamic OG images

### 5.3 Notifications
- Email via Resend: winner announcements, submission confirmations, status changes

### 5.4 Admin Dashboard
- Route group `/(admin)/` with role check middleware
- Campaign moderation, user management, payout oversight

### 5.5 Testing
- Vitest for API route unit tests
- Playwright for E2E critical paths
