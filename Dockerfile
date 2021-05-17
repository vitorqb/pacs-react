FROM nginx:1.17-alpine

ARG VERSION
ARG BUILD_DIR=./build

# Dependencies
RUN apk update && apk upgrade && apk add --no-cache curl tar

# Copies the artifact
COPY "${BUILD_DIR}/pacs-react_${VERSION}.tar.gz" /artifact.tar.gz

# Unzip the artifact
RUN mkdir /serve && cd /serve && tar -vzxf /artifact.tar.gz

# Copies the config
COPY nginx.config /etc/nginx/nginx.conf

# Exposes port
EXPOSE 8000
