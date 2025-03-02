#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('lomi.')
  .description('CLI for lomi.\'s payment infrastructure')
  .version('1.0.0');

// Import commands
import('./commands/init.js').then(({ default: initCommand }) => {
  program.addCommand(initCommand);
});

import('./commands/api-key.js').then(({ default: apiKeyCommand }) => {
  program.addCommand(apiKeyCommand);
});

import('./commands/webhook.js').then(({ default: webhookCommand }) => {
  program.addCommand(webhookCommand);
});

import('./commands/dev.js').then(({ default: devCommand }) => {
  program.addCommand(devCommand);
});

// Error handling
program.on('command:*', () => {
  console.error(chalk.red('Invalid command'));
  console.log(`See ${chalk.blue('--help')} for a list of available commands.`);
  process.exit(1);
});

program.parse();
