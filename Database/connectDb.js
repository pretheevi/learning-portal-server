import { createClient } from '@libsql/client'
import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') })

let _client = null

function getClient() {
  if (!_client) {
    _client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
  }
  return _client
}

const db = {
  all:   async (sql, args = []) => (await getClient().execute({ sql, args })).rows,
  get:   async (sql, args = []) => (await getClient().execute({ sql, args })).rows[0],
  run:   async (sql, args = []) => await getClient().execute({ sql, args }),
  exec:  async (sql) => await getClient().execute(sql),
  batch: async (stmts) => await getClient().batch(stmts),
  get _client() { return getClient() }
}

export default db
