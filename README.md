# M3 Engineering Group — website

A static site. Plain HTML, one CSS file, one small JavaScript file. No build step, no
dependencies, no framework. Open `index.html` in a browser and it works.

```
index.html          Home
company.html        About, core values, leadership, certifications, gallery
key-staff/          Full biographies and registrations (URL: /key-staff/)
services.html       Six disciplines with capability lists (anchor links per discipline)
projects.html       Filterable index of 25 projects
careers.html        Openings
contact.html        Four offices + enquiry form
404.html            Not-found page
assets/css/site.css All styling
assets/js/site.js   Mobile menu, scroll reveals, project filter
assets/img/         logo-m3.svg (logo). Photos arrive when you run localise-images.sh
sitemap.xml         Update if you add pages
.nojekyll           Tells GitHub Pages to serve files as-is
```

---

## Publishing on GitHub Pages

1. Create a new repository on GitHub.
2. Upload the contents of this folder to the repository root — `index.html` must sit at
   the top level, not inside a subfolder.
3. In the repository, go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**, pick `main` and folder `/ (root)`,
   then **Save**.
5. Wait a minute. The site appears at `https://<your-username>.github.io/<repo-name>/`.

### Pointing m3eg.com at it

In **Settings → Pages → Custom domain**, enter `m3eg.com` and save. GitHub writes a
`CNAME` file into the repo. Then, at your DNS provider, set:

| Type  | Name  | Value                                                        |
|-------|-------|--------------------------------------------------------------|
| A     | `@`   | `185.199.108.153`                                            |
| A     | `@`   | `185.199.109.153`                                            |
| A     | `@`   | `185.199.110.153`                                            |
| A     | `@`   | `185.199.111.153`                                            |
| CNAME | `www` | `<your-username>.github.io`                                  |

Tick **Enforce HTTPS** once the certificate is issued (usually under an hour).

⚠️ **Do not change DNS until you are happy with the site**, because the moment `m3eg.com`
points at GitHub, the current WordPress site stops being reachable at that address.

---

## Two things to do before going live

### 1. Localise the images

The photographs currently load from the existing WordPress install
(`m3eg.com/wp-content/uploads/...`). That works right now, but it breaks the moment the
domain moves. Fix it by running, from the repository root:

```bash
bash localise-images.sh
```

That downloads all 30 photographs into `assets/img/` and rewrites the HTML to point at
the local copies. If any download fails the script tells you which, so nothing breaks
silently. Review with `git diff`, then commit.

The logo is already local (`assets/img/logo-m3.svg`) so it is not affected.

### 2. Connect the contact form

GitHub Pages serves static files only — it cannot process a form submission. Options:

- **Formspree** (free tier): create a form at formspree.io, then in `contact.html`
  replace `https://formspree.io/f/YOUR_FORM_ID` with your endpoint.
- **Keep Formstack**: replace the `<form>` block in `contact.html` with a link to the
  existing form at `studio2108.formstack.com`.
- **Do nothing**: the page already lists `info@m3eg.com` and direct phone numbers, so
  enquiries still reach you.

---

## Editing the site

Everything is hand-editable HTML. A few conventions worth knowing:

**Colours and type** live as CSS custom properties at the top of `assets/css/site.css`.
Change `--flow` and the accent colour updates everywhere.

**Adding a project**: copy an existing `<article class="prow">` block in
`projects.html`. The `data-discipline` attribute drives the filter — use one of
`wastewater`, `stormwater`, `stream`, `asset`, `transport`, `construction`. Also update
the count in the `data-count` paragraph at the bottom.

**Adding a job opening**: copy an `<article class="role">` block in `careers.html`.

**Navigation** has a Company dropdown (overview, core values, key staff, certifications,
photo gallery) and flat top-level links for the rest. It opens on hover, on keyboard focus,
and on tap, and closes on Escape or an outside click. It appears in both the header and
footer of every page, so a new page means editing all eight files. If that becomes tedious, that is the point at which a static site
generator like Eleventy or Astro starts earning its keep — both still output plain HTML.

**Swapping in the real logo**: the wordmark is inline SVG in the header and footer of
each page (search for `class="mark"`). Replace the `<svg>` with
`<img src="assets/img/logo.png" alt="M3 Engineering Group" width="120">` if you would
rather use the existing logo file.

---

## Notes on content

Copy was carried over from the existing site and tightened. Two things worth checking:

- **`SW / 04` on the projects page.** On the current site, the project titled *Force Main
  Condition Assessment and Rehabilitation* has a description about Essex Creek flood
  analysis in Maryland Heights — the title and body do not match. Both were carried over
  as-is. One of them needs correcting.
- **The Memphis office** is mentioned on the current Company page but has no address or
  phone anywhere on the site. It is listed here without a street address; fill it in when
  you have it, in `index.html` and `contact.html`.
- **Suite 620 has been added** to the St. Louis address. Your own website omitted it, but
  ACEC Missouri, SAM.gov and Dun & Bradstreet all list "911 Washington Avenue, Suite 620",
  so it looks like an omission on the old site rather than a change. Worth a glance.
- **Two biographies are missing.** `key-staff/` has full write-ups for Marjorie Melton,
  Marc Eshelman, Todd Williams and Mike Fitzhenry, taken from your existing bio pages.
  Paolla Zulske Kovalsky and Henry Frees have photos and titles but no biography, because
  no bio page for either could be found. Their entries show an italic "Biography to be
  added" note with a `TODO` comment in the HTML marking exactly where the text goes.
- **Gallery alt text.** The 16 photographs on `company.html#gallery` have empty `alt=""`
  attributes, because the images could not be viewed while building the page. Please add a
  short description to each one.

## URLs

`key-staff/` is a real directory containing `index.html`, so it serves at exactly
`https://m3eg.com/key-staff/` — the same URL as on the current WordPress site. Any existing
links or search rankings pointing there keep working.

The other consolidated pages did not get that treatment. These old URLs will 404 after the
switch:

| Old URL | Now lives at |
|---|---|
| `/values/` | `company.html#values` |
| `/certifications/` | `company.html#certifications` |
| `/photo-gallery/` | `company.html#gallery` |
| `/wastewater/` | `services.html#water-wastewater` |
| `/stormwater/` | `services.html#stormwater` |
| `/stream-restoration/` | `services.html#stream-restoration` |
| `/asset-management/` | `services.html#asset-management` |
| `/transportation/` | `services.html#transportation` |
| `/construction/` | `services.html#construction-management` |
| `/career/` | `careers.html` |
| `/st-louis/`, `/chicago/`, `/st-charles/` | `contact.html` |

Any of these can be given the same treatment as `key-staff/` — a folder with an
`index.html` that either holds the content or redirects. Say which ones matter and they can
be added. The individual staff bio pages (`/key-staff/marc-eshelman-pe/` and so on) are now
sections of one page rather than separate URLs.
