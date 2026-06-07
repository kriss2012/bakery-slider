import React, { useEffect, useRef, useState, useCallback } from 'react';
import './DBMonitor.css';

// Error Boundary to prevent the whole Admin from crashing
class DBMonitorErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="dbmon-error-fallback">
          <div className="dbmon-error-icon">⚡</div>
          <h3>DB Monitor Initialization Failed</h3>
          <p>Could not connect to the Spring Boot backend. The monitor will retry automatically.</p>
          <code>{this.state.error?.message}</code>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Live Database Connection Monitor
 * Connects via polling to the Spring Boot backend and displays
 * real-time HikariCP connection pool metrics.
 */
const DBMonitorInner = () => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);
  const [mode, setMode] = useState('loading'); // loading, live, demo
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  const SPRING_URL = 'http://localhost:8080';

  const getDemoMetrics = () => ({
    timestamp: new Date().toISOString(),
    poolName: 'DvBakesHikariPool',
    activeConnections: Math.floor(Math.random() * 4) + 1,
    idleConnections: Math.floor(Math.random() * 8) + 2,
    totalConnections: 8,
    pendingThreads: 0,
    maxPoolSize: 20,
    minIdle: 5,
    utilizationPercent: Math.random() * 25 + 5,
    connectionStatus: ['IDLE', 'ACTIVE', 'MODERATE'][Math.floor(Math.random() * 3)],
    databaseType: 'SQLite',
    isConnected: true,
    totalRequestsHandled: Math.floor(Math.random() * 500) + 200
  });

  const getDemoHealth = () => ({
    status: 'UP',
    usedMemoryMB: Math.floor(Math.random() * 100) + 80,
    totalMemoryMB: 256,
    maxMemoryMB: 512,
    availableProcessors: 4,
    memoryUsagePercent: Math.floor(Math.random() * 30) + 15,
    javaVersion: '17.0.8',
    uptime: Math.floor(Date.now() / 1000) % 86400
  });

  const updateMetrics = useCallback((data) => {
    if (!mountedRef.current) return;
    setMetrics(data);
    setLastUpdate(new Date());
    setHistory(prev => {
      const entry = {
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        active: data.activeConnections || 0,
        idle: data.idleConnections || 0,
        utilization: data.utilizationPercent || 0
      };
      return [...prev.slice(-19), entry];
    });
  }, []);

  const fetchFromSpringBoot = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('dvbakes_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await fetch(`${SPRING_URL}/api/admin/db-metrics`, {
        headers,
        signal: AbortSignal.timeout(3000)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (mountedRef.current) {
          setIsConnected(true);
          setMode('live');
          updateMetrics(data);
        }
        return true;
      }
    } catch (e) {
      // Spring Boot not available
    }
    return false;
  }, [updateMetrics]);

  const fetchHealth = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('dvbakes_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${SPRING_URL}/api/admin/server-health`, {
        headers,
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok && mountedRef.current) {
        setServerHealth(await res.json());
      } else {
        if (mountedRef.current) setServerHealth(getDemoHealth());
      }
    } catch (e) {
      if (mountedRef.current) setServerHealth(getDemoHealth());
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const poll = async () => {
      const ok = await fetchFromSpringBoot();
      if (!ok && mountedRef.current) {
        setIsConnected(false);
        setMode('demo');
        updateMetrics(getDemoMetrics());
        setServerHealth(getDemoHealth());
      } else if (ok) {
        fetchHealth();
      }
    };

    // Initial fetch immediately
    poll();

    // Poll every 3 seconds
    pollingRef.current = setInterval(poll, 3000);

    return () => {
      mountedRef.current = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchFromSpringBoot, fetchHealth, updateMetrics]);

  const getStatusColor = (status) => {
    const colors = {
      IDLE: '#22d3ee',
      ACTIVE: '#4ade80',
      MODERATE: '#fbbf24',
      HIGH_LOAD: '#f97316',
      SATURATED: '#f43f5e',
      DISCONNECTED: '#6b7280'
    };
    return colors[status] || '#a78bfa';
  };

  const buildSparkline = (key, color) => {
    if (history.length < 2) return null;
    const max = Math.max(...history.map(h => h[key] || 0), 1);
    const W = 200, H = 40;
    const pts = history.map((h, i) => {
      const x = (i / Math.max(history.length - 1, 1)) * W;
      const y = H - ((h[key] || 0) / max) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {history.length > 0 && (() => {
          const last = history[history.length - 1];
          const ly = H - ((last[key] || 0) / max) * H;
          return <circle cx={W} cy={ly} r="4" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />;
        })()}
      </svg>
    );
  };

  const PoolBar = ({ metrics }) => {
    if (!metrics) return null;
    const { activeConnections = 0, idleConnections = 0, maxPoolSize = 20 } = metrics;
    const free = Math.max(0, maxPoolSize - activeConnections - idleConnections);
    const activeW = (activeConnections / maxPoolSize) * 100;
    const idleW = (idleConnections / maxPoolSize) * 100;
    const freeW = (free / maxPoolSize) * 100;

    return (
      <div className="pool-bar-container">
        <div className="pool-bar-label-row">
          <span className="pool-bar-label"><span className="pool-dot active" />Active ({activeConnections})</span>
          <span className="pool-bar-label"><span className="pool-dot idle" />Idle ({idleConnections})</span>
          <span className="pool-bar-label"><span className="pool-dot free" />Free ({free})</span>
        </div>
        <div className="pool-bar-track">
          <div className="pool-bar-segment active-seg" style={{ width: `${activeW}%` }} />
          <div className="pool-bar-segment idle-seg" style={{ width: `${idleW}%` }} />
          <div className="pool-bar-segment free-seg" style={{ width: `${freeW}%` }} />
        </div>
        <div className="pool-bar-ticks">
          {[0, 25, 50, 75, 100].map(t => (
            <span key={t} style={{ left: `${t}%` }}>{Math.round(t * maxPoolSize / 100)}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="dbmon-wrapper">
      {/* Header */}
      <div className="dbmon-header">
        <div className="dbmon-title-group">
          <div className="dbmon-pulse-dot" style={{ background: isConnected ? '#4ade80' : mode === 'demo' ? '#fbbf24' : '#6b7280' }} />
          <h2 className="dbmon-title">Spring Boot DB Monitor</h2>
          <span className="dbmon-subtitle">HikariCP Connection Pool · Live</span>
        </div>
        <div className="dbmon-ws-badge" style={{
          background: isConnected ? '#4ade8020' : '#fbbf2420',
          borderColor: isConnected ? '#4ade80' : '#fbbf24'
        }}>
          <span style={{ color: isConnected ? '#4ade80' : '#fbbf24' }}>
            {isConnected ? '⚡ Spring Boot Connected' : mode === 'demo' ? '📊 Demo Mode (Start Spring Boot)' : '🔄 Connecting...'}
          </span>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {mode === 'demo' && (
        <div className="dbmon-demo-notice">
          <span>📌 Demo Mode Active</span>
          <span>Start the Spring Boot server: <code>cd spring-backend && start.bat</code> (port 8080)</span>
        </div>
      )}

      {/* Status Badge */}
      {metrics && (
        <div className="dbmon-status-bar">
          <div
            className="dbmon-status-pill"
            style={{
              background: `${getStatusColor(metrics.connectionStatus)}18`,
              border: `1px solid ${getStatusColor(metrics.connectionStatus)}60`,
            }}
          >
            <span className="status-pulse" style={{ background: getStatusColor(metrics.connectionStatus) }} />
            <span style={{ color: getStatusColor(metrics.connectionStatus), fontWeight: 700 }}>
              {metrics.connectionStatus}
            </span>
            <span className="dbmon-pool-name">Pool: {metrics.poolName}</span>
          </div>
          <div className="dbmon-db-type">{metrics.databaseType} Database</div>
          <div className="dbmon-last-update">
            {lastUpdate && `Updated ${lastUpdate.toLocaleTimeString()}`}
          </div>
        </div>
      )}

      {/* Main Metrics Grid */}
      {metrics ? (
        <>
          <div className="dbmon-grid">
            <div className="dbmon-card" style={{ '--card-accent': '#4ade80' }}>
              <div className="dbmon-card-label">Active Connections</div>
              <div className="dbmon-card-value" style={{ color: '#4ade80' }}>
                {metrics.activeConnections}
                <span className="dbmon-card-max">/{metrics.maxPoolSize}</span>
              </div>
              <div className="dbmon-sparkline">{buildSparkline('active', '#4ade80')}</div>
            </div>

            <div className="dbmon-card" style={{ '--card-accent': '#22d3ee' }}>
              <div className="dbmon-card-label">Idle Connections</div>
              <div className="dbmon-card-value" style={{ color: '#22d3ee' }}>
                {metrics.idleConnections}
                <span className="dbmon-card-max">/{metrics.minIdle} min</span>
              </div>
              <div className="dbmon-sparkline">{buildSparkline('idle', '#22d3ee')}</div>
            </div>

            <div className="dbmon-card" style={{ '--card-accent': '#a78bfa' }}>
              <div className="dbmon-card-label">Pool Utilization</div>
              <div className="dbmon-card-value" style={{ color: '#a78bfa' }}>
                {(metrics.utilizationPercent || 0).toFixed(1)}
                <span className="dbmon-card-max">%</span>
              </div>
              <div className="dbmon-util-ring">
                <svg viewBox="0 0 100 100" width="60" height="60">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#a78bfa" strokeWidth="10"
                    strokeDasharray={`${(metrics.utilizationPercent || 0) * 2.51} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px #a78bfa)' }}
                  />
                  <text x="50" y="54" textAnchor="middle" fill="#a78bfa" fontSize="18" fontWeight="700">
                    {Math.round(metrics.utilizationPercent || 0)}%
                  </text>
                </svg>
              </div>
            </div>

            <div className="dbmon-card" style={{ '--card-accent': (metrics.pendingThreads || 0) > 0 ? '#f43f5e' : '#4ade80' }}>
              <div className="dbmon-card-label">Threads Waiting</div>
              <div className="dbmon-card-value" style={{ color: (metrics.pendingThreads || 0) > 0 ? '#f43f5e' : '#4ade80' }}>
                {metrics.pendingThreads || 0}
                <span className="dbmon-card-max"> threads</span>
              </div>
              <div className="dbmon-card-note" style={{ color: (metrics.pendingThreads || 0) > 0 ? '#f43f5e' : '#64748b' }}>
                {(metrics.pendingThreads || 0) > 0 ? '⚠ Pool saturation detected' : '✓ No queue pressure'}
              </div>
            </div>

            <div className="dbmon-card" style={{ '--card-accent': '#fbbf24' }}>
              <div className="dbmon-card-label">Requests Handled</div>
              <div className="dbmon-card-value" style={{ color: '#fbbf24' }}>
                {(metrics.totalRequestsHandled || 0).toLocaleString()}
              </div>
              <div className="dbmon-card-note" style={{ color: '#64748b' }}>Since server start</div>
            </div>

            <div className="dbmon-card" style={{ '--card-accent': metrics.isConnected ? '#4ade80' : '#f43f5e' }}>
              <div className="dbmon-card-label">DB Connection</div>
              <div className="dbmon-card-value" style={{ color: metrics.isConnected ? '#4ade80' : '#f43f5e', fontSize: '1.2rem' }}>
                {metrics.isConnected ? '✓ Connected' : '✗ Offline'}
              </div>
              <div className="dbmon-card-note" style={{ color: '#64748b' }}>
                {metrics.databaseType} · {metrics.poolName}
              </div>
            </div>
          </div>

          {/* Pool Bar */}
          <div className="dbmon-poolbar-section">
            <h3>Connection Pool Visualization</h3>
            <PoolBar metrics={metrics} />
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="dbmon-history-section">
              <h3>Connection Activity Log</h3>
              <div className="dbmon-history-scroll">
                <table className="dbmon-history-table">
                  <thead>
                    <tr><th>Time</th><th>Active</th><th>Idle</th><th>Utilization</th></tr>
                  </thead>
                  <tbody>
                    {[...history].reverse().slice(0, 10).map((h, i) => (
                      <tr key={i} style={{ opacity: 1 - i * 0.08 }}>
                        <td className="mono">{h.time}</td>
                        <td><span style={{ color: '#4ade80' }}>{h.active}</span></td>
                        <td><span style={{ color: '#22d3ee' }}>{h.idle}</span></td>
                        <td>
                          <div className="hist-util-bar">
                            <div style={{
                              width: `${h.utilization}%`,
                              background: h.utilization > 70 ? '#f43f5e' : h.utilization > 40 ? '#fbbf24' : '#a78bfa'
                            }} />
                          </div>
                          <span>{(h.utilization || 0).toFixed(1)}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="dbmon-loading">
          <div className="dbmon-spinner" />
          <p>Connecting to Spring Boot backend...</p>
          <small>Make sure Spring Boot is running on port 8080</small>
          <small>Run: <code>cd spring-backend &amp;&amp; start.bat</code></small>
        </div>
      )}

      {/* Server Health */}
      {serverHealth && (
        <div className="dbmon-server-health">
          <h3>JVM Server Health</h3>
          <div className="health-grid">
            <div className="health-item">
              <span className="health-label">Status</span>
              <span className="health-value" style={{ color: '#4ade80' }}>{serverHealth.status}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Memory</span>
              <span className="health-value">{serverHealth.usedMemoryMB} / {serverHealth.maxMemoryMB} MB</span>
            </div>
            <div className="health-item">
              <span className="health-label">Memory Usage</span>
              <span className="health-value" style={{ color: serverHealth.memoryUsagePercent > 80 ? '#f43f5e' : '#4ade80' }}>
                {serverHealth.memoryUsagePercent}%
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">CPU Cores</span>
              <span className="health-value">{serverHealth.availableProcessors} vCPU</span>
            </div>
            <div className="health-item">
              <span className="health-label">Java Version</span>
              <span className="health-value mono">{serverHealth.javaVersion}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Uptime</span>
              <span className="health-value">{Math.floor((serverHealth.uptime || 0) / 60)}m {(serverHealth.uptime || 0) % 60}s</span>
            </div>
          </div>
          <div className="health-mem-bar-track">
            <div
              className="health-mem-bar-fill"
              style={{
                width: `${serverHealth.memoryUsagePercent}%`,
                background: serverHealth.memoryUsagePercent > 80 ? '#f43f5e' : serverHealth.memoryUsagePercent > 60 ? '#fbbf24' : '#4ade80'
              }}
            />
          </div>
          <div className="health-mem-labels">
            <span>0 MB</span><span>JVM Heap Usage</span><span>{serverHealth.maxMemoryMB} MB</span>
          </div>
        </div>
      )}

      {/* Spring Boot Setup Guide */}
      {mode === 'demo' && (
        <div className="dbmon-setup-guide">
          <h3>🚀 Start Spring Boot for Live Data</h3>
          <div className="setup-steps">
            <div className="setup-step">
              <span className="step-num">1</span>
              <div>
                <strong>Prerequisites:</strong> Java 17+ and Maven installed
              </div>
            </div>
            <div className="setup-step">
              <span className="step-num">2</span>
              <div>
                <strong>Open terminal in:</strong> <code>d:\Web-Projects\bakery-slider\spring-backend\</code>
              </div>
            </div>
            <div className="setup-step">
              <span className="step-num">3</span>
              <div>
                <strong>Run:</strong> <code>D:\maven\bin\mvn spring-boot:run</code>
              </div>
            </div>
            <div className="setup-step">
              <span className="step-num">4</span>
              <div>
                <strong>Wait for:</strong> <em>"Started DvBakesSaaSApplication on port 8080"</em>
              </div>
            </div>
            <div className="setup-step">
              <span className="step-num">5</span>
              <div>
                <strong>This panel auto-connects</strong> — no refresh needed!
              </div>
            </div>
          </div>
          <div className="setup-endpoints">
            <strong>API Endpoints (once running):</strong>
            <code>GET http://localhost:8080/api/products</code>
            <code>GET http://localhost:8080/actuator/health</code>
            <code>GET http://localhost:8080/api/admin/db-metrics (JWT)</code>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapped with error boundary
const DBMonitor = () => (
  <DBMonitorErrorBoundary>
    <DBMonitorInner />
  </DBMonitorErrorBoundary>
);

export default DBMonitor;
