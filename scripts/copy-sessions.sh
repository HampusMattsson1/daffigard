# Pre-requisite is to have a container running
#podman run --rm -e LOW_RESOURCE=true -e PROFILE=robin-billys -e VARIANT=billys --name daff-test ghcr.io/hampusmattsson1/daffigard:0.1.2-robin

# 1. Set your target directory inside the container and local destination
CONTAINER_NAME="daff-test"
CONTAINER_DIR="/app"
LOCAL_DEST="./USER_SESSIONS"

mkdir -p "$LOCAL_DEST"

# 2. Find matching directories and copy them
#container exec "$CONTAINER_NAME" sh -c "cd $CONTAINER_DIR && tar -cf - user*" | tar -xf - -C "$LOCAL_DEST"
podman cp "$CONTAINER_NAME:$CONTAINER_DIR/user*" "$LOCAL_DEST"