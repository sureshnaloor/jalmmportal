# Vendor Dashboard

A comprehensive vendor management dashboard that provides a consolidated view of vendor information, purchase orders, evaluations, and more.

## Features

### 1. Vendor Search
- **Minimum 3 characters required** for search
- Searches both `vendors` and `registeredvendors` collections
- Real-time search with debounced input
- Displays vendor name, code, and source

### 2. Vendor Details Dashboard
When a vendor is selected, the dashboard displays:

#### Complete Vendor Information
- Company details (registration number, email, website, tax number)
- Full address information
- Contact details with edit capability

#### Purchase Order Summary
- Total PO value and count
- PO table sorted by date (most recent first)
- Individual PO details including value and balance

#### Vendor Group Mappings
- Material and service group mappings
- Edit capability to add/remove mappings
- Visual indicators for service vs material groups

#### Vendor Evaluation
- Overall grade and total score
- Evaluation year information
- Historical evaluation data

#### Vendor Documents
- PDF document links
- Document type and name information
- Direct access to view documents

#### Sales Contact Management
- Sales representative details
- Edit capability for contact information
- Phone, email, and mobile information

## API Endpoints

### Search API
- **Endpoint**: `/api/vendors/search-enhanced`
- **Method**: GET
- **Parameters**: `term` (minimum 3 characters)
- **Returns**: Array of vendor search results

### Dashboard API
- **Endpoint**: `/api/vendors/dashboard/[vendorcode]`
- **Method**: GET
- **Parameters**: `vendorcode`
- **Returns**: Complete vendor dashboard data including:
  - Vendor details
  - PO summary and list
  - Group mappings
  - Evaluation data
  - Documents

## Usage

1. Navigate to **Vendors > Vendor Dashboard** from the main menu
2. Enter at least 3 characters in the search box
3. Click on a vendor from the search results
4. View comprehensive vendor information in the dashboard
5. Use edit buttons to modify contact details or group mappings

## Technical Details

### Frontend
- Built with React and Next.js
- Uses Tailwind CSS for styling
- Implements debounced search for performance
- Responsive design for mobile and desktop

### Backend
- MongoDB integration
- Searches multiple collections
- Aggregates data from various sources
- Error handling and validation

### Data Sources
- `vendors` collection (SAP vendors)
- `registeredvendors` collection (non-SAP vendors)
- `purchaseorders` collection
- `vendorgroupmap` collection
- `vendorevaluation` collection
- `vendorevaluationmarks` collection
- `vendordocuments` collection

## File Structure

```
pages/
├── vendor-dashboard/
│   └── index.js                 # Main dashboard page
└── api/
    └── vendors/
        ├── search-enhanced.js   # Enhanced search API
        └── dashboard/
            └── [vendorcode].js  # Dashboard data API
```

## Dependencies

- React
- Next.js
- Tailwind CSS
- react-toastify
- MongoDB
- FontAwesome icons

## Future Enhancements

- Export vendor data to PDF/Excel
- Bulk vendor operations
- Advanced filtering and sorting
- Vendor performance analytics
- Document upload functionality
- Email integration for vendor communications

