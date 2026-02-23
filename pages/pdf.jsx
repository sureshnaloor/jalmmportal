/* eslint-disable jsx-a11y/alt-text */
import {
  Document,
  Page,
  View,
  Text,
  Image,
  PDFViewer,
  StyleSheet,
} from "@react-pdf/renderer";
import { useState, useEffect } from "react";

const styles = StyleSheet.create({
  body: {
    backgroundColor: "#000fff",
  },
  viewer: {
    width: window.innerWidth,
    height: window.innerHeight,
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: 5,
    fontSize: 8,
  },
});

const PDF = () => {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    (async () => {
      const result = await fetch(`/api/usermaster`);
      const json = await result.json();
      setEmployees(json);
    })();
  }, []);

  console.log(employees);
  return (
    <Document>
      <Page
        style={{
          height: "500px",
          width: "1500px",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <View style={{ display: "flex", justifyContent: "center" }}>
          <Text wrap={true} style={{ fontSize: "12px", fontWeight: "heavy" }}>
            Hello JAL,
            ipsem  Lorem 
          </Text>
        </View>
        <View>
          <Image
            className="min-w-full"
            src="/images/civil.jpg"
            width={1500}
            height={900}
          />
        </View>
        <View style={styles.table}>
        <View style={styles.tableRow}>
          
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Employee Name</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>Employee Number</Text>
          </View>
        </View>
        </View>
        {employees.slice(0, 50).map((emp, index) => (
          <View key={index} style={styles.tableRow}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{emp.empname}</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCell}>{emp.empno}</Text>
          </View>
         
        </View>
        ))}
      </Page>
    </Document>
  );
};
const PDFView = () => {
  const [client, setClient] = useState(false);

  useEffect(() => {
    setClient(true);
  }, []);

  return (
    <PDFViewer style={styles.viewer}>
      <PDF />
    </PDFViewer>
  );
};
export default PDFView;
