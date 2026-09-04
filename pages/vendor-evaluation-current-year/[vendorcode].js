import { getSession } from 'next-auth/react';
import VendorEvaluationDetailPage from '../../components/VendorEvaluation/VendorEvaluationDetailPage';
import { EVALUATION_TRACK } from '../../lib/vendorEvaluationYear';

export default function VendorEvaluationDetail() {
  return <VendorEvaluationDetailPage track={EVALUATION_TRACK.CURRENT_YEAR} />;
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { session } };
}
