# CLI E2E Test Plan

*Last updated: 2026-03-02*

## Overview

End-to-end test for the markhub CLI workflow: login → push → pull → verify.

## Prerequisites

- [x] CLI published to npm as `markhub`
- [x] CLI installable globally: `npm install -g markhub`
- [x] Production site accessible: https://markhub.md
- [x] GitHub OAuth configured for device flow

## Test Results

### 1. CLI Installation ✅

```bash
$ npm install -g markhub
added 48 packages in 2s

$ markhub --version
0.1.0
```

### 2. Command Help ✅

All commands show proper help output:
- `markhub help` - Shows all available commands
- `markhub login --help` - Shows -f/--force flag
- `markhub push --help` - Shows -v/--visibility, -p/--path, -f/--force flags
- `markhub pull --help` - Shows -o/--output, -f/--force flags

### 3. Login Flow (Requires Human) ⏳

The login command initiates GitHub device flow correctly:

```bash
$ markhub login
- Requesting device code...
```

**To complete:**
1. Run `markhub login`
2. Visit the displayed URL
3. Enter the displayed code
4. Authorize the Markhub app
5. Wait for CLI to confirm login

Verify with:
```bash
$ markhub whoami
@username
Name: Your Name
Profile: https://markhub.md/username
```

### 4. Push Flow (After Login) ⏳

```bash
# Create test file
echo "# Test File\n\nPushed via CLI e2e test." > /tmp/e2e-test.md

# Push as public
markhub push /tmp/e2e-test.md -v public

# Expected output:
# ✓ File uploaded successfully!
# https://markhub.md/username/e2e-test.md
# Raw: https://markhub.md/api/raw/username/e2e-test.md
```

### 5. Pull Flow (After Login) ⏳

```bash
# Pull the file back
markhub pull username/e2e-test.md -o /tmp/e2e-pulled.md

# Expected output:
# ✓ Downloaded: e2e-test.md (XX bytes)
# From: https://markhub.md/username/e2e-test.md
```

### 6. Verify Contents ⏳

```bash
# Compare files
diff /tmp/e2e-test.md /tmp/e2e-pulled.md

# Should show no differences
```

### 7. List Files (After Login) ⏳

```bash
markhub list

# Expected output:
# e2e-test.md  🌐 public  ★ 0  just now  https://markhub.md/username/e2e-test.md
```

### 8. Logout ⏳

```bash
markhub logout

# Expected output:
# Goodbye, username! 👋
```

## Automated Verification

The following was verified automatically:

| Component | Status |
|-----------|--------|
| npm package installs | ✅ |
| CLI version displays | ✅ |
| All commands have help | ✅ |
| Production site responds | ✅ |
| Device flow initiates | ✅ |

## Human Verification Required

The full auth flow requires human interaction:

1. Visit GitHub device verification URL
2. Enter code shown by CLI
3. Authorize the app

This cannot be automated without storing GitHub credentials.

## Cleanup

After testing, delete the test file:

```bash
# Via web UI at /dashboard, or:
# Currently no CLI delete command (could add in future)
```
