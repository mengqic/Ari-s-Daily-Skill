---
name: obsidian-meeting-note
description: Creates Obsidian meeting notes from user-provided text and images in the Meeting Notes 2026 folder. Handles subfolder selection/creation, meeting name suggestion from content, and date-appended filenames. Use when the user wants to create a meeting note, save meeting content to Obsidian, turn notes or images into an Obsidian note, or mentions "meeting notes 2026".
---

# Obsidian Meeting Note

Creates Obsidian notes from entered text and images under Meeting Notes 2026. Handles prompts for subfolder and meeting name when not specified.

## Base Path

All notes are created under:

```
/Users/mengqichen/Documents/ObNotes/Meeting Notes 2026
```

## Workflow

### Step 1: Gather Content

The user provides:
- **Text** (required): meeting content, notes, transcript, etc.
- **Images** (optional): screenshots, diagrams, or other visuals from the meeting

### Step 2: Subfolder Resolution

**If the user did not specify a subfolder:**

1. List existing subfolders under Meeting Notes 2026.
2. Ask the user:
   - "Which subfolder should this note go in?"
   - Present options: "None (root)", list of existing subfolders, or "Create a new subfolder"
3. If "Create a new subfolder": ask for the subfolder name.
4. If "None (root)": create the note directly in Meeting Notes 2026.
5. If choosing existing: use the selected subfolder.

**If the user specified a subfolder:** use it. Create the subfolder if it does not exist.

### Step 3: Meeting Name Resolution

**If the user did not specify a meeting name:**

1. Analyze the text content to extract a suggested name (e.g., from:
   - First heading or title-like line
   - Meeting subject line
   - Recurring meeting pattern (e.g., "Weekly Sync", "1-1 with David")
   - Key topic or project mentioned early in the content
2. Suggest 1–3 options to the user.
3. Ask: "What should this meeting note be named?" and show the suggestions.
4. If the user picks one, use it. Otherwise use their custom name.

**If the user specified a meeting name:** use it.

### Step 4: Date and Filename

- Use today's date (unless the user specifies another date).
- Filename format: `{Meeting Name} - {YYYY-MM-DD}.md`
- Sanitize the meeting name for filesystem: replace `/` with space, remove or replace invalid characters (e.g. `<>:"|?*`).
- Full path: `Meeting Notes 2026/{subfolder if any}/{Meeting Name} - {YYYY-MM-DD}.md` — omit subfolder when using root.

### Step 5: Create the Note

**Note structure:**

```markdown
---
date: YYYY-MM-DD
---

# {Meeting Name}

{User's text content}

{Image embeds, if any}
```

**Image handling:**
- Save images to: `Meeting Notes 2026/{subfolder}/assets/`
- Use Obsidian embed: `![{filename}](assets/{filename})` or `![[{filename}]]`
- Name images descriptively: `{meeting-slug}-{index}.{ext}` (e.g., `weekly-sync-1.png`)
- If the user pastes or attaches images, save them to the assets folder and embed them in the note at relevant positions.

### Step 6: Confirm

After creating the note, confirm:
- Full path to the created file
- Subfolder used
- Meeting name and date in the filename

## Quick Reference

| User provides   | Agent action                                      |
|-----------------|---------------------------------------------------|
| No subfolder    | List existing, ask to choose or create new        |
| No meeting name | Analyze content, suggest 1–3 names, ask to pick   |
| Text only       | Create note with text content                     |
| Text + images   | Create note, save images to assets, embed in note |

## Trigger Phrases

- "Create a meeting note"
- "Turn this into an Obsidian note"
- "Save this to meeting notes 2026"
- "Add this to my meeting notes"
- "Create note from this content"
