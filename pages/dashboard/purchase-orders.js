import SectionDashboard from "../../components/SectionDashboard";
import { navigationSections } from "../../lib/navigationConfig";

export default function PurchaseOrdersDashboard() {
  return <SectionDashboard section={navigationSections.purchaseOrders} />;
}

export async function getServerSideProps() {
  return { props: {} };
}
