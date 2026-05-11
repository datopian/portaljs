#!/usr/bin/env bash
# Run a scoped, read-only data quality audit for one local or remote file.
# Usage: check-data-quality.sh <file-path-or-url>

set -euo pipefail

FILE_INPUT="${1:?Usage: check-data-quality.sh <file-path-or-url>}"
TEMP_FILE=""

cleanup() {
  if [[ -n "$TEMP_FILE" && -f "$TEMP_FILE" ]]; then
    rm -f "$TEMP_FILE"
  fi
}

trap cleanup EXIT

if [[ "$FILE_INPUT" =~ ^https?:// ]]; then
  TEMP_FILE="$(mktemp)"
  python3 - <<'PYDL' "$FILE_INPUT" "$TEMP_FILE"
import sys
import urllib.request

url, out_path = sys.argv[1:3]
with urllib.request.urlopen(url) as response, open(out_path, "wb") as out_file:
    out_file.write(response.read())
PYDL
  RESOLVED_FILE="$TEMP_FILE"
  SOURCE_TYPE="url"
else
  RESOLVED_FILE="$FILE_INPUT"
  SOURCE_TYPE="local"
fi

python3 - <<'PY2' "$RESOLVED_FILE" "$FILE_INPUT" "$SOURCE_TYPE"
import csv
import json
import re
import sys
from collections import Counter
from datetime import datetime
from pathlib import Path

resource_path = Path(sys.argv[1])
file_input = sys.argv[2]
source_type = sys.argv[3]

if not resource_path.exists():
    print(json.dumps({
        'error': f'File `{file_input}` is not available.',
        'file': file_input,
    }, indent=2))
    sys.exit(0)

ext = resource_path.suffix.lower()
if ext not in {'.csv', '.tsv'}:
    print(json.dumps({
        'error': 'Only CSV and TSV files are supported right now.',
        'file': file_input,
    }, indent=2))
    sys.exit(0)

delimiter = '\t' if ext == '.tsv' else ','

column_profiles = {}
row_count = 0
duplicate_rows = 0
row_counter = Counter()


def init_profile(name):
    return {
        'column': name,
        'null_count': 0,
        'blank_count': 0,
        'distinct_values': set(),
        'sample_values': [],
        'type_counts': Counter(),
        'numeric_min': None,
        'numeric_max': None,
        'negative_count': 0,
        'year_min': None,
        'year_max': None,
        'invalid_year_count': 0,
    }


def add_sample(profile, value):
    if value and value not in profile['sample_values'] and len(profile['sample_values']) < 5:
        profile['sample_values'].append(value)


def looks_like_year_column(name):
    lower = name.lower()
    return 'year' in lower or lower.endswith('_yr')


def classify_value(value):
    if value is None:
        return 'null'
    text = str(value).strip()
    if text == '':
        return 'blank'
    lowered = text.lower()
    if lowered in {'true', 'false', 'yes', 'no'}:
        return 'boolean'
    if re.fullmatch(r'-?\d+', text):
        return 'integer'
    if re.fullmatch(r'-?(\d+\.\d*|\d*\.\d+)', text):
        return 'float'
    date_formats = ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m', '%b %Y', '%B %Y']
    for fmt in date_formats:
        try:
            datetime.strptime(text, fmt)
            return 'date'
        except ValueError:
            continue
    return 'string'

with resource_path.open('r', encoding='utf-8-sig', newline='') as f:
    reader = csv.DictReader(f, delimiter=delimiter)
    fieldnames = reader.fieldnames or []
    if not fieldnames:
        print(json.dumps({'error': f'Resource `{resource_path.name}` does not contain tabular headers.'}, indent=2))
        sys.exit(0)

    for name in fieldnames:
        column_profiles[name] = init_profile(name)

    for row in reader:
        row_count += 1
        normalized_row = []
        for name in fieldnames:
            raw = row.get(name)
            profile = column_profiles[name]
            if raw is None:
                profile['null_count'] += 1
                normalized_row.append(None)
                continue

            text = str(raw)
            stripped = text.strip()
            normalized_row.append(stripped)
            if stripped == '':
                profile['blank_count'] += 1
                continue

            profile['distinct_values'].add(stripped)
            add_sample(profile, stripped)
            value_type = classify_value(stripped)
            profile['type_counts'][value_type] += 1

            if value_type in {'integer', 'float'}:
                number = float(stripped)
                profile['numeric_min'] = number if profile['numeric_min'] is None else min(profile['numeric_min'], number)
                profile['numeric_max'] = number if profile['numeric_max'] is None else max(profile['numeric_max'], number)
                if number < 0:
                    profile['negative_count'] += 1

            if looks_like_year_column(name):
                if re.fullmatch(r'\d{4}', stripped):
                    year = int(stripped)
                    profile['year_min'] = year if profile['year_min'] is None else min(profile['year_min'], year)
                    profile['year_max'] = year if profile['year_max'] is None else max(profile['year_max'], year)
                else:
                    profile['invalid_year_count'] += 1

        row_counter[tuple(normalized_row)] += 1

for count in row_counter.values():
    if count > 1:
        duplicate_rows += count - 1

likely_id_columns = [name for name in column_profiles if name.lower() in {'id', 'identifier'} or name.lower().endswith('_id')]
findings = []
recommendations = []


def add_finding(severity, check, column, message, value=None, evidence=None):
    findings.append({
        'severity': severity,
        'check': check,
        'column': column,
        'message': message,
        'value': value,
        'evidence': evidence,
    })

if duplicate_rows > 0:
    severity = 'critical' if duplicate_rows > max(1, row_count * 0.05) else 'warning'
    add_finding(severity, 'duplicate_rows', None, f'{duplicate_rows} duplicate rows found.', duplicate_rows)
    recommendations.append('Review and deduplicate repeated rows if they are not intentional.')

for column, profile in column_profiles.items():
    null_like = profile['null_count'] + profile['blank_count']
    if row_count and null_like:
        ratio = null_like / row_count
        severity = 'critical' if ratio >= 0.2 else 'warning'
        add_finding(severity, 'missing_values', column, f'{null_like} rows are null or blank in `{column}`.', null_like)
        recommendations.append(f'Check missing values in `{column}`.')

    if profile['invalid_year_count'] > 0:
        add_finding('warning', 'invalid_year_values', column, f'{profile["invalid_year_count"]} values in `{column}` are not valid 4-digit years.', profile['invalid_year_count'])
        recommendations.append(f'Normalize year values in `{column}`.')

    meaningful_types = {kind for kind, count in profile['type_counts'].items() if count > 0}
    if len(meaningful_types) > 1 and not meaningful_types.issubset({'integer', 'float'}):
        add_finding('warning', 'mixed_types', column, f'Column `{column}` contains mixed value types: {sorted(meaningful_types)}.', sorted(meaningful_types))
        recommendations.append(f'Normalize mixed value types in `{column}`.')

    lower_column = column.lower()
    if profile['negative_count'] > 0 and any(token in lower_column for token in ['ton', 'amount', 'total', 'count', 'value', 'volume']):
        add_finding('warning', 'negative_values', column, f'Column `{column}` contains {profile["negative_count"]} negative values.', profile['negative_count'])
        recommendations.append(f'Validate whether negative values are expected in `{column}`.')

for column in likely_id_columns:
    profile = column_profiles[column]
    non_unique = (row_count - profile['null_count'] - profile['blank_count']) - len(profile['distinct_values'])
    if non_unique > 0:
        add_finding('warning', 'duplicate_identifier_values', column, f'Likely identifier column `{column}` has {non_unique} duplicate values.', non_unique)
        recommendations.append(f'Check uniqueness constraints for `{column}`.')

year_columns = [name for name in column_profiles if looks_like_year_column(name)]
if len(year_columns) > 1:
    add_finding(
        'warning',
        'ambiguous_year_columns',
        None,
        f'Multiple year-like columns found: {", ".join(year_columns)}. Queries may need to choose between them explicitly.',
        len(year_columns),
        {'columns': year_columns},
    )
    recommendations.append('Document which year field should be used for analytics and exports.')

seen_recommendations = set()
unique_recommendations = []
for item in recommendations:
    if item not in seen_recommendations:
        seen_recommendations.add(item)
        unique_recommendations.append(item)

severity_order = {'critical': 3, 'warning': 2, 'info': 1}
status = 'ok'
if any(f['severity'] == 'critical' for f in findings):
    status = 'critical'
elif findings:
    status = 'warning'

output_profiles = []
for column, profile in column_profiles.items():
    output_profiles.append({
        'column': column,
        'null_count': profile['null_count'],
        'blank_count': profile['blank_count'],
        'distinct_count': len(profile['distinct_values']),
        'sample_values': profile['sample_values'],
        'inferred_types': dict(profile['type_counts']),
        'numeric_min': profile['numeric_min'],
        'numeric_max': profile['numeric_max'],
        'year_min': profile['year_min'],
        'year_max': profile['year_max'],
    })

result = {
    'status': status,
    'file': file_input,
    'file_name': Path(file_input).name,
    'source_type': source_type,
    'resource_format': ext.lstrip('.'),
    'row_count': row_count,
    'column_count': len(column_profiles),
    'findings': sorted(findings, key=lambda item: severity_order.get(item['severity'], 0), reverse=True),
    'recommendations': unique_recommendations,
    'column_profiles': output_profiles,
}

print(json.dumps(result, indent=2))
PY2
