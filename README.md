# CineBook - Movie Ticket Booking React Project

This learning project combines the topics from the supplied experiment sheets:
- React Hooks and reusable components
- Custom hooks and Context API
- React Router and nested/dynamic routes
- Login demo and protected routes
- Axios REST API calls and CRUD booking operations
- Redux Toolkit global booking state
- Vitest and React Testing Library
- Lazy loading, accessibility, PWA manifest
- Production build and deployment

## Requirements
Install Node.js LTS from https://nodejs.org/ and install VS Code.

## Install
Open this folder in VS Code, then Terminal > New Terminal:
```bash
npm install
```

## Quick start (API + app together)
```bash
npm start
```
This runs the REST API (port 3001) and the Vite app together. Or run them separately as below.

## Start the REST API
Terminal 1:
```bash
npm run api
```
API runs at http://localhost:3001

## Start the React application
Terminal 2:
```bash
npm run dev
```
Open the URL shown, usually http://localhost:5173

## Test and production build
```bash
npm test
npm run build
npm run preview
```

## Accounts, payment and booking flow
1. The app opens on **Create account** (first visit) or **Sign in**. Everything else needs an account.
2. Accounts are saved in `users.json` (passwords hashed with bcrypt), so they survive API restarts. Delete the file to reset all accounts.
3. Flow: movie → theatre/show → seats → summary → your details → **payment** → confirmation ticket.
4. Payment is a **demo gateway** - no real money moves. Test card `4242 4242 4242 4242` (any future expiry, any CVV). Card `4000 0000 0000 0002` or UPI ID `fail@upi` simulates a declined payment. Card number and CVV are never sent to the server.
5. The server recomputes the price, verifies the payment and only then saves the booking. Each user sees only their own bookings.

### "Booking failed / Cannot reach the API server"
The API must be running on port 3001 (`npm start`, or `npm run api` in a second terminal). If your session expired you are sent back to sign in.

## Experiments
1. Hooks and reusable components: Home, search, filters, detail, theatre, show, seats, summary, booking.
2. Custom hooks + Context API + Redux Toolkit state + localStorage persistence.
3. Router pages, dynamic movie route, nested booking route and controlled forms.
4. Login, Auth Context, ProtectedRoute, validation, error boundary, reusable UI components.
5. API Integration: GET movies/theatres, GET movie detail, POST/GET/PATCH/DELETE bookings.
6. State management: Redux Toolkit booking state and derived price.
7. API CRUD + demo token header + unauthorized handling.
8. Testing, PWA, lazy loading, accessibility and deployment build.

For GitHub Pages, if deploying under a repository subpath, configure Vite's `base` and HashRouter or the host's SPA fallback. Netlify and Vercel support straightforward Vite deployments; use `npm run build` and `dist` as output.


## Enhanced version notes
- Movie catalogue expanded with more movie entries; search and genre options are generated from API data.
- Larger text, responsive movie cards, gradient colours and improved spacing.
- Login page supports creating an account and signing in; passwords are hashed with bcrypt and sessions use signed JWTs.
- This classroom backend stores accounts in memory, so accounts reset when the API server restarts. It is not a production deployment. For real public users, use a persistent database, HTTPS, a strong secret from environment variables, rate limiting, and a trusted auth provider or audited backend.
- Do not use a personal/reused password in this local practice project.
- After replacing files, run `npm install` again so bcryptjs and jsonwebtoken are installed.
"# madhuu" 
