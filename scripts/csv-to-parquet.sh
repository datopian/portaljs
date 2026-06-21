#!/usr/bin/env bash
# Convert a CSV/TSV dataset to Apache Parquet for the PortalJS query tier (epic
# po-g9y, phase 6). Parquet is columnar + compressed, so DuckDB-Wasm can query it
# IN PLACE over HTTP range requests once it's on R2 — projection/predicate
# pushdown means a browser fetches only the row groups and columns a query
# touches, never the whole file. CSV has no such structure; it must be downloaded
# whole. Converting at publish time is what unlocks the no-download tier.
#
# Usage:
#   csv-to-parquet.sh <input.csv|input.tsv> [output.parquet]
#
# Env overrides:
#   COMPRESSION     Parquet codec (default: zstd; also: snappy, gzip, none)
#   ROW_GROUP_SIZE  rows per row group (default: 100000). Smaller groups give
#                   finer-grained range reads — better for weak clients querying
#                   large files; larger groups compress slightly better.
#
# After converting, version the .parquet with Git LFS (it's already routed in
# .gitattributes) so its bytes stream to R2, and point the dataset's
# resource.path at the R2 URL. See README.md → "Large data (Git LFS → R2)".

set -euo pipefail

INPUT="${1:?Usage: csv-to-parquet.sh <input.csv|input.tsv> [output.parquet]}"
OUTPUT="${2:-}"
COMPRESSION="${COMPRESSION:-zstd}"
ROW_GROUP_SIZE="${ROW_GROUP_SIZE:-100000}"

if [[ ! -f "$INPUT" ]]; then
  echo "error: input file not found: $INPUT" >&2
  exit 1
fi

if ! command -v duckdb >/dev/null 2>&1; then
  cat >&2 <<'EOF'
error: the `duckdb` CLI is required for CSV→Parquet conversion but was not found.

Install it (it's a single static binary, no runtime):
  macOS:    brew install duckdb
  Linux:    curl -L https://github.com/duckdb/duckdb/releases/latest/download/duckdb_cli-linux-amd64.zip -o duckdb.zip && unzip duckdb.zip
  Other:    https://duckdb.org/docs/installation

Then re-run this script.
EOF
  exit 127
fi

# Default the output next to the input: data.csv -> data.parquet.
if [[ -z "$OUTPUT" ]]; then
  OUTPUT="${INPUT%.*}.parquet"
fi

# Pick the reader by extension. read_csv_auto sniffs schema, types, and header;
# TSV is the same reader with a tab delimiter. (tr-lowercase keeps this working on
# the stock macOS bash 3.2, which lacks ${var,,}.)
EXT="$(printf '%s' "$INPUT" | tr '[:upper:]' '[:lower:]')"
case "$EXT" in
  *.tsv) READER="read_csv_auto('$INPUT', delim='\t')" ;;
  *)     READER="read_csv_auto('$INPUT')" ;;
esac

echo "Converting $INPUT -> $OUTPUT (compression=$COMPRESSION, row_group_size=$ROW_GROUP_SIZE)…"

duckdb -c "COPY (SELECT * FROM $READER) TO '$OUTPUT' (FORMAT PARQUET, COMPRESSION $COMPRESSION, ROW_GROUP_SIZE $ROW_GROUP_SIZE);"

# Report the win so the publisher sees why Parquet is worth it.
if command -v du >/dev/null 2>&1; then
  IN_SIZE="$(du -h "$INPUT" | cut -f1)"
  OUT_SIZE="$(du -h "$OUTPUT" | cut -f1)"
  echo "Done. $INPUT ($IN_SIZE) -> $OUTPUT ($OUT_SIZE)"
else
  echo "Done. Wrote $OUTPUT"
fi

cat <<EOF

Next steps:
  1. Version it with Git LFS (already routed in .gitattributes):
       git add "$OUTPUT" && git commit -m "data: add $(basename "$OUTPUT")"
     The bytes stream to R2 via Giftless; only a pointer stays in git.
  2. Point the dataset's resource at the R2 URL with format: "parquet".
     The showcase will query it in place over HTTP range requests (no download).
EOF
