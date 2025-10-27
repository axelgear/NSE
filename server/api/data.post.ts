import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { AppData } from '~/types'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event) as AppData
    
    // Validate the data structure
    if (!body || typeof body !== 'object') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid data format'
      })
    }

    // Required fields validation
    if (!Array.isArray(body.stocks) || !Array.isArray(body.loans) || !Array.isArray(body.transactions)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required data arrays'
      })
    }

    // Update the lastUpdated timestamp
    body.lastUpdated = new Date().toISOString()

    // Path to the data.json file
    const dataPath = join(process.cwd(), 'public', 'data.json')
    
    // Write the data to the file
    await writeFile(dataPath, JSON.stringify(body, null, 2), 'utf8')
    
    return {
      success: true,
      message: 'Data saved successfully',
      lastUpdated: body.lastUpdated
    }
  } catch (error) {
    console.error('Error saving data:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save data to file'
    })
  }
})
