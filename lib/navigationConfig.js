import {
  faAddressCard,
  faCircleQuestion,
  faPeopleGroup,
} from "@fortawesome/free-solid-svg-icons";

const CARD_COLORS = [
  "sky",
  "violet",
  "amber",
  "emerald",
  "rose",
  "cyan",
  "fuchsia",
  "teal",
  "indigo",
  "orange",
  "lime",
  "pink",
];

function withColors(cards) {
  return cards.map((card, index) => ({
    ...card,
    color: card.color || CARD_COLORS[index % CARD_COLORS.length],
  }));
}

export const navigationSections = {
  projects: {
    id: "projects",
    label: "Projects",
    icon: faCircleQuestion,
    dashboardHref: "/dashboard/projects",
    description: "Manage projects, schedules, tracking, and lessons learnt.",
    cards: withColors([
      {
        href: "/projects1",
        label: "Projects",
        description:
          "Browse and search all projects — view status, details, and related information in one place.",
        size: "xl",
      },
      {
        href: "/projectpurchaseorders",
        label: "Project-wise POs",
        description:
          "View purchase orders grouped by project to monitor procurement activity per job.",
        size: "lg",
      },
      {
        href: "/openprojects",
        label: "Open Projects",
        description: "Projects that still have open purchase orders requiring follow-up.",
        size: "md",
      },
      {
        href: "/tracking",
        label: "Tracking",
        description:
          "Track materials, deliveries, and expediting status across active projects.",
        size: "lg",
      },
      {
        href: "/projectdetails",
        label: "Project Details",
        description: "Detailed project metadata, contacts, and configuration.",
        size: "md",
      },
      {
        href: "/wbsdescriptions",
        label: "WBS Descriptions Upload",
        description: "Upload and maintain WBS element descriptions for projects.",
        size: "md",
      },
      {
        href: "/lessons-learnt",
        label: "Lessons Learnt",
        description:
          "Capture and review lessons learnt to improve future project execution.",
        size: "md",
      },
      {
        href: "/longleadpackages",
        label: "Long Lead Material Packages",
        description:
          "Manage long-lead material packages and monitor critical procurement timelines.",
        size: "md",
      },
    ]),
  },
  materials: {
    id: "materials",
    label: "Materials",
    icon: faPeopleGroup,
    dashboardHref: "/dashboard/materials",
    description: "Search materials, manage groups, documents, and standardization.",
    cards: withColors([
      {
        href: "/materials1",
        label: "Materials",
        description:
          "Search the material master — stock levels, prices, incoming orders, and requisitions.",
        size: "xl",
      },
      {
        href: "/materialdocuments",
        label: "Material Docs",
        description: "View and manage documentation attached to material codes.",
        size: "lg",
      },
      {
        href: "/material-groups",
        label: "Material Groups",
        description: "Organize materials into groups and map vendors to groups.",
        size: "lg",
      },
      {
        href: "/material-groups/map-materials",
        label: "Map Materials to Subgroups",
        description:
          "Assign unmapped SAP materials to material group subgroups in batches of 100.",
        size: "md",
      },
      {
        href: "/material-groups/mapped-materials",
        label: "Mapped Materials",
        description:
          "View, search, and edit existing material-to-subgroup mappings.",
        size: "md",
      },
      {
        href: "/material-groups/service-group-map",
        label: "Service Group Map",
        description:
          "Upload service line items and map them to service type subgroups.",
        size: "md",
      },
      {
        href: "/reqmatcode",
        label: "New Matcode",
        description: "Submit requests for new material codes to be created in SAP.",
        size: "md",
      },
      {
        href: "/material-standardization",
        label: "Standardize Materials",
        description:
          "Identify duplicate or similar materials and consolidate to standard codes.",
        size: "md",
      },
    ]),
  },
  purchaseOrders: {
    id: "purchaseOrders",
    label: "Purchase Orders",
    icon: faAddressCard,
    dashboardHref: "/dashboard/purchase-orders",
    description: "Monitor POs, alerts, feedback, and purchasing reports.",
    cards: withColors([
      {
        href: "/openpurchaseorders1",
        label: "Open PO",
        description:
          "All open purchase orders in one place — manage delivery, expediting, and monitoring.",
        size: "xl",
      },
      {
        href: "/stock-purchase-orders",
        label: "Stock Item POs",
        description:
          "Open purchase orders for stock items — delivery date within 10 days of PO date.",
        size: "lg",
      },
      {
        href: "/allpurchaseorders",
        label: "All POs",
        description: "Search and browse the complete purchase order history.",
        size: "lg",
      },
      {
        href: "/purchaseordersearch",
        label: "PO Complete Details",
        description: "Look up full details for any purchase order by number.",
        size: "md",
      },
      {
        href: "/po-alert-report",
        label: "PO Alerts",
        description: "Purchase orders flagged for attention — delays, issues, or anomalies.",
        size: "md",
      },
      {
        href: "/po-feedback",
        label: "PO Feedback",
        description: "Collect and review feedback linked to purchase orders.",
        size: "sm",
      },
      {
        href: "/po-comments",
        label: "PO Comments Summary",
        description: "Summary view of comments and notes across purchase orders.",
        size: "sm",
      },
      {
        href: "/cash-po-materials-report",
        label: "Cash Purchases Dashboard",
        description: "Overview of cash purchase orders and related materials.",
        size: "md",
      },
      {
        href: "/all-purchases-report",
        label: "All Purchases Report",
        description: "Comprehensive report covering all purchase types and categories.",
        size: "lg",
      },
      {
        href: "/domestic-purchases-report",
        label: "Domestic Purchases",
        description: "Within KSA / domestic purchase details and breakdown.",
        size: "md",
      },
      {
        href: "/import-purchases-report",
        label: "Import Purchases",
        description: "Import purchase details — overseas procurement and logistics.",
        size: "md",
      },
      {
        href: "/services-purchases-report",
        label: "Services Purchases",
        description: "Service-type purchase orders and related spend analysis.",
        size: "md",
      },
      {
        href: "/channel-partner-purchases-report",
        label: "Channel Partner Purchases",
        description: "Purchases made through channel partners.",
        size: "md",
      },
    ]),
  },
  vendors: {
    id: "vendors",
    label: "Vendors",
    icon: faAddressCard,
    dashboardHref: "/dashboard/vendors",
    description: "Manage vendors, evaluations, documents, and compliance reports.",
    cards: withColors([
      {
        href: "/vendors1",
        label: "Vendors",
        description: "Search and browse the vendor master — contacts, status, and overview.",
        size: "xl",
      },
      {
        href: "/vendor-dashboard",
        label: "Vendor Dashboard",
        description:
          "Rich vendor profile view — services, contacts, group mapping, and additional info.",
        size: "lg",
      },
      {
        href: "/vendor-contacts",
        label: "Vendor Contacts",
        description:
          "Browse active vendors and view or edit salesperson contacts and address records.",
        size: "md",
      },
      {
        href: "/active-vendors",
        label: "Active Vendors",
        description: "Vendors currently active with recent purchase activity.",
        size: "md",
      },
      {
        href: "/dormant-vendors",
        label: "Dormant Vendors",
        description: "Vendors with no recent activity — candidates for review or cleanup.",
        size: "md",
      },
      {
        href: "/vendorevaluation/webformat",
        label: "Vendor Evaluation",
        description: "Evaluate vendor performance using the web evaluation form.",
        size: "lg",
      },
      {
        href: "/vendor-evaluation-current-year",
        label: "Vendor Evaluation Current Year",
        description:
          "Annual vendor evaluation for the previous calendar year — fixed and PO-based parameters.",
        size: "lg",
      },
      {
        href: "/vendorswithpo",
        label: "Vendor Details",
        description: "Detailed vendor information for vendors with purchase orders.",
        size: "md",
      },
      {
        href: "/vendorswithpo/not-evaluated-fixed",
        label: "Not Evaluated (Fixed Scores)",
        description: "Vendors with POs that have not yet been evaluated — fixed score view.",
        size: "sm",
      },
      {
        href: "/vendor-extract",
        label: "Vendor Extract (OpenAI)",
        description: "AI-assisted extraction of vendor information from documents.",
        size: "md",
      },
      {
        href: "/vendors",
        label: "Non SAP Vendors",
        description: "Vendors maintained outside the SAP vendor master.",
        size: "sm",
      },
      {
        href: "/vendors/group-mapping",
        label: "Vendor Mapping",
        description: "Map vendors to material or service groups.",
        size: "md",
      },
      {
        href: "/vendors/with-po-mapping",
        label: "Vendors with PO – Map Groups",
        description: "Assign group mappings for vendors that have purchase orders.",
        size: "md",
      },
      {
        href: "/vendor-group-mapping",
        label: "Map Groups to Vendors",
        description: "Bulk mapping of groups to vendor records.",
        size: "sm",
      },
      {
        href: "/vendor-feedback",
        label: "Vendor Feedback",
        description: "Collect and review feedback on vendor performance.",
        size: "sm",
      },
      {
        href: "/vendordocupload",
        label: "Upload Documents",
        description: "Upload compliance and qualification documents for vendors.",
        size: "md",
      },
      {
        href: "/vendor-reports/no-purchaseorders",
        label: "Vendors w/o PO",
        description: "Registered vendors that have never received a purchase order.",
        size: "sm",
      },
      {
        href: "/vendor-reports/with-po-no-docs",
        label: "Vendors w/ PO - No Docs",
        description: "Vendors with POs but no uploaded documentation on file.",
        size: "sm",
      },
      {
        href: "/vendor-reports/po-missing-docs",
        label: "Vendors w/ PO - Missing Docs",
        description: "Vendors with POs where required documents are still missing.",
        size: "sm",
      },
      {
        href: "/vendorevaluation/pdf/new",
        label: "Vendor Evaluation PDF",
        description: "Generate vendor evaluation reports in PDF format.",
        size: "sm",
      },
    ]),
  },
};

/** Ordered list for header navigation */
export const mainNavigationItems = [
  navigationSections.projects,
  navigationSections.materials,
  navigationSections.purchaseOrders,
  navigationSections.vendors,
];

export function getSectionById(id) {
  return navigationSections[id] || null;
}
