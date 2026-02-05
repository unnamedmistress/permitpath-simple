# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

##  gog (Google CLI) - Gmail Management

**Authentication:** Configured for momchrysti@gmail.com
**Keyring Password:** Set in GOG_KEYRING_PASSWORD environment variable

### Email Search & Cleanup Commands

**Search messages:**
```bash
gog gmail messages search "query" --json
# Example: gog gmail messages search "older_than:2d in:spam" --json
```

**Move messages to Trash (batch):**
```bash
# 1. Search and get message IDs
gog gmail messages search "your_query" --json > results.json

# 2. Extract IDs and move to trash
gog gmail batch modify id1 id2 id3 --add-label TRASH --remove-label INBOX --force
```

**Permanently delete messages:**
```bash
gog gmail batch delete id1 id2 id3 --force
```

**Common Gmail queries:**
- `older_than:7d` - Messages older than 7 days
- `in:spam` - Messages in spam folder
- `category:social` - Social category
- `category:promotions` - Promotions category
- `category:updates` - Updates category
- `-in:inbox` - Not in inbox (combine with above)

**Batch operations:**
- Always use `--force` to skip confirmations in automated scripts
- Use `--json` for machine-readable output
- Use `--no-input` to fail instead of prompting (good for automation)
- Add `--account momchrysti@gmail.com` if needed (usually auto-detected)

**Example cleanup workflow:**
```bash
# Get spam/promo messages older than 2 days
QUERY="older_than:2d -in:inbox (in:spam OR category:social OR category:promotions)"
IDS=$(gog gmail messages search "$QUERY" --json | jq -r '.[].id')

# Move to trash in batches of 100
echo "$IDS" | xargs -n 100 gog gmail batch modify --add-label TRASH --force
```

### Important Notes

- **TRASH vs DELETE:** Adding TRASH label moves to trash (30-day recovery). DELETE is permanent.
- **Rate limits:** Gmail API has rate limits. For large batches, add delays between operations.
- **Always test queries first:** Run search without modify to verify what will be affected.
- **--force flag:** Required for non-interactive batch operations (no confirmation prompts).

##  Complete Email Cleanup Example

**Goal:** Clean spam/promotions older than 2 days

**Step 1: Search and extract message IDs**
```bash
# Search with query
QUERY="older_than:2d -in:inbox (in:spam OR category:social OR category:promotions)"
MESSAGES=$(gog gmail messages search "$QUERY" --json --account momchrysti@gmail.com)

# Extract just the IDs (requires jq)
IDS=$(echo "$MESSAGES" | jq -r '.[].id')

# Count how many messages
COUNT=$(echo "$IDS" | wc -l)
echo "Found $COUNT messages to move to trash"
```

**Step 2: Move to trash in batches**
```bash
# Move in batches of 50 (safe batch size)
echo "$IDS" | xargs -n 50 gog gmail batch modify --add-label TRASH --force --account momchrysti@gmail.com

# Alternative: process in shell loop for progress reporting
BATCH=0
echo "$IDS" | while read -r line; do
  BATCH=$((BATCH + 1))
  BATCH_IDS=$(echo "$line" | tr '\n' ' ')
  echo "Processing batch $BATCH..."
  gog gmail batch modify $BATCH_IDS --add-label TRASH --force --account momchrysti@gmail.com
done
```

**Step 3: Verify**
```bash
# Check how many messages are now in trash
gog gmail messages search "in:trash newer_than:1d" --json | jq '. | length'
```

**Important:**
- Messages in TRASH are recoverable for 30 days
- Use `--force` to skip confirmation prompts (required for automation)
- Gmail API has rate limits - for 1000+ messages, add `sleep 1` between batches
- Test your query first: run search without modify to verify what will be affected

##  Ready-to-Execute: Clean Promotions Folder

**When user says "empty my promotions" or "clean promotions folder":**

Execute this IMMEDIATELY (dont ask permission, dont offer options):

```bash
# Step 1: Search promotions (get count first)
gog gmail messages search "category:promotions" --json --account momchrysti@gmail.com > /tmp/promotions.json

# Step 2: Extract message IDs
IDS=$(jq -r '.messages[].id' /tmp/promotions.json 2>/dev/null)
COUNT=$(echo "$IDS" | wc -l)

# Step 3: Report what youre doing
echo "Found $COUNT messages in Promotions. Moving to trash..."

# Step 4: Move to trash in batches of 50
if [ ! -z "$IDS" ]; then
  echo "$IDS" | xargs -n 50 gog gmail batch modify --add-label TRASH --remove-label INBOX --force --account momchrysti@gmail.com
  echo "Done! Moved $COUNT messages to trash."
else
  echo "Promotions folder is already empty."
fi
```

**Just run it. No confirmations. No alternatives. Execute and report progress.**

Similarly for spam/social/updates - same pattern, change the category.
