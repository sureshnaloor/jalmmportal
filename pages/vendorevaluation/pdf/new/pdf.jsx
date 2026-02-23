/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  View,
  Text,
  PDFViewer,
  StyleSheet,
} from "@react-pdf/renderer";
import { useState, useEffect } from "react";
import moment from "moment";

// Modern, professional styling with better use of space
const styles = StyleSheet.create({
  page: {
    padding: 0,
    margin: 0,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    backgroundColor: "#1e3a8a",
    padding: 20,
    marginBottom: 0,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 10,
    color: "#e0e7ff",
    textAlign: "center",
    opacity: 0.9,
  },
  filterInfo: {
    backgroundColor: "#f1f5f9",
    padding: 12,
    marginBottom: 0,
    borderBottom: "2 solid #cbd5e1",
  },
  filterText: {
    fontSize: 9,
    color: "#475569",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 0,
  },
  tableHeader: {
    backgroundColor: "#1e40af",
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#1e3a8a",
    borderBottomStyle: "solid",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
    minHeight: 35,
  },
  tableRowEven: {
    backgroundColor: "#f8fafc",
  },
  tableColCode: {
    width: "8%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  tableColName: {
    width: "18%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  tableColFixed: {
    width: "18%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  tableColYear: {
    width: "10%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  tableColScorer: {
    width: "18%",
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  headerCell: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cellCode: {
    fontSize: 9,
    color: "#1e40af",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cellName: {
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica-Bold",
  },
  cellFixedMain: {
    fontSize: 11,
    color: "#059669",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  cellFixedDetail: {
    fontSize: 7,
    color: "#475569",
    marginTop: 1,
    lineHeight: 1.3,
  },
  cellYear: {
    fontSize: 10,
    color: "#0f172a",
    textAlign: "center",
    fontFamily: "Helvetica-Bold",
  },
  cellScorer: {
    fontSize: 9,
    color: "#1e40af",
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  cellDate: {
    fontSize: 8,
    color: "#64748b",
    fontFamily: "Helvetica-Oblique",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 8,
    color: "#64748b",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginHorizontal: 40,
  },
});

const PDF = ({ filters }) => {
  const [vendormarks, setVendormarks] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/vendorevaluation`);
      const json = await result.json();
      setVendormarks(json);
    })();
  }, []);

  useEffect(() => {
    if (filters && vendormarks.length > 0) {
      const filtered = vendormarks.filter((vendor) => {
        const vendorCode = parseInt(vendor.vendorcode);
        return (
          vendorCode >= filters.vendorCodeFrom &&
          vendorCode <= filters.vendorCodeTo
        );
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(vendormarks);
    }
  }, [filters, vendormarks]);

  const formatDecimal = (value) => {
    if (!value) return "N/A";
    if (typeof value === "object" && value.$numberDecimal) {
      return parseFloat(value.$numberDecimal).toFixed(2);
    }
    return parseFloat(value).toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page} margin={[10, 15, 10, 15]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vendor Evaluation Report</Text>
          <Text style={styles.headerSubtitle}>
            Comprehensive Vendor Performance Analysis
          </Text>
        </View>

        {filters && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterText}>
              Filter: Vendor Codes {filters.vendorCodeFrom} - {filters.vendorCodeTo} | Total Records: {filteredData.length}
            </Text>
          </View>
        )}

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.tableColCode}>
              <Text style={styles.headerCell}>Code</Text>
            </View>
            <View style={styles.tableColName}>
              <Text style={styles.headerCell}>Vendor Name</Text>
            </View>
            <View style={styles.tableColFixed}>
              <Text style={styles.headerCell}>Fixed Score</Text>
            </View>
            <View style={styles.tableColYear}>
              <Text style={styles.headerCell}>2022</Text>
            </View>
            <View style={styles.tableColYear}>
              <Text style={styles.headerCell}>2023</Text>
            </View>
            <View style={styles.tableColYear}>
              <Text style={styles.headerCell}>2024</Text>
            </View>
            <View style={styles.tableColScorer}>
              <Text style={styles.headerCell}>Scorer & Date</Text>
            </View>
          </View>

          {filteredData.map((vendor, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : null,
              ]}
            >
              <View style={styles.tableColCode}>
                <Text style={styles.cellCode}>{vendor.vendorcode}</Text>
              </View>
              <View style={styles.tableColName}>
                <Text style={styles.cellName}>{vendor.vendorname || "N/A"}</Text>
              </View>
              <View style={styles.tableColFixed}>
                <Text style={styles.cellFixedMain}>
                  {formatDecimal(vendor.finalfixedscore)}
                </Text>
                <Text style={styles.cellFixedDetail}>
                  Payment: {formatDecimal(vendor.paymentscore)}
                </Text>
                <Text style={styles.cellFixedDetail}>
                  Quality: {formatDecimal(vendor.qualityscore)} × 2
                </Text>
                <Text style={styles.cellFixedDetail}>
                  Technical: {formatDecimal(vendor.technicalscore)}
                </Text>
                <Text style={styles.cellFixedDetail}>
                  Salesman: {formatDecimal(vendor.salesmanscore)}
                </Text>
              </View>
              <View style={styles.tableColYear}>
                <Text style={styles.cellYear}>
                  {vendor.finalscore2022 || "N/A"}
                </Text>
              </View>
              <View style={styles.tableColYear}>
                <Text style={styles.cellYear}>
                  {vendor.finalscore2023 || "N/A"}
                </Text>
              </View>
              <View style={styles.tableColYear}>
                <Text style={styles.cellYear}>
                  {vendor.finalscore2024 || "N/A"}
                </Text>
              </View>
              <View style={styles.tableColScorer}>
                <Text style={styles.cellScorer}>
                  {vendor.createdBy || "N/A"}
                </Text>
                <Text style={styles.cellDate}>
                  {vendor.createdAt
                    ? moment(vendor.createdAt).format("DD-MMM-YYYY")
                    : "N/A"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>
            Generated on {moment().format("DD MMMM YYYY, hh:mm A")} | Page 1
          </Text>
        </View>
      </Page>
    </Document>
  );
};

const PDFView = ({ filters }) => {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-gray-600">Loading PDF Viewer...</div>
      </div>
    );
  }

  const viewerStyle = {
    width: typeof window !== "undefined" ? window.innerWidth : "100%",
    height: typeof window !== "undefined" ? window.innerHeight : "100vh",
  };

  return (
    <PDFViewer style={viewerStyle}>
      <PDF filters={filters} />
    </PDFViewer>
  );
};

export default PDFView;

