#!/bin/bash

# LOG_FILE="$HOME/active_window.log"
LOG_FILE="./active_window.log"

echo "Logging active window" > "$LOG_FILE"
echo "Timestamp, Active Window" >> "$LOG_FILE"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

  # Get the currently active window title
  ACTIVE_WINDOW=$(xdotool getwindowfocus getwindowname 2>/dev/null)

  if [ ! -z "$ACTIVE_WINDOW" ]; then
    echo "$TIMESTAMP, $ACTIVE_WINDOW"
    echo "$TIMESTAMP, $ACTIVE_WINDOW" >> "$LOG_FILE"
  fi

  sleep 5
done
