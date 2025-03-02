import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../utils/config.js';
import { makeRequest } from '../utils/api.js';

const command = new Command('status');

command
  .description('Check lomi. API connection status')
  .action(async () => {
    const spinner = ora('Checking API connection...').start();

    try {
      const config = getConfig();
      
      // Test API connection using ping endpoint
      await makeRequest('/ping', {
        method: 'GET',
      });

      spinner.succeed('Connected to lomi. API');
      
      console.log('\nCurrent Configuration:');
      console.log('Environment:', chalk.blue(config.environment));
      console.log('API Key:', chalk.blue('•'.repeat(20) + config.apiKey.slice(-4)));
      
      if (config.environment === 'sandbox') {
        console.log('\nNote:', chalk.yellow('You are using the sandbox environment'));
        console.log('Switch to production when ready:', chalk.blue('lomi login'));
      }
    } catch (error) {
      spinner.fail('Failed to connect to lomi. API');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      
      console.log('\nTroubleshooting:');
      console.log('1. Check your API key:', chalk.blue('lomi login'));
      console.log('2. Verify your internet connection');
      console.log('3. Contact support if the issue persists');
      
      process.exit(1);
    }
  });

export default command; 