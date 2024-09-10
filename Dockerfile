FROM node:alpine  as builder
WORKDIR /app/

COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install
COPY . /app/

RUN yarn build

FROM node:alpine
ENV NODE_ENV=production

WORKDIR /app/

COPY --from=builder /usr/src/dist/ /app/
COPY package.json /app/
COPY yarn.lock /app/

RUN yarn install --production
CMD ["node", "index.js"]