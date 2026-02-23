import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Vendorevaluationpastyearsnew({ vendornumber }) {
  const [scores, setScores] = useState({
    2018: '',
    2019: '',
    2020: '',
    2021: '',
    2022: '',
    2023: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [vendorpastscores, setVendorpastscores] = useState([]);

  const { data: session } = useSession();
  const router = useRouter();

  // Fetch past scores
  useEffect(() => {
    const fetchPastScores = async () => {
      try {
        setIsLoading(true);
        const result = await fetch(`/api/vendors/vendorevalpastyears/${vendornumber}`);
        const json = await result.json();
        setVendorpastscores(json);
      } catch (error) {
        console.error('Error fetching past scores:', error);
        toast.error('Failed to load past evaluation scores');
      } finally {
        setIsLoading(false);
      }
    };

    if (vendornumber) {
      fetchPastScores();
    }
  }, [vendornumber]);

  // Handle score update
  const handleScoreUpdate = async (year, score) => {
    try {
      const response = await fetch(`/api/vendors/vendorevalpastyears/${vendornumber}`, {
        method: "PUT",
        body: JSON.stringify({
          pastyear: year.toString(),
          score: score,
          createdBy: session?.user?.name,
          createdAt: new Date(),
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error('Failed to update score');

      toast.success(`Evaluation score for year ${year} has been updated successfully!`);
      router.reload();
    } catch (error) {
      console.error('Error updating score:', error);
      toast.error('Failed to update evaluation score');
    }
  };

  // Get score for a specific year
  const getYearScore = (year) => {
    return vendorpastscores["past"]?.find(past => past.pastyear === year.toString())?.pastyearscore;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-zinc-800 mb-4 flex items-center">
        <svg className="w-4 h-4 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Historical Performance Analysis
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(scores).map((year) => {
          const yearScore = getYearScore(year);
          const isEvaluated = yearScore >= 0;

          return (
            <div key={year} className="bg-gradient-to-br from-zinc-50 to-stone-50 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-zinc-200 hover:border-zinc-300">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-zinc-800">Year {year}</h3>
                {isEvaluated ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    yearScore >= 80 ? 'bg-teal-500 text-white' :
                    yearScore >= 60 ? 'bg-stone-500 text-white' :
                    'bg-red-500 text-white'
                  }`}>
                    Score: {yearScore}
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-400 text-white shadow-sm">
                    Not evaluated
                  </span>
                )}
              </div>

              {!isEvaluated && (
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={scores[year]}
                      onChange={(e) => setScores({...scores, [year]: e.target.value})}
                      placeholder="Enter score (0-100)"
                      className="flex-1 rounded-md border-zinc-200 shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white text-xs"
                    />
                    <button
                      onClick={() => handleScoreUpdate(year, scores[year])}
                      disabled={!scores[year]}
                      className="px-3 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors text-xs"
                    >
                      Update
                    </button>
                  </div>
                  <p className="text-xs text-zinc-600 italic">
                    No PO activity during this year
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 bg-gradient-to-r from-zinc-100 to-stone-100 rounded-lg border border-zinc-200">
        <h4 className="font-bold text-zinc-800 mb-2 text-sm">Performance Rating Guide:</h4>
        <div className="space-y-1">
          <p className="flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-teal-500 mr-2 shadow-sm"></span>
            <span className="font-semibold text-teal-800">Score ≥ 80:</span> Excellent performance
          </p>
          <p className="flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-stone-500 mr-2 shadow-sm"></span>
            <span className="font-semibold text-stone-800">Score ≥ 60:</span> Satisfactory performance
          </p>
          <p className="flex items-center text-xs">
            <span className="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-sm"></span>
            <span className="font-semibold text-red-800">Score &lt; 60:</span> Needs improvement
          </p>
        </div>
      </div>
    </div>
  );
}

export default Vendorevaluationpastyearsnew; 