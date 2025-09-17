#!/usr/bin/env bash

# scripts/db_dump.sh
# Print all tables from a PostgreSQL database to the console.
# Connection can be configured via standard PG env vars:
#   PGHOST (default: localhost)
#   PGPORT (default: 5432)
#   PGDATABASE (default: isdstore)
#   PGUSER (default: postgres)
#   PGPASSWORD (optional, or use ~/.pgpass)

set -euo pipefail

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-isdstore}"
PGUSER="${PGUSER:-postgres}"

export PGPASSWORD="${PGPASSWORD:-postgres}"

if ! command -v psql >/dev/null 2>&1; then
    echo "Error: psql is not installed or not in PATH." >&2
    exit 1
fi

PSQL=(psql --no-psqlrc -v ON_ERROR_STOP=1 -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE")

# Verify connection
if ! "${PSQL[@]}" -Atqc "SELECT 1;" >/dev/null 2>&1; then
    echo "Error: cannot connect to PostgreSQL at ${PGHOST}:${PGPORT} db=${PGDATABASE} user=${PGUSER}" >&2
    echo "Hint: export PGPASSWORD or configure ~/.pgpass if authentication is required." >&2
    exit 2
fi

# Collect all base tables (exclude system schemas)
TABLES=()
while IFS= read -r line; do
    TABLES+=("$line")
done < <("${PSQL[@]}" -Atc "
    SELECT quote_ident(table_schema)||'.'||quote_ident(table_name)
    FROM information_schema.tables
    WHERE table_type='BASE TABLE'
        AND table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY 1;
")

if (( ${#TABLES[@]} == 0 )); then
    echo "No tables found."
    exit 0
fi

# Ensure no pager interferes with output
export PAGER=cat
export PSQL_PAGER=cat

for tbl in "${TABLES[@]}"; do
    echo
    echo "======== ${tbl} ========"
    "${PSQL[@]}" -X --pset pager=off -c "TABLE ${tbl};"
done

unset PGPASSWORD
exit 0