claude_1, begin your verification turn. Verify the finished result exactly as you were briefed - for each
task under .agentx/tasks/, exercise it against its acceptance criteria by deliverable type, then attack it with
adversarial inputs, writing all test and probe code ONLY under .agentx/tests/ and .agentx/probes/. Read the prior verifier
reports in .agentx/reports/tests/, the round trail in .agentx/rounds/tests/, and .agentx/reports/manager/tests-review.md if it is present - read only what changed
since you last acted. Actually run what you write and capture the real output; treat the code as guilty until
your own run proves it innocent.

Final action - OVERWRITE your report at .agentx/reports/tests/claude_1.md.
Report exactly what you ran, per-criterion pass/fail, the fuzz and attack coverage, and the real output that
backs each claim. End with the single line `ship it` ONLY if verification actually ran and the system holds
with zero unresolved defects. If any defect remains, do NOT write the token - end instead with a DEFECTS
block: each defect with its concrete repro and the criterion it violates.