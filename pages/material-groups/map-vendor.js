import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCommentDots } from '@fortawesome/free-solid-svg-icons';

export default function MapVendorPage() {
  const router = useRouter();
  const { subgroupId } = router.query;
  const [searchTerm, setSearchTerm] = useState('');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapping, setMapping] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [subgroupInfo, setSubgroupInfo] = useState(null);
  const [mappedVendors, setMappedVendors] = useState([]);
  const [loadingMapped, setLoadingMapped] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (router.isReady && subgroupId) {
      fetchSubgroupInfo();
      fetchMappedVendors();
    }
  }, [router.isReady, subgroupId]);

  useEffect(() => {
    if (searchTerm.length >= 3) {
      const timeoutId = setTimeout(() => {
        searchVendors();
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setVendors([]);
    }
  }, [searchTerm]);

  const fetchSubgroupInfo = async () => {
    try {
      const response = await fetch('/api/materialgroups');
      const data = await response.json();
      
      // Find the subgroup in the groups data
      for (const group of data) {
        const subgroup = group.subgroups.find(sg => sg._id === subgroupId);
        if (subgroup) {
          setSubgroupInfo({
            subgroupName: subgroup.name,
            groupName: group.name,
            subgroupDescription: subgroup.description
          });
          break;
        }
      }
    } catch (err) {
      console.error('Error fetching subgroup info:', err);
    }
  };

  const fetchMappedVendors = async () => {
    if (!subgroupId) return;
    try {
      setLoadingMapped(true);
      const response = await fetch(`/api/vendorgroupmap/vendors-by-subgroup?subgroupId=${subgroupId}`);
      if (!response.ok) throw new Error('Failed to fetch mapped vendors');
      const data = await response.json();
      setMappedVendors(data);
    } catch (err) {
      console.error('Error fetching mapped vendors:', err);
    } finally {
      setLoadingMapped(false);
    }
  };

  const searchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/vendors/search-enhanced?term=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search vendors');
      }
      
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error('Error searching vendors:', err);
      setError('Failed to search vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleMapVendor = async () => {
    if (!selectedVendor) {
      setError('Please select a vendor first');
      return;
    }

    try {
      setMapping(true);
      setError(null);
      setSuccess(null);

      const vendorCode = selectedVendor.vendorcode || selectedVendor['vendor-code'] || selectedVendor.vendorname || selectedVendor['vendor-name'];

      const response = await fetch('/api/vendorgroupmap/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorCode: vendorCode,
          subgroupId: subgroupId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to map vendor');
      }

      setSuccess(`Vendor "${selectedVendor.vendorname || selectedVendor['vendor-name']}" successfully mapped to this subgroup!`);
      setSelectedVendor(null);
      setSearchTerm('');
      setVendors([]);
      fetchMappedVendors();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error mapping vendor:', err);
      setError(err.message || 'Failed to map vendor');
    } finally {
      setMapping(false);
    }
  };

  const handleUnmapVendor = async (vendor) => {
    const vendorCode = vendor['vendor-code'] ?? vendor.vendorcode;
    const vendorName = vendor['vendor-name'] ?? vendor.vendorname;
    const isUnregistered = !!vendor.isUnregistered;
    const id = isUnregistered ? `unreg-${vendorName}` : vendorCode;
    try {
      setDeletingId(id);
      setError(null);
      const response = await fetch('/api/vendorgroupmap/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subgroupId,
          vendorCode: isUnregistered ? vendorName : vendorCode,
          isUnregistered
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to remove mapping');
      setSuccess(`Vendor "${vendorName}" removed from this subgroup.`);
      fetchMappedVendors();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error removing vendor mapping:', err);
      setError(err.message || 'Failed to remove vendor mapping');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>
            {subgroupInfo 
              ? `Map Vendor to ${subgroupInfo.groupName} - ${subgroupInfo.subgroupName}`
              : 'Map Vendor'
            }
          </h1>
          <button 
            className={styles.newButton}
            onClick={() => router.push('/material-groups')}
          >
            Back to Material Groups
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '4px', marginBottom: '20px', border: '1px solid #6ee7b7' }}>{success}</div>}

        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Search and Select Vendor</h2>
            
            <div className={styles.formField} style={{ marginBottom: '20px' }}>
              <label>Search Vendor (minimum 3 characters):</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type vendor name or code..."
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>

            {loading && <div className={styles.loading}>Searching vendors...</div>}

            {vendors.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Search Results:</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Vendor Code</th>
                      <th>Select</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, index) => {
                      const vendorName = vendor.vendorname || vendor['vendor-name'];
                      const vendorCode = vendor.vendorcode || vendor['vendor-code'];
                      const isSelected = selectedVendor && 
                        (selectedVendor.vendorname === vendorName || selectedVendor['vendor-name'] === vendorName);
                      
                      return (
                        <tr 
                          key={index} 
                          className={styles.groupRow}
                          style={{ 
                            backgroundColor: isSelected ? '#dbeafe' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedVendor(vendor)}
                        >
                          <td className={styles.groupName}>{vendorName || 'N/A'}</td>
                          <td className={styles.groupDescription}>{vendorCode || 'N/A'}</td>
                          <td>
                            <input
                              type="radio"
                              name="vendor"
                              checked={isSelected}
                              onChange={() => setSelectedVendor(vendor)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {selectedVendor && (
              <div style={{ 
                backgroundColor: '#eff6ff', 
                padding: '15px', 
                borderRadius: '4px', 
                marginBottom: '20px',
                border: '1px solid #93c5fd'
              }}>
                <h3 style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>Selected Vendor:</h3>
                <p><strong>Name:</strong> {selectedVendor.vendorname || selectedVendor['vendor-name']}</p>
                <p><strong>Code:</strong> {selectedVendor.vendorcode || selectedVendor['vendor-code'] || 'N/A'}</p>
              </div>
            )}

            <div className={styles.formActions}>
              <button 
                type="button" 
                className={styles.submitButton}
                onClick={handleMapVendor}
                disabled={!selectedVendor || mapping}
              >
                {mapping ? 'Mapping...' : 'Map Vendor'}
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => router.push('/material-groups')}
              >
                Cancel
              </button>
            </div>

            <hr style={{ margin: '32px 0 24px', border: 'none', borderTop: '1px solid #e5e7eb' }} />

            <h2 style={{ marginBottom: '16px' }}>Already Mapped Vendors ({mappedVendors.length})</h2>
            {loadingMapped ? (
              <div className={styles.loading}>Loading mapped vendors...</div>
            ) : mappedVendors.length === 0 ? (
              <p>No vendors are currently mapped to this material subgroup.</p>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Vendor Name</th>
                    <th>Vendor Code</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedVendors.map((vendor, index) => {
                    const code = vendor['vendor-code'] ?? vendor.vendorcode;
                    const rowId = vendor.isUnregistered ? `unreg-${vendor['vendor-name'] ?? vendor.vendorname}` : code;
                    const isDeleting = deletingId === rowId;
                    return (
                      <tr key={index} className={styles.groupRow}>
                        <td className={styles.groupName}>
                          {vendor['vendor-name'] || vendor.vendorname || 'N/A'}
                        </td>
                        <td className={styles.groupDescription}>
                          {vendor['vendor-code'] || vendor.vendorcode || 'N/A'}
                        </td>
                        <td className={styles.groupType}>
                          {vendor.isUnregistered ? 'Unregistered' : 'Registered'}
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            style={{ width: 'auto', padding: '4px 10px' }}
                            onClick={() => handleUnmapVendor(vendor)}
                            disabled={isDeleting}
                            title="Remove vendor from this subgroup"
                          >
                            {isDeleting ? 'Removing...' : 'Delete'}
                          </button>
                          <button
                            type="button"
                            className={styles.feedbackButton}
                            onClick={() => router.push({
                              pathname: '/material-groups/vendor-feedback',
                              query: {
                                vendorCode: vendor['vendor-code'] ?? vendor.vendorcode,
                                vendorName: vendor['vendor-name'] ?? vendor.vendorname,
                                subgroupId: subgroupId || ''
                              }
                            })}
                            title="Vendor feedback"
                          >
                            <FontAwesomeIcon icon={faCommentDots} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <FooterComponent />
    </>
  );
}

