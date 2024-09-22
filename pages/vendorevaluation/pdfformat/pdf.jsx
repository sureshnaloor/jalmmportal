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
  import moment from "moment";
  
  const styles = StyleSheet.create({
    body: {
      backgroundColor: "#ffffff",
    },
    viewer: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    table: {
      display: 'table',
      width: 'auto',
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderRightWidth: 0,
      borderBottomWidth: 0,
    },
    tableRow: {
      margin: 'auto',
      flexDirection: 'row',
    },
    
    tableCol10: {
      width: '10%',
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },
    tableCol20: {
      width: '20%',
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderLeftWidth: 0,
      borderTopWidth: 0,
    },
    tableColflex: {
      width: '20%',
      borderStyle: 'solid',
      borderWidth: 0.5,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      display: 'flex',
      flexDirection: 'column',
    },
    tableCelltitle: {
      margin: 3,
      fontSize: 8,
      color: '#008080',
      textTransform: 'uppercase',
      textAlign: 'center',
    },
    tableCellcolor: {
      margin: 3,
      fontSize: 7,
      color: '#008080',
      fontFamily: 'Helvetica-Bold',
    },
    tableCellflex: {
      margin: 3,
      fontSize: 8,
      flexDirection: 'column',
      display: 'flex',
    },
    tableCellcenter: {
      margin: 3,
      fontSize: 7,
      textAlign: 'center',
      fontFamily: 'Courier-Bold',
    },
    tableCellsmall: {
      margin: 3,
      fontSize: 6,
      textAlign: 'center',
      fontFamily: 'Courier-Oblique',
      color: '#0047ab',
    },
    tableCell: {
      margin: 3,
      fontSize: 7,
      textAlign: 'center',
      fontFamily: 'Times-Bold',
    },
  });
  
  const PDF = () => {
    const [vendormarks, setVendormarks] = useState([]);
  
    useEffect(() => {
      (async () => {
        const result = await fetch(`/api/vendorevaluation`);
        const json = await result.json();
        setVendormarks(json);
      })();
    }, []);
  
    console.log(vendormarks);
    return (
      <Document>
        <Page
          
        >
                   
          <View style={styles.table}>
          <View style={styles.tableRow}>
            
            <View style={styles.tableCol10}>
              <Text style={styles.tableCelltitle}>Vendor code</Text>
            </View>
            <View style={styles.tableCol20}>
              <Text style={styles.tableCelltitle}>Vendor name</Text>
            </View>
            <View style={styles.tableCol20}>
              <Text style={styles.tableCelltitle}>Fixed score</Text>
            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCelltitle}>Year 2022 score</Text>
            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCelltitle}>Year 2023 score</Text>
            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCelltitle}>Year 2024 score</Text>
            </View>
            <View style={styles.tableCol20}>
              <Text style={styles.tableCelltitle}>Scorer:</Text>
            </View>
          </View>
          </View>
          {vendormarks.map((vendor, index) => (
            <View key={index} style={styles.tableRow}>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCell}>{vendor.vendorcode}</Text>
            </View>
            <View style={styles.tableCol20}>
              <Text style={styles.tableCellcolor}>{vendor.vendorname}</Text>
            </View>
            <View style={styles.tableColflex}>
              <Text style={styles.tableCellcenter}>{vendor.finalfixedscore.$numberDecimal}</Text>
              <Text style={styles.tableCellsmall}>Credit payment: {vendor.paymentscore.$numberDecimal}</Text>
              <Text style={styles.tableCellsmall}>Quality assurance: {vendor.qualityscore.$numberDecimal * 2}</Text>
              <Text style={styles.tableCellsmall}>Technical clarity: {vendor.technicalscore.$numberDecimal}</Text>
              <Text style={styles.tableCellsmall}>Salesman interaction: {vendor.salesmanscore.$numberDecimal}</Text>

            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCellcenter}>{vendor.finalscore2022}</Text>
            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCellcenter}>{vendor.finalscore2023}</Text>
            </View>
            <View style={styles.tableCol10}>
              <Text style={styles.tableCellcenter}>{vendor.finalscore2024}</Text>
            </View>
            <View style={styles.tableColflex}>
              <Text style={styles.tableCellcolor}>{vendor.createdBy} </Text> <Text style={styles.tableCell}> {moment(vendor.createdAt).format("DD-MMM-YY")}</Text> 
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
  