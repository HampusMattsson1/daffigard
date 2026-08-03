FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# --- Final Stage ---
FROM node:20-slim

WORKDIR /app

# Copy production node_modules and app code
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Install system dependencies and browsers to a world-accessible location
RUN mkdir -p /usr/local/playwright-browsers && \
    apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libdbus-1-3 libx11-6 libx11-xcb1 libxcb1 libxrandr2 libatk1.0-0 libcups2 \
    libnss3 libgtk-3-0 libxss1 libappindicator3-1 libxslt1.1 libegl1 libasound2 && \
    PLAYWRIGHT_BROWSERS_PATH=/usr/local/playwright-browsers npx playwright install chromium-headless-shell && \
    rm -rf /usr/local/playwright-browsers/.cache && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/playwright-browsers

ENV TZ=Europe/Stockholm
ENV INSTANCE_COUNT=1

# Copy entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Use entrypoint script to support multiple instances
CMD ["/app/entrypoint.sh"]