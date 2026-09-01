# Gate contract

A gate is a checkpoint in a DAG. Discipline is mandatory and the model cannot skip it. A gate is passed only when required artifacts exist, mechanical hooks exit 0, and an independent evaluator returns verdict pass with no high-severity issues. A generator scoring its own work is not a pass.
