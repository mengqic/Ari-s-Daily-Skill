/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Tone - The default tone to use when refining text. */
  "defaultTone": "professional" | "casual" | "formal" | "friendly" | "concise" | "empathetic" | "softened",
  /** Gemini CLI Path - Path to the gemini CLI binary. Leave empty to use the default. */
  "geminiPath": string,
  /** Default Skill Folder - Path to the default skill folder containing SKILL.md. Can be overridden at runtime via Switch Skill Source. */
  "skillPath": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `refine-with-options` command */
  export type RefineWithOptions = ExtensionPreferences & {}
  /** Preferences accessible in the `switch-skill` command */
  export type SwitchSkill = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `refine-with-options` command */
  export type RefineWithOptions = {}
  /** Arguments passed to the `switch-skill` command */
  export type SwitchSkill = {}
}

