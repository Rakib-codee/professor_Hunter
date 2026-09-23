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

## 7. Typography, revised (proposal, not yet implemented)

Pass 2 shipped one family (Source Sans 3) and let layout carry hierarchy. That keeps the page calm but gives it no voice, and with no images and a deliberately flat palette, type is the only element left that can. This section replaces §2's single-family plan with two families in clearly different roles. The three constraints hold: Latin sits beside system CJK on every record (so no serif), the webfont budget stays at 40–60 KB Latin-only, and body text stays highly legible on cheap Android screens for non-native readers.

### 7.1 The faces, and why not the obvious ones

**Display: Archivo, weight 700, in two widths (normal and Expanded).** A grotesque descended from late-19th-century American job-printing type by way of Omnibus-Type's Chivo: squarish bowls, flat horizontal terminals, a tall x-height and tight apertures. At 24 px and above it has a physical, set-in-metal presence that neutral neo-grotesques deliberately avoid. Two properties make it right for this product rather than merely distinctive:

- Its width axis is a second voice inside one family. **Archivo Expanded** at the same weight sets the large numerals (738 professors, the picker counts) as wide, planted figures, which is how registry ledgers and stamped records present a count. No second display family is needed.
- Its x-height (about 0.55 em) is close to the visual mass of a CJK ideograph at the same size, so `Chen Jun 陈军` reads as one line, not a bold Latin word with a lighter Chinese afterthought. Low-x-height grotesques (Helvetica-likes) make the ideographs look oversized next to them.

**Text: Source Sans 3, weights 400 and 600, unchanged.** Kept precisely because of the CJK constraint: it is the Latin companion of Source Han Sans, the design Android ships as Noto Sans CJK and that PingFang closely matches. Body lines mixing English and a Chinese name are set in matched designs. It is also one of the most legible humanist faces at 16 px on low-density screens: open apertures, clear a/g/l/1 distinctions, generous spacing.

Why not the defaults:

- _Inter, Geist, system-ui:_ neutral by design; they are the house style of every dashboard built since 2020, which is exactly the "generic SaaS" read the brief rejects. Their low-contrast, wide-set letterforms also spend horizontal space the 375 px headline does not have.
- _Helvetica / Arial:_ small x-height beside CJK, and the "no character" problem twice over.
- _Schibsted Grotesk, Instrument Sans, Familjen Grotesk_ (the closest alternatives): measured Latin subsets at 700 are 25, 17 and 12 KB. Each is a fine display face, but none has a width axis, so the big counts would need either a third file or fake width. Archivo gives both voices for 28 KB.

Budget, measured from Google Fonts' Latin-subset woff2 files: Source Sans 3 400 (15 KB) + 600 (15 KB) + Archivo 700 (14 KB) + Archivo Expanded 700 (14 KB) = **58 KB**. Loaded through next/font with metric-matched fallbacks, so nothing shifts while they arrive. Archivo is never loaded below 700 and never used below 20 px, so one weight is enough.

### 7.2 Scale

Two columns of sizes: 375 px / 1440 px. Line-height as a ratio. Tracking only where noted.

| Role                   | Face and weight      | 375 px    | 1440 px   | Notes                                                                    |
| ---------------------- | -------------------- | --------- | --------- | ------------------------------------------------------------------------ |
| Landing headline       | Archivo 700          | 40 / 1.05 | 64 / 1.0  | letter-spacing −0.02 em; `text-wrap: balance`                            |
| Hero figures (738, 34) | Archivo Expanded 700 | 36 / 1.0  | 56 / 1.0  | tabular; label under in Meta                                             |
| Page title             | Archivo 700          | 28 / 1.1  | 36 / 1.1  | e.g. `Civil Engineering`, `My tracker`                                   |
| Major picker row       | Archivo 700          | 24 / 1.15 | 32 / 1.1  | count in Archivo Expanded 700, 22 / 28, Ink                              |
| Professor name, page   | Archivo 700          | 30 / 1.1  | 40 / 1.05 | `name_cn` follows at 0.9× in the CJK stack, 400, Slate                   |
| Professor name, list   | Archivo 700          | 20 / 1.2  | 22 / 1.2  | `name_cn` at 0.9×, 400, Slate                                            |
| Section heading        | Archivo 700          | 20 / 1.2  | 24 / 1.2  | `Research area`, `Send it`, `Follow-ups due`                             |
| Body                   | Source Sans 3 400    | 16 / 1.5  | 16 / 1.5  | legal pages 17 / 1.55 at 1440                                            |
| Body strong            | Source Sans 3 600    | 16 / 1.5  | 16 / 1.5  | labels, university name in a record                                      |
| Controls               | Source Sans 3 600    | 15 / 1    | 16 / 1    | buttons, nav, form labels, tabs                                          |
| Meta                   | Source Sans 3 400    | 13 / 1.4  | 14 / 1.4  | dates, email type, counts in sentences, footnotes; tabular where numeric |
| Chip                   | Source Sans 3 400    | 13 / 1    | 14 / 1    | tag chips, filters in effect                                             |

Nothing else exists. Two display sizes per screen at most (one title, one row or name size), so the display face reads as structure, not decoration.

### 7.3 Display type as an active element

Three places carry the design; everywhere else the display face is absent.

1. **The major picker** is the landing page's hero and the `/find` page in full. Each row becomes a single Archivo line at 24 / 32 px with its count set in Archivo Expanded at 22 / 28 px, in Ink, right-aligned on the same baseline, tabular. The row height grows to 72 px on phones and 88 px on desktop. Three rows fill the first viewport on a phone with nothing else needed. The count is not decoration: it is the one fact a student wants before tapping.
2. **Professor names** are the only bold thing in a record. Archivo 700 at 20 px in the ledger, 30 px on the record sheet, with the Chinese name at 0.9× in the system CJK stack, regular weight, Slate. The rest of the record stays Source Sans. Scanning a list of forty records becomes scanning forty names, which is how people actually browse a faculty page.
3. **The big counts** on the landing page: `738` and `34` set in Archivo Expanded at 36 / 56 px with `professors` and `universities` as Meta labels beneath, replacing the number-in-a-sentence. The tracker summary (`7 sent, 1 waiting…`) and the admin stat tiles use the same figure style at 28 px. Numbers are the product's proof of seriousness; setting them large and wide says so without a single adjective.

### 7.4 How Archivo sits beside the CJK stack

- **Size.** Ideographs are drawn to fill the em; Latin capitals reach about 0.7 em. At equal size a Chinese name looks larger and heavier than the Latin one beside it. Body text keeps §2's rule (CJK one step up, 1.0625×) because Source Sans is small on the body. Display names invert it: the Chinese name is set at 0.9× of the Archivo size, so `Chen Jun` at 20 px pairs with `陈军` at 18 px, and their visual heights match.
- **Weight.** Archivo 700 against CJK regular (400) is deliberate. Android phones ship Noto Sans CJK in Regular only (Bold arrives in newer builds and iOS has Medium/Semibold), so a bold CJK request would render inconsistently across devices. The regular Chinese name in Slate next to the bold Ink Latin name reads as a consistent secondary, on every device, rather than as a random weight change.
- **Baseline and gap.** Both names sit on one baseline (`align-items: baseline`) with a 0.4 em gap; the CJK span carries `lang="zh-Hans"` so the browser picks Simplified forms and the right system font.
- **x-height.** Archivo's tall x-height means the lowercase in `Chen Jun` carries mass at the same optical level as the ideographs' central strokes; with a low-x-height display face the Latin would look like a caption to the Chinese.

### 7.5 Where restraint applies

Body copy, forms, alerts, the draft editor, the tracker rows below the name, legal pages, the footer, admin tables and every button stay in Source Sans 3 exactly as shipped. Archivo never appears in a control, never below 20 px, never in a running sentence, and never in more than two sizes on one screen. Emphasis inside body text is Source Sans 600, not the display face. If a screen has no title and no name, it has no Archivo at all: login, signup, password reset and the legal pages keep their quiet 22 px Source Sans headings.
