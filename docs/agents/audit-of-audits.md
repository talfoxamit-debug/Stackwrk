# Agent prompt: the audit of the audits

> A reusable prompt for discovering this repo's defect families. Run it when enough audit and fix history has accumulated to have something to learn from.
>
> Companion to `docs/QUALITY_SYSTEM.md`, which defines what a family is and what closing one requires. Read that first.
>
> **If this repo has little or no audit history, do not run this.** There is nothing to mine, and an agent asked to find patterns in a thin corpus will invent them. Start with the empty registry and add the first family the moment the same kind of bug appears twice.

## What this run is, and what it is not

This is a **read-only** pass over work that has already been done. It finds the **root causes behind bugs already found**. It does not look for new bugs, and it must not fix anything.

That constraint is the entire value. A normal audit adds to the pile. This one explains the pile, and tells you how much of it is actually one thing.

## The prompt

Paste from here down.

---

You are running an audit of the audits on this repository.

**You are READ-ONLY. Do not edit, fix, or commit anything.** If you find a live bug, note it and move on; it is not what this pass is for.

**Your goal:** find the root causes behind bugs that have ALREADY been found. Not new bugs. You are looking for the small number of mechanisms that produced a large number of findings.

### Read the whole history first

Before analyzing anything, read the corpus:

- Every findings, audit, and review document in the repo.
- The issue tracker, if one is used, including closed issues.
- Pull request descriptions and review comments, which is where "we should really fix the underlying thing" usually gets said and then forgotten.
- Every commit whose message contains "fix", plus the diff for each. The commit message says what someone believed they were fixing; the diff says what actually changed. When those disagree, that gap is often a family.

Then answer, with numbers.

### What to report

**1. The corpus.** How many audit or review passes. How many findings raised, how many stood, how many were refuted, and the refutation rate. If refutation was never recorded, say so rather than estimating.

**2. Duplication, measured.** Within a single pass, how many findings were the same defect seen through different lenses. Across passes, how many findings had already been reported earlier. Give both as percentages, and show your working.

**3. The families.** For each root cause you identify:
   - A one-line name describing the **mechanism**, not the symptom.
   - How many instances trace to it.
   - Across how many passes it appears, with first and last sighting.
   - **Whether ONE mechanical check could catch the entire family**, and specifically what that check would be. This is the most useful column in the whole report.

**4. A direct numeric answer to the question that matters:** is this codebase's defect population unbounded, or is it a few systemic causes producing many instances? Answer with the ratio of distinct classes to total findings, and say plainly which it is.

**5. The fixed-but-incomplete list.** Findings marked resolved where the instance was patched and the mechanism was left live. For each, name the mechanism and estimate how many siblings remain. **This is usually the most valuable section of the report,** because every row is a bug that is already believed to be handled and is not.

**6. Every existing guard, and what it structurally cannot see.** List each automated check, then state the category of defect each is blind to by construction. A guard that greps source text cannot see anything that lives in data. Say so explicitly, per guard.

**7. Harness artifacts.** Any case where a past pass manufactured a finding: an unset local environment variable that produced a fake blocker, a check that reported all-clear over an empty list, a test that mutated a real system. These distort every count above and they recur.

### How to write it up

- **Lead with a plain-language answer for a non-technical reader** who is deciding whether this work is finishable. No jargon, no file paths, in the first paragraph. The honest headline is usually a ratio: this many findings, this many actual causes.
- **Report two numbers everywhere:** findings raised, and distinct classes. One without the other is misleading in a predictable direction.
- **Close with a "not verified" list.** What you could not check, what you inferred rather than confirmed, and where the corpus was too thin to support a conclusion. A report without this section reads as more certain than it is.

---

## After the run

Each family the run identifies becomes a row in the registry in `docs/QUALITY_SYSTEM.md`, with its candidate guard. Add the rows in the same commit as the analysis, so the registry never lags the knowledge.

Then work the guards, not the findings list. A guard at the top of the ladder closes a family permanently; another pass over the same findings closes nothing.
