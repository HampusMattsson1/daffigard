``` bash
PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1 npx playwright test --headed


# Logga in med ett konto
PROFILE=user-hampus-privat npm run login

# Spela dafgård
PROFILE=user-hampus-privat HEADLESS=false npm run play

# Spela billys
PROFILE=user-robin-billys HEADLESS=false npm run billys


# Podman
podman build -t ghcr.io/hampusmattsson1/daffigard:0.1.2 .

# Copy folder/file from container to host
podman cp <container_name_or_id>:<path_inside_container> <path_on_host>
```