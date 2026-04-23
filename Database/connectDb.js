import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import path from 'path'
const databasePath = path.resolve("./Database/learningPortal.db")

async function connectDb()  {
  try{
    const db = await open({
      filename: databasePath,
      driver: sqlite3.Database 
    })  
    console.log('Connected to Database Successfully')
    return db
  } catch (err) {
    throw err
  }
}

export default connectDb
