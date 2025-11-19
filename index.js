#! /usr/bin/env node

import { Command } from "commander";
import SitemapGenerator from "sitemap-generator";
import chalk from "chalk";
import { HttpProxyAgent } from "http-proxy-agent";
import { HttpsProxyAgent } from "https-proxy-agent";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pkg = JSON.parse(readFileSync(join(__dirname, "package.json"), "utf8"));

const program = new Command();

program
  .version(pkg.version)
  .argument("<url>", "URL to generate sitemap for")
  .option(
    "-f, --filepath <filepath>",
    "path to file including filename",
    "sitemap.xml",
  )
  .option(
    "-m, --max-entries <maxEntries>",
    "limits the maximum number of URLs per sitemap file",
    "50000",
  )
  .option(
    "-d, --max-depth <maxDepth>",
    "limits the maximum distance from the original request",
    "0",
  )
  .option("-q, --query", "consider query string")
  .option("-u, --user-agent <agent>", "set custom User Agent")
  .option("-v, --verbose", "print details when crawling")
  .option(
    "-c, --max-concurrency <maxConcurrency>",
    "maximum number of requests the crawler will run simultaneously",
    "5",
  )
  .option(
    "-r, --no-respect-robots-txt",
    "controls whether the crawler should respect rules in robots.txt",
  )
  .option("-l, --last-mod", "add Last-Modified header to xml")
  .option(
    "-g, --change-freq <changeFreq>",
    "adds a <changefreq> line to each URL in the sitemap.",
  )
  .option(
    "-p, --priority-map <priorityMap>",
    'priority for each depth url, values between 1.0 and 0.0, example: "1.0,0.8,0.6,0.4"',
  )
  .option("-x, --proxy <url>", "Use the passed proxy URL")
  .action((url, options) => {
    let arrayPriority = [];
    if (options.priorityMap) {
      arrayPriority = options.priorityMap.split(",");
    }

    const generatorOptions = {
      stripQuerystring: !options.query,
      filepath: options.filepath,
      maxEntriesPerFile: parseInt(options.maxEntries),
      maxDepth: parseInt(options.maxDepth),
      maxConcurrency: parseInt(options.maxConcurrency),
      respectRobotsTxt: options.respectRobotsTxt,
      lastMod: options.lastMod,
      changeFreq: options.changeFreq,
      priorityMap: arrayPriority,
    };

    if (options.userAgent) {
      generatorOptions.userAgent = options.userAgent;
    }

    if (options.proxy) {
      const httpProxyAgent = new HttpProxyAgent(options.proxy);
      const httpsProxyAgent = new HttpsProxyAgent(options.proxy);
      generatorOptions.httpAgent = httpProxyAgent;
      generatorOptions.httpsAgent = httpsProxyAgent;
    }

    const generator = SitemapGenerator(url, generatorOptions);

    if (options.verbose) {
      let added = 0;
      let ignored = 0;
      let errored = 0;

      generator.on("add", (url) => {
        added += 1;
        console.log("[", chalk.green("ADD"), "]", chalk.gray(url));
      });

      generator.on("ignore", (url) => {
        ignored += 1;
        console.log("[", chalk.cyan("IGN"), "]", chalk.gray(url));
      });

      generator.on("error", (error) => {
        errored += 1;
        console.error(
          "[",
          chalk.red("ERR"),
          "]",
          chalk.gray(error.url, ` (${error.code})`),
        );
      });

      generator.on("done", () => {
        const message =
          "Added %s pages, ignored %s pages, encountered %s errors.";
        const stats = [chalk.white(message), added, ignored, errored];
        console.log.apply(this, stats);
        process.exit(0);
      });
    }

    generator.start();
  });

program.parse();
