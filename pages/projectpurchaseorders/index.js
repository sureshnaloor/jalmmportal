import React, { useState, useEffect, useMemo } from 'react';
import moment from 'moment';
import HeaderNewComponent from '../../components/HeaderNewComponent';
import FooterComponent from '../../components/FooterComponent';
import { FiSearch, FiArrowUp, FiArrowDown, FiFolder, FiShoppingCart, FiEye, FiChevronRight, FiChevronDown } from 'react-icons/fi';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatWbsWithDescription } from '../../lib/wbsDescriptions';
import Link from 'next/link';

function formatCurrency(value) {
  return (value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function WbsTreeNode({ node, depth = 0, defaultExpanded = true }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren = node.children && node.children.length > 0;
  const indent = depth * 24;

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div
        className={`flex flex-wrap items-start gap-2 py-2 px-3 hover:bg-gray-50 ${node.isNetwork ? 'bg-purple-50' : ''}`}
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className={`flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 ${hasChildren ? 'cursor-pointer' : 'invisible'}`}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {hasChildren && (expanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />)}
        </button>

        <div className="flex-1 min-w-[200px]">
          <div className={`font-medium text-sm ${node.isNetwork ? 'text-purple-800' : 'text-gray-900'}`}>
            {node.wbs}
          </div>
          {node.description && (
            <div className="text-sm text-gray-600 mt-0.5">{node.description}</div>
          )}
          {node.pos && node.pos.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {node.pos.map((po) => (
                <button
                  key={po.ponum}
                  type="button"
                  onClick={() => window.open(`/purchaseorders/${po.ponum}`, '_blank')}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-sky-100 text-sky-800 hover:bg-sky-200 transition-colors"
                  title={`PO Value: ${formatCurrency(po.poval)} SAR`}
                >
                  {po.ponum}
                </button>
              ))}
            </div>
          )}
          {(!node.pos || node.pos.length === 0) && !hasChildren && (
            <span className="text-xs text-gray-400">No direct POs</span>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-xs sm:text-sm text-right">
          <div>
            <div className="text-gray-500">Direct PO Value</div>
            <div className="font-medium text-gray-800">{formatCurrency(node.directPoValue)}</div>
          </div>
          <div>
            <div className="text-gray-500">Direct Balance</div>
            <div className="font-medium text-gray-800">{formatCurrency(node.directBalanceValue)}</div>
          </div>
          <div>
            <div className="text-gray-500">Total (rolled up)</div>
            <div className="font-semibold text-blue-700">{formatCurrency(node.totalPoValue)}</div>
          </div>
          <div>
            <div className="text-gray-500">Balance (rolled up)</div>
            <div className="font-semibold text-amber-700">{formatCurrency(node.totalBalanceValue)}</div>
          </div>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <WbsTreeNode key={child.wbs} node={child} depth={depth + 1} defaultExpanded={depth < 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectPurchaseOrders() {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [poLoading, setPoLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'ponum', direction: 'asc' });
  const [projectSortConfig, setProjectSortConfig] = useState({ key: 'project-name', direction: 'asc' });

  useEffect(() => {
    const fetchProjects = async () => {
      if (!searchTerm?.trim()) {
        setProjects([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/projects?str=${encodeURIComponent(searchTerm.trim())}`);
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjects([]);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchProjects, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedProject) {
        setReportData(null);
        return;
      }
      setPoLoading(true);
      try {
        const response = await fetch(`/api/purchaseorders/project-wbs/${selectedProject}`);
        const data = await response.json();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching project PO report:', error);
        setReportData(null);
      }
      setPoLoading(false);
    };

    fetchReport();
  }, [selectedProject]);

  const allPurchaseOrders = useMemo(() => {
    if (!reportData) return [];
    const network = (reportData.networkPurchaseOrders || []).map((po) => ({
      ...po,
      wbs: `Network: ${reportData.network}`,
      isNetwork: true,
    }));
    return [...(reportData.purchaseOrders || []), ...network];
  }, [reportData]);

  const sortedProjects = useMemo(() => {
    const items = [...projects];
    if (!projectSortConfig.key) return items;
    items.sort((a, b) => {
      const aVal = a[projectSortConfig.key] || '';
      const bVal = b[projectSortConfig.key] || '';
      if (aVal < bVal) return projectSortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return projectSortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [projects, projectSortConfig]);

  const sortedPurchaseOrders = useMemo(() => {
    const items = [...allPurchaseOrders];
    if (!sortConfig.key) return items;

    items.sort((a, b) => {
      if (sortConfig.key === 'podate') {
        const aDate = a.podate ? new Date(a.podate).getTime() : 0;
        const bDate = b.podate ? new Date(b.podate).getTime() : 0;
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (sortConfig.key === 'poval' || sortConfig.key === 'balgrval') {
        const aVal = a[sortConfig.key] || 0;
        const bVal = b[sortConfig.key] || 0;
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aVal = String(a[sortConfig.key] || '');
      const bVal = String(b[sortConfig.key] || '');
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [allPurchaseOrders, sortConfig]);

  const requestProjectSort = (key) => {
    setProjectSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const ProjectSortIndicator = ({ columnKey }) => {
    if (projectSortConfig.key !== columnKey) return null;
    return projectSortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  const SortIndicator = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? <FiArrowUp className="inline ml-1" /> : <FiArrowDown className="inline ml-1" />;
  };

  const handleViewPo = (ponum) => {
    window.open(`/purchaseorders/${ponum}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <HeaderNewComponent />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Project-wise Purchase Orders</h1>
          <p className="text-gray-600 mt-1">
            Search a project by name or WBS to list all purchase orders under the WBS and every nested sub-element.
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects by name or WBS (e.g., project*name*term)..."
              className="w-full px-4 py-3 pl-12 text-gray-700 bg-white border rounded-lg focus:outline-none focus:border-blue-500 shadow-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Use * to separate up to 4 search terms. All terms must appear in the project name or WBS.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-xl font-semibold text-gray-800">Projects</h2>
              </div>
              <div className="overflow-x-auto">
                {sortedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <FiFolder className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Search for Projects</h3>
                    <p className="text-gray-500">Enter a project name or WBS in the search box above.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestProjectSort('project-wbs')}
                        >
                          WBS <ProjectSortIndicator columnKey="project-wbs" />
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                          onClick={() => requestProjectSort('project-name')}
                        >
                          Name <ProjectSortIndicator columnKey="project-name" />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Manager</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedProjects.map((project, index) => {
                        const encodedWbs = project['project-wbs'].replace('/', '%2F');
                        const isSelected = selectedProject === encodedWbs;
                        return (
                          <tr
                            key={index}
                            onClick={() => setSelectedProject(encodedWbs)}
                            className={`cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{project['project-wbs']}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{project['project-name']}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{project['project-incharge']}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {selectedProject && (
              <>
                {poLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
                  </div>
                ) : reportData ? (
                  <>
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex flex-wrap justify-between items-start gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-gray-800">Purchase Orders</h2>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">{reportData.project?.wbs}</span>
                              {reportData.project?.name && ` — ${reportData.project.name}`}
                            </p>
                            {reportData.network && (
                              <p className="text-sm text-gray-500 mt-0.5">Network: {reportData.network}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="text-center px-3 py-1 bg-white rounded border">
                              <div className="text-gray-500">PO Count</div>
                              <div className="font-semibold text-gray-900">{reportData.summary?.poCount || 0}</div>
                            </div>
                            <div className="text-center px-3 py-1 bg-white rounded border">
                              <div className="text-gray-500">Total PO Value</div>
                              <div className="font-semibold text-blue-700">{formatCurrency(reportData.summary?.totalPoValue)}</div>
                            </div>
                            <div className="text-center px-3 py-1 bg-white rounded border">
                              <div className="text-gray-500">Total Balance</div>
                              <div className="font-semibold text-amber-700">{formatCurrency(reportData.summary?.totalBalanceValue)}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {sortedPurchaseOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                          <FiShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-600">No Purchase Orders</h3>
                          <p className="text-gray-500">No purchase orders found under this WBS subtree.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                                  onClick={() => requestSort('ponum')}
                                >
                                  PO Number <SortIndicator columnKey="ponum" />
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                                  onClick={() => requestSort('podate')}
                                >
                                  PO Date <SortIndicator columnKey="podate" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vendor Name</th>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                                  onClick={() => requestSort('poval')}
                                >
                                  PO Value (SAR) <SortIndicator columnKey="poval" />
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                                  onClick={() => requestSort('balgrval')}
                                >
                                  Balance (SAR) <SortIndicator columnKey="balgrval" />
                                </th>
                                <th
                                  className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                                  onClick={() => requestSort('wbs')}
                                >
                                  WBS <SortIndicator columnKey="wbs" />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {sortedPurchaseOrders.map((po, index) => (
                                <tr key={`${po.ponum}-${index}`} className="hover:bg-blue-50">
                                  <td className="px-4 py-3 text-sm font-medium text-sky-600">{po.ponum}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">
                                    {po.podate ? moment(po.podate).format('MM/DD/YYYY') : '—'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600 max-w-[220px] truncate" title={po.vendorname}>
                                    {po.vendorname || '—'}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(po.poval)}</td>
                                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(po.balgrval)}</td>
                                  <td className={`px-4 py-3 text-sm max-w-[220px] truncate ${po.isNetwork ? 'text-purple-700' : 'text-gray-600'}`} title={formatWbsWithDescription(po.wbs, reportData.wbsDescriptions || {})}>
                                    {po.isNetwork ? po.wbs : formatWbsWithDescription(po.wbs, reportData.wbsDescriptions || {})}
                                  </td>
                                  <td className="px-4 py-3">
                                    <button
                                      type="button"
                                      onClick={() => handleViewPo(po.ponum)}
                                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                    >
                                      <FiEye className="mr-1" />
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {reportData.wbsTree && (
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
                          <h2 className="text-xl font-semibold text-gray-800">WBS Tree — PO Rollup</h2>
                          <p className="text-sm text-gray-600 mt-1">
                            Purchase orders grouped by WBS element with values rolled up from nested sub-levels to the root.
                            {' '}
                            <Link href="/wbsdescriptions" className="text-blue-600 hover:underline">
                              Upload WBS descriptions
                            </Link>
                          </p>
                          <div className="mt-3 flex flex-wrap gap-6 text-sm font-medium">
                            <span>
                              Root total PO value:{' '}
                              <span className="text-blue-700">{formatCurrency(reportData.wbsTree.totalPoValue)} SAR</span>
                            </span>
                            <span>
                              Root total balance:{' '}
                              <span className="text-amber-700">{formatCurrency(reportData.wbsTree.totalBalanceValue)} SAR</span>
                            </span>
                          </div>
                        </div>
                        <div className="max-h-[600px] overflow-y-auto">
                          <WbsTreeNode node={reportData.wbsTree} defaultExpanded />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">
                    Failed to load purchase order data. Please try again.
                  </div>
                )}
              </>
            )}

            {!selectedProject && (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <FiShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600">Select a Project</h3>
                <p className="text-gray-500 mt-1">Choose a project to view its purchase orders and WBS rollup.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <ToastContainer position="top-right" autoClose={3000} />
      <FooterComponent />
    </div>
  );
}

export default ProjectPurchaseOrders;
