import {
  Action,
  ActionPanel,
  Color,
  confirmAlert,
  getPreferenceValues,
  Icon,
  List,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { useState } from "react";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "fs";
import { basename, join } from "path";

import { setActiveSkillPath } from "./lib/skill-loader";

interface SkillEntry {
  name: string;
  path: string;
}

interface Preferences {
  skillSourceRoot?: string;
  geminiSkillRoot?: string;
}

const DEFAULT_SOURCE_ROOT = "/Users/huayumochi/skills/Ari-s-Daily-Skill";
const DEFAULT_GEMINI_ROOT = "/Users/huayumochi";

/**
 * Scans a directory for immediate subdirectories that contain a SKILL.md file.
 * Returns them sorted by name.
 */
function discoverSkills(root: string): SkillEntry[] {
  if (!existsSync(root)) return [];

  const entries: SkillEntry[] = [];
  for (const name of readdirSync(root)) {
    if (name.startsWith(".")) continue;
    const fullPath = join(root, name);
    try {
      if (statSync(fullPath).isDirectory() && existsSync(join(fullPath, "SKILL.md"))) {
        entries.push({ name, path: fullPath });
      }
    } catch {
      // Permission error or dangling symlink -- skip.
    }
  }
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

function getSourceRoot(): string {
  const { skillSourceRoot } = getPreferenceValues<Preferences>();
  return skillSourceRoot || DEFAULT_SOURCE_ROOT;
}

function getGeminiRoot(): string {
  const { geminiSkillRoot } = getPreferenceValues<Preferences>();
  return geminiSkillRoot || DEFAULT_GEMINI_ROOT;
}

function syncDirectory(src: string, dest: string): number {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  let count = 0;
  for (const entry of readdirSync(src)) {
    if (entry.startsWith(".")) continue;
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);

    if (statSync(srcPath).isDirectory()) {
      count += syncDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function clearDirectory(dir: string): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

// ===========================================================================
// Main view: source skills list with sync actions
// ===========================================================================

export default function SwitchSkill() {
  const [searchText, setSearchText] = useState("");

  const sourceRoot = getSourceRoot();
  const geminiRoot = getGeminiRoot();
  const sourceSkills = discoverSkills(sourceRoot);
  const geminiSkills = discoverSkills(geminiRoot);

  const trimmedSearch = searchText.trim();
  const isCustomPath =
    trimmedSearch !== "" &&
    !sourceSkills.some((s) => s.path === trimmedSearch) &&
    !geminiSkills.some((s) => s.path === trimmedSearch);

  async function handleSync(source: SkillEntry, dest: SkillEntry) {
    if (source.path === dest.path) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Source and destination are the same",
      });
      return;
    }

    const confirmed = await confirmAlert({
      title: `Sync "${source.name}" → "${dest.name}"`,
      message:
        `Overwrite all files in:\n${dest.path}\n\nwith files from:\n${source.path}`,
      primaryAction: { title: "Sync" },
    });
    if (!confirmed) return;

    try {
      if (existsSync(dest.path)) {
        clearDirectory(dest.path);
      }
      const count = syncDirectory(source.path, dest.path);
      await setActiveSkillPath(source.path);
      await showHUD(`Synced ${count} files: ${source.name} → ${dest.name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await showToast({ style: Toast.Style.Failure, title: "Sync failed", message });
    }
  }

  function buildCustomEntry(): SkillEntry {
    return {
      name: basename(trimmedSearch) || "custom",
      path: trimmedSearch,
    };
  }

  return (
    <List
      searchBarPlaceholder="Type a custom path..."
      onSearchTextChange={setSearchText}
    >
      <List.Section title="Source Skills" subtitle={sourceRoot}>
        {sourceSkills.map((entry) => (
          <SourceItem
            key={entry.path}
            entry={entry}
            geminiSkills={geminiSkills}
            onSync={handleSync}
          />
        ))}
      </List.Section>

      <List.Section title="Gemini CLI Skills" subtitle={geminiRoot}>
        {geminiSkills.map((entry) => (
          <List.Item
            key={entry.path}
            title={entry.name}
            subtitle={entry.path}
            icon={Icon.HardDrive}
            accessories={[{ tag: { value: "Destination", color: Color.Blue } }]}
          />
        ))}
      </List.Section>

      {isCustomPath && existsSync(trimmedSearch) && (
        <List.Section title="Custom Path">
          <SourceItem
            entry={buildCustomEntry()}
            geminiSkills={geminiSkills}
            isCustom
            onSync={handleSync}
          />
        </List.Section>
      )}
    </List>
  );
}

// ---------------------------------------------------------------------------
// Source skill list item with destination submenu
// ---------------------------------------------------------------------------

function SourceItem({
  entry,
  geminiSkills,
  isCustom = false,
  onSync,
}: {
  entry: SkillEntry;
  geminiSkills: SkillEntry[];
  isCustom?: boolean;
  onSync: (source: SkillEntry, dest: SkillEntry) => Promise<void>;
}) {
  const pathExists = existsSync(entry.path);
  const tag = !pathExists
    ? { value: "Not found", color: Color.Red }
    : isCustom
      ? { value: "Custom", color: Color.Orange }
      : { value: "Source", color: Color.Green };

  return (
    <List.Item
      title={entry.name}
      subtitle={entry.path}
      icon={isCustom ? Icon.Plus : Icon.Document}
      accessories={[{ tag }]}
      actions={
        pathExists ? (
          <ActionPanel>
            {geminiSkills.length === 1 ? (
              <Action
                title={`Sync to ${geminiSkills[0].name}`}
                icon={Icon.ArrowRight}
                onAction={() => onSync(entry, geminiSkills[0])}
              />
            ) : (
              <ActionPanel.Submenu title="Sync to..." icon={Icon.ArrowRight}>
                {geminiSkills.map((dest) => (
                  <Action
                    key={dest.path}
                    title={dest.name}
                    icon={Icon.HardDrive}
                    onAction={() => onSync(entry, dest)}
                  />
                ))}
              </ActionPanel.Submenu>
            )}
          </ActionPanel>
        ) : undefined
      }
    />
  );
}
