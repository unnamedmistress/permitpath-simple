# Security Patterns and Risk Classifications

## Whitelisted Operations:
- Standard API calls to known services (e.g., GitHub, Vercel)
- File operations within controlled directories

## Risk Classifications:

### Critical:
- Accessing or modifying sensitive files (e.g., .env, SSH keys)
- Network requests to unverified domains

### High:
- Operations that alter file permissions or delete files
- Unauthorized exposure of credentials

### Medium:
- Commands that may log sensitive information
- Minor access level changes

### Low:
- General data processing tasks