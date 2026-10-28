# SDMS – Saint Joseph Integrated Technical College
Vue 3 + Vite + Pinia. Run: `npm install && npm run dev`
No login page: sign up with your name (first account = admin, others = patron). Logout returns to the signup page; entering the same name signs you back in.
Run `npm install` again after updating (adds xlsx for Excel export).
Backend team: replace localStorage + USERS in `src/stores/sdms.js` with real API/auth.
