import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { getConfig, saveConfig } from '../utils/config.js';

const command = new Command('api-key');

command
  .description('Manage API keys')
  .command('set')
  .description('Set or update API key')
  .action(async () => {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key (from https://lomi.africa/portal/settings/api-keys):',
        validate: (input: string) => input.length > 0 || 'API key is required',
      },
      {
        type: 'list',
        name: 'environment',
        message: 'Which environment is this API key for?',
        choices: ['production', 'sandbox'],
        default: 'sandbox',
      },
    ]);

    try {
      const config = getConfig();
      await saveConfig({
        ...config,
        apiKey: answers.apiKey,
        environment: answers.environment,
      });

      console.log(chalk.green('\nAPI key updated successfully!'));
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Failed to update API key'));
      process.exit(1);
    }
  });

command
  .command('show')
  .description('Show current API key')
  .action(() => {
    try {
      const config = getConfig();
      console.log('\nCurrent configuration:');
      console.log(chalk.blue('API Key:'), config.apiKey);
      console.log(chalk.blue('Environment:'), config.environment);
    } catch (error) {
      console.error(chalk.red(error instanceof Error ? error.message : 'Failed to retrieve API key'));
      process.exit(1);
    }
  });

export default command;
