# fritter-crawler

Rough draft of a script for crawling the fritter network.

Writes all `profile.json` files to `fritters/${key}.json`.

If no `profile.json` is found in a dat link, writes the 404 error to `not-fritters/${key}.json`.

The goal is to eventually analyze and visualize the fritter network using the dataset produced by this crawler.

TODO:

- retries
- better logging

## License

ISC
