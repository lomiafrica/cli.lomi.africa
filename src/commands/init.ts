import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import { saveConfig } from '../utils/config.js';

const command = new Command('init');

const clientTemplate = `// Import the Lomi client
import { CustomersClient, PaymentLinksClient, WebhooksClient } from 'lomi.';

// Initialize clients with your API key from environment variables
const config = {
  apiKey: process.env.LOMI_API_KEY,
  baseUrl: process.env.LOMI_API_URL || 'https://api.lomi.africa/v1'
};

// Create client instances
export const customers = new CustomersClient(config.baseUrl, config.apiKey);
export const paymentLinks = new PaymentLinksClient(config.baseUrl, config.apiKey);
export const webhooks = new WebhooksClient(config.baseUrl, config.apiKey);

// Example: Create a payment link
async function createPaymentLink() {
  const link = await paymentLinks.create({
    merchant_id: 'your_merchant_id',
    title: 'Product Name',
    price: 1000,
    currency_code: 'XOF'
  });
  return link;
}

// Export all clients
export const lomi = {
  customers,
  paymentLinks,
  webhooks,
};

export default lomi;`;

const envTemplate = `# Your Lomi API Key (get it from https://lomi.africa/portal/settings/api-keys)
LOMI_API_KEY=your_api_key_here

# API URL (defaults to production)
# Use https://sandbox.api.lomi.africa/v1 for testing
LOMI_API_URL=https://api.lomi.africa/v1`;

command
  .description('Initialize a new lomi. project')
  .action(async () => {
    console.log(chalk.blue('\nWelcome to lomi.! Let\'s set up your project.\n'));

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
        message: 'Which environment would you like to use?',
        choices: ['production', 'sandbox'],
        default: 'sandbox',
      }
    ]);

    const spinner = ora('Setting up your project...').start();

    try {
      // Save config
      await saveConfig({
        projectName: process.cwd().split('/').pop() || 'default',
        apiKey: answers.apiKey,
        environment: answers.environment,
      });

      // Create lib directory
      const libDir = join(process.cwd(), 'lib');
      await mkdir(libDir, { recursive: true });

      // Create client file
      await writeFile(join(libDir, 'lomi.ts'), clientTemplate);

      // Create .env file if it doesn't exist
      const envPath = join(process.cwd(), '.env');
      const envContent = envTemplate.replace('your_api_key_here', answers.apiKey);
      if (answers.environment === 'sandbox') {
        envContent.replace('api.lomi.africa', 'sandbox.api.lomi.africa');
      }
      try {
        await writeFile(envPath, envContent, { flag: 'wx' });
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
          throw error;
        }
      }

      // Install the published npm package
      spinner.text = 'Installing lomi. client package...';
      execSync('npm install lomi.', { stdio: 'ignore' });

      spinner.succeed('Project initialized successfully!');
      
      console.log('\nCreated the following files:');
      console.log(chalk.blue('- lib/lomi.ts'), '- Client configuration with examples');
      console.log(chalk.blue('- .env'), '- Environment variables');
      
      console.log('\nQuick Start:');
      console.log(chalk.blue('1.'), 'Import the client:');
      console.log('   import { lomi } from \'./lib/lomi\';');
      
      console.log('\nExample: Create a payment link');
      console.log('   const link = await lomi.paymentLinks.create({');
      console.log('     merchant_id: \'your_merchant_id\',');
      console.log('     title: \'Product Name\',');
      console.log('     price: 1000,');
      console.log('     currency_code: \'XOF\',');
      console.log('     allowed_providers: [\'ORANGE\', \'WAVE\']');
      console.log('   });');
      
      console.log('\nFor local webhook testing, run:', chalk.blue('lomi dev'));
      console.log('Documentation:', chalk.blue('https://docs.lomi.africa'));
    } catch (error) {
      spinner.fail('Failed to initialize project');
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

export default command;
