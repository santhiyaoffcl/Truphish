import { useState, useRef, useEffect } from 'react';
import { 
  Send, Sparkles, Brain, Cpu, MessageSquare, Terminal, 
  Trash2, ShieldCheck, AlertCircle, RefreshCw, Layers
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AiAnalyst = () => {
  const { user } = useAuth();
  
  // Model & Mode selections
  const [selectedModel, setSelectedModel] = useState('gemini'); // gemini or groq
  const [deepSweep, setDeepSweep] = useState(true);

  // Chat message logs
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('truphish_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello! I am your TruPhish **AI Threat Advisory Agent**.\n\nI can analyze suspicious domains, dissect email headers, and help you inspect general phishing patterns. How can I assist you today?`,
        modelUsed: 'System Agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentProgress, setAgentProgress] = useState([]);
  
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, agentProgress]);

  // Persist chat logs to local storage
  useEffect(() => {
    localStorage.setItem('truphish_chat_history', JSON.stringify(messages));
  }, [messages]);

  const handleClearHistory = () => {
    if (!window.confirm("Are you sure you want to clear this advisory chat log?")) return;
    const initialMsg = [
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hello! I am your TruPhish **AI Threat Advisory Agent**.\n\nI can analyze suspicious domains, dissect email headers, and help you inspect general phishing patterns. How can I assist you today?`,
        modelUsed: 'System Agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(initialMsg);
  };

  const executeProgressLog = async (text) => {
    // Check if the query has potential domains to scan
    const domainPattern = /\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gi;
    const hasDomain = domainPattern.test(text);

    if (deepSweep && hasDomain) {
      const logs = [
        '🔍 Deconstructing message context...',
        '🌐 Resolving target domain DNS coordinates...',
        '🔒 Verifying SSL/TLS certificate chains...',
        '⚙️ Injecting predictive ML threat markers...',
        '🧠 Dispatching threat ledger context to LLM...'
      ];

      for (let i = 0; i < logs.length; i++) {
        setAgentProgress(prev => [...prev, logs[i]]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } else {
      setAgentProgress(['🤖 Formulating cybersecurity advisor report...']);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const handleSendMessage = async (textToSend) => {
    const messageContent = textToSend || inputMessage;
    if (!messageContent.trim()) return;

    if (!textToSend) setInputMessage('');

    // Append user message
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    
    setIsGenerating(true);
    setAgentProgress([]);

    try {
      // 1. Run agentic visual feedback logger sequence
      await executeProgressLog(messageContent);

      // 2. Fetch response from Express API
      const response = await api.post('/chat', {
        message: messageContent,
        history: messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        model: selectedModel,
        agenticDeepSweep: deepSweep
      });

      const responseData = response.data;
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseData.reply,
        modelUsed: responseData.modelUsed,
        toolExecuted: responseData.toolExecuted,
        scanData: responseData.scanData,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Communication Error**: Failed to retrieve response from the security server. Make sure the backend server is running.`,
        modelUsed: 'Error Handler',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
      setAgentProgress([]);
    }
  };

  const quickPrompts = [
    { label: "Analyze: paypal-verification-update.xyz", action: "Verify this domain: paypal-verification-update.xyz" },
    { label: "How to identify credential harvesting?", action: "How do I recognize credential harvesting attacks?" },
    { label: "Audit SPF & DKIM records", action: "What security metrics should I look for in email headers to check for sender spoofing?" }
  ];

  return (
    <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 150px)', alignItems: 'stretch' }}>
      
      {/* Sidebar Configurations */}
      <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1.5rem', flexShrink: 0 }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={20} color="var(--accent)" /> AI Config
        </h3>
        
        {/* Model Selection */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: '600', fontSize: '0.85rem' }}>Cognitive Core</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => setSelectedModel('gemini')}
              className="outline"
              style={{ 
                justifyContent: 'flex-start', 
                textAlign: 'left', 
                padding: '0.75rem 1rem', 
                borderWidth: '1px',
                borderColor: selectedModel === 'gemini' ? 'var(--accent)' : 'var(--border)',
                background: selectedModel === 'gemini' ? 'rgba(99, 102, 241, 0.08)' : 'var(--glass-bg)',
                color: selectedModel === 'gemini' ? 'var(--accent)' : 'var(--text-main)',
                borderRadius: '12px',
                boxShadow: selectedModel === 'gemini' ? '0 0 10px rgba(99,102,241,0.1)' : 'none'
              }}
            >
              <Sparkles size={16} /> Google Gemini Pro
            </button>
            <button 
              onClick={() => setSelectedModel('groq')}
              className="outline"
              style={{ 
                justifyContent: 'flex-start', 
                textAlign: 'left', 
                padding: '0.75rem 1rem', 
                borderWidth: '1px',
                borderColor: selectedModel === 'groq' ? 'var(--accent)' : 'var(--border)',
                background: selectedModel === 'groq' ? 'rgba(99, 102, 241, 0.08)' : 'var(--glass-bg)',
                color: selectedModel === 'groq' ? 'var(--accent)' : 'var(--text-main)',
                borderRadius: '12px',
                boxShadow: selectedModel === 'groq' ? '0 0 10px rgba(99,102,241,0.1)' : 'none'
              }}
            >
              <Cpu size={16} /> Groq Llama 3
            </button>
          </div>
        </div>

        {/* Mode Toggle */}
        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: '14px', background: 'var(--bg-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700' }}>Agentic Deep Sweep</h4>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto-scan domains found in queries</p>
            </div>
            <label className="switch" style={{ flexShrink: 0 }}>
              <input 
                type="checkbox" 
                checked={deepSweep} 
                onChange={e => setDeepSweep(e.target.checked)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* Clear Chat */}
        <button 
          onClick={handleClearHistory}
          className="outline"
          style={{ 
            marginTop: 'auto', 
            justifyContent: 'center', 
            borderColor: 'var(--danger)', 
            color: 'var(--danger)',
            borderRadius: '12px'
          }}
        >
          <Trash2 size={16} /> Clear Chat Log
        </button>
      </div>

      {/* Main Chat Interface */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem', overflow: 'hidden' }}>
        
        {/* Messages Ledger Display */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          paddingRight: '0.5rem', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          {messages.map(msg => (
            <div 
              key={msg.id} 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                width: '100%',
                animation: 'fadein 0.3s'
              }}
            >
              {/* Sender & Model Metadata tag */}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: '600', padding: '0 0.5rem' }}>
                {msg.role === 'user' ? 'You' : `${msg.modelUsed} • Analyst`} — {msg.timestamp}
              </span>

              {/* Message Content Bubble */}
              <div style={{ 
                maxWidth: '80%', 
                padding: '1rem 1.25rem', 
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                background: msg.role === 'user' 
                  ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%)' 
                  : 'var(--bg-color)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                lineHeight: '1.5',
                fontSize: '0.95rem',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
                
                {/* Visual Tool Logs Output if scan occurred */}
                {msg.scanData && (
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingTop: '0.75rem', 
                    borderTop: `1px solid ${msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'var(--border)'}`,
                    fontSize: '0.8rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--accent)', fontWeight: '700', marginBottom: '0.5rem' }}>
                      <Terminal size={14} /> TOOL LEDGER DIAGNOSTICS:
                    </div>
                    <div style={{ 
                      background: msg.role === 'user' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)', 
                      padding: '0.65rem 0.85rem', 
                      borderRadius: '8px',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'var(--text-muted)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                      fontFamily: 'monospace'
                    }}>
                      <div style={{ fontWeight: 'bold', color: msg.scanData.risk_score >= 50 ? 'var(--danger)' : 'var(--success)' }}>
                        VERDICT: {msg.scanData.prediction.toUpperCase()} ({msg.scanData.risk_score}/100 Risk)
                      </div>
                      <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        Scan Host: {msg.scanData.logs?.[0] || 'Dynamic Host'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Simulated Thinking Progress Logger */}
          {isGenerating && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', animation: 'fadein 0.3s' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: '600', padding: '0 0.5rem' }}>
                AI Threat Advisor
              </span>
              
              <div style={{ 
                maxWidth: '80%', 
                padding: '1rem 1.25rem', 
                borderRadius: '16px',
                borderTopLeftRadius: '4px',
                background: 'var(--bg-color)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {agentProgress.map((prog, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        fontSize: '0.8rem', 
                        color: index === agentProgress.length - 1 ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: index === agentProgress.length - 1 ? '700' : '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        animation: 'fadein 0.2s'
                      }}
                    >
                      {index === agentProgress.length - 1 ? <RefreshCw size={12} className="spin" /> : <ShieldCheck size={12} color="var(--success)" />}
                      {prog}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {!isGenerating && messages.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem', animation: 'fadein 0.4s' }}>
            {quickPrompts.map((prompt, i) => (
              <button 
                key={i} 
                onClick={() => handleSendMessage(prompt.action)}
                className="outline"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.78rem', borderRadius: '10px', whiteSpace: 'nowrap' }}
              >
                {prompt.label}
              </button>
            ))}
          </div>
        )}

        {/* Input box Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}
        >
          <input 
            type="text" 
            placeholder={isGenerating ? "Agent is processing query..." : "Ask a question or type a domain (e.g. check domain.com)..."} 
            value={inputMessage} 
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isGenerating}
            style={{ marginBottom: 0, flex: 1, padding: '0.9rem 1.25rem', borderRadius: '14px' }}
            required
          />
          <button 
            type="submit" 
            disabled={isGenerating || !inputMessage.trim()}
            style={{ 
              padding: '0 1.5rem', 
              borderRadius: '14px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
};

export default AiAnalyst;
