import { LocalStorage, getPreferenceValues } from "@raycast/api";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { basename, join } from "path";

/** LocalStorage key for persisting the user's skill folder choice. */
const ACTIVE_SKILL_PATH_KEY = "activeSkillPath";

/** Appended to every assembled system prompt to constrain model output. */
const OUTPUT_RULES = `
---

CRITICAL OUTPUT RULES:
- Output ONLY the refined/rewritten text, ready to copy-paste.
- Do NOT include explanations, commentary, labels like "Here's the refined version:", or markdown code fences.
- Preserve any formatting the user used (bullet points, numbered lists, line breaks, @mentions).
- Keep the same general length — do not dramatically shorten or lengthen.
`.trim();

interface Preferences {
  skillPath?: string;
}

/**
 * Resolves the active skill folder path.
 *
 * Priority: LocalStorage override > Raycast preference > repo default.
 */
export async function getActiveSkillPath(): Promise<string> {
  const storedPath = await LocalStorage.getItem<string>(ACTIVE_SKILL_PATH_KEY);
  if (storedPath && existsSync(storedPath)) {
    return storedPath;
  }

  const { skillPath } = getPreferenceValues<Preferences>();
  if (skillPath && existsSync(skillPath)) {
    return skillPath;
  }

  return join(__dirname, "..", "..", "..", "rewrite-message");
}

/** Persists the user's skill folder choice across sessions. */
export async function setActiveSkillPath(path: string): Promise<void> {
  await LocalStorage.setItem(ACTIVE_SKILL_PATH_KEY, path);
}

/**
 * Returns a human-readable name for the active skill.
 *
 * Parses the `name:` field from SKILL.md frontmatter, falling back to the
 * directory basename.
 */
export async function getActiveSkillName(): Promise<string> {
  const skillPath = await getActiveSkillPath();
  const skillMdPath = join(skillPath, "SKILL.md");

  if (!existsSync(skillMdPath)) {
    return basename(skillPath);
  }

  const content = readFileSync(skillMdPath, "utf-8");
  const match = content.match(/^name:\s*(.+)$/m);
  return match?.[1]?.trim() || basename(skillPath);
}

/**
 * Loads all markdown files from the active skill folder and assembles them
 * into a single system prompt string for Gemini CLI.
 *
 * The SKILL.md file is placed first, followed by all other .md files
 * (sorted alphabetically), followed by output-constraining rules.
 */
export async function loadSkillPrompt(): Promise<string> {
  const skillPath = await getActiveSkillPath();

  if (!existsSync(skillPath)) {
    throw new Error(
      `Skill folder not found: ${skillPath}\n\n` +
        'Use the "Switch Skill Source" command to select a valid skill folder.',
    );
  }

  const skillMdPath = join(skillPath, "SKILL.md");
  const sections: string[] = [];

  if (existsSync(skillMdPath)) {
    sections.push(readFileSync(skillMdPath, "utf-8"));
  }

  for (const filePath of collectMarkdownFiles(skillPath, skillMdPath)) {
    const relativeName = filePath
      .slice(skillPath.length)
      .replace(/^\//, "")
      .replace(/\.md$/, "");
    const content = readFileSync(filePath, "utf-8");
    sections.push(`\n---\n\n# Reference: ${relativeName}\n\n${content}`);
  }

  sections.push(OUTPUT_RULES);

  return sections.join("\n\n");
}

/**
 * Recursively collects .md file paths under `directory`, excluding hidden
 * files/folders and an optional `excludePath`. Results are sorted.
 */
function collectMarkdownFiles(
  directory: string,
  excludePath?: string,
): string[] {
  const results: string[] = [];

  for (const entry of readdirSync(directory)) {
    if (entry.startsWith(".")) continue;

    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      results.push(...collectMarkdownFiles(fullPath, excludePath));
    } else if (fullPath.endsWith(".md") && fullPath !== excludePath) {
      results.push(fullPath);
    }
  }

  return results.sort();
}
