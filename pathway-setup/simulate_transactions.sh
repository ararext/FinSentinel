#!/usr/bin/env bash
set -euo pipefail

# Simple CSV mutator for Pathway streaming demo.
# This script will:
#   - every few seconds remove the oldest data row
#     (keeping the CSV header), and
#   - append a freshly generated random transaction row.
# It runs in an infinite loop until you stop it with
# Ctrl+C.
#
# Usage (from pathway-setup directory):
#   chmod +x simulate_transactions.sh
#   ./simulate_transactions.sh
#
# Make sure app.py is running in another terminal so
# Pathway can pick up the changes via its streaming CSV
# connector.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CSV_PATH="${SCRIPT_DIR}/../server/data/transactions.csv"

if [[ ! -f "${CSV_PATH}" ]]; then
  echo "[error] CSV not found at ${CSV_PATH}" >&2
  exit 1
fi

# Delay between updates in seconds (default 2s, can be overridden
# by setting UPDATE_DELAY environment variable before running).
UPDATE_DELAY="${UPDATE_DELAY:-2}"

if ! [[ "${UPDATE_DELAY}" =~ ^[0-9]+$ ]]; then
  echo "[error] UPDATE_DELAY must be an integer number of seconds" >&2
  exit 1
fi

echo "[info] Streaming transactions to ${CSV_PATH} every ${UPDATE_DELAY}s."
echo "[info] Press Ctrl+C to stop."

# Infinite loop: drop oldest data row (not the header) and append a new one.
while true; do
  # Ensure the file still exists
  if [[ ! -f "${CSV_PATH}" ]]; then
    echo "[error] CSV not found at ${CSV_PATH}" >&2
    exit 1
  fi

  # Keep header, optionally drop the first data row if present.
  line_count=$(wc -l < "${CSV_PATH}")
  if (( line_count > 1 )); then
    # Delete the first data row (line 2), keeping the header intact.
    # Using a temporary file to be safe with pipefail.
    tmp_file="${CSV_PATH}.tmp"
    {
      head -n 1 "${CSV_PATH}"
      tail -n +3 "${CSV_PATH}" 2>/dev/null || true
    } > "${tmp_file}"
    mv "${tmp_file}" "${CSV_PATH}"
    echo "[info] Removed oldest transaction row."
  fi

  # Fixed step for now
  STEP=1

  # Random transaction type
  TYPES=("PAYMENT" "TRANSFER" "CASH_OUT" "CASH_IN" "DEBIT")
  TYPE_IDX=$(( RANDOM % ${#TYPES[@]} ))
  TX_TYPE="${TYPES[TYPE_IDX]}"

  # Random amount between 1,000 and 100,000
  AMOUNT_BASE=$(( (RANDOM % 99000) + 1000 ))
  AMOUNT="${AMOUNT_BASE}.0"

  # Random sender/receiver account IDs
  SENDER_ID="C$((100000000 + (RANDOM % 899999999)))"
  RECEIVER_ID="M$((100000000 + (RANDOM % 899999999)))"

  # Simple balance logic: oldbalanceOrg >= amount, newbalanceOrig = oldbalanceOrg - amount
  OLD_ORG=$(( AMOUNT_BASE + (RANDOM % 90000) ))
  NEW_ORG=$(( OLD_ORG - AMOUNT_BASE ))

  # Destination balances (optional in schema, but we keep them consistent)
  OLD_DEST=0
  NEW_DEST=$AMOUNT_BASE

  # Flags
  IS_FRAUD=0
  IS_FLAGGED=0

  NEW_ROW="${STEP},${TX_TYPE},${AMOUNT},${SENDER_ID},${OLD_ORG}.0,${NEW_ORG}.0,${RECEIVER_ID},${OLD_DEST}.0,${NEW_DEST}.0,${IS_FRAUD},${IS_FLAGGED}"

  echo "${NEW_ROW}" >> "${CSV_PATH}"

  echo "[info] Appended new transaction row to transactions.csv:"
  echo "       ${NEW_ROW}"

  sleep "${UPDATE_DELAY}"
done
