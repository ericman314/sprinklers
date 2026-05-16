import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function loadConfig() {
  const configPath = process.env.CONFIG_PATH || path.resolve(__dirname, '../config/config.json')
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  if (!config.passwordHash) throw new Error(`config at ${configPath} is missing passwordHash`)
  if (!config.jwtSecret) throw new Error(`config at ${configPath} is missing jwtSecret`)
  return config
}
