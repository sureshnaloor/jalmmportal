import { useState, useRef } from 'react';
import VendorGroupMapping from '../../components/VendorGroupMapping';
import HeaderComponent from '../../components/HeaderComponent';

export default function VendorGroupMappingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const searchVendors = async (term) => {
    if (!term) {
      setVendors([]);
      return;
    }

    setIsSearching(true);
    try {
      console.log('Searching for term:', term);
      const response = await fetch(`/api/vendors/search?term=${encodeURIComponent(term)}`);
      console.log('Search response status:', response.status);
      if (!response.ok) throw new Error('Search failed');
      const data = await response.json();
      console.log('Search results:', data);
      setVendors(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout
    searchTimeout.current = setTimeout(() => {
      searchVendors(term);
    }, 300);
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor["vendor-code"]);
    setSearchTerm(vendor.name);
    console.log(vendor["vendor-code"]);
    console.log(selectedVendor);
    setVendors([]); // Clear search results
  };

  return (
    <>
    <HeaderComponent />
    <div className="container mx-auto h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Vendor Group Mapping</h1>

      {/* Search Section */}
      <div className="mb-8 relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search vendor by name..."
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Search Results Dropdown */}
        {vendors.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {vendors.map((vendor) => (
              <div
                key={vendor.code}
                onClick={() => handleVendorSelect(vendor)}
                className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
              >
                <div className="font-medium text-sm  text-black">Vendor: {vendor["vendor-name"]}</div>
                <div className="text-sm text-gray-600">Code: {vendor["vendor-code"]}</div>
              </div>
            ))}
          </div>
        )}

        {isSearching && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Mapping Component */}
      {selectedVendor && (
        <div className="mt-4">
          <VendorGroupMapping vendorCode={selectedVendor} />
        </div>
      )}

      {/* No vendor selected state */}
      {!selectedVendor && (
        <div className="text-center text-gray-500 mt-8">
          Search and select a vendor to manage group mappings
        </div>
      )}
    </div>
    </>
  );
} 