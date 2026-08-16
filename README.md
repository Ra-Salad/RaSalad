# rasalad.com — static site

A static version of the RA SALAD STUDIOS website, converted from the WordPress
original. The page markup is the fully rendered output of the live site, and
every image and video was copied from the WordPress installation at its original
resolution — nothing was re-encoded, resized or recompressed.

There is no PHP, no database and no build step to publish. Any static host will
serve it.

## Pages

| URL           | File                    |
| ------------- | ----------------------- |
| `/`           | `index.html`            |
| `/portfolio/` | `portfolio/index.html`  |
| `/contact/`   | `contact/index.html`    |
| unknown URLs  | `404.html`              |

## Layout

```
index.html, portfolio/, contact/, 404.html
data/portfolio-videos.js          the portfolio video list — edit this
styles/                           site and page stylesheets
scripts/                          site scripts and the contact form handler
media/video/                      the homepage header reel and its poster
media/logos/                      header logo, wordmark, app icons
media/stills/                     frames from finished work (home page)
media/behind-the-scenes/          on-set photography (contact page)
media/team/                       team portraits
media/thumbnails/                 portfolio grid posters
media/custom/                     drop new thumbnails here
tools/serve.ps1                   local preview server
robots.txt, sitemap.xml, .nojekyll
```

Nothing is named after a WordPress theme, a plugin, or a camera roll. Folders
describe what they hold.

Asset links are relative to each page, so the site works whether it is published
at a domain root or in a subdirectory. The one exception is `404.html`, which
uses root-relative paths because a host serves it for URLs at any depth; its
styling therefore assumes the site lives at a domain root.

## Preview locally

```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

Then open http://127.0.0.1:8099/. Opening the HTML files directly with `file://`
will not work correctly, because directory URLs like `/portfolio/` need a server
to resolve to `index.html`.

## Deploy to GitHub Pages

1. Create a repository and push these files to its default branch.
2. In **Settings → Pages**, set the source to that branch, folder `/ (root)`.
3. To serve it at `rasalad.com`, add a file named `CNAME` at the repository root
   containing exactly `rasalad.com`, then point the domain's DNS at GitHub Pages.
   Without a custom domain the site is served at
   `https://<user>.github.io/<repo>/`, which works too — only `404.html` styling
   depends on being at a domain root.

`.nojekyll` is present so GitHub publishes the files as-is instead of running
them through Jekyll.

## Portfolio videos

To add a video, reorder the grid or swap the reel, edit one file:

```
data/portfolio-videos.js
```

Each video is a small block with a YouTube ID, a title, its filter categories
and a thumbnail path. The grid follows the order of that list, and moving a
block up or down moves the video. Instructions are written at the top of the
file. Save it, refresh the page, and the change is live — there is nothing to
rebuild or recompile. Re-running the conversion does not overwrite it, so edits
made here are safe.

New thumbnails go in `media/custom/`. Use wide 16:9 images around 1500 pixels
across; larger files only slow the page down.

This replaces the WordPress video-gallery plugin, which is no longer part of the
site. The plugin measured and positioned every thumbnail with JavaScript, and it
miscounted the available width by a single pixel — which is why the grid kept
collapsing to two columns. Layout is now plain CSS Grid, so the browser sizes
the columns itself during a resize or zoom and there is nothing left to get the
arithmetic wrong. The plugin also drew a translucent black caption bar across
every thumbnail even though the captions were empty; that is gone.

Columns are 3 on desktop, 2 on tablets and 1 on phones.

## Contact form

WordPress handled form submissions in PHP, which a static host cannot do. The
form markup, styling and validation are unchanged; submissions now go to
[Formspree](https://formspree.io) instead. Formspree keeps the destination
address on its own servers, so the recipient email never appears in this site's
source.

To activate it:

1. Create a free Formspree form and point it at the address you want to receive
   messages at.
2. Formspree gives you an endpoint like `https://formspree.io/f/abcdwxyz`. Copy
   the last part — `abcdwxyz`.
3. Open `scripts/contact-form.js` and replace
   `PASTE_YOUR_FORMSPREE_FORM_ID_HERE` with that ID.

Until the ID is filled in, submitting shows the form's own "there has been some
error" message and logs an explanation to the browser console. Re-running the
conversion keeps whatever ID is already in the published file.

## Things worth knowing

- **The header video is large.** `media/video/homepage-header-reel.mov` is the
  original 95 MB QuickTime file from the WordPress media library, kept at full
  quality. It is under GitHub's 100 MB per-file limit, but GitHub will warn
  about it on push, and visitors on slow connections will wait. A still of the
  reel's own title card (`homepage-header-poster.jpg`) is shown until the file
  arrives, and the video is marked `playsinline` so iPhones play it in place
  instead of taking over the screen. Re-encoding it to H.264 MP4 would cut the
  size dramatically with no visible quality loss; if you do, update the `src`
  in `index.html`.
- **The home page has an empty `<title>`.** This carries over from the live site,
  where the WordPress site title is blank, so browser tabs and search results
  show the bare URL. Adding a title inside `<title></title>` in `index.html`
  would fix it.
- **Google Fonts is still loaded from Google.** The Saira Condensed stylesheet is
  requested from `fonts.googleapis.com`, exactly as the live site does. Self-host
  it if you would rather not depend on Google.
- **Search is gone.** The theme's 404 page had a WordPress search box; it is
  replaced with a link home, since there is no server to search with.
- **The reel no longer has a "REEL" button above it.** The plugin drew a filter
  button there, styled with white text on a transparent background, so it was
  invisible against the white page and filtered a list of one video. It was
  dropped rather than reproduced.
- **Video titles come from YouTube.** They are used for the popup caption and
  for screen readers, and live in `data/portfolio-videos.js`. One typo in a
  YouTube title ("An Ernest Surpise") is spelled correctly there; change it
  back if you would rather the two match.
