<p align="center">
  <img align="center" src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/github_banner.png" alt="SCBypass Banner">
</p>

<p align="left">
  <img width="40px" src="https://raw.githubusercontent.com/titaniumnetwork-dev/Holy-Unblocker/master/views/assets/img/logo_github.png" alt="SCBypass Logo">
</p>

# SCBypass (v6.9.4)

![GitHub Actions Status](https://github.com/QuiteAFancyEmerald/Holy-Unblocker/workflows/CI-Production/badge.svg)
![GitHub Actions Status](https://github.com/QuiteAFancyEmerald/Holy-Unblocker/workflows/CI-Win/badge.svg)
[![Docker Image Version](https://img.shields.io/docker/v/quiteafancyemerald/holy-unblocker.svg)](https://hub.docker.com/r/quiteafancyemerald/holy-unblocker)
[![Docker Pulls](https://img.shields.io/docker/pulls/quiteafancyemerald/holy-unblocker.svg)](https://hub.docker.com/r/quiteafancyemerald/holy-unblocker)

**SCBypass** is a secure, clientless web proxy / unblocker that bypasses almost any content filter — whether it's school Chromebooks, network-level blocks, government censorship, or browser extension blockers.

It supports **YouTube**, **Discord**, **GeForce NOW**, **Spotify**, Reddit, Instagram — and basically any site you throw at it — including the ability to access **Tor / .onion** domains directly in a normal browser.

Follow my TikTok for updates, new drops & mirrors:  
https://www.tiktok.com/@holy.nik.offz

Join the Discord community:  
https://discord.gg/TnPCzYWZAP

> Over the years similar proxies reached **30M+** users. SCBypass continues that legacy with frequent updates and strong focus on evasion + self-hosting privacy.

### Current Branch: **v6.9.4_production** (recommended for self-hosting)

<details>
<summary>Branch types (for reference)</summary>

- `master` / `main` → development, readable source, SEO experiments
- `beta` → upcoming changes (may break things)
- `v6.x_production` → stable, heavily obfuscated, maximum filter evasion, production-ready

</details>

**Tip:** For best evasion when self-hosting → use a **production** branch (`v6.9.4_production` or similar).

## Deploy SCBypass (one-click options)

### Free Deployments

[![Deploy to Koyeb](https://binbashbanana.github.io/deploy-buttons/buttons/remade/koyeb.svg)](https://app.koyeb.com/deploy?name=scbypass&type=git&repository=QuiteAFancyEmerald%2FHoly-Unblocker&branch=v6.9.4_production&builder=dockerfile&ports=8080%3Bhttp%3B%2F)

<details>
<summary>Alternative free platforms</summary>

- Render  
- Fly.io  
- Cyclic (if still available)  
- Oracle Cloud Always Free tier

</details>

### Paid / Higher-performance Options (credit card may be required)

- Railway.app
- Render.com (paid tier)
- DigitalOcean / Vultr / Linode ~$5–12/mo droplets
- Azure / Google Cloud / AWS free credits for new accounts

**Note:** Replit & Heroku no longer support free proxy hosting. Use Koyeb, Railway or a cheap VPS instead.

## Quick Setup (VPS / Dedicated Server)

```bash
# Clone production branch (recommended)
git clone -b v6.9.4_production https://github.com/QuiteAFancyEmerald/Holy-Unblocker.git scbypass
cd scbypass

# Install dependencies
npm run fresh-install

# Start (pm2 will be used automatically if production: true in config)
npm start

# Later restarts / updates
npm restart

# Stop all pm2 processes
npm run kill

# Clean Rammerhead cache if needed
npm run clean
