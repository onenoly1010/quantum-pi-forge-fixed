import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Get file extension
    const fileExtension = file.name.split('.').pop();
    
    // Create a safe filename (remove special characters and spaces)
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .toLowerCase();

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the upload path
    const uploadDir = join(process.cwd(), 'public', 'logos');
    const filePath = join(uploadDir, safeName);

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Write file to disk
    await writeFile(filePath, buffer);

    // Return success response with file URL
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      filename: safeName,
      url: `/logos/${safeName}`,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// GET endpoint to list uploaded logos
export async function GET() {
  try {
    const { readdir } = await import('fs/promises');
    const uploadDir = join(process.cwd(), 'public', 'logos');
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ files: [] });
    }

    const files = await readdir(uploadDir);
    const imageFiles = files
      .filter(file => !file.startsWith('.'))
      .map(file => ({
        name: file,
        url: `/logos/${file}`
      }));

    return NextResponse.json({ files: imageFiles });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
