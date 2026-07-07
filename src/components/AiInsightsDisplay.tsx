import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, BrainCircuit, CheckCircle2, DollarSign, Info, Lightbulb, Loader2, Sparkles, TrendingUp, Wallet, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { authService } from '../pages/auth.service'; // Assuming authService is accessible
import { useAuth } from '../context/AuthContext';

// Re-defining interfaces from the backend response for clarity in frontend
interface DashboardAiMessage {
  title: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  message: string;
  action?: string;
}

interface SalaryRisk {
  level: 'low' | 'medium' | 'high';
  canPaySalaries: boolean;
  projectedPayroll: number;
  availableCashAfterCosts: number;
  coverageRatio: number;
  explanation: string;
}

interface DashboardAiResponse {
  provider: 'gemini' | 'local';
  model: string | null;
  generatedAt: string;
  status: 'good' | 'warning' | 'danger';
  score: number;
  overview: string;
  salaryRisk: SalaryRisk;
  highlights: DashboardAiMessage[];
  recommendations: string[];
  topProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  lowStockAlertsCount: number;
  raw: any; // Raw data, not strictly needed for display but good to have
}

const severityColors = {
  info: 'bg-blue-50 border-blue-100 text-blue-700',
  success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  warning: 'bg-[#F2F2F7] border-[#E5E5EA] text-[#48484A]',
  danger: 'bg-red-50 border-red-100 text-red-700',
};

const salaryRiskColors = {
  low: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  medium: 'bg-[#F2F2F7] border-[#E5E5EA] text-[#48484A]',
  high: 'bg-red-50 border-red-100 text-red-700',
};

export function AiInsightsDisplay({ periodDays = 30 }) {
  const { t } = useTranslation();
  const { tenantId, user } = useAuth();
  const [aiInsights, setAiInsights] = useState<DashboardAiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId || !user?.id) {
      setError("Tenant ID or User ID not available.");
      setIsLoading(false);
      return;
    }

    const fetchInsights = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await authService.getAiInsights(periodDays);
        setAiInsights(data);
      } catch (err: any) {
        console.error("Failed to fetch AI insights:", err);
        setError(err.message || "Failed to load AI insights.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [tenantId, user?.id, periodDays]);

  if (isLoading) {
    return (
      <Card className="rounded-sm border-slate-200 shadow-none lg:col-span-3">
        <CardContent className="p-6 flex flex-col items-center justify-center h-64 ">
          <Loader2 className="h-8 w-8 text-[#3A3A3C] animate-spin mb-4" />
          <p className="text-sm text-slate-500 font-medium">{t('common.loading')} AI Insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-sm border-red-200 bg-red-50 shadow-none lg:col-span-3">
        <CardContent className="p-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!aiInsights) {
    return (
      <Card className="rounded-sm border-slate-200 shadow-none lg:col-span-3">
        <CardContent className="p-6 text-center text-slate-500">
          <Info className="h-6 w-6 mx-auto mb-3 text-slate-400" />
          <p>No AI insights available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: 'good' | 'warning' | 'danger') => {
    switch (status) {
      case 'good': return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'warning': return <AlertCircle className="h-5 w-5 text-[#636366]" />;
      case 'danger': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-sm border-slate-200 shadow-none">
        <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-4">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
            {getStatusIcon(aiInsights.status)}
            {t('ai_analysis.overview_title', 'Synthèse IA')}
            <span className={cn(
              "ml-auto px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tighter",
              aiInsights.status === 'good' ? 'bg-emerald-50 text-emerald-700' :
              aiInsights.status === 'warning' ? 'bg-[#F2F2F7] text-[#48484A]' :
              'bg-red-50 text-red-700'
            )}>
              {aiInsights.status}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-slate-700 leading-relaxed">{aiInsights.overview}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <BrainCircuit className="h-4 w-4" />
            <span>Generated by {aiInsights.provider} ({aiInsights.model || 'local fallback'}) on {new Date(aiInsights.generatedAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Highlights Cards */}
        {aiInsights.highlights.map((highlight, index) => (
          <Card key={index} className="rounded-sm border-slate-200 shadow-none">
            <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <Sparkles className="h-4 w-4 text-[#636366]" />
                {highlight.title}
                <span className={cn(
                  "ml-auto px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-tighter",
                  severityColors[highlight.severity]
                )}>
                  {highlight.severity}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              <p className="text-sm text-slate-700">{highlight.message}</p>
              {highlight.action && (
                <p className="text-xs text-blue-600 font-medium flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  {highlight.action}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations List */}
      {aiInsights.recommendations.length > 0 && (
        <Card className="rounded-sm border-slate-200 shadow-none">
          <CardHeader className="border-b border-slate-100 bg-slate-50/30 px-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-700">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              {t('ai_analysis.recommendations_title', 'Recommandations')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
              {aiInsights.recommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}