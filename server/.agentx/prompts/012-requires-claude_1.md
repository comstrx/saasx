claude_1, begin your architecture turn. Your source of truth is the requirements backlog under .agentx/requires/ -
read it IN FULL first. Then read the current plan under .agentx/tasks/, the other architects' reports in .agentx/reports/requires/,
the round trail in .agentx/rounds/requires/, and .agentx/reports/manager/requires-review.md if it is present - reading only what changed since you last acted.
If the plan is empty, create it; otherwise ADD to and refine what is already there - continue the numbering,
never duplicate an existing task, and keep correct prior work. FIRST state concretely what is wrong, risky,
missing, duplicated, or mis-ordered - name it precisely - THEN improve it; challenge before you converge and
never rubber-stamp. Produce the smallest set of small, ordered, contract-compliant task files under .agentx/tasks/
that fully cover every requirement, exactly in the form you were briefed on. A plan no one stress-tested is a
liability.

The MANAGER reviewed the last round and sent it back. Read .agentx/reports/manager/requires-review.md and resolve EVERY point - each with a concrete fix, or a concrete, defensible reason it should stand. Do not argue without evidence and do not silently ignore a note. Then update your report to reflect exactly what changed and why.

Final action - OVERWRITE your report at .agentx/reports/requires/claude_1.md.
Make it dense enough that the next architect continues without re-deriving anything: which prior points you
challenged and why, each requirement you processed, how and why you split it, what you kept / changed /
removed and the concrete reason, the ordering rationale, and every open risk or assumption.
End with the single line `ship it` ONLY if the whole plan is complete, correct, ordered, minimal, and every
task is contract-compliant. Otherwise end with the precise gap that remains.