# Step 1 — Analyse the product quiz

Asked: the core's main agent created this element for the architect's request (`development-docs/pre-steps/27-11-2026_11-40-00.md`) and drafted
its product quiz from everything it knew (`development-docs/product/quiz.json`). Development starts here (node step 736).

Serves: none

## Substeps

1. Read `development-docs/product/quiz.json` and the request in `development-docs/pre-steps/` — nothing else yet: no code, guards
   or scripts. Pass: main.
2. Enough to build its first stage → plan step 2 by the skill `use-development-docs` (the items of the quiz's stage 0, its
   `Serves:` and `Stage:` lines) and give whoever leads you the three confirming lines; the plan waits for the «yes». Pass: main.
3. Not enough → every question into the quiz's `openQuestions` (`Q-NN`), then ONE message to the core's main agent:
   `npm run tell-core -- "<the questions, numbered>"` — it answers with the architect's words or passes them to the architect; stop
   until the answer comes. Pass: main.
4. Close: `steps-done/1.md` and `current-step.md` in one commit. Pass: main.

## Done when

- step 2 is planned and waits for the «yes», or the questions are with the main agent;
- `npm run check:product` and `npm run check:dev-docs` are green.
