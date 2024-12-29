#! /usr/bin/env node
import { program } from "commander";
import { createListener } from "./listener.js";
import * as util from 'node:util';
import info from './package.json' with { type: "json" };
program
    .version(info.version)
    .argument("<namespace>", "the relay namespace to listen to, e.g. namespace.servicebus.windows.net")
    .argument("<relay>", "the name of the relay to listen to")
    .argument("<url>", "the destination server to pass requests to, e.g. https://tessitura.local.net/api/")
    .showSuggestionAfterError()
    .showHelpAfterError()
    .action((ns, relay, url) => { createListener(ns, relay, url).catch((e) => program.error(util.inspect(e))); });
program.parse();
//# sourceMappingURL=index.js.map