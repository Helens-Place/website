# Photos for helensplace.co.uk

All images are in place. They were prepared from the originals in the
"photos for website" folder by `scripts/process-photos.mjs`, which resizes them
for the web and converts the logo to a transparent PNG.

| Filename                 | What it is                                                        | Used on                     |
|--------------------------|-------------------------------------------------------------------|-----------------------------|
| `logo.png`               | The Helen's Place wordmark, brand purple on transparency           | Header                      |
| `helen-hero.jpg`         | At the desk, head resting on hand, bookshelf behind                | Homepage hero               |
| `helen-portrait.jpg`     | Seated portrait, blue cardigan, book on lap                        | About                       |
| `helen-book-laptop.jpg`  | Holding the open book, laughing at the laptop                      | The book                    |
| `helen-dog-sofa.jpg`     | On the sofa with the labrador                                      | Assessments                 |
| `helen-laptop-step.jpg`  | On the decking step with the laptop                                | Schools and training        |
| `helen-desk-working.jpg` | At the desk typing, wearing glasses                                | Research and expert witness |
| `helen-contact.jpg`      | With a mug, the Helen's Place artwork on the wall behind           | Contact and Speaking        |
| `helen-garden-laptop.jpg`| On the decking with the laptop, leaves in the foreground           | Courses                     |
| `helen-dog-bw.jpg`       | Black and white, with the labrador                                 | About, second image         |
| `book-cover.jpg`         | Literacy Learning Journeys cover                                   | Homepage book band, book    |

## Replacing or adding a photo

Drop a file in here with the same name and it appears on the next build. If a
file is ever missing, the site renders a labelled placeholder block in the brand
colours rather than breaking.

To prepare new originals:

```bash
node scripts/process-photos.mjs "<path to the folder of originals>"
```

## Alt text

Alt text is written per image and lives in the page content files, so it can be
edited in TinaCMS rather than in code.

## Not currently used

`white logo.png` from the original folder is the reversed version of the
wordmark. It is not needed yet because the header and footer both sit on light
backgrounds, but it is the one to reach for if a dark section is ever added.
