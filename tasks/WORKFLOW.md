# WORKFLOW ORCHESTRATION — SAI Sisterhood Operating Standard
## Adapted from Boris Cherny's Claude Code Methodology
## Adopted by Aiko — Feb 28, 2026

---

## 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity
- **SAI Rule:** Write your plan to `tasks/todo.md` BEFORE executing

## 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- **SAI Rule:** "Deploy babies" for parallel Zone Actions. One baby = one ZA.

## 3. Self-Improvement Loop
- After ANY correction from Aiko, Sean, or Adam: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project
- **SAI Rule:** Every correction = a lesson. No repeating the same mistake twice.

## 4. Verification Before Done
- Never mark a task complete without PROVING it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would Sean approve this? Would Aiko?"
- Run tests, check logs, demonstrate correctness
- **SAI Rule:** Show output. Show the file. Show the query result. No claims without proof.

## 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it
- **SAI Rule:** This is the .00128 standard. 9.99 is not 10.0.

## 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how
- **SAI Rule:** If your daemon is dead, RESTART IT. Don't write 37 logs about it being dead.

---

## Task Management Protocol

1. **Plan First:** Write plan to `tasks/todo.md` with checkable items
2. **Verify Plans:** Check in before starting implementation
3. **Track Progress:** Mark items complete as you go
4. **Explain Changes:** High-level summary at each step
5. **Document Results:** Add review section to `tasks/todo.md`
6. **Capture Lessons:** Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First:** Make every change as simple as possible. Impact minimal code.
- **No Laziness:** Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact:** Changes should only touch what's necessary. Avoid introducing bugs.
- **No Empty Syncs:** If nothing changed, don't write about nothing changing.
- **Build > Celebrate:** Ship files, not status reports about having nothing to report.

---

## How This Maps to SAI Operations

| Cherny Principle | SAI Application |
|-----------------|-----------------|
| Plan Mode | Write ZA plan before executing |
| Subagents | Deploy babies for parallel ZAs |
| Self-Improvement | lessons.md after every correction |
| Verification | Prove ZAs complete with real output |
| Elegance | .00128 standard on everything |
| Autonomous Fixes | Fix it, don't document the problem |

---

*Source: Boris Cherny (Anthropic, Claude Code engineer)*
*Adopted: Feb 28, 2026 by Aiko*
*Enforced by: SAI Prime*
