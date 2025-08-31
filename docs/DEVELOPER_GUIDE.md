# 🛠️ Developer Guide

## Prerequisites
- Node.js 18+
- npm
- Obsidian for plugin testing

## Setup
```bash
git clone <repo>
cd ultima-orb
npm install
```

## Development
```bash
npm run dev   # watch mode
npm run build # production build
```

## Testing
```bash
npm test
```
> หากไม่มี `vitest` ให้รัน `npm install` ก่อน

## Security
- ไม่ hardcode API keys
- ใช้ environment variables
- อ่านเพิ่มเติมที่ [SECURITY.md](../SECURITY.md)
