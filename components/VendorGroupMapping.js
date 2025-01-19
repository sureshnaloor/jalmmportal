import { useState, useEffect, useRef } from 'react';
import Select from 'react-select';

export default function VendorGroupMapping({ vendorCode, vendorName }) {
  const [groups, setGroups] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const selectRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch groups with subgroups
        const groupsResponse = await fetch('/api/materialgroups');
        const groupsData = await groupsResponse.json();

        // Fetch existing mappings for this vendor
        const mappingsResponse = await fetch(`/api/vendorgroupmap?vendorCode=${vendorCode}`);
        const mappingsData = await mappingsResponse.json();

        // Create options for the select component
        const options = groupsData.flatMap(group => 
          group.subgroups.map(subgroup => ({
            value: subgroup._id,
            label: `${group.name} - ${subgroup.name}`,
            groupName: group.name,
            subgroupName: subgroup.name,
            isService: group.isService
          }))
        );

        setGroups(options);
        setFilteredOptions(options);

        // Set initial selections based on existing mappings
        const initialSelections = options.filter(option => 
          mappingsData.some(mapping => mapping.subgroupId === option.value)
        );
        setSelectedOptions(initialSelections);

      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vendorCode]);

  // Filter options based on search term
  useEffect(() => {
    if (!searchFilter) {
      setFilteredOptions(groups);
      return;
    }

    const searchRegex = new RegExp(searchFilter, 'i');
    const filtered = groups.filter(option => 
      searchRegex.test(option.groupName) || 
      searchRegex.test(option.subgroupName)
    );
    setFilteredOptions(filtered);
  }, [searchFilter, groups]);

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/vendorgroupmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorCode,
          subgroupIds: selectedOptions.map(option => option.value)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update mappings');
      }

      alert('Mappings updated successfully');
    } catch (err) {
      console.error(err);
      alert('Failed to update mappings');
    }
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      minHeight: 50,
    }),
    menuList: (base) => ({
      ...base,
    //   maxHeight: 'calc(100vh - 300px)', // Subtract header/footer space
      height: 'auto',
      overflowY: 'auto',
      padding: '8px 0',
    }),
    menu: (base) => ({
      ...base,
      position: 'absolute',
      width: '100%',
      zIndex: 1000, // Increased z-index
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
    valueContainer: (base) => ({
      ...base,
      maxHeight: '100px',
      overflowY: 'auto',
      padding: '2px 8px',
    }),
    multiValue: (base) => ({
      ...base,
      maxWidth: '100%',
      margin: '2px 6px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      whiteSpace: 'normal',
      wordWrap: 'break-word',
    }),
    option: (base) => ({
      ...base,
      padding: '8px 12px',
      fontSize: '14px',
      lineHeight: '1.5',
      color: 'black',
    }),
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">
        Material/Service Group Mapping for Vendor: {vendorName} ({vendorCode})
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Filter Groups
        </label>
        <div className="relative w-1/4 mb-4">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              if (selectRef.current) {
                selectRef.current.setState({ menuIsOpen: true });
              }
            }}
            placeholder="Search groups or subgroups..."
            className="w-full p-2 pr-8 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchFilter && (
            <button
              onClick={() => setSearchFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
        
        <label className="block text-sm font-medium mb-2">
          Select Material/Service Groups
        </label>
        <Select
          ref={selectRef}
          isMulti
          options={filteredOptions}
          value={selectedOptions}
          onChange={setSelectedOptions}
          className="w-full"
          classNamePrefix="select"
          placeholder="Select groups..."
          groupBy={option => option.isService ? 'Services' : 'Materials'}
          styles={customStyles}
          menuPlacement="auto"
          closeMenuOnSelect={false}
          isClearable={true}
          menuIsOpen={searchFilter.length > 0}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save Mappings
      </button>
    </div>
  );
} 