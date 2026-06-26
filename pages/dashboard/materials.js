import SectionDashboard from "../../components/SectionDashboard";
import { navigationSections } from "../../lib/navigationConfig";

export default function MaterialsDashboard() {
  return <SectionDashboard section={navigationSections.materials} />;
}

export async function getServerSideProps() {
  return { props: {} };
}
