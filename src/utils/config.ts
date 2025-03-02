import Conf from 'conf';
import { z } from 'zod';

const configSchema = z.object({
  projectName: z.string(),
  apiKey: z.string(),
  environment: z.enum(['production', 'sandbox']),
});

type Config = z.infer<typeof configSchema>;

const config = new Conf<Config>({
  projectName: 'lomi.',
  defaults: {
    projectName: '',
    apiKey: '',
    environment: 'sandbox',
  },
});

export async function saveConfig(data: Config): Promise<void> {
  try {
    const validatedData = configSchema.parse(data);
    config.set(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function getConfig(): Config {
  const data = {
    projectName: config.get('projectName'),
    apiKey: config.get('apiKey'),
    environment: config.get('environment'),
  };

  try {
    return configSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid configuration: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

export function clearConfig(): void {
  config.clear();
}
