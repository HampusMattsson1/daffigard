#!/bin/bash
set -e

# Ensure Playwright uses the pre-installed browsers
export PLAYWRIGHT_BROWSERS_PATH=/usr/local/playwright-browsers
export PW_BROWSERS_PATH=/usr/local/playwright-browsers

# Debug: verify browsers exist in the image
echo "Checking for Playwright browsers..."
if [ -d "$PLAYWRIGHT_BROWSERS_PATH" ]; then
    echo "✓ Browser directory found at $PLAYWRIGHT_BROWSERS_PATH"
    ls -la "$PLAYWRIGHT_BROWSERS_PATH" || echo "  (empty or inaccessible)"
else
    echo "✗ Browser directory NOT found at $PLAYWRIGHT_BROWSERS_PATH"
    # Fallback to installing at runtime
    echo "Installing browsers at runtime..."
    npx playwright install chromium-headless-shell
fi

# Number of instances to run, default to 1
COUNT=${INSTANCE_COUNT:-1}
PROFILE_NAME=${PROFILE:-user-data}
VARIANT=${VARIANT:-play}

# Handle matches for "hampus" -> "user-hampus" or "user-hampus" -> "user-hampus"
if [[ "$PROFILE_NAME" == user-* ]] || [[ "$PROFILE_NAME" == "user-data" ]]; then
    PROFILE_FOLDER="$PROFILE_NAME"
else
    PROFILE_FOLDER="user-$PROFILE_NAME"
fi

echo "Starting $COUNT instances of Playwright using profile '$PROFILE_FOLDER' with variant '$VARIANT'..."
trap 'kill $(jobs -p)' SIGTERM SIGINT

for i in $(seq 1 $COUNT); do
    echo "Launching instance $i..."
    
    # Each instance needs a unique user-data directory to avoid lock collisions
    USER_DATA_PATH="/tmp/user-data-$i"
    mkdir -p "$USER_DATA_PATH"
    
    # Copy the selected user-data to the instance directory if it exists
    PROFILE_SOURCE=""
    for candidate in "/app/$PROFILE_FOLDER" "/app/$PROFILE_NAME" "./$PROFILE_FOLDER" "./$PROFILE_NAME"; do
        if [ -d "$candidate" ]; then
            PROFILE_SOURCE="$candidate"
            break
        fi
    done

    if [ -n "$PROFILE_SOURCE" ]; then
        echo "Using profile directory '$PROFILE_SOURCE'..."
        cp -rp "$PROFILE_SOURCE/." "$USER_DATA_PATH/"
    else
        echo "⚠️ Profile directory for '$PROFILE_FOLDER' not found! Starting with a clean session instead."
    fi
    
    # Run the selected variant script with the unique user-data path (browser path already exported globally)
    LOW_RESOURCE=${LOW_RESOURCE:-false} PROFILE="$PROFILE_FOLDER" USER_DATA_DIR="$USER_DATA_PATH" npm run $VARIANT &
    
    # Small delay to stagger browser launches
    sleep 2
done

# Wait for all background processes to finish
wait
