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
