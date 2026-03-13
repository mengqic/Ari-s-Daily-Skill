---
name: rewrite-message
description: Rewrites the user's message to sound natural and native-like in English. Use when the user asks to "rewrite my message", "make this sound more natural", "polish my English", "improve how I said this", or wants to communicate more clearly with native speakers.
---

# Rewrite Message

Rewrites the user's draft message into natural, native-sounding English while preserving the original intent and tone.

## When to Apply

- User says "rewrite this", "make it sound natural", "polish my message", "fix my English"
- User pastes a message and asks for help communicating it better
- User wants to sound like a specific person or style

## Instructions

1. **Clarify first when needed**: If the message is unclear, confusing, ambiguous, or could be more concise, ask 1–3 focused follow-up questions before rewriting. Use the user's answers to refine the message. Do not guess or assume—ask.
2. **Express appreciation first when replying**: If the message is a comment, reply, or follow-up to someone else's message, open by acknowledging and thanking them for their question, feedback, contribution, or reach-out—then proceed to the main content. Keep it brief and genuine (e.g., "Thanks for sharing this!" / "Really appreciate the feedback!" / "Great question—").
3. **Preserve intent**: Keep the core meaning, request, or sentiment exactly as the user intended.
4. **Improve naturalness**: Fix awkward phrasing, unnatural word order, and non-idiomatic expressions.
5. **Match tone**: If the user specifies tone (e.g., professional, casual, friendly), apply it. Default to polite and clear.
6. **Use style samples**: If the user has provided samples in [samples.md](samples.md), mirror those patterns (sentence structure, phrasing, level of formality).
7. **Output format**:
   - Show the **rewritten message** first (ready to copy)
   - Optionally show 1–2 brief notes on what changed, if helpful

## Without Custom Samples

If no samples are configured, rewrite for:
- Clear, professional-but-warm tone
- Natural collocations (e.g., "look into it" not "investigate it" in casual contexts)
- Appropriate formality for the implied context (Slack vs email vs formal doc)

## With Custom Samples

If [samples.md](samples.md) exists and contains examples:
- Analyze sentence patterns, openings, closings, and level of formality
- Match that style in the rewrite
- Stay consistent with the sample voice

## Example

**Input (user):** "I want to ask my manager: Can you please check the report I sent yesterday? I need your feedback before the meeting."

**Output:**
```
Hi [Name], could you take a look at the report I sent yesterday when you have a moment? I'd really appreciate your feedback before the meeting. Thanks!
```

*Note: More casual and natural—"take a look" instead of "check", "when you have a moment" softens the request.*

**When to ask follow-up questions:** If the user writes something vague like "I need to tell them about the thing" or "Please fix the problem soon"—ask: Who is "them"? What thing? Which problem? What does "soon" mean? Use their answers to craft the rewritten message.

### Clarification example

**Input (unclear):** "I need to tell them about the thing we discussed and when."

**Agent asks:** "A couple quick questions so I can nail this: (1) Who are 'they'—your manager, the team, or someone else? (2) What 'thing'—the timeline change, the budget, or something else? (3) Preferred channel—Slack, email, or meeting?"

**User answers:** Manager, the timeline change, email.

**Output:** Rewritten message incorporating the answers, e.g. a concise email to the manager about the timeline change.

**When to ask follow-ups:** If the user writes something like "I need to tell them about the thing and the deadline" (vague), ask: "What exactly do they need to know? Is the deadline for them to respond, or for a deliverable? Who is 'them'?" Use their answers to craft a clear, refined message.

## When to Ask Follow-Up Questions

If the message is unclear, confusing, or too long, ask before rewriting. Example:

**Input (unclear):** "I need to tell them about the thing and the problem."

**Agent:** "A few quick questions so I can get this right: (1) Who is 'them'—your manager, the team, or someone else? (2) What is 'the thing'? (3) What problem occurred?" 

After the user answers, use those details to craft the rewritten message.

### When to Ask Follow-ups

**Input (unclear):** "I need to tell them about the thing and when we can do it."

**Agent asks:** "A few quick questions so I can get this right: (1) Who are 'they'—a specific person or team? (2) What is 'the thing'—a deadline, a project update, or something else? (3) What format will this be in (Slack, email, meeting)?"

**After user answers:** Use their answers to craft a clear, refined message.

**When to ask follow-up questions:**

| Situation | Example follow-up |
|-----------|-------------------|
| Unclear intent | "Are you asking for approval, or just keeping them in the loop?" |
| Missing context | "What's the deadline or urgency level?" |
| Too verbose | "What's the single most important thing you want them to do?" |
| Ambiguous recipient | "Is this for your manager or the whole team?" |

## When to Ask Follow-ups

**Input (unclear):** "Can you help with the thing? Need it soon."

**Agent asks:** "A few quick questions so I can phrase this well: (1) What is 'the thing'—a task, document, or something else? (2) Who are you asking—a teammate, manager? (3) What does 'soon' mean for you—today, this week?"

**After user answers:** Rewrite using their clarification, then show the polished message.

## Clarification Example

**Input (unclear):** "I need to tell them about the thing and when it will be done."

**Agent asks:** "A few quick questions so I can get this right: (1) Who are 'they'—your manager, a client, or the team? (2) What is 'the thing'—a deliverable, a bug fix, or something else? (3) Do you have a specific deadline or timeframe in mind?"

**User answers:** Manager, the Q2 report, and by Friday EOD.

**Output:**
```
Hi [Name], just a quick update: I'm aiming to have the Q2 report done by end of day Friday. I'll let you know if anything changes.
```

## Clarification Example

**Input (ambiguous):** "I need to tell them about the thing and when it will be ready."

**Agent asks:** "A few quick questions so I can nail this: (1) Who is 'them'—your manager, the team, or a client? (2) What is 'the thing'—a feature, report, or something else? (3) Do you have a specific deadline or is it still uncertain?"

**User answers:** Manager, the Q2 roadmap, and we're targeting end of March.

**Output:**
```
Hi [Name], quick update: I'm working on the Q2 roadmap and aiming to have it ready by end of March. I'll share it as soon as it's done.
```

**When to ask follow-up questions:**

- *Unclear:* "I need to talk about the thing" → Ask: "What specific topic or issue do you want to discuss?"
- *Ambiguous:* "Let's do it tomorrow" → Ask: "What action or meeting are you referring to?"
- *Too verbose:* Long rambling message → Ask: "What's the main point or ask you want them to take away?"

## Clarification Example

**Input (unclear):** "I need to tell them about the thing we discussed and the problem."

**Agent asks:** A few quick questions so I can nail this: (1) Who is "them"—your manager, the team, or someone else? (2) What "thing" did you discuss? (3) What problem—and do you need help, or are you just updating them?

**User answers:** My manager. We discussed the Q3 timeline. The problem is we might miss the deadline—I want to flag it and ask for more resources.

**Output (refined):**
```
Hi [Name], following up on our Q3 timeline discussion. I'm concerned we might miss the deadline and wanted to flag it early. Could we chat about potentially bringing in more resources? Happy to jump on a call whenever works for you.
```

## Clarification Example

**Input (user):** "Tell them about the thing and when we need it."

**Agent:** To rewrite this clearly, I need a bit more context: (1) Who is "them"? (2) What is "the thing"—a report, a decision, a deliverable? (3) What is the deadline or timeline?

**User provides answers.**

**Agent:** [Produces refined message using the clarification.]
