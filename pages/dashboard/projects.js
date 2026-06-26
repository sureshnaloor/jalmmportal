import SectionDashboard from "../../components/SectionDashboard";
import { navigationSections } from "../../lib/navigationConfig";

export default function ProjectsDashboard() {
  return <SectionDashboard section={navigationSections.projects} />;
}

export async function getServerSideProps() {
  return { props: {} };
}
