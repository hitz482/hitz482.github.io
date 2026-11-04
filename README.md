# hitz482.github.io

Portfolio site for Aman Khandelwal. Plain HTML/CSS, no build step.

## Publish on GitHub Pages

1. Create a **public** repo named exactly `hitz482.github.io` on github.com/hitz482.
2. Push this folder to it:
   ```
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/hitz482/hitz482.github.io.git
   git push -u origin main
   ```
3. In the repo: Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site goes live at https://hitz482.github.io in a minute or two.

Your existing docs site at https://hitz482.github.io/HitzMergeTactics/ keeps working.

## Before you publish

Search `index.html` for `TODO`:
- Rename the three Fab listing buttons ("Listing 1/2/3") to the product names.
- Point "View on Fab" in the HITZ section at the HITZ listing.
- Put your LinkedIn profile URL in the contact links.
- Replace `assets/Aman_Khandelwal_Resume.pdf` with the updated resume (export the doc as PDF).

## Files

- `index.html`: the whole page
- `styles.css`: colours and layout (tokens at the top)
- `favicon.svg`: AK monogram
- `assets/img/`: screenshots from Steam and the HITZ docs site
