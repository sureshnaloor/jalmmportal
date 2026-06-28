import { getSession } from "next-auth/react";
import OpenPOListPage from "../../components/OpenPOListPage";

function StockPurchaseOrders() {
  return (
    <OpenPOListPage
      apiUrl="/api/purchaseorders/openpo/stockitems"
      pageTitle="Stock Item Purchase Orders"
      pageSubtitle="Open POs where delivery date is within 10 days of the PO date"
      tableTitle="Stock Item Open POs"
      showDelayedReportButton={false}
    />
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}

export default StockPurchaseOrders;
