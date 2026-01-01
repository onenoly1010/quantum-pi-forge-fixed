# Logos Folder

This folder contains uploaded logo images for the Quantum Pi Forge application.

## Accessing Logos

Uploaded logos are publicly accessible at:
```
/logos/[filename]
```

## Upload Interface

To upload new logos, visit:
```
/upload-logo
```

## Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- SVG (.svg)

## File Size Limit

Maximum file size: 5MB

## API Endpoints

### Upload Logo
```
POST /api/upload-logo
Content-Type: multipart/form-data
Field: file
```

### List Uploaded Logos
```
GET /api/upload-logo
```

Returns JSON with list of uploaded files:
```json
{
  "files": [
    {
      "name": "logo.png",
      "url": "/logos/logo.png"
    }
  ]
}
```
