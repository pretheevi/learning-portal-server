import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@libsql/client'

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

const db = {
  all:   async (sql, args = []) => (await client.execute({ sql, args })).rows,
  get:   async (sql, args = []) => (await client.execute({ sql, args })).rows[0],
  run:   async (sql, args = []) => await client.execute({ sql, args }),
  exec:  async (sql) => await client.execute(sql),
  batch: async (stmts) => await client.batch(stmts),
  _client: client
}

export default db
