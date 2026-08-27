'use client';
import { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Wifi, 
  WifiOff, 
  Activity, 
  RefreshCw, 
  Trash2, 
  Send, 
  Power, 
  Users, 
  Search, 
  CheckCircle2, 
  Eye, 
  Terminal,
  Zap,
  Globe,
  Info
} from 'lucide-react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import DataTable from '@/components/ui/DataTable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SocketLogsSkeleton from '@/components/skeletons/SocketLogsSkeleton';
import { 
  getSocketMetricsAction, 
  getSocketLogsAction, 
  getActiveSocketClientsAction, 
  disconnectSocketClientAction, 
  broadcastSocketMessageAction, 
  clearSocketLogsAction 
} from '@/actions/socketActions';

export default function SocketsPage() {
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' | 'clients' | 'broadcast'
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Data states
  const [metrics, setMetrics] = useState({
    activeSocketsCount: 0,
    totalConnections: 0,
    totalDisconnections: 0,
    totalEventsEmitted: 0,
    roomsCount: 0,
    uptimeSeconds: 0,
    gatewayStatus: 'healthy'
  });

  const [logs, setLogs] = useState([]);
  const [clients, setClients] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('ALL');

  // Modals
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [selectedSocketId, setSelectedSocketId] = useState(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const [clearLogsModalOpen, setClearLogsModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [payloadModalOpen, setPayloadModalOpen] = useState(false);
  const [activePayload, setActivePayload] = useState(null);

  // Broadcast state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [targetRoom, setTargetRoom] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Fetch all socket statistics
  const fetchData = useCallback(async () => {
    try {
      const [metricsRes, logsRes, clientsRes] = await Promise.all([
        getSocketMetricsAction(),
        getSocketLogsAction({ search: logSearch, eventType: eventTypeFilter }),
        getActiveSocketClientsAction()
      ]);

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data.data || []);
      }

      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching socket telemetry:', err);
    } finally {
      setLoading(false);
    }
  }, [logSearch, eventTypeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live auto-refresh every 3.5 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 3500);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (loading && logs.length === 0) {
    return <SocketLogsSkeleton />;
  }

  // Handle Force Disconnect
  const handleConfirmDisconnect = async () => {
    if (!selectedSocketId) return;
    setDisconnecting(true);
    try {
      const res = await disconnectSocketClientAction(selectedSocketId, 'Disconnected via Admin Gateway Console');
      if (res.success) {
        setDisconnectModalOpen(false);
        setSelectedSocketId(null);
        await fetchData();
      }
    } catch (err) {
      console.error('Disconnect failed:', err);
    } finally {
      setDisconnecting(false);
    }
  };

  // Handle Clear Logs
  const handleConfirmClearLogs = async () => {
    setClearing(true);
    try {
      const res = await clearSocketLogsAction();
      if (res.success) {
        setClearLogsModalOpen(false);
        await fetchData();
      }
    } catch (err) {
      console.error('Clear logs failed:', err);
    } finally {
      setClearing(false);
    }
  };

  // Handle Broadcast submit
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    setBroadcastSuccess('');

    try {
      const res = await broadcastSocketMessageAction({
        message: broadcastMessage,
        type: broadcastType,
        targetRoom: targetRoom.trim() || null
      });

      if (res.success) {
        setBroadcastSuccess('Broadcast message dispatched successfully to all connected clients!');
        setBroadcastMessage('');
        await fetchData();
        setTimeout(() => setBroadcastSuccess(''), 4000);
      }
    } catch (err) {
      console.error('Broadcast error:', err);
    } finally {
      setBroadcasting(false);
    }
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ''}${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  const getEventBadge = (type) => {
    switch (type) {
      case 'CONNECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CONNECT
          </span>
        );
      case 'DISCONNECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            DISCONNECT
          </span>
        );
      case 'FORCE_DISCONNECT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            ADMIN KICK
          </span>
        );
      case 'BUS_UPDATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            BUS TELEMETRY
          </span>
        );
      case 'JOIN_ROOM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            JOIN ROOM
          </span>
        );
      case 'TRANSPORT_UPGRADE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
            UPGRADE
          </span>
        );
      case 'BROADCAST':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            BROADCAST
          </span>
        );
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ERROR
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {type}
          </span>
        );
    }
  };

  // Logs Table Columns
  const logColumns = [
    {
      header: 'Event Type',
      accessor: 'eventType',
      sortable: true,
      render: (row) => getEventBadge(row.eventType)
    },
    {
      header: 'Timestamp',
      accessor: 'timestamp',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-slate-300">
          {new Date(row.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 })}
        </span>
      )
    },
    {
      header: 'Socket ID',
      accessor: 'socketId',
      render: (row) => (
        <div className="font-mono text-xs font-bold text-amber-400 max-w-[140px] truncate" title={row.socketId}>
          {row.socketId}
        </div>
      )
    },
    {
      header: 'Transport',
      accessor: 'transport',
      render: (row) => (
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${row.transport === 'websocket' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
          {row.transport}
        </span>
      )
    },
    {
      header: 'Client IP',
      accessor: 'ip',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {row.ip.replace('::ffff:', '')}
        </span>
      )
    },
    {
      header: 'Event Details',
      accessor: 'details',
      render: (row) => (
        <div className="text-xs font-medium text-slate-200 truncate max-w-[280px]" title={row.details}>
          {row.details}
        </div>
      )
    },
    {
      header: 'Payload',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-4',
      render: (row) => (
        row.metadata ? (
          <Tooltip content="Inspect Payload" position="left">
            <button
              onClick={() => {
                setActivePayload(row);
                setPayloadModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
            >
              <Eye size={14} />
            </button>
          </Tooltip>
        ) : (
          <span className="text-slate-600 text-xs font-mono">-</span>
        )
      )
    }
  ];

  // Connected Clients Columns
  const clientColumns = [
    {
      header: 'Socket ID',
      accessor: 'socketId',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="font-mono text-xs font-bold text-slate-100">{row.socketId}</span>
        </div>
      )
    },
    {
      header: 'Transport Protocol',
      accessor: 'transport',
      render: (row) => (
        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase ${row.transport === 'websocket' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
          {row.transport}
        </span>
      )
    },
    {
      header: 'Client IP Address',
      accessor: 'ip',
      render: (row) => (
        <span className="font-mono text-xs text-slate-300">
          {row.ip.replace('::ffff:', '')}
        </span>
      )
    },
    {
      header: 'Subscribed Rooms',
      accessor: 'rooms',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.rooms && row.rooms.length > 0 ? (
            row.rooms.map((room, idx) => (
              <span key={idx} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                {room}
              </span>
            ))
          ) : (
            <span className="text-slate-500 text-xs italic">Default (Broadcast)</span>
          )}
        </div>
      )
    },
    {
      header: 'Connected At',
      accessor: 'connectedAt',
      render: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {row.connectedAt ? new Date(row.connectedAt).toLocaleTimeString() : 'Active'}
        </span>
      )
    },
    {
      header: 'Controls',
      accessor: 'actions',
      sortable: false,
      className: 'text-right pr-4',
      render: (row) => (
        <Tooltip content="Force Disconnect" variant="danger" position="left">
          <button
            onClick={() => {
              setSelectedSocketId(row.socketId);
              setDisconnectModalOpen(true);
            }}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition cursor-pointer"
          >
            <Power size={14} />
          </button>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* 🌟 Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/25 shrink-0">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">Socket.IO Real-Time Gateway &amp; Logs</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Port 5000 Live
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                Uptime: {formatUptime(metrics.uptimeSeconds)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">Live WebSocket telemetry tracking, client connections stream, room subscriptions, and admin broadcast console.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap relative z-10 shrink-0">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition cursor-pointer ${
              autoRefresh 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Zap size={14} className={autoRefresh ? 'text-emerald-400 fill-emerald-400/20' : ''} />
            {autoRefresh ? 'Live Auto-Sync (3s)' : 'Auto-Sync Paused'}
          </button>

          <Tooltip content="Refresh socket telemetry" position="left">
            <button
              onClick={fetchData}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </Tooltip>

          <Tooltip content="Wipe socket log history" position="left">
            <button
              onClick={() => setClearLogsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              <Trash2 size={14} />
              <span>Clear Logs</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* 📊 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Sockets */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-emerald-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Sockets</p>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{metrics.activeSocketsCount}</h3>
            <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Live Connected Clients
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Wifi size={24} />
          </div>
        </div>

        {/* Total Connections */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-primary-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Connects</p>
            <h3 className="text-2xl font-black text-slate-100 font-mono">{metrics.totalConnections}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Cumulative Handshakes</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary-500/10 border border-primary-500/20 text-primary-400 flex items-center justify-center shrink-0 shadow-inner">
            <Users size={24} />
          </div>
        </div>

        {/* Total Disconnections */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-rose-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disconnections</p>
            <h3 className="text-2xl font-black text-rose-400 font-mono">{metrics.totalDisconnections}</h3>
            <p className="text-[11px] text-slate-400 font-medium">Closed Sessions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
            <WifiOff size={24} />
          </div>
        </div>

        {/* Events Emitted */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex justify-between items-center group hover:border-purple-500/30 transition">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events Emitted</p>
            <h3 className="text-2xl font-black text-purple-400 font-mono">{metrics.totalEventsEmitted}</h3>
            <p className="text-[11px] text-purple-300 font-medium">Messages &amp; Telemetry</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
            <Activity size={24} />
          </div>
        </div>
      </div>

      {/* 🧭 Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'logs'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Terminal size={14} />
          <span>Real-Time Event Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'clients'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users size={14} />
          <span>Connected Clients ({clients.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 ${
            activeTab === 'broadcast'
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Send size={14} />
          <span>Admin Broadcast Console</span>
        </button>
      </div>

      {/* 📋 TAB 1: Live Event Logs Stream */}
      {activeTab === 'logs' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Terminal className="text-primary-400" size={18} />
              <h3 className="font-bold text-slate-100 text-sm">Socket.IO Activity Event Stream</h3>
              <span className="text-xs text-slate-500">({logs.length} logged)</span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="w-48">
                <Select
                  value={eventTypeFilter}
                  onChange={(val) => setEventTypeFilter(val)}
                  options={[
                    { value: 'ALL', label: 'All Event Types' },
                    { value: 'CONNECT', label: 'Connect Events' },
                    { value: 'DISCONNECT', label: 'Disconnect Events' },
                    { value: 'BUS_UPDATE', label: 'Bus Telemetry' },
                    { value: 'JOIN_ROOM', label: 'Room Joins' },
                    { value: 'BROADCAST', label: 'Broadcasts' },
                    { value: 'ERROR', label: 'Errors' }
                  ]}
                />
              </div>

              <div className="w-56">
                <Input
                  placeholder="Search by Socket ID or IP..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  icon={Search}
                />
              </div>
            </div>
          </div>

          <DataTable
            columns={logColumns}
            data={logs}
            loading={loading}
            emptyMessage="No socket events recorded yet. Connect a client to see live events."
          />
        </div>
      )}

      {/* 👥 TAB 2: Active Clients Directory */}
      {activeTab === 'clients' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="text-emerald-400" size={18} />
              <h3 className="font-bold text-slate-100 text-sm">Currently Active Connected Sockets</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {clients.length} Online
              </span>
            </div>
          </div>

          <DataTable
            columns={clientColumns}
            data={clients}
            loading={loading}
            emptyMessage="No active socket connections at the moment."
          />
        </div>
      )}

      {/* 📡 TAB 3: Broadcast Console */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
                <Send className="text-primary-400" size={18} />
                <h3 className="font-bold text-slate-100 text-sm">Dispatch Live Socket Announcement</h3>
              </div>

              {broadcastSuccess && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span className="font-bold">{broadcastSuccess}</span>
                </div>
              )}

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Broadcast Message Content *</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Urgent Notice: Bus Route #12 is delayed by 15 minutes due to heavy traffic."
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Alert Severity</label>
                    <Select
                      value={broadcastType}
                      onChange={(val) => setBroadcastType(val)}
                      options={[
                        { value: 'info', label: 'Info (Normal Announcement)' },
                        { value: 'warning', label: 'Warning (Bus Delay / Weather)' },
                        { value: 'danger', label: 'Emergency (Urgent Alert)' },
                        { value: 'success', label: 'Success Notification' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Target Room (Optional)</label>
                    <Input
                      placeholder="e.g. route_1 or school_1 (Leave blank for ALL)"
                      value={targetRoom}
                      onChange={(e) => setTargetRoom(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={broadcasting || !broadcastMessage.trim()}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition cursor-pointer shadow-lg shadow-primary-500/25 active:scale-95"
                  >
                    <Send size={14} />
                    <span>{broadcasting ? 'Emitting...' : 'Dispatch Live Broadcast'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <Globe className="text-primary-400" size={18} />
                <h3 className="font-bold text-slate-100 text-sm">How Broadcasts Work</h3>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  When you submit a broadcast message, the backend Socket.IO engine emits a <code className="text-primary-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-bold border border-slate-800">systemBroadcast</code> event.
                </p>
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-100 flex items-center gap-1.5">
                    <Info size={14} className="text-primary-400" /> Targeting Capabilities:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-400">
                    <li><strong className="text-slate-200">Global (All Sockets):</strong> Delivered instantly to every connected School, Parent &amp; Driver dashboard.</li>
                    <li><strong className="text-slate-200">Specific Route:</strong> Enter <code className="text-primary-400 font-bold">route_12</code> to alert only parents and students of Bus 12.</li>
                    <li><strong className="text-slate-200">Specific School:</strong> Enter <code className="text-primary-400 font-bold">school_1</code> to target one campus.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚠️ Disconnect Client Confirm Modal */}
      <ConfirmModal
        isOpen={disconnectModalOpen}
        title="Force Disconnect Client Socket"
        message={`Are you sure you want to forcibly terminate the connection for socket ID "${selectedSocketId}"? The client will immediately be disconnected from the gateway.`}
        type="danger"
        confirmText={disconnecting ? 'Disconnecting...' : 'Force Disconnect'}
        onConfirm={handleConfirmDisconnect}
        onClose={() => {
          setDisconnectModalOpen(false);
          setSelectedSocketId(null);
        }}
      />

      {/* ⚠️ Clear Logs Confirm Modal */}
      <ConfirmModal
        isOpen={clearLogsModalOpen}
        title="Clear Socket Event Logs"
        message="Are you sure you want to wipe all in-memory Socket.IO log history? This will clear all previous connection, disconnection, and telemetry records."
        type="danger"
        confirmText={clearing ? 'Clearing...' : 'Clear All Logs'}
        onConfirm={handleConfirmClearLogs}
        onClose={() => setClearLogsModalOpen(false)}
      />

      {/* 🔍 Payload Inspector Modal */}
      {payloadModalOpen && activePayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center space-x-2">
                <Terminal size={18} className="text-amber-400" />
                <h3 className="font-bold text-slate-100 text-sm">Payload Inspector — {activePayload.eventType}</h3>
              </div>
              <button
                onClick={() => {
                  setPayloadModalOpen(false);
                  setActivePayload(null);
                }}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs text-slate-400 space-y-1">
                <p><strong>Socket ID:</strong> <span className="font-mono text-amber-400 font-bold">{activePayload.socketId}</span></p>
                <p><strong>Event:</strong> {activePayload.eventType} ({activePayload.transport})</p>
                <p><strong>Timestamp:</strong> {new Date(activePayload.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block mb-1.5">Metadata JSON:</span>
                <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-60 shadow-inner">
                  {JSON.stringify(activePayload.metadata, null, 2)}
                </pre>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => {
                  setPayloadModalOpen(false);
                  setActivePayload(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
