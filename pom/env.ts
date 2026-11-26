import * as fs from 'node:fs';
import * as path from 'node:path';

const ENV_PATH = path.resolve(__dirname, '..', '.env');

if (fs.existsSync(ENV_PATH)) {
  process.loadEnvFile(ENV_PATH);
}

/** Значение из .env по имени ключа. Падает с понятной ошибкой, если ключа нет. */
export function env(key: string): string {
  const value = process.env[key];
  if (value === undefined) {
    throw new Error(`В .env не найден ключ ${key} (${ENV_PATH})`);
  }
  return value;
}
