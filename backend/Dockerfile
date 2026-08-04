# ========================
#Dockerfile for building a Docker image for the application
# Stage 1: build the application
# ========================
# 1. Base Image
# we use the official node.js image as the base image.
# "20-alpine" is a lightweight version of the node.js image.
# Image can be accessed from another stage using 'builder' name.
FROM node:20-alpine AS builder
# 2. set the working directory in the container
# all next commands will be run inside  /app directory
WORKDIR /app
# 3. copy package.json and package-lock.json to the working directory
# This is important for docker caching layer
# If your code changes but your dependencies don't, Docker will use the cached layer and won't reinstall the dependencies
COPY package*.json ./
# 4. install dependencies
# --omit=dev flag is used to install only production dependencies
# Install only production dependencies to reduce the size of the final image
# ci refers clan install, which is faster and more reliable than npm install
RUN npm ci --omit=dev
#5. copy the rest of the application code to the working directory
# ====================
# Stage 2: create the final image 
# ====================
FROM node:20-alpine
# create none root user and group to run the application
RUN addgroup -S financeAppGroup && adduser -S financeAppUser -G financeAppGroup
# 1. set the working directory in the container
# both  uses /app as working directory, so we can copy the files from the builder stage to this stage
WORKDIR /app
#  copy the node_modules from the builder stage 1 to the final image
COPY --from=builder /app/node_modules ./node_modules

COPY . .
# 6. expose the port the app runs on
# set the ownership to the non-root user  and group we created earlier
RUN chown -R financeAppUser:financeAppGroup /app
# switch to the non-root user
USER financeAppUser
# expose the port the app runs on
EXPOSE 5000
# 7. define the command to run the application
CMD ["node","server.js"]
