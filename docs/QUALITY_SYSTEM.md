# The Quality System: how we stop re-finding the same bugs

> Read this before you fix anything, and before you audit anything.
>
> Written 2026-08-14. An audit-of-the-audits on a sibling repo found that 21 audit passes had raised roughly 679 findings, and that those findings collapsed to about 12 recurring root causes. In that repo's newest pass, 47% of confirmed findings traced to exactly two causes, and three of its four "blockers" turned out to be one defect seen from three angles.
>
> This file installs the method here before we have the same problem.

## The problem this file exists to solve

When every audit finds more, the natural conclusion is "this codebase has endless bugs." That conclusion is usually wrong, and the arithmetic disproves it: a small number of systemic causes produce a large number of instances.

The distinction matters because it changes whether the work is finishable. "679 findings" is not a job anyone can complete. "12 classes, 3 closed" is. Reporting only the first number is what makes the work feel infinite.

Bugs came back for two reasons, and neither was "the code is bad":

1. **Every fix patched an instance and left the class open.** The reported bug stopped reproducing, so it got marked done, and the mechanism that produced it kept producing siblings.
2. **Every automated guard was a text search over source code.** Not one queried the database or exercised the running system, so every data-shaped defect family was invisible to CI by construction. Those families could only be caught by a human running an audit, which guarantees they come back.

## The one rule

> **Fix the class, not the instance. A fix is not done until something automatic would catch the next instance.**

The specific move, almost every time: **replace an enumerated list with a rule.** A list of allowed status values gets patched one value at a time, forever. A transition rule that derives what is allowed stops the recurrence permanently. When you find yourself adding one more item to a list to fix a bug, that is the signal you are patching an instance.

## What "done" means for a fix

A fix is done when all four are true. If any is missing, it is an **instance patch**, and you say so plainly rather than marking it complete.

1. **The instance is fixed.** The reported bug no longer reproduces.
2. **The class is named.** You have said which family it belongs to, or you have added a new family with evidence.
3. **The siblings were found.** You searched for other instances of the same mechanism and either fixed them or listed them. A family is never a single row.
4. **A guard exists.** Something automatic fails if the pattern reappears. If a guard is genuinely impossible, write down why, and what a human must check instead.

> Never mark a finding done because the instance is patched. That is the exact move that produces a "fixed-but-incomplete" backlog, where the ledger says closed and the mechanism is still live.

## The guard ladder

Prefer the highest rung you can actually reach.

1. **A database constraint or trigger.** Cannot be bypassed by any code path, including a service-role client and a future agent who never read this file. Always prefer this when the fact being protected lives in data.
2. **A build-time check that blocks the deploy.** It cannot ship if it fails.
   **Ship it as a ratchet against a checked-in baseline, so it fails only on something new.** A check that fails on 41 pre-existing sites gets disabled within a day, and then you have neither the guard nor the fix. Baseline the known violations, fail on additions, and burn the baseline down separately.
3. **A runtime assertion that alerts.** For things only observable in production. Note the trap: anything that reports on failure must be able to report its own failure. An alarm that has never fired a real message is not an alarm, it is an assumption.
4. **A documented human step.** The weakest rung, because it degrades the moment anyone is busy. Use it only when rungs 1 to 3 are truly impossible, and say explicitly that is what you did.

## Rules for auditing

The audit instrument itself can manufacture findings. These rules exist to stop that.

- **Never report an absence you did not instrument for.** "I found no X" is only sayable if you looked somewhere X would actually have appeared. Otherwise say **unverified**.
- **An empty result is not a clean result.** If a check returns nothing, prove the check works before reporting all-clear. Plant a violation and confirm the check catches it.
- **Verify against production, not a local build.** An unset local environment variable manufactures fake blockers that waste a whole pass.
- **The live system of record is the authority.** Never trust generated type files or committed schema snapshots; they go stale silently. Prove claims against the database itself, or against a `file:line`.
- **Adversarially verify before reporting.** Hand every finding to a skeptic whose job is to refute it, and require "stands = false" when merely uncertain. Measured refutation rates run around 20%, and up to 79% in a single pass. An unrefuted finding list is roughly a third noise.
- **Deduplicate before counting.** Tag every finding with its family, and report two numbers: findings raised, and distinct classes.
- **Audit the guards themselves.** They are code. Prove each one fails on a planted violation before trusting it. A test suite once wrote a row into a production database; the checking apparatus gets the same scrutiny as the thing it checks.

## Rules for reporting

- **"Fixed" means the class is closed and guarded.** Anything else is "instance patched", and the difference is the whole point of this file.
- **"Live" means verified in production.** Not committed, not merged, not "the build went green." The chain from commit to push to merge to build to deploy breaks at every link.
- **Always publish what you did NOT verify.** Silence reads as "checked and fine." An audit without a "not verified" list is marketing.

## The defect-class registry

| # | Family | Recurrence | Guard that would close it |
|---|--------|------------|---------------------------|
| _(empty)_ | | | |

**This table is deliberately empty.**

Defect families are specific to a codebase. They come from its own architecture, its own history, and its own habits, so they have to be discovered here rather than copied from somewhere else. A family imported from another repo describes that repo's mistakes, not ours, and filing one would make this registry decorative on the day it was created.

**The rule for adding a family: the same KIND of bug seen twice is a class.** Not the same bug reported twice, and not two bugs in the same file. The same mechanism producing two different symptoms.

To add a row you need three things, committed together with the fix:

1. **A one-line name** for the family, describing the mechanism rather than the symptom.
2. **At least two instances**, each with `file:line` or query evidence.
3. **A candidate guard**, placed as high on the ladder as it can go. If no mechanical guard is possible, say so explicitly and write down the human check that replaces it.

When you find something that fits none of the existing families, add a family rather than filing a lone instance.

To discover families from this repo's accumulated history in one pass, use `docs/agents/audit-of-audits.md`.

---

**Related:** `CLAUDE.md` (hard rules and house style) · `docs/agents/audit-of-audits.md` (the discovery prompt) · `AUDIT-FINDINGS.md` (the 2026-07-17 findings register) · `AUDIT-PLAN.md` (the plan that pass executed) · `todo.md` (the tracker)
