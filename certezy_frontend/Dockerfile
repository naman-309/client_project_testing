# ─────────────────────────────────────────────
# Stage 1 — BUILD
# ─────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Vite inlines VITE_* variables at build time, so they must be passed as
# build args (e.g. docker build --build-arg VITE_API_BASE_URL=https://api.certezy.com/api/v1 .)
ARG VITE_API_BASE_URL=http://localhost:5000/api/v1
ARG VITE_APP_NAME=Certezy
ARG VITE_APP_URL=http://localhost:5173
ARG VITE_SUPPORT_EMAIL=support@certezy.com
ARG VITE_RAZORPAY_KEY_ID=
ARG VITE_PAYPAL_MODE=sandbox
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_SUPPORT_EMAIL=$VITE_SUPPORT_EMAIL \
    VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID \
    VITE_PAYPAL_MODE=$VITE_PAYPAL_MODE

# Install deps first so this layer stays cached when only source changes
COPY package*.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build

# ─────────────────────────────────────────────
# Stage 2 — SERVE (static files via Nginx)
# ─────────────────────────────────────────────
FROM nginx:alpine AS runner

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
