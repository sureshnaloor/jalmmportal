import { getSession } from 'next-auth/react';
import VendorEvaluationListPage from '../../components/VendorEvaluation/VendorEvaluationListPage';
import { EVALUATION_TRACK } from '../../lib/vendorEvaluationYear';

export default function VendorEvaluationPriorPoList() {
  return <VendorEvaluationListPage track={EVALUATION_TRACK.PRIOR_PO} />;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { session } };
}
