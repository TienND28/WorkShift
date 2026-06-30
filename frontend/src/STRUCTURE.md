# WorkShift Frontend Structure

```
src/
├── app/                    # App shell, router, route guards
│   ├── App.tsx
│   ├── providers.tsx       # GoogleOAuthProvider
│   ├── router.tsx
│   ├── ProtectedRoute.tsx
│   └── GuestRoute.tsx
├── features/               # Feature modules (domain UI)
│   └── auth/
│       ├── components/
│       └── pages/
├── pages/                  # Top-level pages (compose features)
├── components/
│   ├── ui/                 # Button, Input, ...
│   └── layout/             # AuthLayout, AppShell
├── hooks/
├── stores/                 # authStore (lightweight global state)
├── lib/
│   ├── api/                # HTTP client + domain APIs
│   └── auth/               # localStorage tokens
├── types/
└── styles/
```

## Auth flow

1. `LoginPage` → `GoogleSignInButton` (GIS credential = ID token)
2. `POST /api/auth/google` `{ idToken }`
3. Tokens + user saved → redirect `/`

## Env

Copy `.env.example` → `.env` with `VITE_GOOGLE_CLIENT_ID` (same as backend).
