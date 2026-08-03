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

# Set environment variable before installing browsers and deps
ENV PLAYWRIGHT_BROWSERS_PATH=/usr/local/playwright-browsers
ENV TZ=Europe/Stockholm
ENV INSTANCE_COUNT=1

# Install full Chromium and let Playwright manage OS dependencies automatically
RUN mkdir -p /usr/local/playwright-browsers && \
    npx playwright install-deps chromium && \
    npx playwright install chromium && \
    rm -rf /usr/local/playwright-browsers/.cache && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy entrypoint script and make it executable
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Use entrypoint script to support multiple instances
CMD ["/app/entrypoint.sh"]