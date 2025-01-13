FROM node:23.6-alpine AS build

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

WORKDIR /frontend

COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


FROM node:23.6-alpine AS prod

WORKDIR /frontend

COPY package*.json .
RUN npm install --omit=dev && npm install vite
COPY --from=build /frontend/dist ./dist
COPY --from=build /frontend/package*.json /frontend/vite.config.js ./

CMD ["npm", "run", "preview"]
