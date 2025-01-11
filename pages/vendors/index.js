import React, { useState, useEffect } from 'react';
import useDebounce from '../../lib/useDebounce'; // Adjust the path as necessary
import styles from './Vendors.module.css'; // Adjust the path as necessary

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 100);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    vendorname: '',
    countrycode: '',
    city: '',
    address1: '',
    address2: '',
    pobox: '',
    zipcode: '',
    telephone1: '',
    telephone2: '',
    salesname: '',
    salesemail: '',
    salesmobile: '',
    fax: '',
    companyregistrationnumber: '',
    companyemail: '',
    vendorcode: '',
    companywebsite: ''
  });
  const [shouldFetch, setShouldFetch] = useState(false);
  const [showNewVendorModal, setShowNewVendorModal] = useState(false);

  useEffect(() => {
    const fetchVendors = async () => {
      if (debouncedSearchTerm.length >= 4) {
        const response = await fetch(`/api/registeredvendors?search=${debouncedSearchTerm}`);
        const data = await response.json();
        setVendors(data);
      } else {
        setVendors([]);
      }
    };

    fetchVendors();
  }, [debouncedSearchTerm, shouldFetch]);

  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setFormData({
      vendorname: vendor.vendorname,
      countrycode: vendor.address?.countrycode || '',
      city: vendor.address?.city || '',
      address1: vendor.address?.address1 || '',
      address2: vendor.address?.address2 || '',
      pobox: vendor.address?.pobox || '',
      zipcode: vendor.address?.zipcode || '',
      telephone1: vendor.contact?.telephone1 || '',
      telephone2: vendor.contact?.telephone2 || '',
      salesname: vendor.contact?.salesname || '',
      salesemail: vendor.contact?.salesemail || '',
      salesmobile: vendor.contact?.salesmobile || '',
      fax: vendor.contact?.fax || '',
      companyregistrationnumber: vendor.companyregistrationnumber || '',
      companyemail: vendor.companyemail || '',
      vendorcode: vendor.vendorcode || '',
      companywebsite: vendor.companywebsite || ''
    });
  };

  const handleSave = async () => {
    const response = await fetch(`/api/registeredvendors`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ _id: selectedVendor._id, ...formData })
    });

    if (response.ok) {
      const updatedVendor = await response.json();
      setVendors((prevVendors) =>
        prevVendors.map((vendor) =>
          vendor._id === updatedVendor._id ? { ...vendor, ...updatedVendor } : vendor
        )
      );
      setSelectedVendor(null);
      setFormData({
        vendorname: '',
        countrycode: '',
        city: '',
        address1: '',
        address2: '',
        pobox: '',
        zipcode: '',
        telephone1: '',
        telephone2: '',
        salesname: '',
        salesemail: '',
        salesmobile: '',
        fax: '',
        companyregistrationnumber: '',
        companyemail: '',
        vendorcode: '',
        companywebsite: ''
      });
      setShouldFetch(!shouldFetch); // Trigger re-fetch
    }
  };

  const handleNewVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/registeredvendors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create vendor');
      }

      await fetchVendors(); // Refresh the list
      setShowNewVendorModal(false); // Close the modal
      resetForm(); // Clear the form
    } catch (error) {
      console.error('Error creating vendor:', error);
      // You might want to show an error message to the user here
    }
  };

  const resetForm = () => {
    setFormData({
      vendorname: '',
      countrycode: '',
      city: '',
      address1: '',
      address2: '',
      pobox: '',
      zipcode: '',
      telephone1: '',
      telephone2: '',
      salesname: '',
      salesemail: '',
      salesmobile: '',
      fax: '',
      companyregistrationnumber: '',
      companyemail: '',
      vendorcode: '',
      companywebsite: ''
    });
  };

  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="Search vendors..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Country Code</th>
            <th>City</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Company Registration Number</th>
            <th>Company Email</th>
            <th>Vendor Code</th>
            <th>Company Website</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor._id} className='border-b border-gray-200 text-sm'>
              <td className='font-bold italic text-sky-800'>{vendor.vendorname}</td>
              <td className='text-teal-800'>{vendor.address?.countrycode}</td>
              <td className='text-teal-800'>{vendor.address?.city}</td>
              <td>
                <span className='block font-bold text-red-800'>Add1: {vendor.address?.address1} </span>
                {vendor.address?.address2}<br />
                {vendor.address?.pobox}<br />
                {vendor.address?.zipcode}
              </td>
              <td>
                <span className="block">Tel1: {vendor.contact?.telephone1}</span>
                <span className="block">Tel2: {vendor.contact?.telephone2}</span>
                <span className="block text-red-800 font-semibold">Sales Name: {vendor.contact?.salesname}</span>
                <span className="block text-emerald-800">Sales Email: {vendor.contact?.salesemail}</span>
                <span className="block text-blue-800">Sales Mobile: {vendor.contact?.salesmobile}</span>
                <span className="block">Fax: {vendor.contact?.fax}</span>
              </td>
              <td>{vendor.companyregistrationnumber}</td>
              <td>{vendor.companyemail}</td>
              <td>{vendor.vendorcode}</td>
              <td>{vendor.companywebsite}</td>
              <td>
                <button 
                  className={styles.editButton} 
                  onClick={() => handleEdit(vendor)}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedVendor && (
        <div className={styles.editFormContainer}>
          <div className={styles.editForm}>
            <h3>Edit Vendor {selectedVendor.vendorname}</h3>
            
            {/* Company Information Group */}
            <div className={styles.formGroup}>
              <h4 className={styles.formGroupTitle}>Company Information</h4>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>Vendor Name</label>
                  <input
                    type="text"
                    value={formData.vendorname}
                    onChange={(e) => setFormData({ ...formData, vendorname: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label className={styles.label}>Country Code</label>
                  <input
                    type="text"
                    value={formData.countrycode}
                    onChange={(e) => setFormData({ ...formData, countrycode: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label className={styles.label}>City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label className={styles.label}>Address 1</label>
                  <input
                    type="text"
                    value={formData.address1}
                    onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                    className={styles.input}
                  />
                </div>
                
                <div className={styles.formField}>
                  <label className={styles.label}>Address 2</label>
                  <input
                    type="text"
                    value={formData.address2}
                    onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Pobox</label>
                  <input
                    type="text"
                    value={formData.pobox}
                    onChange={(e) => setFormData({ ...formData, pobox: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Zipcode</label>
                  <input
                    type="text"
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* You can continue with other groups following the same pattern */}
            <div className={styles.formGroup}>
              <h4 className={styles.formGroupTitle}>Contact Information</h4>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>Telephone 1</label>
                  <input type="text" value={formData.telephone1} onChange={(e) => setFormData({ ...formData, telephone1: e.target.value })} className={styles.input} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Telephone 2</label>
                  <input type="text" value={formData.telephone2} onChange={(e) => setFormData({ ...formData, telephone2: e.target.value })} className={styles.input} />
                </div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <h4 className={styles.formGroupTitle}>Sales Information</h4>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>Sales Name</label>
                  <input type="text" value={formData.salesname} onChange={(e) => setFormData({ ...formData, salesname: e.target.value })} className={styles.input} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Sales Email</label>
                  <input type="text" value={formData.salesemail} onChange={(e) => setFormData({ ...formData, salesemail: e.target.value })} className={styles.input} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Sales Mobile</label>
                  <input type="text" value={formData.salesmobile} onChange={(e) => setFormData({ ...formData, salesmobile: e.target.value })} className={styles.input} />
                </div>
              </div>
            </div>
            <div className={styles.formGroup}>
              <h4 className={styles.formGroupTitle}>Company Registration Number</h4>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label className={styles.label}>Company Registration Number</label>
                  <input type="text" value={formData.companyregistrationnumber} onChange={(e) => setFormData({ ...formData, companyregistrationnumber: e.target.value })} className={styles.input} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Company Email</label>
                  <input type="text" value={formData.companyemail} onChange={(e) => setFormData({ ...formData, companyemail: e.target.value })} className={styles.input} />
                </div>
               
                <div className={styles.formField}>
                  <label className={styles.label}>Company Website</label>
                  <input type="text" value={formData.companywebsite} onChange={(e) => setFormData({ ...formData, companywebsite: e.target.value })} className={styles.input} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.label}>Vendor Code</label>
                  <input type="text" value={formData.vendorcode} onChange={(e) => setFormData({ ...formData, vendorcode: e.target.value })} className={styles.input} />
                </div>

              </div>
            </div>
            
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
          </div>
        </div>
      )}
      {/* Add New Button */}
      <button 
        className={styles.addNewButton}
        onClick={() => setShowNewVendorModal(true)}
      >
        +
      </button>

      {/* New Vendor Modal */}
      {showNewVendorModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Add New Vendor</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowNewVendorModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleNewVendorSubmit}>
              {/* Company Information Group */}
              <div className={styles.formGroup}>
                <h4 className={styles.formGroupTitle}>Company Information</h4>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.label}>Vendor Name</label>
                    <input
                      type="text"
                      value={formData.vendorname}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        vendorname: e.target.value 
                      })}
                      className={styles.input}
                      required
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.label}>Country Code</label>
                    <input
                      type="text"
                      value={formData.countrycode}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        countrycode: e.target.value 
                      })}
                      className={styles.input}
                      required
                    />
                  </div>
                  
                  <div className={styles.formField}>
                    <label className={styles.label}>City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        city: e.target.value 
                      })}
                      className={styles.input}
                      required
                    />
                  </div>

                  {/* Add more fields following the same pattern */}
                </div>
              </div>

              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}