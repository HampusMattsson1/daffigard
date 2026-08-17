# Viewing the headed browser

The normal container runs headless. The headed Compose overlay starts Chromium in
an X virtual display. The noVNC viewer is optional and runs only when
`VNC_ENABLED=true`.

## Docker or Podman Compose

From the repository directory, set `VNC_ENABLED` and start the normal Compose
file together with the headed overlay:

```powershell
$env:VNC_ENABLED="true"
docker compose -f docker-compose.yml -f docker-compose.headed.yml up --build
```

For Podman, use the Compose command installed with your Podman setup:

```powershell
$env:VNC_ENABLED="true"
podman compose -f docker-compose.yml -f docker-compose.headed.yml up --build
```

Open `http://localhost:6080/vnc.html` in a browser, then use the **Connect**
button. The browser window shown there is the same one that Playwright uses to
navigate the game.

Without `VNC_ENABLED=true`, the headed container runs only the X virtual display
needed by Chromium. It does not start the window manager, VNC server, or noVNC
web server, so port `6080` does not serve a page and the viewer processes consume
no CPU or memory.

Stop it with `Ctrl+C`, or run:

```powershell
docker compose -f docker-compose.yml -f docker-compose.headed.yml down
```

Replace `docker` with `podman` when applicable.

## Podman running inside WSL

Run the `podman compose` command inside the WSL distribution that has Podman.
The overlay deliberately binds port `6080` to that distribution's loopback
interface, so it is not exposed to your LAN.

On current WSL 2 installations with localhost forwarding, Windows can open the
same address:

```text
http://localhost:6080/vnc.html
```

If that page does not load from Windows, get the WSL distribution's IP and open
the displayed address instead:

```bash
hostname -I
```

For example, if the result begins with `172.28.96.14`, open:

```text
http://172.28.96.14:6080/vnc.html
```

WSL IP addresses can change after a restart. To keep using `localhost` from
Windows, enable WSL localhost forwarding in `%UserProfile%\.wslconfig` and then
restart WSL:

```ini
[wsl2]
localhostForwarding=true
```

```powershell
wsl --shutdown
```

After WSL starts again, relaunch the headed Compose stack.
