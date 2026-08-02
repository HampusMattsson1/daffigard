``` bash
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright test --headed


# Logga in med ett konto
PROFILE=user-hampus-privat npm run login

# Spela dafgård
PROFILE=user-hampus-privat HEADLESS=false npm run play
```