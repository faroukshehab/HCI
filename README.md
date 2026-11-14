# Brightpath

**AI-Powered Personalized Assessment and Learning Gap Detection for Children**

Brightpath is an interactive web prototype for primary school (Grades 1–5). Children work on paper and send a photo or scan. The teacher checks the scanned text, reviews suggested marks, decides which learning gaps and warning signs are real, and shares results with personal feedback. Students and parents then see only what the teacher approved.

The prototype addresses a gap found in our user research: grading paper work and spotting recurring mistakes takes teachers a lot of time, while young students get little personal feedback. Brightpath reduces routine grading work but keeps every decision with the teacher.

> **Prototype notice:** OCR (text recognition) and AI grading are **simulated**. Uploaded files are not read, and marks come from a rule-based check, not an AI model. See [Demo data and simulation limitations](#demo-data-and-simulation-limitations).

## Contents

- [Main features](#main-features)
- [Technology stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running locally](#running-locally)
- [Testing and checks](#testing-and-checks)
- [Using the application](#using-the-application)
- [Demo data and simulation limitations](#demo-data-and-simulation-limitations)
- [Project structure](#project-structure)
- [Known limitations](#known-limitations)
- [Team](#team)

## Main features

Features marked **(simulated)** imitate a real capability for the prototype.

### Student

- **Home dashboard:**
  - the latest grade and average;
  - something to work on, a mistake to watch, and extra help;
  - shortcuts to the student's work, results and help.
- **Upload work:** one or more photos or PDFs (JPG, PNG, PDF, up to 20 MB each, up to 10 files). Files are checked for type, size and empty content, with child-friendly error messages. Before sending, the student rates how sure they felt for each question.
- **My results:** only results the teacher has shared. Each shows:
  - the grade;
  - marks and teacher feedback for each question;
  - topics to keep practising;
  - the teacher's personal message;
  - "Get help with this question".
- **Notifications:** a bell with an unread count. Notification types are new and updated results, teacher replies, feedback, practice ideas and topics to review. Students can mark one or all as read, and opening a notification goes to the related page.
- **Get help:** a step-by-step help ladder (small hint → bigger hint → worked example using a different question → ask the teacher), in English and German. Hints never give the answer.

### Teacher

- **Review submissions:**
  - a queue with filters and search;
  - teachers can also upload a student's work themselves.
- **Grading review**, one question at a time:
  - the original work and the extracted text **(simulated OCR)**, with a certainty value and the words the scan was unsure about;
  - the expected answer and the marking criteria;
  - the suggested mark **(simulated AI)** next to the teacher's mark, with what was credited, missing or incorrect;
  - checks that flag uncertain, incomplete or questionable answers;
  - mark and feedback editing, explicit buttons to accept the AI mark or keep your own, and a history of every mark change.
- **Summary and publishing:**
  - an overview of the student's performance;
  - learning-gap and red-flag decisions (confirm or dismiss);
  - a personal message to the student.

  Publishing is blocked until every required check is done, and it needs a confirmation. Shared results can be reopened for correction; earlier versions are kept.
- **Students and profiles:** each student's results over time, topics, confidence, help used and support given.
- **Flagged students:** students who may need support, based only on shared results. One low mark alone never flags a student. The teacher can:
  - see the priority and status;
  - check the evidence behind each flag;
  - confirm, dismiss or resolve a flag;
  - add notes and record the support given;
  - compare results before and after that support.
- **Learning insights:**
  - class performance;
  - common learning gaps;
  - recurring mistakes;
  - students requiring attention;
  - recommended teaching actions;
  - topic, student, confidence and help-request views.
- **Create assessment:** a three-step builder (Details → Questions → Review and assign). It includes:
  - topic, difficulty and source filters;
  - adding, removing and reordering questions;
  - the **Difficulty Balancer**: target mix, suggestions with Accept and Dismiss, manual difficulty overrides;
  - a student preview;
  - saving, editing and deleting drafts;
  - assigning to several students with a due date and help settings.
- **Teacher-written questions:** the teacher sets the language, topic, difficulty, marks, expected answer, sample answer and marking criteria. Criteria support accepted phrases, part marks and wrong-idea caps. A "test the marking" box tries an answer before saving. Questions can be saved as a draft or as ready. Once students have answered a question it can only be duplicated, not edited.
- **Help requests:** see the help steps a student already used, and reply. The student is notified.
- **Send a message:** feedback, a practice recommendation or a request to review a topic, sent to one student's notifications.

### Parent (optional view)

- Read-only view of the child's shared results, progress by subject, teacher feedback and home practice ideas.
- Unshared results, AI suggestions, confidence data and teacher-only notes are never shown.

### Across the app

- **Student Confidence vs. Answer:** compares how sure a student felt with the mark. A pattern is reported only when the same signal appears in at least 2 answers from at least 2 assessments.
- **Languages:** the interface is in English; assessments, answers, hints and feedback work in English and German.
- **Feedback for actions:** success messages appear only after the change is saved, and failures show a clear error. Confirmation dialogs are used for publishing, reopening, assigning and deleting, and are protected against double clicks.
- **Page addresses:** hash routes such as `#/teacher/review/...`, so Back, Forward and reload work.

## Technology stack

Versions are those installed from `package.json` at the time of writing.

| Area | Technology |
|---|---|
| UI library | React 19.3 (with React DOM) |
| Language | TypeScript 5.9 (strict mode) |
| Build tool and dev server | Vite 8.3 with `@vitejs/plugin-react` 6.3 |
| Styling | Tailwind CSS 4.3 through `@tailwindcss/vite`, plus custom CSS design tokens in `src/index.css` |
| Formatting | oxfmt 0.2 |
| Storage | Browser `localStorage` (no backend) |

There are no other runtime dependencies.

## Prerequisites

- **Node.js 22.** This is the version pinned in `.mise.toml`; recent Node versions supported by Vite 8 should also work.
- **npm.** It comes with Node.js. The repository also contains a `pnpm-lock.yaml`, so pnpm 10 works as well.
- **A modern browser.** The app was developed and tested in Google Chrome.

No environment variables, API keys or accounts are needed.

## Installation

1. Clone the repository from https://github.com/faroukshehab/HCI.

   ```bash
   git clone https://github.com/faroukshehab/HCI.git
   ```

2. Enter the project folder.

   ```bash
   cd HCI
   ```

3. Install the dependencies.

   ```bash
   npm install
   ```

4. **Environment variables:** none are required. Optionally, `PORT` changes the port of the dev and preview servers (see below).

## Running locally

Start the development server:

```bash
npm run dev
```

- Open **http://localhost:8443** in your browser. Port 8443 is set in `vite.config.ts`.
- The server also listens on your local network address (`0.0.0.0`).
- The port is strict: if 8443 is already in use, the server stops with an error instead of picking another port. Choose a different port like this:

  ```bash
  PORT=3000 npm run dev
  ```

  Then open http://localhost:3000.

- Stop the server with **Ctrl + C** in the terminal.

To build and serve the production version locally:

```bash
npm run build
```

```bash
npm run preview
```

`npm run build` writes the optimized site to `dist/`. `npm run preview` serves it at **http://localhost:8443**; set `PORT` to change it.

## Testing and checks

### Checks you can run from `package.json`

| Command | What it does |
|---|---|
| `npx tsc --noEmit` | Type-checks all TypeScript in `src/` and `vite.config.ts` without writing files |
| `npm run build` | Builds the production version into `dist/`; fails if the code doesn't compile |
| `npm run format` | Formats the code with oxfmt (this changes files) |

```bash
npx tsc --noEmit
```

```bash
npm run build
```

`package.json` has **no `test` script**, so `npm test` is not available.

### Development test scripts (optional)

During development, a set of test scripts was used. They are **not included in this repository**:

- **`data/*.js`:** plain Node scripts that test the logic modules. Among other things they cover grading, publishing rules, saved-data migration, notifications, flags and the difficulty balancer.
- **`browser/enh-*.part.mjs`:** end-to-end scenarios that drive Google Chrome in headless mode against `npm run preview`, through the Chrome DevTools protocol. `browser/enh.sh <scenarios>` runs them.

They are also **not packaged as a ready-to-run test suite**:

- They contain absolute file paths from the development machine, which you must change at the top of `browser/check.sh`, `browser/enh.sh` and `browser/enh.mjs`.
- The browser scenarios need a local Google Chrome installation.
- `browser/check.sh` shows how the logic modules are compiled to CommonJS before the data scripts run.

In the last development run, all 19 data scripts and 682 browser checks passed (desktop, tablet and phone widths). That run was on the development machine, so treat it as a record, not a guarantee for your setup.

## Using the application

There is **no login**. Switch roles with **View as** (Teacher, Student or Parent) at the bottom of the sidebar. The demo shows a fictional Grade 4B class at "Greenwood Academy" with 18 students:
- Teacher: Ms. Raghda.
- Demo student: Omar Hassan.
- Parent: Omar's parent.

### Student view

1. Choose **View as › Student**.
2. **Home** shows "How you're doing" and the notification bell. The bell includes four predefined demo notifications, marked "Demo example".
3. **My work**: select **Send my work**, choose files or "Use a sample exam (demo)", rate how sure you felt for each question, confirm, and send.
4. **My results**: open a result to see marks, feedback and practice topics. The 72% "Fractions" result is predefined demo data.
5. **Get help**: choose an assessment and question, then go through the hints. "Ask my teacher" sends a question to the teacher.

### Teacher view and the main assessment workflow

1. Choose **View as › Teacher**.
2. **Review submissions**: open a submission marked "To review", or upload work with **Upload student work**.
3. For each question:
   - compare the original work with the extracted text;
   - correct the text if needed, then select **Text is correct · verify**;
   - check the suggested mark and "Why the AI suggests…";
   - set the mark and edit the feedback.
4. Open **Summary**: confirm or dismiss the learning gaps and red flags, and write a personal message.
5. Select **Review and publish** and confirm. The student is notified and can see the result. Use **Reopen to correct** to change a shared result.

### Additional features to explore (teacher)

- **Create assessment:** build an assessment in three steps, use the difficulty balance, add your own question, preview, save a draft and assign it.
- **Create assessment › My questions › Add a question:** write a question with its own marking criteria.
- **Flagged students** and **Learning insights:** support needs, class patterns and recommended actions.
- **Help requests:** reply to students' questions.

### Parent view

Choose **View as › Parent** to see Omar's shared results, teacher feedback and practice ideas (read-only).

### Resetting the demo

Open **How the demo works** in the sidebar and use **Reset demo data**. The current data is kept as a backup first.

## Demo data and simulation limitations

- **OCR is simulated.** Uploaded files are checked for type and size but **never read**. A predefined sample answer stands in for each question, sometimes with deliberate "scan mistakes" to correct. The app labels this as simulated OCR.
- **Grading is not a real AI model.** Suggested marks come from a deterministic rule-based checker (`src/grading.ts`). It matches the extracted text against each question's criteria, accepted phrases and known wrong ideas, in English and German. The teacher approves every mark.
- **Learning gaps, flags and insights are rules, not predictions.** They are calculated from teacher-approved marks with fixed thresholds (`src/support.ts`) and are labelled as indicators, not diagnoses.
- **No backend, no authentication.** All data is stored in the browser's `localStorage`, so it stays on one device and browser. Roles are switched freely for demonstration.
- **All people and records are synthetic,** including the parent view's data. Some records are explicitly predefined demo data and labelled "Demo example":
  - Omar's 72% fractions result;
  - his four sample notifications;
  - two support records on the Flagged students page.

## Project structure

```
.
├── index.html            HTML shell with the #root element
├── package.json          Scripts and dependencies
├── vite.config.ts        Vite config (React, Tailwind, dev-server port, Figma Make plugins)
├── .figma/make/site.json Site title and metadata used by vite.config.ts (required)
├── tsconfig.json         TypeScript settings
└── src/
    ├── main.tsx          Entry point: mounts <App /> and loads index.css
    ├── App.tsx           All screens and components for the three roles
    ├── index.css         Tailwind import and the Brightpath design system
    ├── assessmentData.ts Data model, demo data, saving/loading and migration, publishing rules
    ├── grading.ts        Simulated rule-based grader and marking criteria
    ├── demoAnswers.ts    Sample student answers used by the simulated OCR
    ├── review.ts         Grading checks and mark explanations for the teacher review
    ├── support.ts        Learning gaps, flagged students and class insights
    ├── notifications.ts  Student notifications
    ├── insights.ts       Confidence, difficulty balance and help-ladder helpers
    ├── helpContent.ts    Hints, examples and self-checks (English and German)
    ├── homeActivities.ts Home practice ideas for parents
    ├── routes.ts         Page addresses (hash routes)
    └── search.ts         Search helper (ignores case and accents)
```

The project was set up with Figma Make. `vite.config.ts` contains Figma Make helper plugins, and `.figma/make/site.json` must be present for the config to load.

## Known limitations

- **No real OCR or AI:** see above. Marking quality depends on the hand-written criteria for each question.
- **Data stays in one browser.** Clearing site data removes it; use Reset demo data to start over.
- **One demo student account.** Only Omar can be viewed in the student role, although the teacher sees all 18 students.
- **Interface language:** English only. Assessment content works in English and German.
- **Small screens:** on phones, the sidebar sits above the page rather than collapsing into a menu. Some wide tables and charts scroll sideways inside their own box.
- **Testing coverage:** browser testing was done in Google Chrome only. Safari, Firefox, screen readers (such as VoiceOver) and real phones were not tested.
- **Bundle size:** the production build is a single JavaScript file of about 0.65 MB (Vite shows a size warning).

## Team

| | |
|---|---|
| **Project** | AI-Powered Personalized Assessment and Learning Gap Detection for Children (Brightpath) |
| **Team** | AHMEDELDAFRAWY |
| **Course** | CSEN 909 – Human Computer Interaction |
| **University** | German University in Cairo (GUC) |
