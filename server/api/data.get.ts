import { readFile, access } from 'node:fs/promises'
import { join } from 'node:path'
import type { AppData } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    // Path to the data.json file
    const dataPath = join(process.cwd(), 'public', 'data.json')
    
    // Check if file exists
    try {
      await access(dataPath)
    } catch {
      // File doesn't exist, return null to indicate fallback to localStorage
      return null
    }
    
    // Read the data from the file
    const fileContent = await readFile(dataPath, 'utf8')
    const data: AppData = JSON.parse(fileContent)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Error reading data:', error)
    
    // Return null to fallback to localStorage
    return null
  }
})
