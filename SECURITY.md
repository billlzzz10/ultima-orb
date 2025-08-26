# Security Guidelines

## 🔒 Security Overview

Ultima-Orb ใช้มาตรการความปลอดภัยหลายชั้นเพื่อปกป้องข้อมูลและ API keys ของผู้ใช้

## 🛡️ Security Measures

### 1. API Key Management

#### ✅ Best Practices
- **Environment Variables:** ใช้ environment variables สำหรับ API keys
- **No Hardcoding:** ไม่มี API keys hardcode ในโค้ด
- **Settings UI:** จัดการ API keys ผ่าน Obsidian settings interface
- **Encryption:** เข้ารหัส API keys ใน local storage

#### ❌ Avoid
- Hardcoding API keys ในไฟล์ source code
- Committing API keys ไปยัง Git repository
- Sharing API keys ใน public repositories

### 2. Git Hooks Security

#### Pre-commit Hook
```bash
# ตรวจสอบ API keys patterns
PATTERNS=(
    "sk-[a-zA-Z0-9]{48}"
    "sk-ant-[a-zA-Z0-9]{48}"
    "AIza[a-zA-Z0-9]{35}"
    "ntn_[a-zA-Z0-9]{40}"
    "secret_[a-zA-Z0-9]{32}"
    "pat[a-zA-Z0-9]{40}"
    "pk_[a-zA-Z0-9]{40}"
)
```

#### Pre-push Hook
- ตรวจสอบ API keys ใน repository ทั้งหมด
- ตรวจสอบไฟล์ต้องห้าม
- ตรวจสอบไฟล์ขนาดใหญ่
- ตรวจสอบ TypeScript errors

### 3. File Security

#### Forbidden Files
ไฟล์ต่อไปนี้จะไม่ถูก commit:
- `.env`, `.env.local`, `.env.production`
- `config.json`, `secrets.json`
- `*.key`, `*.pem`, `*.p12`, `*.pfx`

#### Large Files
- ไฟล์ขนาดใหญ่กว่า 10MB จะถูกแจ้งเตือน
- ใช้ Git LFS สำหรับไฟล์ขนาดใหญ่

### 4. Code Security

#### TypeScript Safety
- ใช้ TypeScript เต็มรูปแบบ
- ตรวจสอบ type safety ก่อน commit
- ใช้ strict mode

#### Error Handling
- ไม่ expose sensitive information ใน error messages
- ใช้ proper error handling patterns
- Log errors อย่างปลอดภัย

## 🔍 Security Checks

### Automated Checks

#### 1. Pre-commit
```bash
# ตรวจสอบ staged files
git diff --cached --name-only | xargs grep -l "API_KEY_PATTERN"
```

#### 2. Pre-push
```bash
# ตรวจสอบ repository ทั้งหมด
git grep -l "API_KEY_PATTERN"
```

#### 3. Continuous Integration
- ตรวจสอบ API keys ใน CI/CD pipeline
- ตรวจสอบ dependencies vulnerabilities
- ตรวจสอบ code quality

### Manual Checks

#### 1. Code Review
- ตรวจสอบ API key usage
- ตรวจสอบ error handling
- ตรวจสอบ data validation

#### 2. Dependency Audit
```bash
npm audit
npm audit fix
```

## 🚨 Security Incidents

### If API Key is Exposed

1. **Immediate Actions**
   - Revoke exposed API key
   - Generate new API key
   - Update environment variables

2. **Code Cleanup**
   - Remove API key from Git history
   - Update affected files
   - Re-commit with clean history

3. **Prevention**
   - Review Git hooks
   - Update security patterns
   - Improve team training

### Reporting Security Issues

หากพบช่องโหว่ความปลอดภัย กรุณา:

1. **Private Report**
   - ส่ง email ไปยัง maintainer
   - ไม่เปิดเผยใน public channels
   - ให้รายละเอียดที่ชัดเจน

2. **Responsible Disclosure**
   - ให้เวลาในการแก้ไข
   - ไม่เปิดเผยก่อนแก้ไข
   - ร่วมมือในการทดสอบ

## 📋 Security Checklist

### Before Commit
- [ ] ไม่มี API keys ในโค้ด
- [ ] ไม่มี sensitive data ในไฟล์
- [ ] ไฟล์ไม่เกินขนาดที่กำหนด
- [ ] TypeScript compilation ผ่าน
- [ ] Linting ผ่าน

### Before Push
- [ ] Security scan ผ่าน
- [ ] ไม่มี API keys ใน repository
- [ ] ไม่มี sensitive files
- [ ] Tests ผ่าน
- [ ] Build ผ่าน

### Before Release
- [ ] Security audit ผ่าน
- [ ] Dependency vulnerabilities ตรวจสอบแล้ว
- [ ] API keys ปลอดภัย
- [ ] Error handling ครบถ้วน
- [ ] Documentation อัพเดต

## 🔧 Security Tools

### Git Hooks
- `pre-commit`: ตรวจสอบก่อน commit
- `post-commit`: ให้ feedback
- `pre-push`: ตรวจสอบก่อน push

### Development Tools
- **ESLint:** Code quality และ security
- **TypeScript:** Type safety
- **npm audit:** Dependency vulnerabilities
- **Git hooks:** Automated security checks

### Monitoring
- **Console warnings:** แจ้งเตือน security issues
- **Error logging:** Track security events
- **Performance monitoring:** Detect anomalies

## 📚 Security Resources

### Documentation
- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TypeScript Security](https://www.typescriptlang.org/docs/)

### Tools
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [ESLint security rules](https://github.com/nodesecurity/eslint-plugin-security)
- [Git hooks documentation](https://git-scm.com/docs/githooks)

## 🤝 Contributing to Security

### Reporting Issues
1. สร้าง private issue
2. ให้รายละเอียดที่ชัดเจน
3. ไม่เปิดเผย sensitive information
4. ร่วมมือในการแก้ไข

### Suggesting Improvements
1. สร้าง feature request
2. อธิบายประโยชน์
3. ให้ตัวอย่างการใช้งาน
4. พิจารณา impact

### Code Contributions
1. ใช้ secure coding practices
2. ตรวจสอบ security implications
3. เขียน tests สำหรับ security features
4. อัพเดต documentation

---

**Remember:** Security is everyone's responsibility. Always think security first! 🔒
