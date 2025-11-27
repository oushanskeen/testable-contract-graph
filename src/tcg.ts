#!/usr/bin/env node
// tcg.ts

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const path = require("path");
const { tcgcore } = require("../dist/tcgcore")

// Setup CLI options
const argv = yargs(hideBin(process.argv))
    .usage('Usage: $0 --contractGraph <file> --verifications <folder>')
    .option('contractGraph', {
        alias: 'c',
        type: 'string',
        describe: 'Path to the contract graph file',
        demandOption: true,
    })
    .option('verifications', {
        alias: 'v',
        type: 'string',
        describe: 'Path to the verifications folder',
        demandOption: true,
    })
    .help('h')
    .alias('h', 'help')
    .epilog('Example: node tcg --contractGraph contractGraph.md --verifications verifications')
    .argv;

// Resolve paths
const contractGraphPath = path.resolve(argv.contractGraph);
const verificationsPath = path.resolve(argv.verifications);

tcgcore(contractGraphPath, verificationsPath).verifiedMemaidRequirementsFromFile_v()
