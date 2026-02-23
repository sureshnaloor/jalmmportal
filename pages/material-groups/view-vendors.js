import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';

export default function ViewVendorsPage() {
  const router = useRouter();
  const { subgroupId } = router.query;
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subgroupInfo, setSubgroupInfo] = useState(null);

  useEffect(() => {
    if (router.isReady && subgroupId) {
      fetchSubgroupInfo();
      fetchVendors();
    }
  }, [router.isReady, subgroupId]);

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

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/vendorgroupmap/vendors-by-subgroup?subgroupId=${subgroupId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      
      const data = await response.json();
      setVendors(data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderComponent />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.headerText}>
            {subgroupInfo 
              ? `Vendors Mapped to ${subgroupInfo.groupName} - ${subgroupInfo.subgroupName}`
              : 'View Vendors'
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

        {!router.isReady || loading ? (
          <div className={styles.loading}>Loading vendors...</div>
        ) : (
          <div className={styles.content}>
            <div className={styles.groupsSection}>
              <h2>Mapped Vendors ({vendors.length})</h2>
              {vendors.length === 0 ? (
                <p>No vendors are currently mapped to this material subgroup.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Vendor Code</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, index) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
      <FooterComponent />
    </>
  );
}

