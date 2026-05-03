import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function loadConfig() {
  const configPath = process.env.CONFIG_PATH || path.resolve(__dirname, '../config/config.json')
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch (ex) {
    if (ex.code === 'ENOENT') {
      console.warn(`config file not found at ${configPath}; using empty config`)
      return { passwordHash: null, jwtSecret: null, trustIps: [] }
    }
    throw ex
  }
}
