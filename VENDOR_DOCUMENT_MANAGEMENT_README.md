# Vendor Document Management System

This system allows users to upload and manage vendor documents including CR, VAT copies, brochures, profile documents, and other vendor-related files.

## Features

### 1. Document Upload (`/vendordocupload`)
- **Vendor Selection**: Search and select vendors by name or code
- **Document Types**: Support for various document types:
  - Commercial Registration (CR)
  - VAT Certificate
  - Company Brochure
  - Company Profile
  - Business License
  - Quality Certificate
  - Insurance Certificate
  - Other Documents
- **File Support**: PDF, DOC, DOCX, JPG, JPEG, PNG files (max 10MB per file)
- **Multiple Files**: Upload multiple files at once
- **Metadata**: Add descriptions and document type categorization

### 2. Document Viewing (`/vendordocview`)
- **Vendor Search**: Search for vendors to view their documents
- **Document List**: View all uploaded documents with filtering by type
- **Document Viewer**: Built-in PDF and document viewer
- **Download**: Download individual documents
- **Delete**: Remove documents when no longer needed

### 3. File Organization
- **Vendor-Specific Folders**: Each vendor gets their own folder under `/public/[vendorcode]/`
- **Unique Filenames**: Files are renamed with timestamps to prevent conflicts
- **Database Tracking**: All file metadata is stored in MongoDB

## API Endpoints

### Upload Documents
- **POST** `/api/vendors/upload-documents`
- **Body**: FormData with files, vendorCode, documentType, description
- **Response**: Success status and uploaded document details

### Fetch Documents
- **GET** `/api/vendors/documents/[vendorcode]`
- **Response**: Array of documents for the specified vendor

### Delete Document
- **DELETE** `/api/vendors/documents/[vendorcode]/[documentId]`
- **Response**: Success status

## Database Schema

The system uses a MongoDB collection called `vendordocuments` with the following structure:

```javascript
{
  _id: ObjectId,
  filename: String,           // Unique filename with timestamp
  originalName: String,       // Original filename
  filePath: String,          // Path to file in public folder
  fileSize: Number,          // File size in bytes
  mimeType: String,          // MIME type of the file
  documentType: String,      // Type of document (CR, VAT, etc.)
  description: String,       // Optional description
  uploadedBy: String,        // Name of user who uploaded
  uploadedAt: String,        // ISO timestamp of upload
  vendorCode: String         // Vendor code for organization
}
```

## File Structure

```
public/
├── [vendorcode1]/
│   ├── document1_timestamp.pdf
│   ├── document2_timestamp.jpg
│   └── ...
├── [vendorcode2]/
│   ├── document1_timestamp.pdf
│   └── ...
└── ...
```

## Navigation

The system is integrated into the main navigation under:
- **Vendors** → **Upload Documents** (`/vendordocupload`)
- **Vendors** → **View Documents** (`/vendordocview`)

## Security Features

- **Authentication Required**: All pages require user authentication
- **File Type Validation**: Only allowed file types can be uploaded
- **File Size Limits**: 10MB maximum per file
- **Vendor-Specific Access**: Users can only access documents for vendors they have access to

## Usage

1. **Upload Documents**:
   - Navigate to Vendors → Upload Documents
   - Search for and select a vendor
   - Choose document type and add description
   - Select files to upload
   - Click "Upload Documents"

2. **View Documents**:
   - Navigate to Vendors → View Documents
   - Search for a vendor
   - Click "View Documents" to see all uploaded files
   - Use filters to find specific document types
   - View, download, or delete documents as needed

## Dependencies

- `next-connect`: For API route handling
- `multer`: For file upload processing
- `react-file-viewer`: For document viewing
- `react-toastify`: For user notifications
- `next-auth`: For authentication

## Error Handling

- File upload errors are displayed to users
- Database connection errors are logged
- File system errors are handled gracefully
- User-friendly error messages throughout the interface
