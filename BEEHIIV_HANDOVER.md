# beehiiv — outstanding work (handover)

Publication `dde0a37d-c50d-42f6-a315-8eced54dd3ad` · Site `7a4b3f42-8b40-49c9-823d-b53343beeeb6`
Public site: https://polymath-rn-collins.beehiiv.com

Authenticated work needs Claude in Chrome against a signed-in beehiiv session.
Get the bearer token from localStorage (the value matching `/^ey[A-Za-z0-9_-]+\.ey/`), send as
`Authorization: Bearer <tok>`.

## 1. Broken links — highest priority, live now

The nav has 5 broken links and the homepage has 6. All fail the same way: they point at `/{slug}`
but beehiiv serves tag pages at `/t/{slug}`. Verified: every `/t/` URL below returns 200.

Preferred fix — six redirects (Settings -> Website), which repairs nav, homepage and any link
already shared, in one move:

    /hidden-wiring      -> /t/hidden-wiring
    /formation-notes    -> /t/formation-notes
    /institutions-of-1  -> /t/institutions-of-1
    /in-the-field       -> /t/in-the-field
    /unsettled          -> /t/unsettled
    /built-by-rn        -> /t/built-by-rn

Fallback: edit the links by hand in the website builder (13 edits, misses anything already shared).

## 2. Publish the six custom pages

No page-level publish exists (`POST /api/v2/pages/{id}/publish` -> 404). Site-wide only:

    POST /api/v2/sites/{siteId}/publish?publication_id={pubId}
    {"publish_settings": true, "publish_page_ids": [ ...page uuids... ]}

Unpublished pages: formation-notes 842cb1ab · in-the-field ("Dispatches") a99850ea · unsettled 2d5b8e07
hidden-wiring 491bc724 · institutions-of-1 b6d8c212 · built-by-rn 1a3f72ed
(`subscribe` f896f720 shows unpublished but serves 200 publicly — default pages always serve. Leave it.)

UI route: app.beehiiv.com/website_builder_v2/editor -> "Publish..." top right.
The builder hard-refuses below ~1000px wide ("not supported on mobile devices"). Maximise first.

## 3. Alt text on the four published posts

All article images carry alt="" and no figcaption. 4-5 figures per post, ~17 total.
Logo and avatar DO have alt, so it is the article figures specifically.
Posts: the-smallest-institution-in-the-campaign · the-assets-afterlife · the-person-inside-the-asset
· the-2000-video. These are LIVE — editing republishes. Get RN's go-ahead per post.

## 4. Audit the 81 drafts (never started)

Per post: cover present; web_subtitle + the three meta_* descriptions present and free of internal
codes; body-image alt and rights lines; placeholders (TK / TODO / lorem / `***`); email_subject_line
and email_preview_text present; internal links that point at unpublished drafts (they 404 on send).

## API traps that cost hours

- Post fields take TWO body shapes. `web_subtitle`, `title`, `web_title`, `slug`, `meta_*` -> FLAT body.
  `content_tag_ids` -> `{post:{content_tag_ids:[...]}}`, else 400 "param is missing: post".
- Content tags: `/api/v2/content_tags?publication_id=...&per_page=25` returns all. PATCH display/description.
  DELETE -> 204. Strip a tag from its posts before deleting it.
- The posts list endpoint caps at 25 per page regardless of `limit`.
- A timed-out browser call has usually STILL EXECUTED. Check state before retrying.

## Context

82 posts, 4 published (the creator-economy set). Everything else is draft, so every department tag page
except creator-economy and institutions-of-1 renders empty to a reader. Fixing navigation matters, but
the publish state is what decides whether the site has anything on it.

Done already: 67/67 exhibits placed; 26 subtitles rewritten (no internal codes reader-facing);
nine HH-NN tags deleted; all posts filed into 12 departments; 3 junk drafts deleted (85 -> 82).
