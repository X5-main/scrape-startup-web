# scrape-startup-web

## Purpose

This project builds a **library of all startups launched in the last 24 months** and, for each one, stores an **exact replica of its website** — a full offline mirror with complete assets — in this repository.

## How it works

For every startup in the library, this repository contains a subfolder that is a faithful, self-contained copy of that startup's public website:

- **One subfolder per startup** — named after the startup (e.g. `acme-ai/`).
- **Full assets** — HTML, CSS, JavaScript, images, fonts, and any other static resources required to render the site exactly as it appears online.
- **Exact replica** — each subfolder can be opened and browsed locally, reproducing the original site's look and behavior without network access to the original domain.

The goal is a durable, versioned archive: as startups launch, pivot, or shut down, their launch-time web presence remains preserved and reproducible here.

## Repository layout

```
<startup-name>/
  index.html        # entry point of the mirrored site
  assets/           # css, js, images, fonts, ...
  ...
```

Each subfolder is a complete, standalone snapshot of that startup's website at the time it was captured.
