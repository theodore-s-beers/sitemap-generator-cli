#! /usr/bin/env node

import { Command } from "commander";
import SitemapGenerator from "sitemap-generator";
import chalk from "chalk";
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
  .option(
    "--ignore-invalid-ssl",
    "ignore invalid SSL certificates when crawling",
  )
  .action((url, options) => {
    const generatorOptions = {
      stripQuerystring: !options.query,
      filepath: options.filepath,
      maxEntriesPerFile: parseInt(options.maxEntries),
      maxConcurrency: parseInt(options.maxConcurrency),
      respectRobotsTxt: options.respectRobotsTxt,
      ignoreInvalidSSL: !!options.ignoreInvalidSsl,
    };

    if (options.userAgent) {
      generatorOptions.userAgent = options.userAgent;
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
        console.log(chalk.white(message), added, ignored, errored);
        process.exit(0);
      });
    }

    // If not verbose, still need to wait for completion
    if (!options.verbose) {
      generator.on("done", () => process.exit(0));
    }

    generator.start();
  });

program.parse();
