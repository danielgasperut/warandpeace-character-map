# War and Peace Character Map

A spoiler-safe, chapter-by-chapter relationship map for Leo Tolstoy’s *War and Peace*. Choose the chapter you have finished: the map shows only the people, relationships, household names, and descriptions available at that point.

[Open the published map](https://danielgasperut.github.io/warandpeace-character-map/)

## Use and edit it

Open [`docs/index.html`](docs/index.html) directly in a modern browser, or use the GitHub Pages link above. No installation, build, or local web server is needed.

To change the book’s content, edit [`docs/data/book.js`](docs/data/book.js). To adjust the appearance or layout, edit [`docs/assets/styles.css`](docs/assets/styles.css). The map behavior lives in [`docs/assets/map.js`](docs/assets/map.js) and should normally be reused unchanged for another book.

## Architecture

```text
docs/index.html
       │ loads
       ├── data/book.js       book-specific content and spoiler chronology
       ├── assets/map.js      slider, filtering, map, selections, and rendering
       └── assets/styles.css  shared visual design and responsive layout
```

`book.js` contains the complete editorial model: book/chapter ranges, social circles, people, ties, role/detail stages, person summaries, relationship timelines, source information, and the default selected person. `styles.css` contains colors, typography, spacing, layout, and mobile behavior. This split keeps editorial updates separate from design changes.

The browser loads `book.js` with a normal script tag rather than fetching JSON. That is intentional: the map works when opened from Finder as well as when hosted on GitHub Pages.

## Start a new book map

1. Create a new repository from this one, or copy its static structure.
2. Replace `docs/data/book.js` with a copy of [`docs/data/book.template.js`](docs/data/book.template.js).
3. Set the title, source, chapter ranges, default person, and theme in `metadata`.
4. Add social circles, then people, then named ties and chapter-stage summaries.
5. Follow [`CHARACTER-MAP-AUTHORING.md`](CHARACTER-MAP-AUTHORING.md) while writing profiles and relationship timelines.
6. Open `docs/index.html` locally and check chapter introductions and important turns in each relationship.
7. In the GitHub repository’s Pages settings, publish from the `main` branch’s `/docs` folder.

For another book, `book.js` is the content you replace; `map.js`, `styles.css`, and `index.html` are the reusable map kit.

## Spoiler-safety review

The map is deliberately conservative. At every introduction or change, check the preceding chapter and the introduction chapter: no person, relationship, title, role, or descriptive fact should appear before the reader could know it. When the text or edition makes timing uncertain, favor the later chapter.

Relationship notes should explain what is meaningful between the two people *at that point in the story*, using natural language and concrete scenes rather than generic map terminology. The full authoring rules and a data checklist are in [`CHARACTER-MAP-AUTHORING.md`](CHARACTER-MAP-AUTHORING.md).

## Source text

The chapter references and relationship notes were checked against [*War and Peace* on Project Gutenberg, eBook #2600](https://www.gutenberg.org/ebooks/2600), in the Aylmer and Louise Maude translation. The continuous slider runs through Books I–XV and the First and Second Epilogues (365 chapters total).
