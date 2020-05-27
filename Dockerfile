#Build
FROM node:12.16.3-slim as dependencies
WORKDIR /usr/src/app
ARG REACT_APP_AZURE_MAP_API_KEY
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

# Create Production Environment
FROM nginx:1.18-alpine
COPY --from=dependencies /usr/src/app/build /usr/share/nginx/html
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]