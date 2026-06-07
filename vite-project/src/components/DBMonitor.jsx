import React, { useEffect, useRef, useState } from 'react';
import './DBMonitor.css';

/**
 * Live Database Connection Monitor
 * Connects via WebSocket to the Spring Boot backend and displays
 * real-time HikariCP connection pool metrics.
 */
const DBMonitor = () => {
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]); // Sparkline history
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [serverHealth, setServerHealth] = useState(null);
  const wsRef = useRef(null);
  const pollingRef = useRef(null);

  // ─── WebSocket Connection to Spring Boot ─────────────────────────
  useEffect(() => {
    connectWebSocket();
    fetchServerHealth();

    // Poll server health every 10s
    pollingRef.current = setInterval(() => {
      fetchServerHealth();
      // If WS disconnected, poll REST fallback
      if (!isConnected) {
        fetchMetricsRest();
      }
    }, 10000);

    return () => {
      clearInterval(pollingRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const connectWebSocket = () => {
    try {
      // Use SockJS + STOMP for Spring Boot WebSocket
      const SockJS = window.SockJS;
      const Stomp = window.Stomp;

      if (!SockJS || !Stomp) {
        // Fallback: just poll REST endpoint
        setIsConnected(false);
        fetchMetricsRest();
        return;
      }

      const socket = new SockJS('http://localhost:8080/ws');
      const stompClient = Stomp.over(socket);
      stompClient.debug = null; // Suppress debug logs

      stompClient.connect({}, () => {
        setIsConnected(true);
        stompClient.subscribe('/topic/db-metrics', (message) => {
          const data = JSON.parse(message.body);
          updateMetrics(data);
        });
      }, (err) => {
        setIsConnected(false);
        fetchMetricsRest();
      });

      wsRef.current = stompClient;
    } catch (e) {
      setIsConnected(false);
      fetchMetricsRest();
    }
  };

  const fetchMetricsRest = async () => {
    try {
      const token = sessionStorage.getItem('dvbakes_token');
      const res = await fetch('http://localhost:8080/api/admin/db-metrics', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        updateMetrics(data);
      }
    } catch (e) {
      // Spring Boot not running, show demo data
      updateMetrics(getDemoMetrics());
    }
  };

  const fetchServerHealth = async () => {
    try {
      const token = sessionStorage.getItem('dvbakes_token');
      const res = await fetch('http://localhost:8080/api/admin/server-health', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) setServerHealth(await res.json());
    } catch (e) {
      // Fallback demo
      setServerHealth({
        status: 'UP', usedMemoryMB: 128, totalMemoryMB: 256,
        maxMemoryMB: 512, availableProcessors: 4, memoryUsagePercent: 25,
        javaVersion: '21.0.2', uptime: 3600
      });
    }
  };

  const getDemoMetrics = () => ({
    timestamp: new Date().toISOString(),
    poolName: 'DvBakesHikariPool',
    activeConnections: Math.floor(Math.random() * 5),
    idleConnections: Math.floor(Math.random() * 10) + 3,
    totalConnections: 8,
    pendingThreads: 0,
    maxPoolSize: 20,
    minIdle: 5,
    utilizationPercent: Math.random() * 30,
    connectionStatus: 'ACTIVE',
    databaseType: 'SQLite',
    isConnected: true,
    totalRequestsHandled: Math.floor(Math.random() * 1000) + 500
  });

  const updateMetrics = (data) => {
    setMetrics(data);
    setLastUpdate(new Date());
    setHistory(prev => {
      const updated = [...prev, {
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        active: data.activeConnections,
        idle: data.idleConnections,
        utilization: data.utilizationPercent
      }];
      return updated.slice(-20); // Keep last 20 datapoints
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'IDLE': return '#22d3ee';
      case 'ACTIVE': return '#4ade80';
      case 'MODERATE': return '#fbbf24';
      case 'HIGH_LOAD': return '#f97316';
      case 'SATURATED': return '#f43f5e';
      case 'DISCONNECTED': return '#6b7280';
      default: return '#a78bfa';
    }
  };

  const getStatusGlow = (status) => {
    const color = getStatusColor(status);
    return `0 0 12px ${color}60, 0 0 24px ${color}30`;
  };

  // Build sparkline SVG path
  const buildSparkline = (key, color) => {
    if (history.length < 2) return null;
    const max = Math.max(...history.map(h => h[key]), 1);
    const W = 200, H = 40;
    const pts = history.map((h, i) => {
      const x = (i / (history.length - 1)) * W;
      const y = H - (h[key] / max) * H;
      return `${x},${y}`;
    });
    return (
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={pts.join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Animated dot at latest point */}
        {history.length > 0 && (() => {
          const last = history[history.length - 1];
          const lx = W;
          const ly = H - (last[key] / max) * H;
          return (
            <circle cx={lx} cy={ly} r="4" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }}>
              <animate attributeName="r" values="3;5;3" dur="1.5s" repeatCount="indefinite" />
            </circle>
          );
        })()}
      </svg>
    );
  };

  // Connection pool bar segments
  const PoolBar = ({ metrics }) => {
    if (!metrics) return null;
    const { activeConnections, idleConnections, maxPoolSize } = metrics;
    const free = maxPoolSize - activeConnections - idleConnections;
    const activeW = (activeConnections / maxPoolSize) * 100;
    const idleW = (idleConnections / maxPoolSize) * 100;
    const freeW = Math.max(0, (free / maxPoolSize) * 100);

    return (
      <div className="pool-bar-container">
        <div className="pool-bar-label-row">
          <span className="pool-bar-label"><span className="pool-dot active" />Active ({activeConnections})</span>
          <span className="pool-bar-label"><span className="pool-dot idle" />Idle ({idleConnections})</span>
          <span className="pool-bar-label"><span className="pool-dot free" />Free ({Math.max(0, free)})</span>
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
          <div className="dbmon-pulse-dot" style={{ background: isConnected ? '#4ade80' : '#f43f5e' }} />
          <h2 className="dbmon-title">
            Spring Boot DB Monitor
          </h2>
          <span className="dbmon-subtitle">HikariCP Connection Pool · Live</span>
        </div>
        <div className="dbmon-ws-badge" style={{ background: isConnected ? '#4ade8020' : '#f43f5e20', borderColor: isConnected ? '#4ade80' : '#f43f5e' }}>
          <span style={{ color: isConnected ? '#4ade80' : '#f43f5e' }}>
            {isConnected ? '⚡ WebSocket Live' : '🔄 REST Polling'}
          </span>
        </div>
      </div>

      {/* Status Badge */}
      {metrics && (
        <div className="dbmon-status-bar">
          <div
            className="dbmon-status-pill"
            style={{
              background: `${getStatusColor(metrics.connectionStatus)}18`,
              border: `1px solid ${getStatusColor(metrics.connectionStatus)}60`,
              boxShadow: getStatusGlow(metrics.connectionStatus)
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
            {/* Active Connections */}
            <div className="dbmon-card" style={{ '--card-accent': '#4ade80' }}>
              <div className="dbmon-card-label">Active Connections</div>
              <div className="dbmon-card-value" style={{ color: '#4ade80' }}>
                {metrics.activeConnections}
                <span className="dbmon-card-max">/{metrics.maxPoolSize}</span>
              </div>
              <div className="dbmon-sparkline">{buildSparkline('active', '#4ade80')}</div>
            </div>

            {/* Idle Connections */}
            <div className="dbmon-card" style={{ '--card-accent': '#22d3ee' }}>
              <div className="dbmon-card-label">Idle Connections</div>
              <div className="dbmon-card-value" style={{ color: '#22d3ee' }}>
                {metrics.idleConnections}
                <span className="dbmon-card-max">/{metrics.minIdle} min</span>
              </div>
              <div className="dbmon-sparkline">{buildSparkline('idle', '#22d3ee')}</div>
            </div>

            {/* Pool Utilization */}
            <div className="dbmon-card" style={{ '--card-accent': '#a78bfa' }}>
              <div className="dbmon-card-label">Pool Utilization</div>
              <div className="dbmon-card-value" style={{ color: '#a78bfa' }}>
                {metrics.utilizationPercent.toFixed(1)}
                <span className="dbmon-card-max">%</span>
              </div>
              <div className="dbmon-util-ring">
                <svg viewBox="0 0 100 100" width="60" height="60">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1e1e2e" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke="#a78bfa" strokeWidth="10"
                    strokeDasharray={`${metrics.utilizationPercent * 2.51} 251.2`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px #a78bfa)' }}
                  />
                  <text x="50" y="54" textAnchor="middle" fill="#a78bfa" fontSize="18" fontWeight="700">
                    {Math.round(metrics.utilizationPercent)}%
                  </text>
                </svg>
              </div>
            </div>

            {/* Pending Threads */}
            <div className="dbmon-card" style={{ '--card-accent': metrics.pendingThreads > 0 ? '#f43f5e' : '#4ade80' }}>
              <div className="dbmon-card-label">Threads Waiting</div>
              <div className="dbmon-card-value" style={{ color: metrics.pendingThreads > 0 ? '#f43f5e' : '#4ade80' }}>
                {metrics.pendingThreads}
                <span className="dbmon-card-max"> threads</span>
              </div>
              <div className="dbmon-card-note" style={{ color: metrics.pendingThreads > 0 ? '#f43f5e' : '#64748b' }}>
                {metrics.pendingThreads > 0 ? '⚠ Pool saturation detected' : '✓ No queue pressure'}
              </div>
            </div>

            {/* Total Requests */}
            <div className="dbmon-card" style={{ '--card-accent': '#fbbf24' }}>
              <div className="dbmon-card-label">Requests Handled</div>
              <div className="dbmon-card-value" style={{ color: '#fbbf24' }}>
                {metrics.totalRequestsHandled.toLocaleString()}
              </div>
              <div className="dbmon-card-note" style={{ color: '#64748b' }}>Since server start</div>
            </div>

            {/* DB Status */}
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

          {/* Pool Bar Visualization */}
          <div className="dbmon-poolbar-section">
            <h3>Connection Pool Visualization</h3>
            <PoolBar metrics={metrics} />
          </div>

          {/* History Table */}
          {history.length > 1 && (
            <div className="dbmon-history-section">
              <h3>Connection Activity Log</h3>
              <div className="dbmon-history-scroll">
                <table className="dbmon-history-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Active</th>
                      <th>Idle</th>
                      <th>Utilization</th>
                    </tr>
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
                          <span>{h.utilization.toFixed(1)}%</span>
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
        </div>
      )}

      {/* Server Health Card */}
      {serverHealth && (
        <div className="dbmon-server-health">
          <h3>JVM Server Health</h3>
          <div className="health-grid">
            <div className="health-item">
              <span className="health-label">Status</span>
              <span className="health-value" style={{ color: '#4ade80' }}>{serverHealth.status}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Memory Usage</span>
              <span className="health-value">{serverHealth.usedMemoryMB} MB / {serverHealth.maxMemoryMB} MB</span>
            </div>
            <div className="health-item">
              <span className="health-label">Memory %</span>
              <span className="health-value" style={{ color: serverHealth.memoryUsagePercent > 80 ? '#f43f5e' : '#4ade80' }}>
                {serverHealth.memoryUsagePercent}%
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Processors</span>
              <span className="health-value">{serverHealth.availableProcessors} vCPU</span>
            </div>
            <div className="health-item">
              <span className="health-label">Java Version</span>
              <span className="health-value mono">{serverHealth.javaVersion}</span>
            </div>
            <div className="health-item">
              <span className="health-label">Uptime</span>
              <span className="health-value">{Math.floor(serverHealth.uptime / 60)}m {serverHealth.uptime % 60}s</span>
            </div>
          </div>

          {/* Memory bar */}
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
            <span>0 MB</span>
            <span>JVM Heap Usage</span>
            <span>{serverHealth.maxMemoryMB} MB</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DBMonitor;
