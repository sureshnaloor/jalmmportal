import React from 'react';
import ReactPDF from '@react-pdf/renderer';
import { connectToDatabase } from '../../../lib/mongoconnect';
import { buildGroupVendorMappingReport } from '../../../lib/groupVendorMappingReport';
import { getVendorEvaluationYear } from '../../../lib/vendorEvaluationYear';
import GroupVendorMappingPDFDocument from '../../../components/MaterialGroups/GroupVendorMappingPDFDocument';

export const config = {
  api: {
    responseLimit: false,
  },
};

async function renderPdfBuffer(report) {
  const doc = React.createElement(GroupVendorMappingPDFDocument, { report });
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
    const evaluationYear = req.query.year
      ? parseInt(req.query.year, 10)
      : getVendorEvaluationYear();

    const { db } = await connectToDatabase();
    const report = await buildGroupVendorMappingReport(db, evaluationYear);

    if (req.query.format === 'pdf') {
      const pdfBuffer = await renderPdfBuffer(report);
      const fileName = `group-vendor-mapping-${evaluationYear}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }

    return res.status(200).json(report);
  } catch (error) {
    console.error('vendor-mapping-report error:', error);
    return res.status(500).json({ error: 'Failed to build vendor mapping report' });
  }
}
