import { useState, useEffect } from 'react';
import Select from 'react-select';

export default function VendorGroupMapping({ vendorCode }) {
  const [groups, setGroups] = useState([]);  //array of groups
  const [selectedOptions, setSelectedOptions] = useState([]); //array of selected options
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsResponse = await fetch('/api/materialgroups');
        const groupsData = await groupsResponse.json();

        const mappingsResponse = await fetch(`/api/vendorgroupmap?vendorCode=${vendorCode}`);
        const mappingsData = await mappingsResponse.json();

        const options = groupsData.flatMap(group => 
          group.subgroups.map(subgroup => ({
            value: subgroup._id,
            label: `${group.name} - ${subgroup.name}${subgroup.description ? ` (${subgroup.description})` : ''}`,
            isService: group.isService
          }))
        );

        setGroups(options);

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

      // Even if selectedOptions is empty, consider it a successful update
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
    <div className="p-4" style={{ position: 'relative' }}>
      <h2 className="text-xl font-bold mb-4">
        Material/Service Group Mapping for Vendor: {vendorCode}
      </h2>
      
      <div className="mb-4" style={{ position: 'relative' }}>
        <label className="block text-sm font-medium mb-2">
          Select Material/Service Groups
        </label>
        <div style={{ position: 'relative', minHeight: '50px' }}>
          <Select
            isMulti
            options={groups}
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
          />
        </div>
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