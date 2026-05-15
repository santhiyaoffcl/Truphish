import { useEffect, useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from 'recharts';
import { ArrowUpRight, Plus, Download, ShieldAlert, MonitorPlay, Activity, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scan/history?limit=100');
        setHistory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch history data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const computedData = useMemo(() => {
    let safeCount = 0;
    let phishingCount = 0;
    let totalScore = 0;
    let urlTypeCount = 0;
    let textTypeCount = 0;

    const now = new Date();
    const daysMap = {};
    for(let i=6; i>=0; i--){
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      daysMap[dayStr] = { name: dayStr, safe: 0, phishing: 0 };
    }

    history.forEach(item => {
      if (item.prediction.toLowerCase() === 'phishing') phishingCount++;
      else safeCount++;
      
      if (item.type === 'url') urlTypeCount++;
      else textTypeCount++;

      totalScore += item.risk_score;

      const itemDate = new Date(item.created_at);
      const dayStr = itemDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (daysMap[dayStr]) {
        if(item.prediction.toLowerCase() === 'phishing') daysMap[dayStr].phishing++;
        else daysMap[dayStr].safe++;
      }
    });

    const avgRiskScore = history.length > 0 ? Math.round(totalScore / history.length) : 0;
    const barData = Object.values(daysMap);
    
    const safetyPieData = [
      { name: 'Safe', value: safeCount, color: '#10b981' },   // Green for Safe
      { name: 'Phishing', value: phishingCount, color: '#ef4444' } // Red for Danger
    ];

    const typePieData = [
      { name: 'URLs', value: urlTypeCount, color: '#6366f1' },      // Primary Violet
      { name: 'Texts/Emails', value: textTypeCount, color: '#818cf8' }  // Light Violet
    ];

    const recentScans = history.slice(0, 5);

    return { total: history.length, safeCount, phishingCount, avgRiskScore, barData, safetyPieData, typePieData, recentScans };
  }, [history]);

  const { total, safeCount, phishingCount, avgRiskScore, barData, safetyPieData, typePieData, recentScans } = computedData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ padding: '12px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', minWidth: '150px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '800', color: 'var(--text-main)', fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: index === 0 ? '4px' : '0' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>
                {entry.name}: <span style={{ color: 'var(--text-main)' }}>{entry.value}</span>
              </p>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ animation: 'fadein 0.4s' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Security Console</h1>
          <p>Real-time phishing intelligence and threat monitoring dashboard.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => navigate('/scan-url')}>
            <Plus size={18} /> New Analysis
          </button>
          <button className="outline">
            <Download size={18} /> Reports
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
           {[1,2,3,4].map(i => (
             <div key={i} className="card" style={{ flex: 1, minWidth: '240px', height: '140px', background: 'var(--bg-color)', opacity: 0.5 }}></div>
           ))}
        </div>
      ) : (
        <>
          <div className="top-metrics-grid">
            <div className="metric-card-primary">
              <h3>Total Intelligence</h3>
              <div className="value">{total}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.5rem', fontWeight: '500' }}>
                 Aggregated scans across all protocols
              </div>
              <div className="icon"><Zap size={20} color="white" fill="white" /></div>
            </div>

            <div className="metric-card-standard">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Verified Secure</h3>
                <CheckCircle size={18} color="var(--success)" />
              </div>
              <div className="value">{safeCount}</div>
              <div className="badge safe" style={{ marginTop: '0.75rem' }}>
                <TrendingUp size={12} /> {(total > 0 ? (safeCount/total*100).toFixed(0) : 0)}% Integrity
              </div>
            </div>

            <div className="metric-card-standard">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Threats Blocked</h3>
                <ShieldAlert size={18} color="var(--danger)" />
              </div>
              <div className="value">{phishingCount}</div>
              <div className="badge danger" style={{ marginTop: '0.75rem' }}>
                Critical Actions
              </div>
            </div>

            <div className="metric-card-standard">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3>Risk Index</h3>
                <Activity size={18} color="var(--accent)" />
              </div>
              <div className="value">{avgRiskScore}</div>
              <div className="badge warning" style={{ marginTop: '0.75rem' }}>
                 System Severity
              </div>
            </div>
          </div>

          <div className="middle-grid">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Threat Activity Timeline</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '600' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#818cf8' }}></div> Safe
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: '600' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#4338ca' }}></div> Phishing
                   </div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 10, right: 0, bottom: 0, left: -25 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500}} dy={10} />
                  <RechartsTooltip cursor={{fill: 'var(--bg-color)'}} content={<CustomTooltip/>} />
                  <Bar dataKey="safe" name="Safe" stackId="a" fill="#818cf8" radius={[0, 0, 4, 4]} barSize={32} />
                  <Bar dataKey="phishing" name="Phishing" stackId="a" fill="#4338ca" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Latest Intelligence</div>
                <button className="outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', borderRadius: '12px' }} onClick={() => navigate('/history')}>Full Logs</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {recentScans.map(scan => (
                  <div key={scan.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ backgroundColor: scan.prediction === 'phishing' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', padding: '0.6rem', borderRadius: '12px', flexShrink: 0 }}>
                      {scan.type === 'url' ? <MonitorPlay size={20} color={scan.prediction === 'phishing' ? '#ef4444' : '#6366f1'} /> : <Activity size={20} color={scan.prediction === 'phishing' ? '#ef4444' : '#10b981'} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.2rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {scan.input}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: scan.prediction === 'phishing' ? '#ef4444' : '#10b981' }}>{scan.prediction}</span>
                         <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>• {new Date(scan.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {recentScans.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem' }}>No telemetry data available.</p>}
              </div>
            </div>
          </div>

          <div className="bottom-grid">
             <div className="card">
              <div className="card-header">
                <div className="card-title">Secured Integrity</div>
              </div>
              <div style={{ position: 'relative', height: '180px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={safetyPieData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={85}
                      outerRadius={120}
                      dataKey="value"
                      stroke="none"
                      paddingAngle={4}
                    >
                      {safetyPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip/>} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, letterSpacing: '-0.05em', color: 'var(--text-main)' }}>
                     {total > 0 ? Math.round((safeCount/total)*100) : 0}%
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>System Health</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Vector Distribution</div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={typePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                    paddingAngle={4}
                  >
                    {typePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip/>} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ fontSize:'0.7rem', fontWeight:'700', color:'var(--accent)' }}>URLs</div>
                  <div style={{ fontSize:'0.7rem', fontWeight:'700', color:'var(--accent-light)' }}>CONTENT</div>
              </div>
            </div>

            <div className="card">
               <div className="card-header" style={{ marginBottom: '1rem' }}>
                <div className="card-title">Threat Validation Logs</div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ border: 'none' }}>
                  <tbody>
                    {recentScans.slice(0, 3).map(scan => (
                      <tr key={scan.id} style={{ border: 'none' }}>
                        <td style={{ minWidth: '130px', padding: '0.75rem 0' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ width: '4px', height: '24px', background: scan.prediction === 'phishing' ? '#ef4444' : '#10b981', borderRadius: '2px' }}></div>
                              <div>
                                <span style={{ fontWeight: '800', display: 'block', fontSize: '0.85rem', color: 'var(--text-main)' }}>{scan.prediction.toUpperCase()}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>{scan.type} VECTOR</span>
                              </div>
                           </div>
                        </td>
                        <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.75rem 0' }}>{scan.input}</td>
                        <td style={{ textAlign: 'right', padding: '0.75rem 0' }}>
                          <span className={`badge ${scan.prediction === 'phishing' ? 'danger' : 'safe'}`} style={{ fontSize: '0.65rem' }}>
                             {scan.prediction === 'phishing' ? 'Alert' : 'Secure'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
