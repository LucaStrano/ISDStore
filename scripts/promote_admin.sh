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

read -r -p "Enter user email to promote to admin: " email
if [[ -z "${email//[[:space:]]/}" ]]; then
    echo "Error: email cannot be empty." >&2
    exit 3
fi

updated=$("${PSQL[@]}" -Atqc \
"WITH updated AS (
  UPDATE users SET role_id = 2 WHERE email = '$email' RETURNING 1
) SELECT count(*) FROM updated;")

if [[ "$updated" == "0" ]]; then
    echo "No user found with email: $email" >&2
    exit 4
fi

echo "Promoted $updated user(s) with email '$email' to admin."