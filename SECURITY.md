# 🔒 Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Active  |

## Reporting a Vulnerability

HabitQuest is a **client-side only** application with no server, no database, and no user authentication. All data stays in the user's own browser via `localStorage`.

**However**, if you discover a security issue (e.g., XSS vulnerability in input handling), please:

1. **Do NOT** open a public GitHub Issue
2. Contact directly via [WhatsApp](https://whatsapp.com/channel/0029VbCNzQeISTkQR04DvX3r)
3. Include: description, steps to reproduce, potential impact

We aim to respond within **48 hours** and patch within **7 days**.

## Security Design Notes

- All user input is sanitised through `escapeHtml()` before DOM insertion
- No external API calls — the app works fully offline after first load
- No cookies, no tracking, no analytics sent anywhere
- CDN resources (Tailwind, Chart.js, Google Fonts) loaded over HTTPS
