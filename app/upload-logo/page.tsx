'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

interface UploadedFile {
  name: string;
  url: string;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  filename?: string;
  url?: string;
  size?: number;
  type?: string;
  error?: string;
}

interface FileListResponse {
  files: UploadedFile[];
}

export default function LogoUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadExistingFiles = async () => {
    try {
      const response = await fetch('/api/upload-logo');
      if (response.ok) {
        const data: FileListResponse = await response.json();
        setUploadedFiles(data.files);
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  // Load existing files on component mount
  useEffect(() => {
    loadExistingFiles();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus({ type: null, message: '' });
      
      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({
        type: 'error',
        message: 'Please select a file first',
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok && data.success) {
        setUploadStatus({
          type: 'success',
          message: `File uploaded successfully: ${data.filename}`,
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        // Reload the file list
        await loadExistingFiles();
        // Clear file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadStatus({
          type: 'error',
          message: data.error || 'Upload failed',
        });
      }
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: 'An error occurred during upload',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Logo Upload</CardTitle>
          <CardDescription>
            Upload logo images to the /public/logos folder
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div>
              <label htmlFor="file-input" className="block text-sm font-medium mb-2">
                Select Image File
              </label>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Accepted formats: JPEG, PNG, GIF, WebP, SVG (Max size: 5MB)
              </p>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="flex items-center justify-center bg-muted rounded-lg p-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 object-contain"
                  />
                </div>
                {selectedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Logo
                </>
              )}
            </Button>
          </div>

          {/* Status Message */}
          {uploadStatus.type && (
            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
              {uploadStatus.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Uploaded Logos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="border rounded-lg p-3 hover:border-primary transition-colors"
                  >
                    <div className="aspect-square bg-muted rounded-md mb-2 flex items-center justify-center overflow-hidden">
                      {file.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-xs truncate" title={file.name}>
                      {file.name}
                    </p>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
