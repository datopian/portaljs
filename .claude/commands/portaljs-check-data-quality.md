---
description: Audit a local or remote tabular file (CSV/TSV) for common data quality issues. Read-only. Use only when the user explicitly asks to check or audit data quality.
allowed-tools: Bash
---

# /portaljs-check-data-quality

Run a read-only data quality audit for a specific local file or remote file URL. Requires `python3`.

## Usage

```bash
bash scripts/portaljs-check-data-quality.sh "FILE_PATH_OR_URL"
```

Examples:

```bash
bash scripts/portaljs-check-data-quality.sh "./data/trash.csv"
bash scripts/portaljs-check-data-quality.sh "https://example.com/trash.csv"
```

## What it checks

- row count
- null and blank values
- duplicate rows
- duplicate values for likely identifier columns
- numeric min/max and negative values
- likely year/date field quality
- ambiguous overlapping year columns such as `calendar year` and `fiscal year`
- mixed-type columns based on sampled values

## Output

A JSON object with:
- `status`: `ok`, `warning`, or `critical`
- `file`, `file_name`, `source_type`
- `row_count`, `column_count`
- `findings`: array of structured issues
- `recommendations`: array of suggested next steps
- `column_profiles`: per-column summary

## Notes

- Read-only; accepts one CSV or TSV file at a time.
- Local paths and `http`/`https` URLs are supported.
