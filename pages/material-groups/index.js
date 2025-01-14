import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './MaterialGroups.module.css';
import HeaderComponent from '../../components/HeaderComponent';

export default function MaterialGroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/materialgroups');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setGroups(data);
      } else {
        console.error('Received non-array data:', data);
        setGroups([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setGroups([]);
      setError('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = () => {
    const sortedGroups = [...groups].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.isService === b.isService ? 0 : a.isService ? 1 : -1;
      } else {
        return a.isService === b.isService ? 0 : a.isService ? -1 : 1;
      }
    });
    setGroups(sortedGroups);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/materialgroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGroup),
      });
      if (response.ok) {
        setNewGroup({ name: '', description: '', isService: false });
        fetchGroups();
      }
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleAddSubgroup = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/materialsubgroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubgroup),
      });
      if (response.ok) {
        setNewSubgroup({ groupId: '', name: '', description: '' });
        fetchGroups();
      }
    } catch (error) {
      console.error('Error adding subgroup:', error);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (confirm('Are you sure? This will delete all associated subgroups.')) {
      try {
        const response = await fetch(`/api/materialgroups?id=${groupId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchGroups();
        }
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleDeleteSubgroup = async (subgroupId) => {
    if (confirm('Are you sure you want to delete this subgroup?')) {
      try {
        const response = await fetch(`/api/materialsubgroups?id=${subgroupId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          fetchGroups();
        }
      } catch (error) {
        console.error('Error deleting subgroup:', error);
      }
    }
  };

  const handleNewClick = (type, groupId = null) => {
    const query = {
      type: type
    };
    if (groupId) {
      query.groupId = groupId;
    }
    router.push({
      pathname: '/material-groups/new',
      query
    });
  };

  const handleEditClick = (e, type, item) => {
    e.stopPropagation();
    router.push({
      pathname: '/material-groups/edit',
      query: {
        type: type,
        id: item._id
      }
    });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormType(null);
    setEditingItem(null);
    setError(null);
  };

  const handleGroupSubmit = async (formData) => {
    try {
      setError(null);
      const method = formData._id ? 'PUT' : 'POST';
      const body = formData._id 
        ? { id: formData._id, ...formData }
        : formData;

      const response = await fetch('/api/materialgroups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        fetchGroups();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save group');
      }
    } catch (err) {
      console.error('Error saving group:', err);
      setError('Failed to save group');
    }
  };

  const handleSubgroupSubmit = async (formData) => {
    try {
      setError(null);
      const method = formData._id ? 'PUT' : 'POST';
      const body = formData._id 
        ? { id: formData._id, ...formData }
        : formData;

      const response = await fetch('/api/materialsubgroups', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowForm(false);
        fetchGroups();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save subgroup');
      }
    } catch (err) {
      console.error('Error saving subgroup:', err);
      setError('Failed to save subgroup');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/material${type}s`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to delete ${type}`);
      }

      if (type === 'group') {
        setGroups(prevGroups => prevGroups.filter(group => group._id !== id));
        if (selectedGroup?._id === id) {
          setSelectedGroup(null);
        }
      } else if (type === 'subgroup') {
        const updatedGroups = groups.map(group => {
          if (group._id === selectedGroup._id) {
            const updatedGroup = {
              ...group,
              subgroups: group.subgroups.filter(subgroup => subgroup._id !== id)
            };
            setSelectedGroup(updatedGroup);
            return updatedGroup;
          }
          return group;
        });
        setGroups(updatedGroups);
      }

      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      setTimeout(() => setError(null), 3000);

    } catch (error) {
      console.error('Delete error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <div className={styles.formPage}>
        <div className={styles.formHeader}>
          <h2>{editingItem ? 'Edit' : 'New'} {formType}</h2>
          <button 
            className={styles.closeButton}
            onClick={handleCloseForm}
          >
            ×
          </button>
        </div>
        <div className={styles.formContent}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          {formType === 'group' ? (
            <GroupForm 
              initialData={editingItem}
              onSubmit={async (data) => {
                await handleGroupSubmit(data);
                if (!error) handleCloseForm();
              }}
              onCancel={handleCloseForm}
            />
          ) : (
            <SubgroupForm
              groupId={selectedGroup?._id}
              initialData={editingItem}
              onSubmit={async (data) => {
                await handleSubgroupSubmit(data);
                if (!error) handleCloseForm();
              }}
              onCancel={handleCloseForm}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
    <HeaderComponent />
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1 className={styles.headerText}>Material & Service Groups Management</h1>
        <div className={styles.actions}>
          <button 
            className={styles.newButton}
            onClick={() => handleNewClick('group')}
          >
            New Group
          </button>
          {selectedGroup && (
            <button 
              className={styles.newButton}
              onClick={() => handleNewClick('subgroup', selectedGroup._id)}
            >
              New Subgroup
            </button>
          )}
          <button 
            className={styles.sortButton}
            onClick={handleSort}
          >
            Sort by Type
          </button>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.content}>
          <div className={styles.groupsSection}>
            <h2>Groups</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map(group => (
                  <tr 
                    key={group._id}
                    className={selectedGroup?._id === group._id ? styles.selectedRow : ''}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <td className={styles.groupName}>{group.name}</td>
                    <td className={styles.groupDescription}>{group.description}</td>
                    <td className={styles.groupType}>{group.isService ? 'Service' : 'Material'}</td>
                    <td>
                      <button 
                        className={styles.editButton}
                        onClick={(e) => handleEditClick(e, 'group', group)}
                      >
                        Edit
                      </button>
                      <button 
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('group', group._id);
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.subgroupsSection}>
            <h2>Subgroups {selectedGroup && `for ${selectedGroup.name}`}</h2>
            {selectedGroup ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.subgroups.map(subgroup => (
                    <tr key={subgroup._id}>
                      <td className={styles.subgroupName} >{subgroup.name}</td>
                      <td className={styles.subgroupDescription}>{subgroup.description}</td>
                      <td>
                        <button 
                          className={styles.editButton}
                          onClick={(e) => handleEditClick(e, 'subgroup', subgroup)}
                        >
                          Edit
                        </button>
                        <button 
                          className={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete('subgroup', subgroup._id);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Select a group to view subgroups</p>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

// Form Components
function GroupForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    isService: false
  });

  return (
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <div className={styles.formField}>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className={styles.formField}>
        <label>Description:</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className={styles.formField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={formData.isService}
            onChange={(e) => setFormData({ ...formData, isService: e.target.checked })}
          />
          Is Service Group
        </label>
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Update' : 'Create'} Group
        </button>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function SubgroupForm({ groupId, initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    groupId: groupId
  });

  return (
    <form className={styles.form} onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <div className={styles.formField}>
        <label>Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className={styles.formField}>
        <label>Description:</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {initialData ? 'Update' : 'Create'} Subgroup
        </button>
        <button type="button" className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
} 