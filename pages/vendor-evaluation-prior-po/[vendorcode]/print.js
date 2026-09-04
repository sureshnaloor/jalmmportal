import { getSession } from 'next-auth/react';
import VendorEvaluationPrintPage from '../../../components/VendorEvaluation/VendorEvaluationPrintPage';
import { EVALUATION_TRACK } from '../../../lib/vendorEvaluationYear';

export default function VendorEvaluationPriorPoPrint() {
  return <VendorEvaluationPrintPage track={EVALUATION_TRACK.PRIOR_PO} />;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { session } };
}
