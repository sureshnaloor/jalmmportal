/* eslint-disable jsx-a11y/alt-text */
import { useRouter } from "next/router";

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
import { set } from "react-hook-form";
  
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
    const [vendorcode, setVendorcode] = useState(null);
    const router = useRouter()
  
    useEffect(() => {
      (async () => {
       setVendorcode(router.query.vendorcode)
      })();
    }, []);

    console.log(vendorcode);
  
    
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
              width={"1500px"}
              height="900px"
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
          {vendorcode}
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
  