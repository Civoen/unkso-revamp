# UNKSO website (MVP)

Static website for Unknown Soldiers (UNKSO). Plain HTML, CSS and JavaScript, with no build step.

## Deploy with GitHub + Cloudflare Pages

1. Upload everything in this folder to the root of a GitHub repository. `index.html` must be at the top level, next to `js/` and `images/`.
2. In Cloudflare go to **Workers & Pages → Create → Pages → Connect to Git** and choose the repository.
3. Use these build settings:
   - **Framework preset:** None
   - **Build command:** leave empty
   - **Build output directory:** `/`
4. Click **Save and Deploy**. Every push to the main branch redeploys the site.
5. Optional: add your own domain under **Custom domains** in the Pages project.

## Pages

| File | Page |
|---|---|
| `index.html` | Homepage |
| `apply.html` | Application form (mockup, sends nothing yet) |
| `forums.html` | Forum index (mockup with sample "New" flags) |
| `perscom.html` | PERSCOM index (mockup, inner pages not built yet) |
| `company-mw4.html` | Bravo Company (Modern Warfare 4) |
| `company-bf6.html` | Charlie Company (Battlefield 6) |
| `company-eft.html` | Delta Company (Escape From Tarkov) |
| `admin.html` | Console: manage company members (demo) |
| `js/store.js` | Demo data store for the Console and company pages |
| `js/images.js` | Loads images from `images/` when they exist |
| `images/` | Put site images here. See `images/README.txt` for the filenames |

## Images

Upload images to `images/` using the filenames in `images/README.txt`. Each one replaces its placeholder as soon as it's deployed, and missing images just keep the placeholder.

## The Console (demo)

Open it with the padlock icon in the top menu. Pick a role when signing in:

- **Member:** can only view rosters
- **Moderator:** can add, edit, move and remove members
- **Admin:** the same, plus reset the demo data

**This is a mock.** There are no passwords, and changes are saved in each visitor's own browser, so nobody else sees them. Don't rely on it for real records. The starting roster is the `SEED` list near the top of `js/store.js`.

### Making it real later

1. Store members in Cloudflare D1 (a database).
2. Add Pages Functions under `functions/api/` (for example `GET/POST/PUT/DELETE /api/members`).
3. Protect `admin.html` and those endpoints with Cloudflare Access or Discord sign-in, and check each user's role on the server.
4. Swap the read/write functions in `js/store.js` for `fetch()` calls to the API. The pages only use `window.UNKSO`, so they won't need changing.

## Still to fill in

- **Homepage:** the story behind the name "Unknown Soldiers", and the Discord invite link for the Join Discord buttons
- **Application form:** the recruiter reply time ([X] days) and the example clan name
- **Company pages:** the platform for MW4 and BF6
- **Forums and PERSCOM:** replace the sample "New"/"Updated" flags once they're connected to real data

## Fonts

The pages use Gilroy Light and Gilroy ExtraBold when they're installed on the visitor's computer, and fall back to Plus Jakarta Sans otherwise. To show Gilroy to everyone, add the licensed `.woff2` files and point the `@font-face` rules at the top of each page's `<style>` block at them.
