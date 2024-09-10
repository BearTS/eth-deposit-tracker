FROM node:lts-alpine AS builder
WORKDIR /app/

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install
COPY src /app/src
COPY tsconfig.json /app/

RUN yarn build

FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /app/

COPY package.json /app/
COPY yarn.lock /app/
RUN yarn install --production

COPY --from=builder /app/dist /app/
CMD ["node", "index.js"]