# Claude Instructions

**Never commit or push changes on your own.** Always wait for explicit instruction from the user before running `git commit` or `git push`.

## Previewing the dev server on a phone

The dev machine runs Vite inside **WSL2** (NAT networking — the WSL IP like `172.19.68.137` is **not** reachable from other devices). Campus Wi-Fi (uwaterloo) also uses **client isolation**, so phone↔PC over the LAN is blocked even with port forwarding. The reliable path is a **public tunnel** — it bypasses LAN, firewall, and isolation, and works on cellular too.

### Recommended: cloudflared quick tunnel

1. `vite.config.ts` must allow tunnel hosts (already set):
   ```ts
   server: { host: true, allowedHosts: ['.loca.lt', '.trycloudflare.com'] }
   ```
2. Start the dev server (note the port — Vite picks 5173, or the next free one):
   ```bash
   npm run dev
   ```
3. Download `cloudflared` once (Linux amd64 static binary), then start a quick tunnel pointing at the dev port:
   ```bash
   curl -sL -o cloudflared https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   chmod +x cloudflared
   ./cloudflared tunnel --no-autoupdate --url http://localhost:5173
   ```
4. It prints a `https://<random>.trycloudflare.com` URL. Open that on the phone — no password, hot-reload works. The random URL changes each start.

Run both the dev server and the tunnel as **persistent background processes** (they don't survive across separate one-shot shell calls). Wrap the tunnel in a `while true; do ...; sleep 2; done` loop so it respawns if it drops.

### LAN route (only works on a non-isolated network, e.g. a phone hotspot)

WSL NAT means Windows must forward the port into WSL. In an **admin PowerShell on Windows**:
```powershell
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=<WSL_IP>
netsh advfirewall firewall add rule name="wsl-vite-5173" dir=in action=allow protocol=TCP localport=5173
```
- `<WSL_IP>` = `hostname -I` in WSL (resets on reboot — re-point the portproxy if it changes).
- The phone opens `http://<Windows_LAN_IP>:5173/` (`ipconfig.exe` → the active Wi-Fi adapter's IPv4). On a phone hotspot this is usually `172.20.10.2`.
- Cleanup: `netsh interface portproxy delete v4tov4 listenport=5173 listenaddress=0.0.0.0`
- **This fails on campus/eduroam Wi-Fi (client isolation) — use the tunnel there.**
