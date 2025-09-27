import express from 'express'
import path from 'path'
import fs from 'fs'

const router = express.Router()

// @route   GET /api/files/:filename
// @desc    Serve uploaded files
// @access  Public (files are served based on filename)
router.get('/:filename', (req, res) => {
  try {
    const filename = req.params.filename
    const filePath = path.join(process.cwd(), 'uploads', filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        message: 'File not found'
      })
    }

    // Get file stats
    const stats = fs.statSync(filePath)
    if (!stats.isFile()) {
      return res.status(404).json({
        message: 'File not found'
      })
    }

    // Set appropriate headers based on file extension
    const ext = path.extname(filename).toLowerCase()
    let contentType = 'application/octet-stream'

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg'
        break
      case '.png':
        contentType = 'image/png'
        break
      case '.gif':
        contentType = 'image/gif'
        break
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.txt':
        contentType = 'text/plain'
        break
    }

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stats.size)
    
    // Add cache headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400') // 24 hours
    res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`)

    // Handle conditional requests
    const ifNoneMatch = req.get('If-None-Match')
    const etag = `"${stats.mtime.getTime()}-${stats.size}"`
    
    if (ifNoneMatch === etag) {
      return res.status(304).end()
    }

    // Stream the file
    const fileStream = fs.createReadStream(filePath)
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error.message)
      if (!res.headersSent) {
        res.status(500).json({
          message: 'Error reading file'
        })
      }
    })

    fileStream.pipe(res)
  } catch (error) {
    console.error('File serve error:', error.message)
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router