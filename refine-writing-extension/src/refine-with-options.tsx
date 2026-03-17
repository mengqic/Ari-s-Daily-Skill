import {
  Action,
  ActionPanel,
  Clipboard,
  Detail,
  Form,
  getPreferenceValues,
  getSelectedText,
  Icon,
  List,
  showToast,
  Toast,
  useNavigation,
} from "@raycast/api";
import { useState } from "react";
import { usePromise } from "@raycast/utils";

import { refineText } from "./lib/gemini";
import { getActiveSkillName } from "./lib/skill-loader";

interface Preferences {
  defaultTone: string;
}

const CLIPBOARD_HISTORY_DEPTH = 30;

const TONE_OPTIONS = [
  { value: "professional", title: "Professional (warm)" },
  { value: "casual", title: "Casual" },
  { value: "formal", title: "Formal" },
  { value: "friendly", title: "Friendly" },
  { value: "concise", title: "Concise (BLUF)" },
  { value: "empathetic", title: "Empathetic" },
  { value: "softened", title: "Softened" },
] as const;

const CONTEXT_OPTIONS = [
  { value: "general", title: "General" },
  { value: "slack", title: "Slack" },
  { value: "email", title: "Email" },
  { value: "document", title: "Document" },
] as const;

function toneTitle(value: string): string {
  return TONE_OPTIONS.find((o) => o.value === value)?.title ?? value;
}

function contextTitle(value: string): string {
  return CONTEXT_OPTIONS.find((o) => o.value === value)?.title ?? value;
}

interface TextSource {
  id: string;
  title: string;
  text: string;
  section: "selection" | "clipboard";
  icon: Icon;
  accessory?: string;
}

async function loadTextSources(): Promise<TextSource[]> {
  const sources: TextSource[] = [];

  try {
    const text = await getSelectedText();
    if (text.trim()) {
      sources.push({
        id: "selection",
        title: "Current Selection",
        text,
        section: "selection",
        icon: Icon.Text,
      });
    }
  } catch {
    // No selection available.
  }

  for (let offset = 0; offset < CLIPBOARD_HISTORY_DEPTH; offset++) {
    try {
      const { text } = await Clipboard.read({ offset });
      if (text?.trim()) {
        sources.push({
          id: `clip-${offset}`,
          title: offset === 0 ? "Latest copy" : `Copy #${offset + 1}`,
          text,
          section: "clipboard",
          icon: Icon.Clipboard,
          accessory: offset === 0 ? "Most recent" : `${offset + 1} copies ago`,
        });
      }
    } catch {
      break;
    }
  }

  return sources;
}

function truncateLine(value: string, maxLength: number): string {
  const oneLine = value.replace(/\n/g, " ").trim();
  if (oneLine.length <= maxLength) return oneLine;
  return `${oneLine.slice(0, maxLength)}…`;
}

// ===========================================================================
// View 1: Clipboard source picker
// ===========================================================================

export default function RefineWithOptions() {
  const { data: sources, isLoading } = usePromise(loadTextSources);
  const { push } = useNavigation();

  const selectionItems = sources?.filter((s) => s.section === "selection") ?? [];
  const clipboardItems = sources?.filter((s) => s.section === "clipboard") ?? [];

  function openRefineView(text: string) {
    push(<RefineView initialText={text} />);
  }

  return (
    <List isLoading={isLoading} isShowingDetail>
      {selectionItems.length > 0 && (
        <List.Section title="Selected Text">
          {selectionItems.map((item) => (
            <List.Item
              key={item.id}
              title={item.title}
              icon={item.icon}
              detail={<List.Item.Detail markdown={item.text} />}
              actions={
                <ActionPanel>
                  <Action
                    title="Refine This Text"
                    icon={Icon.Wand}
                    onAction={() => openRefineView(item.text)}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {clipboardItems.length > 0 && (
        <List.Section title="Clipboard History">
          {clipboardItems.map((item) => (
            <List.Item
              key={item.id}
              title={item.title}
              subtitle={truncateLine(item.text, 60)}
              icon={item.icon}
              accessories={item.accessory ? [{ text: item.accessory }] : []}
              detail={<List.Item.Detail markdown={item.text} />}
              actions={
                <ActionPanel>
                  <Action
                    title="Refine This Text"
                    icon={Icon.Wand}
                    onAction={() => openRefineView(item.text)}
                  />
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}
    </List>
  );
}

// ===========================================================================
// View 2: Chat-like refinement session (Detail + Cmd+E to edit)
// ===========================================================================

interface HistoryEntry {
  input: string;
  tone: string;
  context: string;
  result: string;
}

function RefineView({ initialText }: { initialText: string }) {
  const { defaultTone } = getPreferenceValues<Preferences>();
  const { data: skillName } = usePromise(getActiveSkillName);

  const [currentText, setCurrentText] = useState(initialText);
  const [tone, setTone] = useState(defaultTone);
  const [context, setContext] = useState("general");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isRefining, setIsRefining] = useState(false);

  const latestResult = history.length > 0 ? history[history.length - 1].result : null;

  async function handleRefine() {
    setIsRefining(true);
    try {
      const result = await refineText(currentText, tone, context);
      setHistory((prev) => [...prev, {
        input: currentText,
        tone,
        context,
        result,
      }]);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await showToast({ style: Toast.Style.Failure, title: "Refinement failed", message });
    } finally {
      setIsRefining(false);
    }
  }

  function useResultAsInput() {
    if (latestResult) {
      setCurrentText(latestResult);
    }
  }

  // Build chat markdown: latest refinement on top, input at bottom
  const sections: string[] = [];

  if (isRefining) {
    sections.push("*Refining with Gemini...*");
  }

  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    sections.push(
      `**#${i + 1}** — ${toneTitle(entry.tone)}, ${contextTitle(entry.context)}\n\n${entry.result}`,
    );
  }

  sections.push(`**Input:**\n\n${currentText}`);

  const markdown = sections.join("\n\n---\n\n");

  return (
    <Detail
      isLoading={isRefining}
      markdown={markdown}
      navigationTitle={skillName ? `Skill: ${skillName}` : "Refine Writing"}
      metadata={
        <Detail.Metadata>
          <Detail.Metadata.Label title="Tone" text={toneTitle(tone)} />
          <Detail.Metadata.Label title="Context" text={contextTitle(context)} />
          <Detail.Metadata.Label title="Refinements" text={String(history.length)} />
          {skillName && <Detail.Metadata.Label title="Skill" text={skillName} />}
        </Detail.Metadata>
      }
      actions={
        <ActionPanel>
          <Action
            title={latestResult ? "Refine Again" : "Refine"}
            icon={Icon.Wand}
            onAction={handleRefine}
          />
          {latestResult && (
            <>
              <Action.Paste
                title="Paste Latest"
                content={latestResult}
                shortcut={{ modifiers: ["cmd"], key: "return" }}
              />
              <Action
                title="Copy Latest"
                icon={Icon.Clipboard}
                shortcut={{ modifiers: ["cmd"], key: "c" }}
                onAction={async () => {
                  await Clipboard.copy(latestResult);
                  await showToast({ style: Toast.Style.Success, title: "Copied to clipboard" });
                }}
              />
              <Action
                title="Use Result as New Input"
                icon={Icon.ArrowRight}
                onAction={useResultAsInput}
                shortcut={{ modifiers: ["cmd"], key: "u" }}
              />
            </>
          )}
          <Action.Push
            title="Edit Text"
            icon={Icon.Pencil}
            shortcut={{ modifiers: ["cmd"], key: "e" }}
            target={<EditTextForm text={currentText} onSave={setCurrentText} />}
          />
          <ActionPanel.Submenu title="Change Tone" icon={Icon.SpeechBubble}>
            {TONE_OPTIONS.map((opt) => (
              <Action
                key={opt.value}
                title={opt.title}
                icon={opt.value === tone ? Icon.CheckCircle : Icon.Circle}
                onAction={() => setTone(opt.value)}
              />
            ))}
          </ActionPanel.Submenu>
          <ActionPanel.Submenu title="Change Context" icon={Icon.Envelope}>
            {CONTEXT_OPTIONS.map((opt) => (
              <Action
                key={opt.value}
                title={opt.title}
                icon={opt.value === context ? Icon.CheckCircle : Icon.Circle}
                onAction={() => setContext(opt.value)}
              />
            ))}
          </ActionPanel.Submenu>
          {history.length > 1 && (
            <ActionPanel.Submenu title="Copy Previous..." icon={Icon.List}>
              {history.map((entry, i) => (
                <Action
                  key={i}
                  title={`#${i + 1} — ${toneTitle(entry.tone)}, ${contextTitle(entry.context)}`}
                  icon={Icon.Clipboard}
                  onAction={async () => {
                    await Clipboard.copy(entry.result);
                    await showToast({ style: Toast.Style.Success, title: `Copied #${i + 1}` });
                  }}
                />
              ))}
            </ActionPanel.Submenu>
          )}
          <Action
            title="Reset"
            icon={Icon.Undo}
            onAction={() => {
              setCurrentText(initialText);
              setHistory([]);
            }}
            shortcut={{ modifiers: ["cmd", "shift"], key: "z" }}
          />
        </ActionPanel>
      }
    />
  );
}

// ===========================================================================
// Quick text editor (Cmd+E → edit → pop back)
// ===========================================================================

function EditTextForm({
  text,
  onSave,
}: {
  text: string;
  onSave: (newText: string) => void;
}) {
  const { pop } = useNavigation();

  function handleSubmit(values: { text: string }) {
    onSave(values.text);
    pop();
  }

  return (
    <Form
      navigationTitle="Edit Text"
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Save" icon={Icon.Check} onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.TextArea id="text" title="" defaultValue={text} />
    </Form>
  );
}
