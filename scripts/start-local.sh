#!/bin/sh
set -eu

firebase emulators:start \
	--config firebase.local.json \
	--only firestore,hosting &
firebase_pid=$!

cleanup() {
	kill "$firebase_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

until curl -fsS http://127.0.0.1:8080/ >/dev/null 2>&1; do
	sleep 1
done

node scripts/seed-emulator.js
echo "Local site: http://127.0.0.1:5002"
wait "$firebase_pid"
