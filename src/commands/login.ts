import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { saveConfig } from '../utils/config.js';

const command = new Command('login');

command
  .description('Set up your lomi. API credentials')
  .action(async () => {
    console.log(chalk.blue('\nLet\'s set up your lomi. API credentials\n'));
    console.log('You can find your API key at: https://lomi.africa/portal/settings/api-keys\n');

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your API key:',
        validate: (input: string) => input.length > 0 || 'API key is required',
      },
      {
        type: 'list',
        name: 'environment',
        message: 'Which environment would you like to use?',
        choices: ['production', 'sandbox'],
        default: 'sandbox',
      }
    ]);

    const spinner = ora('Verifying API key...').start();

    try {
      // Save credentials
      await saveConfig({
        projectName: process.cwd().split('/').pop() || 'default',
        apiKey: answers.apiKey,
        environment: answers.environment,
      });

      spinner.succeed('API credentials saved successfully!');
      
      console.log('\nYou can now use the lomi. CLI and SDK.');
      console.log('\nTry running:', chalk.blue('lomi status'), 'to verify your connection.');
    } catch (error) {
      spinner.fail('Failed to save API credentials');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

export default command; 