// Temporary fix for Analyze button until Tokenization.tsx is cleaned up

// Add this code to replace the InvestmentAnalysis call in Tokenization.tsx:
{selectedToken === `analyze-${token.id}` ? (

  <div className="space-y-4 border-t pt-4 bg-white rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <h4 className="font-semibold flex items-center gap-2 text-lg">
        <BarChart3 className="h-5 w-5 text-blue-600" />
        Investment Analysis - {token.businessName}
      </h4>
      <Button size="sm" variant="ghost" onClick={() => setSelectedToken(null)}>
        <X className="h-4 w-4" />
      </Button>
    </div>

    {/* Trading Chart Placeholder */}
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Trading Analysis</span>
        <span className="text-sm font-bold text-green-600">+12.5%</span>
      </div>

      <div className="bg-white rounded border p-4 h-24 flex items-center justify-center">
        <div className="text-center text-gray-600">
          <BarChart3 className="h-6 w-6 mx-auto mb-1" />
          <p className="text-xs">Price: RM {token.pricePerToken} | ROI: {token.expectedROI}</p>
        </div>
      </div>
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
        <div className="text-xs text-green-700">Score</div>
        <div className="font-bold text-green-800">85%</div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
        <div className="text-xs text-blue-700">Risk</div>
        <div className="font-bold text-blue-800">Low</div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex gap-2">
      <Button
        size="sm"
        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        onClick={() => {
          setSelectedToken(`token-${token.id}`);
        }}
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Buy Now
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="flex-1"
        onClick={() => setSelectedToken(null)}
      >
        Close
      </Button>
    </div>

  </div>
) : selectedToken === `token-${token.id}` ? (
  // existing buy token code continues here...
