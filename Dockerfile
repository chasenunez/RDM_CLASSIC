# syntax=docker/dockerfile:1
#
# RDM Classic, containerised.
#
# Two stages. The first compiles the site with Node; the second copies the
# result into a web server and throws Node away. The finished image holds
# static files and nginx, with no toolchain and no node_modules, which is why
# it is ~50MB rather than ~500MB.
#
# See DOCKER.md for how to build, run, and rebuild after a code change.

# ---------------------------------------------------------------------------
# Stage 1: build the static site
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build

WORKDIR /app

# Dependencies first, and only the two files that describe them. Docker caches
# layers by their inputs, so editing a component does not reinstall anything;
# only a change to package.json or the lockfile does.
COPY package.json package-lock.json ./

# `npm ci` installs the lockfile exactly, and fails if it disagrees with
# package.json. `npm install` would happily resolve newer versions and quietly
# produce a different app than the one that was tested.
RUN npm ci

# Now the sources. .dockerignore keeps node_modules, dist and .git out.
COPY . .

# Where the finished app will be served from.
#
# vite.config.ts sets base: '/RDM_CLASSIC/' for GitHub Pages, and that value is
# baked into index.html and into asset() at build time. A container serving at
# the root would then request /RDM_CLASSIC/assets/... and 404 on everything, so
# the container overrides it to "/".
#
#   docker build -t rdm-classic .                                 -> served at /
#   docker build --build-arg BASE_PATH=/RDM_CLASSIC/ -t x .        -> served at /RDM_CLASSIC/
#
# vite.config.ts is untouched either way, so `npm run build` outside Docker
# still produces the GitHub Pages build.
ARG BASE_PATH=/
RUN npm run build -- --base="${BASE_PATH}"

# ---------------------------------------------------------------------------
# Stage 2: serve it
# ---------------------------------------------------------------------------
#
# nginx-unprivileged is the nginx team's own image. It runs as uid 101 and
# listens on 8080, so nothing in this image runs as root. Plain nginx:alpine
# works too, but binds port 80 as root, which institutional image scanners
# tend to flag. The -slim variant drops njs and the extra modules, which this
# static site has no use for, and saves ~60MB.
FROM nginxinc/nginx-unprivileged:alpine-slim AS runtime

# Cache rules, gzip, and a note about the filenames containing spaces.
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# The built site. Nothing else from stage 1 comes with it.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Lets `docker ps` and any orchestrator tell "running" from "actually serving".
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:8080/ || exit 1
