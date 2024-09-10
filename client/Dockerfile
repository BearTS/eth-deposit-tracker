FROM node:lts-alpine AS base

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL
#ENV NODE_ENV=production

WORKDIR /frontend

COPY package.json .
RUN npm install
COPY . .
RUN npm run build

CMD HOSTNAME=0.0.0.0 npm run start