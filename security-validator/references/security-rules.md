# Security Rules and Risk Patterns

## General Guidelines:
- Treat all external inputs as untrusted.
- Apply least privilege principle.

## Risk Patterns:

### Critical:
- Direct manipulation of file permissions (e.g., chmod 777).
- Network requests to non-whitelisted domains.
- Accessing or modifying secret files (e.g., .env, SSH keys).

### High:
- Uploading files to unknown locations.
- Executing shell commands with root privileges.

### Medium:
- Reading sensitive files without modification.
- Network requests with unknown payloads.

### Low:
- Routine data processing tasks.

## Whitelisted Operations:
- API calls to github.com, npmjs.com, vercel.com.
- File operations within user's home directory.
- Scheduled tasks that do not require permissions.