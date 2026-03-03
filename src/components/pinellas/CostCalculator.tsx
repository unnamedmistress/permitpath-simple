import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Button from '@/components/shared/Button';
import { 
  calculatePermitCost, 
  getHistoricalComparison, 
  generateCustomerQuote,
  isExpressEligible 
} from '@/data/pinellas/feeSchedule';

interface CostCalculatorProps {
  jobType: string;
  jurisdiction?: string;
  onGenerateQuote?: (quote: ReturnType<typeof generateCustomerQuote>) => void;
}

export default function CostCalculator({ jobType, jurisdiction = 'PINELLAS_COUNTY', onGenerateQuote }: CostCalculatorProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [customValue, setCustomValue] = useState<string>('');
  const [markup, setMarkup] = useState<number>(1.25);
  const [showQuote, setShowQuote] = useState(false);

  const valuation = customValue ? parseInt(customValue, 10) : undefined;
  
  const costData = useMemo(() => 
    calculatePermitCost(jobType, jurisdiction, valuation),
    [jobType, jurisdiction, valuation]
  );

  const historicalData = useMemo(() => 
    getHistoricalComparison(jobType),
    [jobType]
  );

  const quote = useMemo(() => 
    generateCustomerQuote(jobType, costData.totalCost, markup),
    [jobType, costData.totalCost, markup]
  );

  const isExpress = isExpressEligible(jobType);

  const handleGenerateQuote = () => {
    setShowQuote(true);
    onGenerateQuote?.(quote);
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <DollarSign size={20} />
          <h3 className="font-semibold">Your Permit Cost</h3>
          {isExpress && (
            <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs flex items-center gap-1">
              <Sparkles size={12} />
              Express
            </span>
          )}
        </div>
        <p className="text-green-100 text-sm mt-0.5">
          {jobType.replace(/_/g, ' ')} • {jurisdiction.replace(/_/g, ' ')}
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Cost Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">
            ${costData.totalCost.toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isExpress ? 'Same-day approval' : 'Standard permit with plan review'}
          </p>
        </div>

        {/* Custom Valuation Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Project Value (optional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder={`Typical: $${costData.estimatedValue.toLocaleString()}`}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
            />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCustomValue(costData.estimatedValue.toString())}
            >
              Use Typical
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Cost calculated based on {costData.estimatedValue > 0 ? `$${costData.estimatedValue.toLocaleString()}` : 'estimated'} construction value
          </p>
        </div>

        {/* Fee Breakdown */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <span className="font-medium text-sm">Fee Breakdown</span>
          {showBreakdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showBreakdown && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Base Permit Fee</span>
              <span>${costData.feeBreakdown.basePermitFee.toFixed(2)}</span>
            </div>
            
            {costData.feeBreakdown.planReviewFee > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Plan Review Fee</span>
                <span>${costData.feeBreakdown.planReviewFee.toFixed(2)}</span>
              </div>
            )}
            
            {costData.feeBreakdown.inspectionFee > 0 && (
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Inspection Fee</span>
                <span>${costData.feeBreakdown.inspectionFee.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">State Surcharge (10%)</span>
              <span>${costData.feeBreakdown.stateSurcharge.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Technology Fee</span>
              <span>${costData.feeBreakdown.technologyFee.toFixed(2)}</span>
            </div>

            {costData.feeBreakdown.additionalFees.map((fee, i) => (
              <div key={i} className="flex justify-between py-1">
                <span className="text-muted-foreground">{fee.name}</span>
                <span>${fee.amount.toFixed(2)}</span>
              </div>
            ))}

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-green-600">${costData.totalCost.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Historical Comparison */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Similar Jobs in Pinellas County</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold">${historicalData.low}</div>
              <div className="text-xs text-muted-foreground">Low</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">${historicalData.average}</div>
              <div className="text-xs text-muted-foreground">Average</div>
            </div>
            <div>
              <div className="font-semibold">${historicalData.high}</div>
              <div className="text-xs text-muted-foreground">High</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on {historicalData.sampleSize} recent permits
          </p>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          {costData.notes.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{note}</span>
            </div>
          ))}
        </div>

        {/* Quote Generator */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-sm mb-3">Generate Customer Quote</h4>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Your Markup</label>
              <input
                type="range"
                min="1"
                max="2"
                step="0.05"
                value={markup}
                onChange={(e) => setMarkup(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>No markup (1.0x)</span>
                <span className="font-medium">{Math.round((markup - 1) * 100)}%</span>
                <span>High (2.0x)</span>
              </div>
            </div>

            {showQuote && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-blue-500" />
                  <span className="font-medium text-sm">Customer Price</span>
                </div>
                <div className="text-2xl font-bold text-blue-700">
                  ${quote.customerPrice.toFixed(2)}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  {quote.lineItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-blue-600">
                      <span>{item.item}</span>
                      <span>${item.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={handleGenerateQuote} className="w-full">
              {showQuote ? 'Update Quote' : 'Generate Quote'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
