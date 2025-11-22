# Sitemap Generator CLI

> Create XML sitemaps from the command line.

Generates a sitemap by crawling your site. Uses streams to efficiently write the sitemap to your drive. Creates multiple sitemaps if the threshold is reached. Respects `robots.txt` and meta tags.

## About This Fork

This is a maintained and modernized fork of the original [`sitemap-generator-cli`](https://github.com/lgraubner/sitemap-generator-cli) by Lars Graubner. The original project has not been maintained since ca. 2020. This fork includes:

- Migration to ESM (ES modules)
- Updated to use the modernized [`@t6e/sitemap-generator`](https://www.npmjs.com/package/@t6e/sitemap-generator) library
- Updated dependencies and security fixes
- Modern development setup with Vitest, ESLint 9, and Prettier

All credit for the original concept and implementation goes to Lars Graubner. This fork maintains the same MIT license.

## Install

This module is available on [npm](https://www.npmjs.com/).

```sh
# Install globally
npm install -g @t6e/sitemap-generator-cli

# Or execute directly with npx (no installation needed)
npx @t6e/sitemap-generator-cli https://example.com
```

Requires Node.js `>=20.0.0`.

## Usage

```sh
sitemap-generator [options] <url>
```

The crawler will fetch HTML pages and other file types [parsed by Google](https://support.google.com/webmasters/answer/35287?hl=en). If present, the `robots.txt` file will be taken into account, with rules applied to each URL to consider if it should be added to the sitemap. The crawler will not fetch URLs from a page if the `robots` meta tag with the value `nofollow` is present, and it will ignore a page completely if the `noindex` rule is present.

When the crawler finishes, the XML sitemap will be built and saved to your specified filepath. If the count of fetched pages is greater than 50,000, it will be split into multiple sitemap files plus a sitemap index file (Google does not allow more than 50,000 items in one sitemap).

### Examples

Basic usage:

```sh
sitemap-generator http://example.com
```

With custom output filepath:

```sh
sitemap-generator -f ./public/sitemap.xml http://example.com
```

With verbose output:

```sh
sitemap-generator -v http://example.com
```

Limit crawl depth:

```sh
sitemap-generator -d 2 http://example.com
```

## Options

```sh
sitemap-generator --help

Usage: sitemap-generator [options] <url>

Arguments:
  url                                      URL to generate sitemap for

Options:
  -V, --version                            output the version number
  -f, --filepath <filepath>                path to file including filename (default: "sitemap.xml")
  -m, --max-entries <maxEntries>           limits the maximum number of URLs per sitemap file (default: "50000")
  -d, --max-depth <maxDepth>               maximum crawl depth (0 = unlimited) (default: "0")
  -q, --query                              consider query string
  -u, --user-agent <agent>                 set custom User Agent
  -v, --verbose                            print details when crawling
  -c, --max-concurrency <maxConcurrency>   maximum number of requests the crawler will run simultaneously (default: "5")
  -r, --no-respect-robots-txt              controls whether the crawler should respect rules in robots.txt
  --ignore-invalid-ssl                     ignore invalid SSL certificates when crawling
  -h, --help                               display help for command
```

### `--filepath` / `-f`

Path to the file to write, including the filename itself. Path can be absolute or relative. Default is `sitemap.xml`.

Examples:

- `sitemap.xml`
- `mymap.xml`
- `/var/www/sitemap.xml`
- `./public/sitemap.xml`

### `--max-entries` / `-m`

Limits the maximum number of URLs per sitemap file. Useful for sites with lots of URLs. Defaults to 50,000 (Google's limit).

### `--max-depth` / `-d`

Maximum crawl depth from the original request. Set to `0` for unlimited depth (default), or specify a number to limit how deep the crawler will go. Useful for generating smaller sitemap files.

### `--max-concurrency` / `-c`

Maximum number of requests the crawler will run simultaneously. Defaults to 5.

### `--query` / `-q`

Consider URLs with query strings like `http://www.example.com/?foo=bar` as individual sites and add them to the sitemap. By default, query strings are stripped.

### `--user-agent` / `-u`

Set a custom User Agent string for crawling. Default is `Node/SitemapGenerator`.

### `--verbose` / `-v`

Print detailed messages during the crawling process, including:

- Each URL added to the sitemap (green)
- Each URL ignored (cyan)
- Each error encountered (red)
- Summary statistics when finished

### `--no-respect-robots-txt` / `-r`

Disable respect for `robots.txt` rules. By default, the crawler respects `robots.txt`.

### `--ignore-invalid-ssl`

Ignore invalid SSL certificates when crawling. Useful for development environments with self-signed certificates.
