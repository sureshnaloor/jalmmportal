import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { connectToDatabase } from '../../../lib/mongoconnect';
import { buildTypeGroupHierarchyReport } from '../../../lib/typeGroupHierarchyReport';
import TypeGroupHierarchyPDFDocument from '../../../components/MaterialGroups/TypeGroupHierarchyPDFDocument';

export const config = {
  api: {
    responseLimit: false,
  },
};

async function renderPdfBuffer(report) {
  const doc = React.createElement(TypeGroupHierarchyPDFDocument, { report });
  const stream = await ReactPDF.renderToStream(doc);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const report = await buildTypeGroupHierarchyReport(db);

    if (req.query.format === 'pdf') {
      const pdfBuffer = await renderPdfBuffer(report);
      const stamp = new Date().toISOString().slice(0, 10);
      const fileName = `material-service-types-groups-${stamp}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('type-group-report error:', error);
    return res.status(500).json({ error: 'Failed to build type / group hierarchy report' });
  }
}
