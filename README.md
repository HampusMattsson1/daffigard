``` sh
npx playwright test

npx playwright show-report
```

View it
``` sh
npx playwright test --headed --project chromium
```


**True setup**
``` sh
npm run login
# Sign in normally, then click Resume in the inspector.

npm run play
```

**Record**
``` sh
#npm run play record
#npx playwright codegen --save-storage=auth.json https://gamecenter.flarie.com/cff63f8b-5eba-4c79-b604-b17b2c5a1a75
node play/codegen-with-session.js

### PowerShell

# Köra headed
$env:HEADLESS="false"; npm run play

# Logga in med ett konto
$env:PROFILE="user-hampus"; npm run login


# Billys login
$env:PROFILE="user-hampus-billys"; npm run login

$env:PROFILE="user-hampus-billys"; $env:HEADLESS="false"; npm run billys

$env:PROFILE="user-hampus"; $env:HEADLESS="false"; npm run play
```

``` sh
# Podman
podman build -t ghcr.io/hampus-mattsson_rbl/daffigard:0.1.2 .
```

v0.2.0 now with less cpu/ram footprint (hopefully)