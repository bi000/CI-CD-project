# =========================
# build react vite application
# =========================
# set the base image to node 20 alpine 
FROM node:20-alpine AS builder
# set working directory inside the container
WORKDIR /app
# copy package.json and package-lock.json to the working directory
# this helps with docker caching, so that we don't have to reinstall dependencies if they haven't changed
COPY package*.json ./
# install dependencies
RUN npm install
# copy the rest of the application code to the working directory
COPY . .
# build the application for the production
RUN npm run build
# =========================
# Stage -2: server the application using nginx
# =========================
# setting the base image to nginx
FROM nginx:alpine
# copy the build output file form the previous stage to the nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html
# Expose port 80 to the outside world
EXPOSE 80
# start nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
