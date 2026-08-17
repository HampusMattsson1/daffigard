# 1. Set your target directory inside the container and local destination
CONTAINER_NAME="daff-test"
CONTAINER_DIR="/app"
LOCAL_DEST="./USER_SESSIONS"

mkdir -p "$LOCAL_DEST"

# 2. Find matching directories and copy them
container exec "$CONTAINER_NAME" sh -c "cd $CONTAINER_DIR && tar -cf - user*" | tar -xf - -C "$LOCAL_DEST"