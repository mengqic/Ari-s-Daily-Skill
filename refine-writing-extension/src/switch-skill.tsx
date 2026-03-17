import {
  Action,
  ActionPanel,
  Color,
  getPreferenceValues,
  Icon,
  List,
  showHUD,
  showToast,
  Toast,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { existsSync } from "fs";

import {
  getActiveSkillName,
  getActiveSkillPath,
  setActiveSkillPath,
} from "./lib/skill-loader";

interface SkillEntry {
  name: string;
  path: string;
}

interface Preferences {
  skillPath?: string;
}

/** Well-known skill folders shipped with this extension. */
const KNOWN_SKILLS: readonly SkillEntry[] = [
  {
    name: "rewrite-message",
    path: "/Users/huayumochi/skills/Ari-s-Daily-Skill/rewrite-message",
  },
  {
    name: "message-rewriter",
    path: "/Users/huayumochi/message-rewriter",
  },
];

/**
 * Lets the user pick which skill folder drives the rewriting logic.
 *
 * Shows a list of known skills with a checkmark on the active one.  The
 * search bar doubles as a custom-path input: type any absolute path and it
 * appears as a selectable option validated against the filesystem.
 */
export default function SwitchSkill() {
  const [activePath, setActivePathState] = useState("");
  const [skillName, setSkillName] = useState("");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    (async () => {
      setActivePathState(await getActiveSkillPath());
      setSkillName(await getActiveSkillName());
    })();
  }, []);

  const allSkills = buildSkillList();
  const trimmedSearch = searchText.trim();
  const isCustomPath =
    trimmedSearch !== "" && !allSkills.some((s) => s.path === trimmedSearch);

  async function selectSkill(entry: SkillEntry) {
    if (!existsSync(entry.path)) {
      await showToast({
        style: Toast.Style.Failure,
        title: "Folder not found",
        message: entry.path,
      });
      return;
    }
    await setActiveSkillPath(entry.path);
    setActivePathState(entry.path);
    setSkillName(entry.name);
    await showHUD(`Switched to: ${entry.name}`);
  }

  return (
    <List
      searchBarPlaceholder="Enter a custom skill folder path..."
      onSearchTextChange={setSearchText}
      navigationTitle={`Active: ${skillName}`}
    >
      <List.Section title="Known Skills">
        {allSkills.map((entry) => (
          <SkillListItem
            key={entry.path}
            entry={entry}
            isActive={activePath === entry.path}
            onSelect={selectSkill}
          />
        ))}
      </List.Section>

      {isCustomPath && (
        <List.Section title="Custom Path">
          <SkillListItem
            entry={{
              name: trimmedSearch.split("/").pop() ?? "custom",
              path: trimmedSearch,
            }}
            isActive={false}
            isCustom
            onSelect={selectSkill}
          />
        </List.Section>
      )}
    </List>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Merges known skills with the preference-configured path (if unique). */
function buildSkillList(): SkillEntry[] {
  const skills = [...KNOWN_SKILLS];
  const { skillPath } = getPreferenceValues<Preferences>();

  if (skillPath && !skills.some((s) => s.path === skillPath)) {
    skills.push({
      name: skillPath.split("/").pop() ?? "custom",
      path: skillPath,
    });
  }
  return skills;
}

function SkillListItem({
  entry,
  isActive,
  isCustom = false,
  onSelect,
}: {
  entry: SkillEntry;
  isActive: boolean;
  isCustom?: boolean;
  onSelect: (entry: SkillEntry) => Promise<void>;
}) {
  const pathExists = existsSync(entry.path);

  function accessoryTag(): { value: string; color: Color } | undefined {
    if (isActive) return { value: "Active", color: Color.Green };
    if (!pathExists) return { value: "Not found", color: Color.Red };
    if (isCustom && pathExists) return { value: "Valid", color: Color.Green };
    return undefined;
  }

  const tag = accessoryTag();

  return (
    <List.Item
      title={entry.name}
      subtitle={entry.path}
      icon={isActive ? Icon.CheckCircle : isCustom ? Icon.Plus : Icon.Circle}
      accessories={tag ? [{ tag }] : []}
      actions={
        <ActionPanel>
          <Action
            title="Use This Skill"
            icon={Icon.CheckCircle}
            onAction={() => onSelect(entry)}
          />
        </ActionPanel>
      }
    />
  );
}
