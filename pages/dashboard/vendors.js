import SectionDashboard from "../../components/SectionDashboard";
import { navigationSections } from "../../lib/navigationConfig";

export default function VendorsDashboard() {
  return <SectionDashboard section={navigationSections.vendors} />;
}

export async function getServerSideProps() {
  return { props: {} };
}
