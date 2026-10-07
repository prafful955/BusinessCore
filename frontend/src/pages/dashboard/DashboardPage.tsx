import { useEffect, useState } from 'react';
import {
  dashboardApi,
  dashboardCategories,
  type DashboardCategory,
  type DashboardSummary,
} from './dashboard.api';

export default function DashboardPage() {
  const [zCategoryL, setCategory] = useState<DashboardCategory>('Bedding');
  const [oSummaryL, setSummary] = useState<DashboardSummary | null>(null);
  const [bLoadingL, setLoading] = useState(true);
  const [zErrorL, setError] = useState('');
  const [nRefreshL, setRefresh] = useState(0);
  useEffect(() => {
    let bActiveL = true;
    setLoading(true);
    setError('');
    setSummary(null);
    dashboardApi
      .summary(zCategoryL)
      .then((oSummaryP) => {
        if (bActiveL) setSummary(oSummaryP);
      })
      .catch((oErrorP) => {
        if (bActiveL)
          setError(oErrorP instanceof Error ? oErrorP.message : 'Unable to load dashboard.');
      })
      .finally(() => {
        if (bActiveL) setLoading(false);
      });
    return () => {
      bActiveL = false;
    };
  }, [zCategoryL, nRefreshL]);
  return (
    <div className="dashboard-page">
      <div className="dashboard-tabs" aria-label="Dashboard categories">
        {dashboardCategories.map((zCategoryP) => (
          <button
            key={zCategoryP}
            className={zCategoryL === zCategoryP ? 'current-tab' : ''}
            aria-pressed={zCategoryL === zCategoryP}
            onClick={() => setCategory(zCategoryP)}
          >
            {zCategoryP}
          </button>
        ))}
      </div>
      <header className="dashboard-heading">
        <h1>{zCategoryL.toUpperCase()}</h1>
        <button
          className="secondary"
          disabled={bLoadingL}
          aria-label="Refresh dashboard"
          onClick={() => setRefresh((nCurrentP) => nCurrentP + 1)}
        >
          ↻ Refresh
        </button>
      </header>
      {bLoadingL ? (
        <p className="dashboard-message" role="status">
          Loading dashboard...
        </p>
      ) : zErrorL ? (
        <div className="dashboard-message" role="alert">
          <p>{zErrorL}</p>
          <button onClick={() => setRefresh((nCurrentP) => nCurrentP + 1)}>Retry</button>
        </div>
      ) : (
        oSummaryL && (
          <>
            <div className="dashboard-metrics">
              {oSummaryL.metrics.map((oMetricP) => (
                <section className="metric-card" key={oMetricP.key}>
                  <div className="metric-heading">
                    <h2>{oMetricP.label}</h2>
                    <time dateTime={oSummaryL.updatedAt}>
                      {new Date(oSummaryL.updatedAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p>
                    {new Intl.NumberFormat(undefined, {
                      style: 'currency',
                      currency: oSummaryL.currency,
                    }).format(oMetricP.amount)}
                  </p>
                </section>
              ))}
            </div>
            {!oSummaryL.metrics.length && (
              <p className="dashboard-message">No metrics available for this category.</p>
            )}
          </>
        )
      )}
    </div>
  );
}
