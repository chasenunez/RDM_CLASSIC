# Running RDM Classic in a container

The game is a static website. This packages the build toolchain, the compiled
site, and a web server into one image, so it runs the same way on a laptop, an
institutional VM, or whatever replaces both, without anyone needing to know
what Node or Vite is.

This is independent of the GitHub Pages deployment. Both continue to work, and
neither knows about the other.

---

## Quick start

You need a container runtime. If `docker info` prints server details, skip to
step 2.

**1. Install a runtime** (macOS, one time):

```bash
brew install colima docker && colima start
```

Colima is free and runs from the command line. Docker Desktop also works, but
its licence requires a paid subscription for organisations over 250 employees
or $10M revenue, which may matter here. On Linux, install `docker.io` or
`podman` from your distribution instead.

**2. Build the image:**

```bash
docker build -t rdm-classic .
```

**3. Run it:**

```bash
docker run --rm -p 8080:8080 rdm-classic
```

Open <http://localhost:8080/>. Stop it with Ctrl+C.

That is the whole thing. There is no database to provision, no configuration
file to fill in, and no network access required once the image is built.

### Or with Compose

```bash
docker compose up --build
```

Same result, one command, and it restarts automatically if the machine reboots.
Requires the Compose plugin (`brew install docker-compose` if `docker compose`
is not found).

---

## What to do when the code changes

**This is the part that matters for maintenance.** The image is a snapshot. It
does not update itself when the source changes.

### If the CI is running (the normal case)

Nothing. `.github/workflows/docker.yml` rebuilds and publishes on every push to
`main`. Pull the new image where it is deployed:

```bash
docker pull ghcr.io/chasenunez/rdm_classic:latest
```

```bash
docker rm -f rdm-classic && docker run -d --name rdm-classic -p 8080:8080 ghcr.io/chasenunez/rdm_classic:latest
```

For a release, tag it and CI publishes a pinned version too:

```bash
git tag v1.1.0 && git push origin v1.1.0
```

That produces `:1.1.0`, `:1.1` and `:latest`. Deployments should pin to a
version rather than `latest`, so an update is a deliberate act.

### Rebuilding by hand

```bash
docker build -t rdm-classic .
```

```bash
docker rm -f rdm-classic && docker run -d --name rdm-classic -p 8080:8080 rdm-classic
```

### Confirm the change actually shipped

A rebuild that appears to do nothing is nearly always the browser serving a
cached copy. Check the server rather than the page:

```bash
curl -s http://localhost:8080/ | grep -o '/assets/[^"]*\.js'
```

The hash is derived from the compiled bundle, so it moves whenever your change
alters the output. If it changed but the page still looks old, it is your
browser: hard-reload with Cmd+Shift+R.

An unchanged hash does not always mean the build failed. Comments, formatting
and anything else that minification discards produce a byte-identical bundle and
therefore the same hash. That is correct behaviour, not a stale build. To check
a change of that kind actually shipped, look for it in the image directly:

```bash
docker run --rm rdm-classic grep -r "some text you changed" /usr/share/nginx/html
```

### What needs no rebuild

Nothing. Every change to `src/`, `public/`, or the JSON data files requires a
rebuild, because the image contains compiled output rather than source.

---

## How it is put together

Four files, all at the repository root except one.

| File | What it does |
|---|---|
| `Dockerfile` | The build. Two stages: compile, then serve |
| `docker/nginx.conf` | Web server config: port, caching, gzip |
| `.dockerignore` | Keeps junk out of the build |
| `compose.yaml` | Convenience wrapper for build plus run |

### The Dockerfile, in two stages

**Stage one** starts from `node:22-alpine`, copies `package.json` and
`package-lock.json`, and runs `npm ci`. Only those two files are copied at
first, so Docker reuses the cached dependency layer until dependencies actually
change. Editing a component does not reinstall anything. `npm ci` rather than
`npm install` because it installs the lockfile exactly and fails if the
lockfile and `package.json` disagree, instead of quietly resolving newer
versions and producing something other than what was tested.

Then it copies the sources and runs the build.

**Stage two** starts from `nginxinc/nginx-unprivileged:alpine-slim`, copies in
the nginx config and the compiled site from stage one, and stops. Node,
`node_modules` and the sources do not travel to stage two. The finished image
is about 91MB, of which 32MB is the game's own PNG artwork and 30MB is nginx.

The base image is the nginx team's unprivileged variant, which runs as user
101 and listens on 8080. Nothing in the image runs as root, which institutional
image scanners tend to require. The `-slim` tag drops the njs scripting engine
and extra modules that a static site has no use for, saving about 60MB over the
plain `alpine` tag.

### The one genuinely tricky part: the base path

`vite.config.ts` sets `base: '/RDM_CLASSIC/'` because GitHub Pages serves the
site from a sub-path. That value is compiled into `index.html` and into
`asset()` in `src/lib/asset.ts` at build time, not read at runtime.

A container serving at the root would therefore ask for
`/RDM_CLASSIC/assets/index-abc123.js`, which does not exist there, and you
would get a blank page.

The Dockerfile overrides it per build:

```dockerfile
ARG BASE_PATH=/
RUN npm run build -- --base="${BASE_PATH}"
```

So the container serves at `/`, while `npm run build` outside Docker still
produces the GitHub Pages build from the unchanged config. To reproduce the
Pages layout in a container:

```bash
docker build --build-arg BASE_PATH=/RDM_CLASSIC/ -t rdm-classic:pages .
```

`vite.config.ts` is never modified. That is deliberate: it means containerising
the game cannot break the existing deployment.

### Caching, which matters more here than usual

Three rules in `docker/nginx.conf`, for three kinds of file:

- **`/assets/`** is fingerprinted by Vite. The filename contains a content
  hash, so a given URL can never change meaning. Cached for a year as
  `immutable`.
- **`/files/`, `/icons/`, `/downloads/`, `/fonts/`** are copied verbatim from
  `public/` and keep their filenames across builds, so the same URL *does*
  change meaning after an update. They revalidate every 5 minutes. Getting this
  wrong means players keep serving themselves the old game.
- **`index.html`** is never cached. If it were, a redeploy would reach nobody,
  because browsers would keep loading the old file pointing at the old bundles.

### The filenames with spaces

The sample project deliberately contains files like `soil samples.xlsx` and
`Text file.svg`. That is the lesson, not an oversight, and 19 files are
affected. The app requests them percent-encoded and nginx decodes and serves
them correctly, but this is the most likely thing to break silently if the
server is ever swapped or reconfigured. If you change anything about how files
are served, test one of them explicitly:

```bash
curl -I 'http://localhost:8080/files/sample_project/soil%20samples.xlsx'
```

It must return `200`. A `404` means whatever is serving the files is mangling
spaces, and the minigame will be unreachable.

---

## Troubleshooting

**Blank page, console shows 404s for `/assets/...`**
A base path mismatch. The image was built for one path and is being served at
another. Rebuild without `--build-arg`, or check what the page is asking for:
`curl -s http://localhost:8080/ | grep assets`.

**`Cannot connect to the Docker daemon`**
The runtime is not running. `colima start`, or open Docker Desktop.

**`port is already allocated`**
Something else has 8080. Use another: `docker run -p 9000:8080 rdm-classic`,
then open <http://localhost:9000/>. The left number is the one you visit.

**The page still looks old after a rebuild**
Almost always browser cache. Check the server first with the `grep -o
'/assets/[^"]*\.js'` command above, then hard-reload.

**`404` on a file whose name contains a space**
See the section above. The web server is not decoding `%20`.

**Build fails at `npm ci`**
`package.json` and `package-lock.json` disagree. Run `npm install` locally,
commit the updated lockfile, and rebuild.

---

## Deploying it somewhere

The image serves plain HTTP on 8080 and holds no state, so it can be run
anywhere and restarted freely. In front of it you will usually want a reverse
proxy terminating HTTPS.

```bash
docker run -d --name rdm-classic --restart unless-stopped -p 8080:8080 \
  ghcr.io/chasenunez/rdm_classic:1.0.0
```

Pin a version rather than `latest` so that updates happen when someone decides
they should, not whenever the container next restarts.
