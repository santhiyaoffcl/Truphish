import { useEffect, useState } from 'react';
import { History as HistoryIcon, Search, Calendar, FileText, LayoutList, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scan/history');
        setHistory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter(item => 
    item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.prediction.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadein 0.4s' }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Analysis Ledger</h1>
          <p>Chronological record of all security scans and intelligence reports.</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)', fontWeight: '700' }}>
              <LayoutList size={20} color="var(--accent)" />
              Logs ({filteredHistory.length})
           </div>
           <div style={{ position: 'relative', width: '300px' }}>
              <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search intelligence logs..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: '2.75rem', marginBottom: 0, height: '44px', fontSize: '0.9rem', borderRadius: 'var(--radius-xl)', background: 'var(--panel-bg)' }} 
              />
           </div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             <p>Accessing Secure Database...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ border: 'none' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Vector Type</th>
                  <th>Payload Intelligence</th>
                  <th>Prediction</th>
                  <th>Risk Index</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map(item => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Calendar size={14} />
                          {new Date(item.created_at).toLocaleDateString()}
                          <span style={{ opacity: 0.5 }}>{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                    </td>
                    <td>
                       <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(99, 102, 241, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)' }}>
                          {item.type === 'url' ? <Search size={14} /> : <FileText size={14} />}
                          {item.type.toUpperCase()}
                       </div>
                    </td>
                    <td style={{ maxWidth: '350px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>
                      {item.input}
                    </td>
                    <td>
                      <span className={`badge ${item.prediction.toLowerCase() === 'phishing' ? 'danger' : 'safe'}`}>
                         {item.prediction.toLowerCase() === 'phishing' ? <ShieldAlert size={12} /> : <CheckCircle2 size={12} />}
                         {item.prediction.toUpperCase()}
                      </span>
                    </td>
                    <td>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, minWidth: '60px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                             <div style={{ 
                               width: `${item.risk_score}%`, 
                               height: '100%', 
                               background: item.prediction.toLowerCase() === 'phishing' ? 'var(--danger)' : 'var(--success)' 
                             }}></div>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', width: '30px' }}>{item.risk_score}%</span>
                       </div>
                    </td>
                  </tr>
                ))}
                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          <HistoryIcon size={48} strokeWidth={1} style={{ opacity: 0.3 }} />
                          <p style={{ fontWeight: '600' }}>No scan history found matching your search.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default History;
