FROM node:23.6-alpine AS base

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /frontend

COPY package*.json .
RUN npm install
COPY . .


FROM base AS dev
CMD ["npm", "run", "dev"]

FROM base AS build
RUN npm run build


FROM nginx:1.27.3-alpine AS prod

COPY --from=build /frontend/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
