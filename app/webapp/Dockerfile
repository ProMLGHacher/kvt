FROM node:24 AS builder

WORKDIR /app

COPY . .

RUN npm install --include=optional \
  && npm install -w webapp --no-save \
    @rolldown/binding-linux-x64-gnu@1.0.0-rc.16 \
    lightningcss-linux-x64-gnu@1.32.0 \
    @tailwindcss/oxide-linux-x64-gnu@4.2.3 \
  && npm run build -w @kvt/core \
  && npm run build -w @kvt/react \
  && npm run build -w @kvt/theme \
  && npm run build -w webapp

FROM nginx:1.27-alpine

COPY webapp/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/webapp/dist /usr/share/nginx/html

EXPOSE 80
