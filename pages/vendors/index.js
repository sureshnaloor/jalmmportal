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
            <tr key={vendor._id}>
              <td>{vendor.vendorname}</td>
              <td>{vendor.address?.countrycode}</td>
              <td>{vendor.address?.city}</td>
              <td>
                {vendor.address?.address1}<br />
                {vendor.address?.address2}<br />
                {vendor.address?.pobox}<br />
                {vendor.address?.zipcode}
              </td>
              <td>
                <span className="block">Tel1: {vendor.contact?.telephone1}</span>
                <span className="block">Tel2: {vendor.contact?.telephone2}</span>
                <span className="block">Sales Name: {vendor.contact?.salesname}</span>
                <span className="block">Sales Email: {vendor.contact?.salesemail}</span>
                <span className="block">Sales Mobile: {vendor.contact?.salesmobile}</span>
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
            <h3>Edit Vendor</h3>
            <label>
              Vendor Name:
              <input
                type="text"
                value={formData.vendorname}
                onChange={(e) => setFormData({ ...formData, vendorname: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Country Code:
              <input
                type="text"
                value={formData.countrycode}
                onChange={(e) => setFormData({ ...formData, countrycode: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              City:
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Address 1:
              <input
                type="text"
                value={formData.address1}
                onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Address 2:
              <input
                type="text"
                value={formData.address2}
                onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              PO Box:
              <input
                type="text"
                value={formData.pobox}
                onChange={(e) => setFormData({ ...formData, pobox: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Zip Code:
              <input
                type="text"
                value={formData.zipcode}
                onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Telephone 1:
              <input
                type="text"
                value={formData.telephone1}
                onChange={(e) => setFormData({ ...formData, telephone1: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Telephone 2:
              <input
                type="text"
                value={formData.telephone2}
                onChange={(e) => setFormData({ ...formData, telephone2: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Sales Name:
              <input
                type="text"
                value={formData.salesname}
                onChange={(e) => setFormData({ ...formData, salesname: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Sales Email:
              <input
                type="email"
                value={formData.salesemail}
                onChange={(e) => setFormData({ ...formData, salesemail: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Sales Mobile:
              <input
                type="text"
                value={formData.salesmobile}
                onChange={(e) => setFormData({ ...formData, salesmobile: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Fax:
              <input
                type="text"
                value={formData.fax}
                onChange={(e) => setFormData({ ...formData, fax: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Company Registration Number:
              <input
                type="text"
                value={formData.companyregistrationnumber}
                onChange={(e) => setFormData({ ...formData, companyregistrationnumber: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Company Email:
              <input
                type="email"
                value={formData.companyemail}
                onChange={(e) => setFormData({ ...formData, companyemail: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Vendor Code:
              <input
                type="text"
                value={formData.vendorcode}
                onChange={(e) => setFormData({ ...formData, vendorcode: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <label>
              Company Website:
              <input
                type="text"
                value={formData.companywebsite}
                onChange={(e) => setFormData({ ...formData, companywebsite: e.target.value })}
                className={styles.inputField}
              />
            </label>
            <button onClick={handleSave} className={styles.saveButton}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}