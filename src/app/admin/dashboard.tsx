"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  Key,
  CheckCircle2,
  AlertCircle,
  Loader2,
  HardDrive,
  Users,
  Activity,
  Server,
  Globe,
  CalendarClock,
  Download,
  Pencil,
  X,
  Save,
  RotateCw,
  BarChart3,
} from "lucide-react";

interface ServerData {
  id: string;
  name: string;
  apiUrl: string;
  _count: { vpnKeys: number };
}

interface VpnKeyData {
  id: string;
  keyId: string;
  name: string | null;
  accessUrl: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  dataLimit: number | null;
  bytesUsed: number;
  expiresAt: string;
  user: { id: string; email: string };
  server: { id: string; name: string };
  createdAt: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getDaysLeft(expiresAt: string) {
  return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000));
}

function defaultEndDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

export default function AdminDashboard({ token, onAnalytics }: { token: string; onAnalytics: () => void }) {
  const [keys, setKeys] = useState<VpnKeyData[]>([]);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showServerPanel, setShowServerPanel] = useState(false);
  const [email, setEmail] = useState("");
  const [keyName, setKeyName] = useState("");
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [dataLimitGB, setDataLimitGB] = useState("");
  const [selectedServerId, setSelectedServerId] = useState("");
  const [newKeyUrl, setNewKeyUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [newServerName, setNewServerName] = useState("");
  const [newServerUrl, setNewServerUrl] = useState("");
  const [addingServer, setAddingServer] = useState(false);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);
  const [syncingServerId, setSyncingServerId] = useState<string | null>(null);

  const [editingKey, setEditingKey] = useState<VpnKeyData | null>(null);
  const [editKeyId, setEditKeyId] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editExpiresAt, setEditExpiresAt] = useState("");
  const [editDataLimitGB, setEditDataLimitGB] = useState("");
  const [saving, setSaving] = useState(false);

  const [renewingKey, setRenewingKey] = useState<VpnKeyData | null>(null);
  const [renewDays, setRenewDays] = useState(30);
  const [renewResetData, setRenewResetData] = useState(false);
  const [renewing, setRenewing] = useState(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchServers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/servers", { headers });
      if (res.ok) {
        const data = await res.json();
        setServers(data);
        if (data.length > 0 && !selectedServerId) {
          setSelectedServerId(data[0].id);
        }
      }
    } catch {
      showToast("error", "Failed to fetch servers");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/keys", { headers });
      if (res.ok) setKeys(await res.json());
    } catch {
      showToast("error", "Failed to fetch keys");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchServers().then(() => fetchKeys());
  }, [fetchServers, fetchKeys]);

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAddServer(e: React.FormEvent) {
    e.preventDefault();
    if (!newServerName || !newServerUrl) return;
    setAddingServer(true);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "POST", headers,
        body: JSON.stringify({ name: newServerName, apiUrl: newServerUrl }),
      });
      if (!res.ok) { showToast("error", (await res.json()).error || "Failed"); return; }
      setNewServerName(""); setNewServerUrl("");
      showToast("success", "Server added");
      fetchServers();
    } catch { showToast("error", "Failed to add server"); }
    finally { setAddingServer(false); }
  }

  async function handleDeleteServer(id: string) {
    if (!confirm("Remove this server?")) return;
    setDeletingServerId(id);
    try {
      const res = await fetch("/api/admin/servers", {
        method: "DELETE", headers, body: JSON.stringify({ id }),
      });
      if (!res.ok) { showToast("error", (await res.json()).error || "Failed"); return; }
      showToast("success", "Server removed");
      fetchServers();
    } catch { showToast("error", "Failed to delete server"); }
    finally { setDeletingServerId(null); }
  }

  async function handleSync(serverId: string) {
    setSyncingServerId(serverId);
    try {
      const res = await fetch("/api/admin/servers/sync", {
        method: "POST", headers,
        body: JSON.stringify({ serverId }),
      });
      const data = await res.json();
      if (!res.ok) { showToast("error", data.error || "Sync failed"); return; }
      showToast("success", data.message);
      fetchKeys(); fetchServers();
    } catch { showToast("error", "Failed to sync keys"); }
    finally { setSyncingServerId(null); }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !selectedServerId) return;
    setCreating(true);
    setNewKeyUrl("");
    try {
      const res = await fetch("/api/admin/keys", {
        method: "POST", headers,
        body: JSON.stringify({
          email,
          name: keyName || undefined,
          serverId: selectedServerId,
          expiresAt: new Date(endDate + "T23:59:59").toISOString(),
          dataLimitGB: dataLimitGB ? Number(dataLimitGB) : undefined,
        }),
      });
      if (!res.ok) { showToast("error", (await res.json()).error || "Failed to create key"); return; }
      const data = await res.json();
      setNewKeyUrl(data.accessUrl);
      setEmail(""); setKeyName(""); setEndDate(defaultEndDate()); setDataLimitGB("");
      showToast("success", "Key created successfully");
      fetchKeys(); fetchServers();
    } catch { showToast("error", "Failed to create key"); }
    finally { setCreating(false); }
  }

  async function handleDelete(keyId: string) {
    if (!confirm("Delete this key?")) return;
    setDeletingId(keyId);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "DELETE", headers, body: JSON.stringify({ keyId }),
      });
      if (res.ok) { showToast("success", "Key deleted"); fetchKeys(); fetchServers(); }
      else showToast("error", "Failed to delete key");
    } catch { showToast("error", "Failed to delete key"); }
    finally { setDeletingId(null); }
  }

  async function handleStatusToggle(keyId: string, currentStatus: string) {
    const newStatus = currentStatus === "ACTIVE" ? "EXPIRED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/keys", {
        method: "PATCH", headers,
        body: JSON.stringify({ keyId, status: newStatus }),
      });
      if (res.ok) { showToast("success", `Key ${newStatus.toLowerCase()}`); fetchKeys(); }
    } catch { showToast("error", "Failed to update status"); }
  }

  function openEdit(key: VpnKeyData) {
    setEditingKey(key);
    setEditKeyId(key.keyId);
    setEditEmail(key.user.email);
    setEditName(key.name || "");
    setEditExpiresAt(new Date(key.expiresAt).toISOString().split("T")[0]);
    setEditDataLimitGB(key.dataLimit ? (key.dataLimit / 1_073_741_824).toFixed(2).replace(/\.?0+$/, "") : "");
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingKey) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/keys", {
        method: "PATCH", headers,
        body: JSON.stringify({
          keyId: editingKey.keyId,
          newKeyId: editKeyId !== editingKey.keyId ? editKeyId : undefined,
          email: editEmail !== editingKey.user.email ? editEmail : undefined,
          name: editName !== (editingKey.name || "") ? editName : undefined,
          expiresAt: editExpiresAt !== new Date(editingKey.expiresAt).toISOString().split("T")[0]
            ? new Date(editExpiresAt + "T23:59:59").toISOString() : undefined,
          dataLimitGB: editDataLimitGB !== (editingKey.dataLimit ? (editingKey.dataLimit / 1_073_741_824).toFixed(2).replace(/\.?0+$/, "") : "")
            ? (editDataLimitGB ? Number(editDataLimitGB) : null) : undefined,
        }),
      });
      if (!res.ok) { showToast("error", (await res.json()).error || "Failed to save"); return; }
      showToast("success", "Key updated");
      setEditingKey(null);
      fetchKeys();
    } catch { showToast("error", "Failed to save changes"); }
    finally { setSaving(false); }
  }

  function copyToClipboard(text: string, id: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault();
    if (!renewingKey) return;
    setRenewing(true);
    try {
      const baseDate = renewingKey.status === "ACTIVE"
        ? new Date(renewingKey.expiresAt)
        : new Date();
      const newExpiry = new Date(baseDate);
      newExpiry.setDate(newExpiry.getDate() + renewDays);
      newExpiry.setHours(23, 59, 59, 0);

      const body: Record<string, unknown> = {
        keyId: renewingKey.keyId,
        status: "ACTIVE",
        expiresAt: newExpiry.toISOString(),
      };

      if (renewResetData && renewingKey.dataLimit) {
        const gb = renewingKey.dataLimit / 1_073_741_824;
        body.dataLimitGB = gb;
      }

      const res = await fetch("/api/admin/keys", {
        method: "PATCH", headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) { showToast("error", (await res.json()).error || "Failed to renew"); return; }
      showToast("success", `Key renewed for ${renewDays} days`);
      setRenewingKey(null);
      setRenewDays(30);
      setRenewResetData(false);
      fetchKeys();
    } catch { showToast("error", "Failed to renew key"); }
    finally { setRenewing(false); }
  }

  const activeKeys = keys.filter((k) => k.status === "ACTIVE").length;
  const totalUsage = keys.reduce((sum, k) => sum + k.bytesUsed, 0);
  const inputClass = "w-full px-4 py-2.5 bg-background border border-card-border rounded-lg text-foreground placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
          toast.type === "success" ? "bg-success/10 border-success/20 text-success" : "bg-danger/10 border-danger/20 text-danger"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted text-sm mt-1">Manage Outline VPN servers & keys</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setLoading(true); fetchServers(); fetchKeys(); }}
            className="p-2.5 bg-card border border-card-border rounded-lg hover:bg-card-border transition-colors" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={onAnalytics}
            className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg bg-card border border-card-border text-foreground hover:bg-card-border transition-colors">
            <BarChart3 className="w-4 h-4" />Analytics
          </button>
          <button onClick={() => { setShowServerPanel(!showServerPanel); setShowCreate(false); }}
            className={`flex items-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors ${
              showServerPanel ? "bg-card border border-primary text-primary" : "bg-card border border-card-border text-foreground hover:bg-card-border"
            }`}>
            <Server className="w-4 h-4" />Servers ({servers.length})
          </button>
          <button onClick={() => { setShowCreate(!showCreate); setShowServerPanel(false); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />Generate Key
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Servers", value: servers.length, icon: Globe, color: "primary" },
          { label: "Total Keys", value: keys.length, icon: Key, color: "primary" },
          { label: "Active Keys", value: activeKeys, icon: Users, color: "success" },
          { label: "Total Bandwidth", value: formatBytes(totalUsage), icon: Activity, color: "warning" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-card-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${s.color}/10 flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 text-${s.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted">{s.label}</p>
                <p className="text-xl font-bold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Server Panel */}
      {showServerPanel && (
        <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Outline Servers</h2>
          <form onSubmit={handleAddServer} className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-3">
              <input type="text" value={newServerName} onChange={(e) => setNewServerName(e.target.value)}
                placeholder="Server name (e.g. Singapore)" required className={inputClass} />
              <input type="text" value={newServerUrl} onChange={(e) => setNewServerUrl(e.target.value)}
                placeholder="API URL (e.g. https://1.2.3.4:8080/secret)" required className={`${inputClass} font-mono text-sm`} />
              <button type="submit" disabled={addingServer || !newServerName || !newServerUrl}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {addingServer ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Add
              </button>
            </div>
          </form>
          {servers.length === 0 ? (
            <div className="text-center py-8 text-muted">
              <Server className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No servers yet. Add your first Outline server above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {servers.map((srv) => (
                <div key={srv.id} className="flex items-center justify-between p-4 bg-background border border-card-border rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{srv.name}</p>
                      <p className="text-xs text-muted font-mono truncate">{srv.apiUrl}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-xs text-muted bg-card px-2.5 py-1 rounded-full">
                      {srv._count.vpnKeys} key{srv._count.vpnKeys !== 1 ? "s" : ""}
                    </span>
                    <button onClick={() => handleSync(srv.id)} disabled={syncingServerId === srv.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50 transition-colors" title="Sync keys from server">
                      {syncingServerId === srv.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                      Sync
                    </button>
                    <button onClick={() => handleDeleteServer(srv.id)} disabled={deletingServerId === srv.id}
                      className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" title="Remove server">
                      {deletingServerId === srv.id ? <Loader2 className="w-4 h-4 animate-spin text-danger" /> : <Trash2 className="w-4 h-4 text-danger" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Key Form */}
      {showCreate && (
        <div className="bg-card border border-card-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Generate New VPN Key</h2>
          {servers.length === 0 ? (
            <div className="text-center py-6 text-muted">
              <Server className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm mb-3">Add a server first before generating keys.</p>
              <button onClick={() => { setShowServerPanel(true); setShowCreate(false); }}
                className="text-sm text-primary hover:text-primary-hover underline">
                Go to Server Management
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Server <span className="text-danger">*</span></label>
                  <select value={selectedServerId} onChange={(e) => setSelectedServerId(e.target.value)} required className={inputClass}>
                    <option value="">Select server...</option>
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s._count.vpnKeys} keys)</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">User Email <span className="text-danger">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Key Name</label>
                  <input type="text" value={keyName} onChange={(e) => setKeyName(e.target.value)}
                    placeholder="e.g. John's Phone" className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">End Date <span className="text-danger">*</span></label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]} required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Data Limit (GB)</label>
                  <input type="number" min={0} step={0.1} value={dataLimitGB}
                    onChange={(e) => setDataLimitGB(e.target.value)}
                    placeholder="Unlimited" className={inputClass} />
                </div>
              </div>
              <button type="submit" disabled={creating || !email || !selectedServerId || !endDate}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Key
              </button>
            </form>
          )}

          {newKeyUrl && (
            <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm font-medium text-success mb-2">Key created! Access URL:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-background px-3 py-2 rounded font-mono break-all">{newKeyUrl}</code>
                <button onClick={() => copyToClipboard(newKeyUrl, "new")}
                  className="shrink-0 p-2 bg-card border border-card-border rounded-lg hover:bg-card-border transition-colors">
                  {copied === "new" ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditingKey(null)}>
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Edit Key</h2>
              <button onClick={() => setEditingKey(null)} className="p-1.5 rounded-lg hover:bg-card-border transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Key ID</label>
                <input type="text" value={editKeyId} onChange={(e) => setEditKeyId(e.target.value)}
                  required className={inputClass} placeholder="e.g. AWS-7" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">User Email</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                  required className={inputClass} placeholder="user@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Key Name</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                  className={inputClass} placeholder="e.g. John's Phone" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">End Date</label>
                <input type="date" value={editExpiresAt} onChange={(e) => setEditExpiresAt(e.target.value)}
                  required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Data Limit (GB)</label>
                <input type="number" min={0} step={0.1} value={editDataLimitGB}
                  onChange={(e) => setEditDataLimitGB(e.target.value)}
                  placeholder="Unlimited" className={inputClass} />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted">
                <Globe className="w-3.5 h-3.5" />
                <span>{editingKey.server.name}</span>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditingKey(null)}
                  className="px-4 py-2.5 bg-card border border-card-border rounded-lg text-sm font-medium hover:bg-card-border transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving || !editKeyId || !editEmail}
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setRenewingKey(null)}>
          <div className="bg-card border border-card-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Renew Key</h2>
              <button onClick={() => setRenewingKey(null)} className="p-1.5 rounded-lg hover:bg-card-border transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 p-3 bg-background border border-card-border rounded-lg">
              <p className="font-medium text-sm">{renewingKey.name || `Key ${renewingKey.keyId}`}</p>
              <p className="text-xs text-muted mt-0.5">{renewingKey.user.email} &middot; {renewingKey.server.name}</p>
              <p className={`text-xs mt-1 ${
                renewingKey.status === "ACTIVE" ? "text-success" : "text-warning"
              }`}>
                {renewingKey.status === "ACTIVE"
                  ? `Active — expires ${new Date(renewingKey.expiresAt).toLocaleDateString()}`
                  : `${renewingKey.status} — expired ${new Date(renewingKey.expiresAt).toLocaleDateString()}`
                }
              </p>
            </div>

            <form onSubmit={handleRenew} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Extend by</label>
                <div className="grid grid-cols-4 gap-2">
                  {[7, 14, 30, 60].map((d) => (
                    <button key={d} type="button" onClick={() => setRenewDays(d)}
                      className={`py-2 text-sm font-medium rounded-lg border transition-colors ${
                        renewDays === d
                          ? "bg-primary text-white border-primary"
                          : "bg-background border-card-border text-foreground hover:bg-card-border"
                      }`}>
                      {d}d
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mt-2">
                  New expiry: {(() => {
                    const base = renewingKey.status === "ACTIVE" ? new Date(renewingKey.expiresAt) : new Date();
                    const d = new Date(base); d.setDate(d.getDate() + renewDays);
                    return d.toLocaleDateString();
                  })()}
                </p>
              </div>

              {renewingKey.dataLimit && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={renewResetData} onChange={(e) => setRenewResetData(e.target.checked)}
                    className="w-4 h-4 rounded border-card-border text-primary focus:ring-primary/50" />
                  <span className="text-sm">Re-apply data limit ({(renewingKey.dataLimit / 1_073_741_824).toFixed(1)} GB)</span>
                </label>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setRenewingKey(null)}
                  className="px-4 py-2.5 bg-card border border-card-border rounded-lg text-sm font-medium hover:bg-card-border transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={renewing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-success hover:bg-success/90 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  {renewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                  Renew
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Keys Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : keys.length === 0 ? (
        <div className="text-center py-20 text-muted">
          <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No keys yet</p>
          <p className="text-sm">Generate your first VPN key to get started.</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-card-border text-left">
                  {["Key", "Server", "User", "Usage", "Expires", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-xs font-medium text-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {keys.map((vpnKey) => {
                  const days = getDaysLeft(vpnKey.expiresAt);
                  const expiryColor = days === 0 ? "text-danger" : days <= 7 ? "text-warning" : "text-muted";
                  return (
                    <tr key={vpnKey.id} className="hover:bg-card-border/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium">{vpnKey.name || `Key ${vpnKey.keyId}`}</p>
                        <p className="text-xs text-muted font-mono">ID: {vpnKey.keyId}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          <Globe className="w-3 h-3" />{vpnKey.server.name}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted">{vpnKey.user.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-muted" />
                          <span>{formatBytes(vpnKey.bytesUsed)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <CalendarClock className={`w-4 h-4 ${expiryColor}`} />
                          <div>
                            <p className={`text-xs font-medium ${expiryColor}`}>
                              {days === 0 ? "Expired" : `${days}d left`}
                            </p>
                            <p className="text-xs text-muted">{new Date(vpnKey.expiresAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleStatusToggle(vpnKey.keyId, vpnKey.status)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                            vpnKey.status === "ACTIVE" ? "bg-success/20 text-success hover:bg-success/30"
                            : vpnKey.status === "EXPIRED" ? "bg-warning/20 text-warning hover:bg-warning/30"
                            : "bg-danger/20 text-danger hover:bg-danger/30"
                          }`}>
                          {vpnKey.status}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setRenewingKey(vpnKey); setRenewDays(30); setRenewResetData(false); }}
                            className="p-1.5 rounded-lg hover:bg-success/10 transition-colors" title="Renew key">
                            <RotateCw className="w-4 h-4 text-success" />
                          </button>
                          <button onClick={() => openEdit(vpnKey)}
                            className="p-1.5 rounded-lg hover:bg-primary/10 transition-colors" title="Edit key">
                            <Pencil className="w-4 h-4 text-primary" />
                          </button>
                          <button onClick={() => copyToClipboard(vpnKey.accessUrl, vpnKey.keyId)}
                            className="p-1.5 rounded-lg hover:bg-card-border transition-colors" title="Copy access URL">
                            {copied === vpnKey.keyId ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-muted" />}
                          </button>
                          <button onClick={() => handleDelete(vpnKey.keyId)} disabled={deletingId === vpnKey.keyId}
                            className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors" title="Delete key">
                            {deletingId === vpnKey.keyId ? <Loader2 className="w-4 h-4 animate-spin text-danger" /> : <Trash2 className="w-4 h-4 text-danger" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
