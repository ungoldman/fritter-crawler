# fritter-crawler

Rough draft of a script for crawling the [fritter](https://github.com/beakerbrowser/fritter) network.

## Usage

```
npx fritter-crawler
```

⚠️ This program will immediately create two folders (`fritters` & `not-fritters`) in the working directory and begin writing files there.

Writes all `profile.json` files to `fritters/${key}.json`.

If no `profile.json` is found in a dat link, writes the 404 error to `not-fritters/${key}.json`.

## About

The goal is to eventually analyze and visualize the fritter network using the dataset produced by this crawler.

## TODO

- retries
- better logging
- make starting key and concurrency modifiable via CLI args
- add option to pipe to STDOUT

## License

ISC
