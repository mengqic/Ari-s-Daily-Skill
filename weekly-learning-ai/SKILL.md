---
name: weekly-learning-ai
description: Curates top 5 learning resources per category from a configurable date range (default 7 days). Collects 16 per category, excludes generic/overlapping/basic items, selects 5 by quality (content, uniqueness, engagement). Categories: release notes (Cursor, Claude Code, Figma Make), productivity (Cursor/Claude Code), product designer workflow (Cursor/Claude Code/Figma). Returns JSON and Obsidian note. Use when the user asks for weekly AI learning digest, AI tool updates, or productivity/designer resources.
---

# Weekly Learning AI

Curates a digest of AI tool updates and productivity resources. Collects 16 per category, applies exclusion filters, evaluates quality, and returns the top 5 per category (best content, most unique, least overlap). Outputs JSON and Obsidian note.

## Date range

- **Default**: Past 7 days (from today).
- **Custom**: Parse user input for explicit ranges (e.g., "past 14 days", "last 2 weeks", "March 1–15").
- If the user specifies a number of days, use that. If no range given, use 7.
- Compute `from` and `to` dates. Include `after:YYYY-MM-DD` in search queries when supported.

## Categories

| Category | Scope | Target audience |
|----------|-------|-----------------|
| **Release Notes** | Cursor, Claude Code, Figma Make | Anyone using these tools |
| **Productivity** | Cursor, Claude Code | Any profession or industry |
| **Product Designer** | Cursor, Claude Code, Figma | Product designers, UX designers |

## Exclusion rules

**Exclude** records that match any of:

1. **Too general**: Entire changelogs, raw fix lists, "X plugins added," bulk release summaries without narrative or insight.
2. **Big overlap**: If multiple articles cover the same topic in similar depth, keep only the best-written one (e.g., one Cursor Automations article, not six Figma-to-Cursor setup guides).
3. **Too basic**: Trivial setup tutorials (e.g., "How to set up Figma MCP server" without advanced workflow or strategy).

When overlap exists, prefer: official sources, deeper analysis, more unique angle, better writing.

## Workflow

### Step 1: Resolve date range

Parse user request for custom range. Default to 7 days. Compute `from` and `to`.

### Step 2: Collect 16 records per category

Run multiple web searches per category to reach ~16 unique records. Deduplicate by URL. Use `[date range]` in queries.

**Category A – Release notes highlights**

- `Cursor changelog release notes [date range]`
- `Claude Code changelog release notes [date range]`
- `Figma Make updates release notes [date range]`
- Prefer: cursor.com/changelog, claudecode.news, GitHub anthropics/claude-code, figma.com/release-notes, figma.com/blog

**Category B – Productivity (industry-agnostic)**

- `Cursor productivity tips [date range]`
- `Claude Code improve productivity [date range]`
- `AI coding assistant daily workflow [date range]`
- Focus: tutorials, workflows, tips that apply regardless of profession.

**Category C – Product designer workflow**

- `Product designer Cursor Figma workflow [date range]`
- `UX designer Claude Code Figma [date range]`
- `Design-to-code Cursor Figma [date range]`
- Focus: design workflows, design systems, prototyping, handoff, Figma integration.

### Step 3: Evaluate quality

Score each record 1–5 on each criterion. Compute average. Tie-break by depth, then usefulness.

| Criterion | 1 (low) | 5 (high) |
|-----------|---------|----------|
| **recency** | >range old | Within date range |
| **accuracy** | Outdated/wrong | Current, verifiable |
| **depth** | Thin, promotional | Specific, actionable |
| **usefulness** | Niche/low value | Widely applicable |
| **source** | Unknown/weak | Official, reputable, expert |
| **uniqueness** | Overlaps heavily with others | Distinct angle, minimal overlap |

### Step 4: Build evaluation table per category

For each category, record **all** evaluated items with full scores:

- title, url, summary
- scores: recency, accuracy, depth, usefulness, source, average
- Rank by average (descending)

### Step 5: Select top 5 per category

From each category’s evaluations, apply exclusion rules, remove overlapping topics (keep best per topic), then take the top 5 by quality score. Quality factors: nice content, engagement signals (thumbs up, read count when inferable), uniqueness (distinct angle, minimal overlap with others). If fewer than 5 pass filters, use all and note in `notes`.

### Step 6: Write conclusion

Summarize across all categories:

- **trends**: What themes or patterns appear (e.g., agent features, Figma integration).
- **keyTakeaways**: 3–5 high-level insights for the reader.
- **recommendations**: 2–4 concrete next steps or areas to explore.

### Step 7: Output JSON

Return valid JSON following the schema below. Do not wrap in markdown code blocks unless the user requests it; return raw JSON when possible.

### Step 8: Create Obsidian note

After producing the JSON, create an Obsidian note and save it:

- **Folder**: `/Users/mengqichen/Documents/ObNotes/AI Weekly Learning`
- **Filename**: `Weekly AI Learning Digest - {YYYY-MM-DD}.md` (use the date the skill was run, e.g., today)
- **Overwrite**: If the file already exists (e.g., skill run more than once on the same day), overwrite it with the new content. Do not append or create a duplicate.

Structure:
- YAML frontmatter: `date`, `tags` (ai-learning, cursor, claude-code, figma, weekly-digest)
- H1 title: `# Weekly AI Learning Digest - {YYYY-MM-DD}`
- Date range summary
- For each category: heading, then top 5 as numbered list with `**[Title](url)**` and summary
- Conclusion: trends, key takeaways, recommendations
- Use markdown links for URLs throughout

## JSON output schema

```json
{
  "meta": {
    "generated": "YYYY-MM-DD",
    "dateRange": {
      "from": "YYYY-MM-DD",
      "to": "YYYY-MM-DD",
      "days": 7
    }
  },
  "categories": [
    {
      "id": "release-notes",
      "name": "Release Notes Highlights (Cursor, Claude Code, Figma Make)",
      "evaluations": [
        {
          "title": "string",
          "url": "string",
          "summary": "string",
          "scores": {
            "recency": 1,
            "accuracy": 1,
            "depth": 1,
            "usefulness": 1,
            "source": 1,
            "average": 1.0
          }
        }
      ],
      "top5": [
        {
          "rank": 1,
          "title": "string",
          "url": "string",
          "summary": "string",
          "scores": {
            "recency": 1,
            "accuracy": 1,
            "depth": 1,
            "usefulness": 1,
            "source": 1,
            "average": 1.0
          }
        }
      ],
      "notes": "string or null"
    },
    {
      "id": "productivity",
      "name": "Productivity Articles (Cursor / Claude Code)",
      "evaluations": [],
      "top5": [],
      "notes": null
    },
    {
      "id": "product-designer",
      "name": "Product Designer Workflow (Cursor / Claude Code / Figma)",
      "evaluations": [],
      "top5": [],
      "notes": null
    }
  ],
  "conclusion": {
    "trends": ["string"],
    "keyTakeaways": ["string"],
    "recommendations": ["string"]
  }
}
```

## Trigger phrases

- "Weekly AI learning digest"
- "AI learning digest past 14 days"
- "What's new in Cursor / Claude Code / Figma this week"
- "AI productivity resources"
- "Weekly learning AI"
- "Designer workflow AI updates"
