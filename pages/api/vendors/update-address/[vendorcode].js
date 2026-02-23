import { connectToDatabase } from '../../../../lib/mongoconnect';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { vendorcode } = req.query;
    const { address, username } = req.body;

    if (!vendorcode) {
      return res.status(400).json({ error: 'Vendor code is required' });
    }

    if (!address) {
      return res.status(400).json({ error: 'Address data is required' });
    }

    const { db } = await connectToDatabase();

    // Try to update in both collections
    const updatePromises = [];

    // Update in vendors collection
    updatePromises.push(
      db.collection('vendors').updateOne(
        { 'vendor-code': vendorcode },
        { 
          $set: { 
            address: address,
            updated_at: new Date(),
            updated_by: username || 'admin'
          }
        }
      )
    );

    // Update in registeredvendors collection
    updatePromises.push(
      db.collection('registeredvendors').updateOne(
        { vendorcode: vendorcode },
        { 
          $set: { 
            address: address,
            updated_at: new Date(),
            updated_by: username || 'admin'
          }
        }
      )
    );

    const results = await Promise.all(updatePromises);
    
    // Check if any update was successful
    const anyUpdated = results.some(result => result.modifiedCount > 0);
    
    if (!anyUpdated) {
      return res.status(404).json({ error: 'Vendor not found in any collection' });
    }

    return res.status(200).json({ 
      message: 'Vendor address updated successfully',
      modifiedCount: results.reduce((sum, result) => sum + result.modifiedCount, 0)
    });

  } catch (error) {
    console.error('Error updating vendor address:', error);
    return res.status(500).json({ 
      error: 'Failed to update vendor address',
      details: error.message 
    });
  }
}
