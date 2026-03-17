import { getPreferenceValues } from "@raycast/api";
import { exec as execCallback } from "child_process";
import { unlinkSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

import { loadSkillPrompt } from "./skill-loader";

const execAsync = promisify(execCallback);

const TIMEOUT_MS = 60_000;
const MAX_BUFFER_BYTES = 1024 * 1024;

interface ExecError extends NodeJS.ErrnoException {
  stderr?: string;
  killed?: boolean;
}

interface Preferences {
  geminiPath?: string;
}

function resolveGeminiPath(): string {
  const { geminiPath } = getPreferenceValues<Preferences>();
  return geminiPath || "gemini";
}

/**
 * Sends text to Gemini CLI for refinement using the active skill as the
 * system prompt.
 *
 * Writes two temp files: one for the GEMINI_SYSTEM_MD system prompt and one
 * for the user's text (piped via stdin). Uses a login shell to inherit the
 * user's PATH so that Gemini CLI is discoverable regardless of install method.
 */
export async function refineText(
  text: string,
  tone = "professional",
  context = "general",
): Promise<string> {
  const geminiPath = resolveGeminiPath();
  const systemPrompt = await loadSkillPrompt();

  const timestamp = Date.now();
  const systemFilePath = join(tmpdir(), `refine-system-${timestamp}.md`);
  const userFilePath = join(tmpdir(), `refine-user-${timestamp}.txt`);

  const userPrompt =
    `Tone: ${tone}\nContext: ${context}\n\nRewrite the following text:\n\n${text}`;

  writeFileSync(systemFilePath, systemPrompt, "utf-8");
  writeFileSync(userFilePath, userPrompt, "utf-8");

  try {
    const { stdout, stderr } = await execAsync(
      buildShellCommand(),
      {
        timeout: TIMEOUT_MS,
        maxBuffer: MAX_BUFFER_BYTES,
        env: {
          ...process.env,
          SYSTEM_FILE: systemFilePath,
          USER_FILE: userFilePath,
          GEMINI_BIN: geminiPath,
        },
      },
    );

    const result = stdout.trim();
    if (!result) {
      const detail = stderr ? `\n\nstderr: ${stderr}` : "";
      throw new Error(`Gemini returned an empty response.${detail}`);
    }
    return result;
  } catch (error: unknown) {
    throw toUserFacingError(error as ExecError);
  } finally {
    cleanupFile(systemFilePath);
    cleanupFile(userFilePath);
  }
}

/**
 * Builds the shell command that pipes the user's text into Gemini CLI
 * with GEMINI_SYSTEM_MD set to the skill system prompt file.
 *
 * Uses `/bin/zsh -l` (login shell) so nvm, homebrew, volta, etc. are on PATH.
 * All dynamic paths are injected via env vars to avoid shell-escaping issues.
 */
function buildShellCommand(): string {
  const instruction =
    "Rewrite the text from stdin following the system instructions " +
    "and the requested tone/context. Output ONLY the refined text.";
  return (
    `/bin/zsh -lc 'cat "$USER_FILE" | ` +
    `GEMINI_SYSTEM_MD="$SYSTEM_FILE" "$GEMINI_BIN" ` +
    `-p "${instruction}"'`
  );
}

/** Converts a raw exec error into a user-friendly message. */
function toUserFacingError(error: ExecError): Error {
  const stderr = error.stderr ?? "";

  if (stderr.includes("command not found") || stderr.includes("not found")) {
    return new Error(
      "Gemini CLI not found. Install it with:\n\n" +
        "  npm install -g @google/gemini-cli\n\n" +
        "Or set the full path in Refine Writing extension preferences.",
    );
  }
  if (error.killed) {
    return new Error(
      `Gemini CLI timed out after ${TIMEOUT_MS / 1000} seconds. ` +
        "The text might be too long, or the network is slow.",
    );
  }
  if (stderr.includes("auth") || stderr.includes("login")) {
    return new Error(
      "Gemini CLI authentication failed. " +
        "Run `gemini` in your terminal to authenticate first.",
    );
  }

  return new Error(
    `Gemini CLI error: ${stderr || error.message || "Unknown error"}`,
  );
}

function cleanupFile(path: string): void {
  try {
    unlinkSync(path);
  } catch {
    // Best-effort cleanup; temp files are ephemeral.
  }
}
