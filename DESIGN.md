# Professor Hunter — visual design plan

Pass 1 (plan only). Nothing below is implemented yet. Pass 2 applies it across every existing page without changing routes, data, behaviour or copy meaning.

## Who this is for, and what the look must do

First-generation applicants from Bangladesh, Pakistan, Africa and Southeast Asia, non-native English, mostly on cheap Android phones over slow connections, anxious about a process with real consequences. The interface has one emotional job: make the student feel they are using a serious, honest academic record, and that they are capable of using it.

So the product should look like a **registry**, not a feed and not a startup. Every professor is a record with provenance. The most visible things on any screen are the evidence marks: when the record was checked, whether the email is a university address, and how we know the professor takes international students. Everything decorative is removed so those marks are what the eye lands on.

Tone in three words: **plain, exact, calm.**

## 1. Color

Six base values. One action colour. Status colours are reserved for evidence and never used for buttons, links or decoration.

| Name   | Hex       | Role                                                                                              |
| ------ | --------- | ------------------------------------------------------------------------------------------------- |
| Ink    | `#1C2331` | All body and heading text. Dark buttons where an action is neutral (Log out, Keep).               |
| Paper  | `#FFFFFF` | Page background. Records sit directly on paper, no cards.                                         |
| Ledger | `#F5F6F8` | Secondary surface: filter panel, record-sheet label column, field backgrounds (subject, dates).   |
| Rule   | `#D5D9E0` | Hairline dividers between records and sections. Decorative only, never a control border.          |
| Slate  | `#5A6472` | Secondary text, labels, icons. Also the border and text of "unknown" states.                      |
| Cobalt | `#2E4A8B` | The only action colour: primary buttons, links, focus ring, active filter chip, current nav item. |

Control borders (inputs, selects, checkboxes) use `#7F8896` so they meet the 3:1 non-text contrast rule; Rule does not.

No cream, no warm tint, no gradients, no shadows. Depth comes from rules and surface changes only.

### Badge states (the important part)

Three evidence levels for acceptance, each in its own colour family so they can never be confused at a glance, plus a plain "no". Text on its tint is ≥ 5.7:1 in every case.

| State         | Label (meaning unchanged)                      | Treatment                                                                                                |
| ------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| confirmed     | Accepts international students — official list | Solid `#166A44` fill, white text, check icon. The only filled badge in the product.                      |
| team-reported | Accepts international students — team-reported | `#7A5200` text on `#FBF1DC`, 1 px `#7A5200` border. Visibly softer than confirmed: tinted, not filled.   |
| unknown       | International acceptance unknown               | Slate text on Ledger, 1 px Slate border, no icon. Deliberately colourless so it never reads as positive. |
| no            | Not accepting international students           | `#9E3434` text on `#F9E8E8`, 1 px border.                                                                |

Today confirmed and team-reported are the same green (`components/professor/badges.tsx:13`). That is the first thing this redesign fixes.

Verification and email type are **provenance, not endorsement**, so they are never green:

- Checked date: Slate text, tabular figures, calendar icon. `Verified 22 Sep 2026`. Stale (over 12 months): same, plus a dashed 1 px border and the suffix `(may be outdated)` replacing today's ` · stale`.
- Email type: Slate text with a small university or person icon: `University email`, `Personal email`. `No email on file` is Slate on Ledger with a dashed border, in the same slot, so an absence is as visible as a presence.

## 2. Type

**One family: Source Sans 3** (weights 400 and 600, Latin subset, loaded through next/font with a metric-matched fallback so nothing shifts while it loads, about 40 KB). Chosen because it is the Latin companion of Source Han Sans, which is the same design Google ships as Noto Sans CJK on every Android phone and that Apple's PingFang closely matches. Latin and Chinese therefore sit on one line at the same visual weight instead of looking like two fonts glued together.

**Chinese names** (`name_cn`) never get the web font. They render in a dedicated stack, marked `lang="zh-Hans"` so the browser picks Simplified glyph forms:

```
"PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans SC", "Microsoft YaHei", sans-serif
```

No web CJK font is loaded (they are 2 to 15 MB). No serif anywhere: cheap Android phones have no CJK serif, and a serif Latin name next to a sans Chinese name looks broken.

Numbers that people compare (dates, counts, `3 of 30 reveals`, quotas) always use tabular figures.

Scale at 375 px, base 16 px, line-height 1.5 for reading and 1.2 for headings:

| Step    | Size / weight | Used for                                                |
| ------- | ------------- | ------------------------------------------------------- |
| Meta    | 13 / 400      | Verification dates, email type, counts, footnotes       |
| Body    | 16 / 400      | Everything readable: research areas, forms, legal pages |
| Name    | 18 / 600      | Professor name in lists; `name_cn` follows at 16 / 400  |
| Section | 20 / 600      | `Research area`, `Contact`, `Send it`                   |
| Page    | 26 / 600      | Page titles                                             |
| Display | 32 / 600      | Landing headline only, at 375 px; 40 on desktop         |

Chinese text gets one size step up at the same slot (17 for a 16 body) because CJK glyphs read smaller at equal em size.

## 3. Layout

Mobile-first at 375 px. Desktop is the same layout with more room, not a different one. Rectangular controls with 4 px corners, minimum 44 px tap height, full-width primary buttons on mobile. Content width 640 px for reading pages, 960 px for the browse page.

### The record strip (the one memorable detail)

Every professor, in a list or on their page, carries a **fixed three-slot evidence strip** in the same order every time:

```
[ Acceptance badge ]   [ Verified 22 Sep 2026 ]   [ University email ]
```

Same slots, same order, same position, on every record, including the empty states (`International acceptance unknown`, `Verification date not recorded`, `No email on file`). The student learns where to look once and never has to search for it again. At 375 px the strip wraps to two lines, but the order never changes.

### Landing (`/`)

The first viewport **is the tool**, not a hero. Headline (`Find a supervisor in China for your CSC application`, unchanged), the one-line subhead with the live counts, then the three majors as a full-width list with hairline rules: major name at Name size, `165 professors at 11 universities` at Meta size on the right. Tapping goes straight to the list. Below that, one trust line in Slate: `Data from public faculty pages. Every record shows when it was last checked.`

Second screen: a **real sample record**, rendered with the actual `ProfessorCard` component, with three short callouts pointing at the strip (checked date, email type, acceptance). This replaces the three feature cards: the product explains itself by showing one record. The three feature texts stay as the callouts' body copy.

Third screen: `How it works` as a numbered list of three sentences (create profile, draft, track), then the existing `Honest disclaimer` copy unchanged, set at Body size, not tucked away.

No images, no illustration, nothing above the fold that is not usable.

### Professor list (`/find/[major]`)

A **ledger**, not a card grid. Records are separated by 1 px Rule lines and are full-width tap targets; no boxes, no shadows. Each record, top to bottom:

1. `Huang Feng` at Name size, followed by `黄峰` in the CJK stack. No parentheses.
2. Title on its own line, Slate.
3. University, then school on the next line. No middle dots anywhere in the product; related facts get their own line or a label.
4. Research area, two-line clamp, Body size, Ink (it is the reason to tap, so it is not muted).
5. Tag chips.
6. The record strip.

The save heart stays top-right, 44 px target, Cobalt when saved (not red; red is reserved for "no" and destructive actions).

Tag filter: the chips currently wrap into ten rows on a phone and push the results below the fold. They become **one horizontally scrolling row** on mobile with a fade at the right edge, and wrap on desktop. The active chip is Cobalt fill with white text; inactive is Ink text with the control border. Sort order unchanged.

The filter panel (desktop sidebar, mobile sheet) sits on Ledger and keeps the tip text. The result line becomes `43 results` in Ink with the filters in effect listed under it as small removable chips.

### Professor page (`/professor/[id]`)

A **record sheet**. Name block first (name, `name_cn`, title). Then the record strip, full width, directly under the name, before anything else. Then a two-column definition list, label column on Ledger, a Rule under each row:

```
University        Beihang University
School            School of Transportation Science and Engineering
Province          Beijing
Research area     Civil / transportation engineering
Tags              [chips]
Source            soft.buaa.edu.cn  (external-link icon, never an arrow in text)
Last checked      22 Sep 2026
```

`Contact` and `Draft` form one section, pinned as a **bottom action bar on mobile** (Reveal email, Draft email) so the two real actions are in thumb reach without scrolling past the record. The reveal quota line (`3 of 30 reveals used today`) sits inside the bar at Meta size. The reply-rate sentence, when present, stays as body text above the bar. `Report a problem` stays a quiet text button at the end of the sheet.

### Draft page (`/professor/[id]/draft`)

Reads as **writing an email with the record beside you**. Desktop: record summary (name, strip, research area) in a narrow left column on Ledger, editor on the right. Mobile: a compact record header (name and strip only), then the editor.

The editor is laid out like a mail client: `Subject` as a single-line field on Ledger, `Email body` as a full-width text area in the same Source Sans (not monospace; monospace makes non-native writers feel they are editing code). The tone toggle is a two-segment control in Cobalt. The `Send it` box becomes the sticky bottom bar on mobile: Copy, Open in mail app, I sent this. Warnings keep their copy and render as one Slate-bordered note above the body, never as toasts.

### Tracker (`/tracker`)

A ledger like the list. Each row: name and university on line one, `Sent 12 Sep 2026` and `Replied 20 Sep 2026` as two small labelled values, status select, follow-up date, notes. Status finally gets colour, reusing the evidence families so the vocabulary stays consistent: replied-positive `#166A44`, conditional `#7A5200`, negative and bounced `#9E3434`, sent-waiting and no-reply Slate. A due follow-up gets a 3 px Cobalt rule on the left of the row and `due` in Cobalt, not red, because it is a prompt, not a failure. The summary becomes four labelled numbers in a row (`3 sent`, `1 waiting`, …) instead of a dot-joined sentence.

### Auth, onboarding, dashboard, profile, admin, legal

Same system, no special treatment: forms on Paper with Ledger field backgrounds, 44 px controls, one Cobalt primary per screen. The onboarding stepper becomes a three-segment progress bar (Cobalt for done and current, Rule for to-do) with the step names under it. The dashboard drops its three link cards for a short ledger of the same links with the live counts on the right. Admin keeps the same components at a denser 14 px meta size. Legal pages get the 640 px reading column and the 16 px body.

Header: one bar on every page, the current section underlined in Cobalt (there is no active state today), and a plain `Menu` button on mobile for the signed-in links. The footer disclaimer is unchanged, Body size, Slate.

## 4. Principles

1. **Evidence before everything.** The record strip is fixed, ordered and present on every record, including its empty states. Provenance is styled as neutral fact; only acceptance carries colour.
2. **A registry, not a feed.** Lists are ledgers with hairline rules. Boxes are used only where something is genuinely separate: a sheet, a dialog, a form section.
3. **One action colour.** Cobalt means "you can do this". Green, amber and red mean "this is what we know". They never swap roles.
4. **Latin and Chinese as equals.** One companion type family, correct language tagging, no serif, no web CJK download.
5. **Calm density for slow phones.** No images on the critical path, one 40 KB font, no shadows or blur, no motion beyond 150 ms colour changes, sheets respect reduced-motion, every layout reserves its space so nothing jumps while data streams in.
6. **The student is capable.** No exclamation marks, no coaching tone, no empty-state illustrations. Copy stays as written; the design gives it room.

## 5. Self-critique: what read as generic, and what changed

I wrote a first version of this plan and reviewed it against the list of things to avoid and against one question: would this plan fit any SaaS app? Six things failed and were changed.

1. **Cards everywhere.** The first draft kept the current rounded card for list items, dashboard links and landing features, with a soft shadow on hover. That is the default shadcn look, and it hides the evidence strip inside a box among boxes. Changed to ledger rows with hairline rules; cards remain only for sheets, dialogs and form sections.
2. **Green for both acceptance levels.** The first badge plan kept green for confirmed and team-reported, differentiated by an icon. Students do not notice icon differences, and it is exactly the current bug. Changed to a filled green versus a tinted amber outline, so evidence strength is the colour itself.
3. **A green "Verified" badge with a check.** It felt reassuring, which is the problem: a check mark makes a date look like an endorsement. Verification is provenance. Changed to Slate, tabular, with `(may be outdated)` for stale records instead of the current ` · stale`.
4. **A serif for professor names**, for academic gravity. Dropped: Android has no CJK serif, so `Huang Feng` in a serif beside `黄峰` in a sans looks like a rendering error on the primary device. One companion sans family instead, and the Chinese name gets its own language-tagged stack.
5. **Teal accent on a warm off-white page**, the first palette I reached for. It is the current industry default and warm cream reads as lifestyle, not record. Changed to Cobalt on pure Paper with a cool Ledger surface.
6. **Landing as hero plus three feature cards.** It describes the product instead of showing it. Changed to the major picker as the first viewport and a real rendered record as the explanation.

Also removed while reviewing: middle-dot joins in every meta string (they hide which facts belong together; each fact now gets a line or a label), the red saved-heart (red now means only "no" or "delete"), and monospace in the email body.

## 6. Out of scope for this pass

Dark mode (tokens exist but nothing enables them; this pass stays light-only), new copy, new routes, new data fields, and any change to what the badges mean.
