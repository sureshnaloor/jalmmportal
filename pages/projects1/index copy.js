import React, { useState, useEffect } from "react";
import { useSession, getSession } from "next-auth/react";
import moment from "moment";
import HeaderComponent from "../../components/HeaderComponent";
import { FiSearch, FiArrowUp, FiArrowDown, FiFolder, FiShoppingCart, FiClipboard, FiUsers, FiBarChart2 } from 'react-icons/fi';

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
  const [sortConfig, setSortConfig] = useState({
    key: 'project-name',
    direction: 'asc'
  });

  const { data: session } = useSession();

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

  // Fetch projects based on search term
  useEffect(() => {
    const fetchProjects = async () => {
      if (!searchTerm) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/projects?str=${searchTerm}`);
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(fetchProjects, 300);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderComponent />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects by name..."
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500 shadow-md hover:shadow-lg transition-shadow duration-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-8 h-[calc(100vh-300px)]">
            {/* Left Column - Projects and POs */}
            <div className="flex flex-col space-y-4">
              {/* Projects Table */}
              <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden flex flex-col h-[calc(50vh-150px)]">
                <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
                </div>
                <div className="overflow-y-auto flex-1">
                  {sortedProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <FiFolder className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Search for Projects</h3>
                      <p className="text-gray-500">Enter a project name in the search box above to view the list of projects.</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
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

              {/* Purchase Orders Table */}
              {selectedProject ? (
                <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden flex flex-col h-[calc(50vh-150px)]">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-xl font-semibold text-gray-800">Purchase Orders</h2>
                    {network && (
                      <p className="text-sm text-gray-600 mt-1">
                        Network: {network["network-num"]}
                      </p>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1">
                    {purchaseOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                        <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 mb-2">No Purchase Orders</h3>
                        <p className="text-gray-500">This project has no purchase orders in the system.</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">PO Number</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Value</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {purchaseOrders.map((po, index) => (
                            <tr 
                              key={po.ponum || index}
                              onClick={() => setSelectedPO(po.ponum)}
                              className={`cursor-pointer hover:bg-blue-50 transition-colors duration-200 ${
                                selectedPO === po.ponum ? 'bg-blue-100' : ''
                              }`}
                            >
                              <td className="px-4 py-2 text-xs font-semibold text-sky-600">{po.ponum}</td>
                              <td className="px-4 py-2 text-xs text-gray-600">{moment(po.podate).format('MM/DD/YYYY')}</td>
                              <td className="px-4 py-2 text-xs text-gray-600">{po.poval ? po.poval.toLocaleString() : '0'} SAR</td>
                              <td className="px-4 py-2 text-xs text-gray-600">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  po.balgrval === 0 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {po.balgrval === 0 ? 'complete' : 'Pending'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden flex flex-col h-[calc(50vh-150px)]">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <h2 className="text-xl font-semibold text-gray-800">Purchase Orders</h2>
                  </div>
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Project</h3>
                    <p className="text-gray-500">Choose a project from the list above to view its purchase orders.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - PO Details */}
            <div className="space-y-4">
              {selectedPO && poDetails ? (
                <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 overflow-hidden h-[calc(100vh-300px)]">
                  <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-semibold text-gray-800">PO Line Items</h2>
                  </div>
                  <div className="overflow-y-auto h-[calc(100%-60px)]">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Line Item</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Material Description</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Unit Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Total Value</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Pending Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Pending Value</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Pending Inv Qty</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">Pending Inv Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {poDetails.map((item, index) => (
                          <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                            <td className="px-4 py-2 text-xs text-gray-600">{item?.["po-line-item"]}</td>
                            <td className="px-4 py-2 text-xs font-semibold text-gray-600">{item?.material?.matdescription}</td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["po-quantity"]?.["$numberDecimal"]} {item?.["po-unit-of-measure"]}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["po-unit-price"]?.toLocaleString()} {item?.currency}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["po-value-sar"]?.toLocaleString()} {item?.currency}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["pending-qty"]?.["$numberDecimal"]} {item?.["po-unit-of-measure"]}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["pending-val-sar"]?.toLocaleString()} {item?.currency}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["pending-inv-qty"]?.["$numberDecimal"]} {item?.["po-unit-of-measure"]}
                            </td>
                            <td className="px-4 py-2 text-xs text-gray-600">
                              {item?.["pending-inv-val"]?.toLocaleString()} {item?.currency}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 p-6">
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-400px)] text-center">
                    <FiClipboard className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Purchase Order Details</h3>
                    <p className="text-gray-500">Select a purchase order to view its details and line items.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default Projects1; 