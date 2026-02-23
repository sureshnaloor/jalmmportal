import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import HeaderNewComponent from "../../components/HeaderNewComponent";
import { FiSearch, FiArrowUp, FiArrowDown, FiFolder, FiShoppingCart, FiClipboard, FiUsers, FiBarChart2, FiX, FiGrid, FiList, FiDownload } from 'react-icons/fi';
import FooterComponent from "../../components/FooterComponent";

function Projects1() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [network, setNetwork] = useState(null);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [networkPOs, setNetworkPOs] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [poDetails, setPODetails] = useState(null);
  const [selectedPOCardRef, setSelectedPOCardRef] = useState(null);
  const [poLayoutMode, setPOLayoutMode] = useState('card'); // 'card' or 'table'
  const [sortConfig, setSortConfig] = useState({
    key: 'project-name',
    direction: 'asc'
  });
  const [poSortConfig, setPOSortConfig] = useState({
    key: null,
    direction: 'asc'
  });
  const [networkPOSortConfig, setNetworkPOSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const { data: session } = useSession();

  // Create refs for PO cards
  const poCardRefs = useRef({});
  const networkPOCardRefs = useRef({});

  // Sort projects based on current sort configuration
  const sortedProjects = React.useMemo(() => {
    let sortableItems = [...projects];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [projects, sortConfig]);

  // Handle sort request
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle PO sort request
  const requestPOSort = (key) => {
    let direction = 'asc';
    if (poSortConfig.key === key && poSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setPOSortConfig({ key, direction });
  };

  // Handle Network PO sort request
  const requestNetworkPOSort = (key) => {
    let direction = 'asc';
    if (networkPOSortConfig.key === key && networkPOSortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setNetworkPOSortConfig({ key, direction });
  };

  // Sort purchase orders based on current sort configuration
  const sortedPurchaseOrders = useMemo(() => {
    if (!poSortConfig.key) return purchaseOrders;
    
    let sortableItems = [...purchaseOrders];
    
    sortableItems.sort((a, b) => {
      // Special handling for status sorting
      if (poSortConfig.key === 'status') {
        const aStatus = a.balgrval === 0 ? 'complete' : 'pending';
        const bStatus = b.balgrval === 0 ? 'complete' : 'pending';
        
        // Pending should always be on top, complete at bottom
        if (aStatus === 'pending' && bStatus === 'complete') {
          return -1; // Pending always comes first
        }
        if (aStatus === 'complete' && bStatus === 'pending') {
          return 1; // Complete always comes after pending
        }
        // If same status, sort by date as secondary sort
        const aDate = new Date(a.podate);
        const bDate = new Date(b.podate);
        if (aDate < bDate) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle ponum sorting
      if (poSortConfig.key === 'ponum') {
        const aNum = a.ponum || '';
        const bNum = b.ponum || '';
        if (aNum < bNum) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aNum > bNum) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle podate sorting
      if (poSortConfig.key === 'podate') {
        const aDate = new Date(a.podate);
        const bDate = new Date(b.podate);
        if (aDate < bDate) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle delivery-date sorting
      if (poSortConfig.key === 'delivery-date') {
        const aDate = a["delivery-date"] ? new Date(a["delivery-date"]) : null;
        const bDate = b["delivery-date"] ? new Date(b["delivery-date"]) : null;
        // Handle null dates
        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        if (aDate < bDate) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle poval sorting
      if (poSortConfig.key === 'poval') {
        const aVal = a.poval || 0;
        const bVal = b.poval || 0;
        if (aVal < bVal) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle balgrval sorting
      if (poSortConfig.key === 'balgrval') {
        const aVal = a.balgrval || 0;
        const bVal = b.balgrval || 0;
        if (aVal < bVal) {
          return poSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return poSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      return 0;
    });
    
    return sortableItems;
  }, [purchaseOrders, poSortConfig]);

  // Sort network purchase orders based on current sort configuration
  const sortedNetworkPOs = useMemo(() => {
    if (!networkPOSortConfig.key) return networkPOs;
    
    let sortableItems = [...networkPOs];
    
    sortableItems.sort((a, b) => {
      // Special handling for status sorting
      if (networkPOSortConfig.key === 'status') {
        const aStatus = a.balgrval === 0 ? 'complete' : 'pending';
        const bStatus = b.balgrval === 0 ? 'complete' : 'pending';
        
        // Pending should always be on top, complete at bottom
        if (aStatus === 'pending' && bStatus === 'complete') {
          return -1; // Pending always comes first
        }
        if (aStatus === 'complete' && bStatus === 'pending') {
          return 1; // Complete always comes after pending
        }
        // If same status, sort by date as secondary sort
        const aDate = new Date(a.podate);
        const bDate = new Date(b.podate);
        if (aDate < bDate) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle ponum sorting
      if (networkPOSortConfig.key === 'ponum') {
        const aNum = a.ponum || '';
        const bNum = b.ponum || '';
        if (aNum < bNum) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aNum > bNum) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle podate sorting
      if (networkPOSortConfig.key === 'podate') {
        const aDate = new Date(a.podate);
        const bDate = new Date(b.podate);
        if (aDate < bDate) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle delivery-date sorting
      if (networkPOSortConfig.key === 'delivery-date') {
        const aDate = a["delivery-date"] ? new Date(a["delivery-date"]) : null;
        const bDate = b["delivery-date"] ? new Date(b["delivery-date"]) : null;
        // Handle null dates
        if (aDate === null && bDate === null) return 0;
        if (aDate === null) return 1;
        if (bDate === null) return -1;
        if (aDate < bDate) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aDate > bDate) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle poval sorting
      if (networkPOSortConfig.key === 'poval') {
        const aVal = a.poval || 0;
        const bVal = b.poval || 0;
        if (aVal < bVal) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      // Handle balgrval sorting
      if (networkPOSortConfig.key === 'balgrval') {
        const aVal = a.balgrval || 0;
        const bVal = b.balgrval || 0;
        if (aVal < bVal) {
          return networkPOSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return networkPOSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
      
      return 0;
    });
    
    return sortableItems;
  }, [networkPOs, networkPOSortConfig]);

  // Handle PO click - open in new tab
  const handlePOClick = (ponum, e) => {
    e.stopPropagation(); // Prevent event bubbling
    window.open(`/purchaseorders/${ponum}`, '_blank');
  };

  // Fetch projects based on search term
  useEffect(() => {
    const fetchProjects = async () => {
      if (!searchTerm || !searchTerm.trim()) {
        setProjects([]);
        return;
      }
      setLoading(true);
      try {
        const encodedSearchTerm = encodeURIComponent(searchTerm.trim());
        const response = await fetch(`/api/projects?str=${encodedSearchTerm}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
      setLoading(false);
    };

    // Increased debounce delay to avoid multiple fetches when user types/deletes
    const debounceTimer = setTimeout(fetchProjects, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Fetch project details when project is selected
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!selectedProject) return;
      try {
        const response = await fetch(`/api/projects/${selectedProject}`);
        const data = await response.json();
        setProjectDetails(data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [selectedProject]);

  // Fetch network when project is selected
  useEffect(() => {
    const fetchNetwork = async () => {
      if (!selectedProject) return;
      try {
        const response = await fetch(`/api/networks/${selectedProject}`);
        const data = await response.json();
        setNetwork(data);
      } catch (error) {
        console.error('Error fetching network:', error);
      }
    };

    fetchNetwork();
  }, [selectedProject]);

  // Fetch purchase orders when project is selected
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      if (!selectedProject) return;
      try {
        const response = await fetch(`/api/purchaseorders/project/consolidated/${selectedProject}`);
        const data = await response.json();
        setPurchaseOrders(data);
        console.log(data);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
      }
    };

    fetchPurchaseOrders();
  }, [selectedProject]);

  // Fetch network POs when network is available
  useEffect(() => {
    const fetchNetworkPOs = async () => {
      if (!network?.["network-num"]) return;
      try {
        const response = await fetch(`/api/purchaseorders/project/consolidated/network/${network["network-num"]}`);
        const data = await response.json();
        setNetworkPOs(data);
      } catch (error) {
        console.error('Error fetching network POs:', error);
      }
    };

    fetchNetworkPOs();
  }, [network]);

  // Fetch PO details when PO is selected
  useEffect(() => {
    const fetchPODetails = async () => {
      if (!selectedPO) {
        setPODetails(null);
        return;
      }
      try {
        const response = await fetch(`/api/purchaseorders/porder/${selectedPO}`);
        const data = await response.json();
        setPODetails(data);
      } catch (error) {
        console.error('Error fetching PO details:', error);
      }
    };

    fetchPODetails();
  }, [selectedPO]);

  // Sort indicator component
  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <FiArrowUp className="inline ml-1" /> : 
      <FiArrowDown className="inline ml-1" />;
  };

  // PO Sort indicator component
  const POSortIndicator = ({ columnKey }) => {
    if (poSortConfig.key !== columnKey) return null;
    return poSortConfig.direction === 'asc' ? 
      <FiArrowUp className="inline ml-1" /> : 
      <FiArrowDown className="inline ml-1" />;
  };

  // Network PO Sort indicator component
  const NetworkPOSortIndicator = ({ columnKey }) => {
    if (networkPOSortConfig.key !== columnKey) return null;
    return networkPOSortConfig.direction === 'asc' ? 
      <FiArrowUp className="inline ml-1" /> : 
      <FiArrowDown className="inline ml-1" />;
  };

  // Calculate top position for PO details based on selected card
  const getPODetailsTopPosition = () => {
    if (!selectedPOCardRef) return 0;
    const cardRect = selectedPOCardRef.getBoundingClientRect();
    const containerRect = selectedPOCardRef.closest('.po-container')?.getBoundingClientRect();
    if (!containerRect) return 0;
    return cardRect.top - containerRect.top;
  };

  // Handle Excel download (WBS / project-level)
  const handleDownloadExcel = async () => {
    if (!selectedProject) {
      alert('Please select a project first');
      return;
    }

    try {
      // selectedProject is stored with "/" as "%2F"; use as-is so path decodes to correct WBS (avoid double-encode)
      const response = await fetch(`/api/purchaseorders/project/excel/${selectedProject}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `PO_Schedule_${selectedProject}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      if (contentDisposition) {
        // Try to get filename from filename* (UTF-8 encoded) first
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (filenameStarMatch) {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } else {
          // Fall back to regular filename
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1].trim();
          }
        }
      }
      
      // Ensure filename ends with .xlsx (remove any trailing characters)
      if (!filename.endsWith('.xlsx')) {
        filename = filename.replace(/\.xlsx.*$/, '') + '.xlsx';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  // Handle Excel download for network POs only
  const handleDownloadExcelNetwork = async () => {
    if (!selectedProject || !network?.["network-num"]) {
      alert('Please select a project with a network first');
      return;
    }

    try {
      const networkNum = network["network-num"];
      const response = await fetch(
        `/api/purchaseorders/project/excel/${encodeURIComponent(selectedProject)}?network=${encodeURIComponent(networkNum)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to generate Excel file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `PO_Schedule_Network_${networkNum}_${moment().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`;
      if (contentDisposition) {
        const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
        if (filenameStarMatch) {
          filename = decodeURIComponent(filenameStarMatch[1]);
        } else {
          const filenameMatch = contentDisposition.match(/filename="?([^";]+)"?/);
          if (filenameMatch) {
            filename = filenameMatch[1].trim();
          }
        }
      }
      if (!filename.endsWith('.xlsx')) {
        filename = filename.replace(/\.xlsx.*$/, '') + '.xlsx';
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download Excel file. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderNewComponent />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects by name or WBS (e.g., project*name*term or single term)..."
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Use * to separate up to 4 search terms. All terms must appear in the project name or WBS.
          </p>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Projects Table */}
            <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
              </div>
              <div className="overflow-x-auto">
                {sortedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FiFolder className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Search for Projects</h3>
                    <p className="text-gray-500">Enter a project name in the search box above to view the list of projects.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                          onClick={() => requestSort('project-wbs')}
                        >
                          WBS <SortIndicator columnKey="project-wbs" />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                          onClick={() => requestSort('project-name')}
                        >
                          Name <SortIndicator columnKey="project-name" />
                        </th>
                        <th 
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                        >
                          Manager
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedProjects.map((project, index) => (
                        <tr 
                          key={index}
                          onClick={() => setSelectedProject(project["project-wbs"].replace("/", "%2F"))}
                          className={`cursor-pointer hover:bg-blue-50 transition-colors duration-200 ${
                            selectedProject === project["project-wbs"].replace("/", "%2F") ? 'bg-blue-100' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {project["project-wbs"]}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {project["project-name"]}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {project["project-incharge"]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Purchase Orders and Details Section */}
            {selectedProject && (
              <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Purchase Orders</h2>
                      {network && (
                        <p className="text-sm text-gray-600 mt-1">
                          Network: {network["network-num"]}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => window.open(`/projectpurchasetimelines/${selectedProject}`, '_blank')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        title="View PO Timelines"
                      >
                        <FiBarChart2 className="mr-2" />
                        Timeline of PO's
                      </button>
                      <button
                        onClick={handleDownloadExcel}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                        title="Download Excel with all PO schedule data"
                      >
                        <FiDownload className="mr-2" />
                        Download Excel
                      </button>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Layout:</span>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={() => setPOLayoutMode('card')}
                            className={`p-2 rounded-md transition-colors duration-200 ${
                              poLayoutMode === 'card' 
                                ? 'bg-white shadow-sm text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            title="Card Layout"
                          >
                            <FiGrid className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPOLayoutMode('table')}
                            className={`p-2 rounded-md transition-colors duration-200 ${
                              poLayoutMode === 'table' 
                                ? 'bg-white shadow-sm text-blue-600' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                            title="Table Layout"
                          >
                            <FiList className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="relative po-container">
                  {/* Left Side - PO Lists */}
                  <div className="p-4 space-y-6">
                    {/* WBS POs */}
                    <div>
                      <h3 className="text-md font-semibold text-blue-700 mb-3">Purchase Orders (WBS)</h3>
                      {purchaseOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-600 mb-2">No Purchase Orders</h3>
                          <p className="text-gray-500">This project has no purchase orders in the system.</p>
                        </div>
                      ) : poLayoutMode === 'card' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {purchaseOrders.map((po, index) => (
                            <div 
                              ref={el => poCardRefs.current[po.ponum] = el}
                              key={po.ponum || index}
                              className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md border-gray-200 hover:border-blue-300"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 
                                  onClick={(e) => handlePOClick(po.ponum, e)}
                                  className="font-semibold text-sky-600 text-sm cursor-pointer hover:text-blue-800 hover:underline"
                                >
                                  {po.ponum}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  po.balgrval === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {po.balgrval === 0 ? 'Complete' : 'Pending'}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p><span className="font-medium">Date:</span> {moment(po.podate).format('MM/DD/YYYY')}</p>
                                <p><span className="font-medium">Delivery Date:</span> {po["delivery-date"] ? moment(po["delivery-date"]).format('MM/DD/YYYY') : 'N/A'}</p>
                                <p><span className="font-medium">Vendor:</span> {po.vendorcode}</p>
                                <p><span className="font-medium">Name:</span> {po.vendorname}</p>
                                <p><span className="font-medium">Value:</span> {po.poval ? po.poval.toLocaleString() : '0'} SAR</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                              <tr>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('ponum')}
                                >
                                  PO Number <POSortIndicator columnKey="ponum" />
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('podate')}
                                >
                                  Date <POSortIndicator columnKey="podate" />
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('delivery-date')}
                                >
                                  Delivery Date <POSortIndicator columnKey="delivery-date" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor Code</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor Name</th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('poval')}
                                >
                                  Value (SAR) <POSortIndicator columnKey="poval" />
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('balgrval')}
                                >
                                  Balance (SAR) <POSortIndicator columnKey="balgrval" />
                                </th>
                                <th 
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                  onClick={() => requestPOSort('status')}
                                >
                                  Status <POSortIndicator columnKey="status" />
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {sortedPurchaseOrders.map((po, index) => (
                                <tr 
                                  key={po.ponum || index}
                                  className="hover:bg-blue-50 transition-colors duration-200"
                                >
                                  <td 
                                    onClick={(e) => handlePOClick(po.ponum, e)}
                                    className="px-4 py-3 whitespace-nowrap text-sm font-medium text-sky-600 cursor-pointer hover:text-blue-800 hover:underline"
                                  >
                                    {po.ponum}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {moment(po.podate).format('MM/DD/YYYY')}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {po["delivery-date"] ? moment(po["delivery-date"]).format('MM/DD/YYYY') : 'N/A'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {po.vendorcode}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={po.vendorname}>
                                    {po.vendorname}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {po.poval ? po.poval.toLocaleString() : '0'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                    {po.balgrval ? po.balgrval.toLocaleString() : '0'}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      po.balgrval === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {po.balgrval === 0 ? 'Complete' : 'Pending'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Network POs */}
                    {networkPOs && networkPOs.length > 0 && (
                      <div>
                        <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                          <h3 className="text-md font-semibold text-purple-700">Purchase Orders (Network: {network["network-num"]})</h3>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => window.open(`/projectpurchasetimelines/${selectedProject}?network=${encodeURIComponent(network["network-num"])}`, '_blank')}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                              title="View PO Timelines for this network"
                            >
                              <FiBarChart2 className="mr-1.5" />
                              Timeline
                            </button>
                            <button
                              onClick={handleDownloadExcelNetwork}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                              title="Download Excel with PO schedule data for this network"
                            >
                              <FiDownload className="mr-1.5" />
                              Download Excel
                            </button>
                          </div>
                        </div>
                        {poLayoutMode === 'card' ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {networkPOs.map((po, index) => (
                              <div 
                                ref={el => networkPOCardRefs.current[po.ponum] = el}
                                key={po.ponum || index}
                                className="p-4 border rounded-lg transition-all duration-200 hover:shadow-md border-gray-200 hover:border-purple-300"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <h4 
                                    onClick={(e) => handlePOClick(po.ponum, e)}
                                    className="font-semibold text-purple-700 text-sm cursor-pointer hover:text-purple-900 hover:underline"
                                  >
                                    {po.ponum}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    po.balgrval === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {po.balgrval === 0 ? 'Complete' : 'Pending'}
                                  </span>
                                </div>
                                <div className="space-y-1 text-xs text-gray-600">
                                  <p><span className="font-medium">Date:</span> {moment(po.podate).format('MM/DD/YYYY')}</p>
                                  <p><span className="font-medium">Delivery Date:</span> {po["delivery-date"] ? moment(po["delivery-date"]).format('MM/DD/YYYY') : 'N/A'}</p>
                                  <p><span className="font-medium">Vendor:</span> {po.vendorcode}</p>
                                  <p><span className="font-medium">Name:</span> {po.vendorname}</p>
                                  <p><span className="font-medium">Value:</span> {po.poval ? po.poval.toLocaleString() : '0'} SAR</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('ponum')}
                                  >
                                    PO Number <NetworkPOSortIndicator columnKey="ponum" />
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('podate')}
                                  >
                                    Date <NetworkPOSortIndicator columnKey="podate" />
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('delivery-date')}
                                  >
                                    Delivery Date <NetworkPOSortIndicator columnKey="delivery-date" />
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor Code</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Vendor Name</th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('poval')}
                                  >
                                    Value (SAR) <NetworkPOSortIndicator columnKey="poval" />
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('balgrval')}
                                  >
                                    Balance (SAR) <NetworkPOSortIndicator columnKey="balgrval" />
                                  </th>
                                  <th 
                                    className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => requestNetworkPOSort('status')}
                                  >
                                    Status <NetworkPOSortIndicator columnKey="status" />
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {sortedNetworkPOs.map((po, index) => (
                                  <tr 
                                    key={po.ponum || index}
                                    className="hover:bg-purple-50 transition-colors duration-200"
                                  >
                                    <td 
                                      onClick={(e) => handlePOClick(po.ponum, e)}
                                      className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-700 cursor-pointer hover:text-purple-900 hover:underline"
                                    >
                                      {po.ponum}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {moment(po.podate).format('MM/DD/YYYY')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {po["delivery-date"] ? moment(po["delivery-date"]).format('MM/DD/YYYY') : 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {po.vendorcode}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={po.vendorname}>
                                      {po.vendorname}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {po.poval ? po.poval.toLocaleString() : '0'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                                      {po.balgrval ? po.balgrval.toLocaleString() : '0'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <span className={`px-2 py-1 rounded-full text-xs ${
                                        po.balgrval === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {po.balgrval === 0 ? 'Complete' : 'Pending'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* No Project Selected State */}
            {!selectedProject && (
              <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 p-6">
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Project</h3>
                  <p className="text-gray-500">Choose a project from the list above to view its purchase orders.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

        <FooterComponent />
      
    </div>
  );
}

export default Projects1; 
   
