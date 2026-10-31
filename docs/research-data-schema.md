# Research data schema v1 (Google Sheets-ready)

This specification defines separate tabs. It is a **design**, not a live Google Sheets connection.

## Tables and columns

| Tab | Columns | Key | Notes |
|---|---|---|---|
| Students | student_id, cohort, active | student_id | Anonymous code only; no real names |
| Sessions | session_id, hour, phase, objective, micro_task_id | session_id | Hours 1–12: learning; 13–16: project |
| Evidence | evidence_id, student_id, session_id, dimension, evidence_type, percent, reference, assessed_at, assessor_id | evidence_id | Dimension K/P/A for learning, PROJECT for project; percent 0–100 |
| RubricCriteria | criterion_id, label, description, level_1, level_2, level_3, level_4 | criterion_id | Five criteria; keep level descriptors explicit |
| RubricRatings | rating_id, student_id, criterion_id, rater_id, level, evidence_ids, assessed_at | rating_id | Two raters independently; level 1–4; evidence_ids are linked identifiers |
| DecisionResults | run_id, criterion_id, n, count_ge2, count_ge3, count_eq4, pass_ge2, pass_ge3, pass_eq4, computed_at | run_id + criterion_id | Derived outputs only, never manually overwrite source ratings |

## Relationships and decision rules

- Students.student_id → Evidence.student_id and RubricRatings.student_id.
- Sessions.session_id → Evidence.session_id.
- RubricCriteria.criterion_id → RubricRatings.criterion_id.
- Evidence.evidence_id is referenced in RubricRatings.evidence_ids (a delimited list for Sheets; normalize as RatingEvidence join table in a database).
- Each student × criterion × rater must have at most one **current** rating for a defined assessment occasion. For repeated occasions, add assessment_id and rating_version.
- Hybrid Rule applies separately to all five criteria, using a prespecified, documented procedure for reconciling or adjudicating ratings. **Do not silently average two raters' ordinal ratings.**
- For each criterion with n eligible students: count_ge2 >= ceil(0.8*n), count_ge3 >= ceil(0.5*n), count_eq4 >= ceil(0.2*n). All 15 checks must pass.
- KPA percentages are formative evidence, **not** interchangeable with ordinal rubric levels.
- Do not infer causality from before/after differences without design-based limitations.

## Privacy and traceability

- Use pseudonymous student IDs (S001 etc.) and separate any re-identification key outside the research workbook.
- Do not store student names, emails, Classroom IDs, or unrestricted Drive links in a public workbook.
- Maintain assessor identity as a pseudonym and document scoring date, rubric version, assessment occasion, and any adjudication.
- Preserve original evidence and rating records; regenerate DecisionResults from validated data.
- In the prototype, no data are uploaded to Google Sheets or Google Classroom.

## Proposed implementation sequence

1. Create Google Sheets workbook with these six tabs and data validation.
2. Add an Apps Script append-only evidence submission form with access control.
3. Add a separate rubric rating form for two raters.
4. Export de-identified CSV to JASP/jamovi for independent verification.
5. Publish only aggregated, non-identifying results.

References:
- https://developers.google.com/apps-script/guides/sheets
- https://developers.google.com/workspace/sheets/api/guides/concepts
- https://www.jamovi.org/
- https://jasp-stats.org/
