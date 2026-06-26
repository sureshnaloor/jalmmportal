import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Temporarily disabled — document type codes in the database do not yet match the
// required minimum set (CR, VAT, bank letter, national address) consistently.
export default function ActiveVendorsCompleteDocumentsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/active-vendors');
  }, [router]);

  return null;
}
