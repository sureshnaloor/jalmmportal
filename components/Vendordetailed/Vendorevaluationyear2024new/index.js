import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import { useSession } from "next-auth/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Vendorevaluationyear2024new({ vendornumber }) {
  const [purchaseorders, setPurchaseorders] = useState([]);
  const [numpo, setNumpo] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [vendorevaled, setVendorevaled] = useState({});
  const [powiserating, setPowiserating] = useState([]);
  const [evaluatedPOs, setEvaluatedPOs] = useState(new Set());
  const [ratings, setRatings] = useState({});

  const router = useRouter();
  const { data: session } = useSession();

  // Fetch purchase orders
  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/purchaseorders/vendor/yearwise2024/${vendornumber}`);
        const json = await response.json();
        
        // Sort POs by value in descending order and take top 3
        const sortedPOs = json.sort((a, b) => b.poval - a.poval).slice(0, 3);
        setPurchaseorders(sortedPOs);
        setNumpo(sortedPOs.length);
        
        // Initialize ratings for each PO
        const initialRatings = {};
        sortedPOs.forEach(po => {
          initialRatings[po.ponum] = {
            delivery: 0,
            price: 0,
            quality: 0
          };
        });
        setRatings(initialRatings);
      } catch (error) {
        console.error('Error fetching purchase orders:', error);
        toast.error('Failed to load purchase orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (vendornumber) {
      fetchPurchaseOrders();
    }
  }, [vendornumber]);

  // Fetch existing evaluations
  useEffect(() => {
    const fetchPOEvaluated = async () => {
      try {
        const response = await fetch(`/api/vendors/vendorevalyearly4/${vendornumber}`);
        const json = await response.json();
        setVendorevaled(json);
      } catch (error) {
        console.error('Error fetching evaluations:', error);
        toast.error('Failed to load existing evaluations');
      }
    };

    if (vendornumber) {
      fetchPOEvaluated();
    }
  }, [vendornumber]);

  // Star rating component
  const StarRating = ({ rating, setRating, disabled, category, ponum }) => {
    const [hover, setHover] = useState(0);

    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <button
              type="button"
              key={index}
              disabled={disabled}
              className={`text-2xl transition-colors duration-200 ${
                ratingValue <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              onClick={() => {
                setRating(ponum, category, ratingValue);
              }}
              onMouseEnter={() => !disabled && setHover(ratingValue)}
              onMouseLeave={() => !disabled && setHover(0)}
            >
              <span>★</span>
            </button>
          );
        })}
        <span className="ml-2 text-sm font-medium text-gray-700">
          {rating || 0}/5
        </span>
      </div>
    );
  };

  // Update rating for a specific PO and category
  const updateRating = (ponum, category, value) => {
    setRatings(prev => ({
      ...prev,
      [ponum]: {
        ...prev[ponum],
        [category]: value
      }
    }));
  };

  // Handle PO evaluation
  const handlePOEvaluation = (ponum, poindex) => {
    const poRatings = ratings[ponum.ponum];
    const totalScore = poRatings.delivery + poRatings.price + poRatings.quality;
    
    setPowiserating((prev) => [
      ...prev,
      {
        ponumber: ponum.ponum,
        povalue: (Math.round(ponum.poval * 100) / 100).toLocaleString(),
        deliveryrating: poRatings.delivery,
        qualityrating: poRatings.quality,
        pricerating: poRatings.price,
        porating: totalScore,
      },
    ]);

    setEvaluatedPOs((prev) => new Set([...prev, ponum.ponum]));
    
    toast.success(
      `PO ${ponum.ponum} evaluation completed! Total score: ${totalScore}/15`,
      { position: "bottom-center" }
    );
  };

  // Check if all POs are evaluated
  const allPOsEvaluated = purchaseorders.length > 0 && 
    purchaseorders.every(po => evaluatedPOs.has(po.ponum));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-bold text-green-800 mb-4 flex items-center">
        <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Current Year PO Evaluations
      </h2>

      {purchaseorders.length > 0 && vendorevaled["powiseevalyear4"] ? (
        // Display existing evaluations - 3 Column Layout
        <div className="grid grid-cols-3 gap-4">
          {vendorevaled["powiseevalyear4"]["powiserating"]
            .sort((a, b) => parseFloat(b.povalue.replace(/,/g, '')) - parseFloat(a.povalue.replace(/,/g, '')))
            .slice(0, 3)
            .map((po, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-green-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-green-800">
                  PO: {po.ponumber}
                </h3>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                  Value: {po.povalue}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                  <span className="text-green-700 font-medium text-xs">Delivery:</span>
                  <span className="font-bold text-green-800 text-xs">{po.deliveryrating}/5</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                  <span className="text-green-700 font-medium text-xs">Price:</span>
                  <span className="font-bold text-green-800 text-xs">{po.pricerating}/5</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-white rounded-md shadow-sm">
                  <span className="text-green-700 font-medium text-xs">Quality:</span>
                  <span className="font-bold text-green-800 text-xs">{po.qualityrating}/5</span>
                </div>
                <div className="mt-3 pt-2 border-t border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-green-800 text-xs">Total:</span>
                    <span className="text-sm font-bold text-green-600">
                      {po.porating}/15
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : purchaseorders.length > 0 ? (
        // Evaluation form
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-lg border border-green-200 mb-4">
            <p className="text-green-800 text-xs font-medium">
              Showing top 3 Purchase Orders by value for evaluation
              <span className="text-red-500 text-xs font-bold ml-2"> (User to score and finalize all PO's together) </span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {purchaseorders.map((ponum, poindex) => {
              const poRatings = ratings[ponum.ponum] || { delivery: 0, price: 0, quality: 0 };
              const totalScore = poRatings.delivery + poRatings.price + poRatings.quality;

              return (
                <div key={poindex} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-green-100">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-green-800">
                        PO: {ponum.ponum}
                      </h3>
                      <p className="text-xs text-green-600 mt-1">
                        Date: {moment(ponum.podate).format('DD/MM/YYYY')}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm">
                      Value: {(Math.round(ponum.poval * 100) / 100).toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white rounded-md p-2 shadow-sm">
                      <label className="block text-xs font-bold text-green-700 mb-1">
                        ⏰ Delivery Rating
                      </label>
                      <StarRating
                        rating={poRatings.delivery}
                        setRating={updateRating}
                        disabled={evaluatedPOs.has(ponum.ponum)}
                        category="delivery"
                        ponum={ponum.ponum}
                      />
                    </div>

                    <div className="bg-white rounded-md p-2 shadow-sm">
                      <label className="block text-xs font-bold text-green-700 mb-1">
                        💰 Price Rating
                      </label>
                      <StarRating
                        rating={poRatings.price}
                        setRating={updateRating}
                        disabled={evaluatedPOs.has(ponum.ponum)}
                        category="price"
                        ponum={ponum.ponum}
                      />
                    </div>

                    <div className="bg-white rounded-md p-2 shadow-sm">
                      <label className="block text-xs font-bold text-green-700 mb-1">
                        ⭐ Quality Rating
                      </label>
                      <StarRating
                        rating={poRatings.quality}
                        setRating={updateRating}
                        disabled={evaluatedPOs.has(ponum.ponum)}
                        category="quality"
                        ponum={ponum.ponum}
                      />
                    </div>

                    <div className="pt-2 border-t border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 rounded-md p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-800 text-xs">Total Score:</span>
                        <span className="text-sm font-bold text-green-600">
                          {totalScore}/15
                        </span>
                      </div>
                    </div>

                    {!evaluatedPOs.has(ponum.ponum) && (
                      <button
                        onClick={() => handlePOEvaluation(ponum, poindex)}
                        disabled={!poRatings.delivery || !poRatings.price || !poRatings.quality}
                        className="w-full mt-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-colors font-bold text-xs"
                      >
                        Submit Evaluation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                try {
                  const response = await fetch(
                    `/api/vendors/vendorevalyearly4/${vendornumber}`,
                    {
                      method: "PUT",
                      body: JSON.stringify({
                        powiserating: powiserating,
                        createdBy: session?.user?.name,
                        createdAt: new Date(),
                      }),
                      headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                      },
                    }
                  );

                  if (!response.ok) throw new Error('Failed to save evaluations');

                  toast.success("All evaluations have been saved successfully!");
                  router.reload();
                } catch (error) {
                  console.error('Error saving evaluations:', error);
                  toast.error('Failed to save evaluations');
                }
              }}
              disabled={!allPOsEvaluated}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 font-bold text-sm"
            >
              🎯 Finalize All Evaluations
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <svg className="w-12 h-12 text-green-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-green-600 font-medium text-sm">No purchase orders found for 2024</p>
        </div>
      )}
    </div>
  );
}

export default Vendorevaluationyear2024new; 