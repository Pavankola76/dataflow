"use client";
import React, { useState, useRef } from "react";
import {
  User, Building, CreditCard, Key, Shield, Bot,
  Mail, Bell, Upload, Check, Copy, Eye, EyeOff,
  Plus, Trash2, RefreshCw, Globe, Clock, Zap,
  ChevronRight, AlertTriangle, Sparkles, Lock,
} from "lucide-react";

/* ── tiny toggle ── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        on ? "bg-indigo-500" : "bg-zinc-700"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
          on ? "translate-x-[22px]" : "translate-x-1"
        }`}
      />
    </button>
  );
}

/* ── toast ── */
function Toast({ message, visible }: { message: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-[13px] font-medium shadow-2xl shadow-emerald-900/40 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <Check className="w-4 h-4" /> {message}
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  /* profile state */
  const [name, setName] = useState("Pavan Kola");
  const [role, setRole] = useState("Data Engineer");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  /* notification toggles */
  const [notifApp, setNotifApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSlack, setNotifSlack] = useState(false);
  const [notifPagerDuty, setNotifPagerDuty] = useState(false);

  /* org state */
  const [orgName, setOrgName] = useState("DataFlow Inc.");
  const [orgSlug, setOrgSlug] = useState("dataflow-inc");
  const [orgTimezone, setOrgTimezone] = useState("America/Chicago");
  const [orgRetention, setOrgRetention] = useState("90");

  /* api keys state */
  const [apiKeys, setApiKeys] = useState([
    { id: "1", name: "Production Pipeline", key: "df_live_9k2x...a7bR", created: "Mar 02, 2026", lastUsed: "2 hours ago", scopes: ["pipelines:write", "connections:read"] },
    { id: "2", name: "CI/CD Integration", key: "df_live_m4Tz...p1Qe", created: "Feb 15, 2026", lastUsed: "14 min ago", scopes: ["pipelines:read", "quality:read"] },
    { id: "3", name: "Monitoring Dashboard", key: "df_live_xR7j...v3Kn", created: "Jan 28, 2026", lastUsed: "1 day ago", scopes: ["monitoring:read", "cost:read"] },
  ]);
  const [showNewKey, setShowNewKey] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  /* ai state */
  const [autonomyLevel, setAutonomyLevel] = useState("supervised");
  const [complexModel, setComplexModel] = useState("gpt4o");
  const [fastModel, setFastModel] = useState("gemini-flash");
  const [autoHeal, setAutoHeal] = useState(true);
  const [schemaEvolution, setSchemaEvolution] = useState(false);

  /* billing state */
  const [plan] = useState("enterprise");

  /* toast */
  const [toast, setToast] = useState({ visible: false, message: "" });
  const showToast = (msg: string) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2500);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "organization", label: "Organization", icon: Building },
    { id: "apikeys", label: "API Keys", icon: Key },
    { id: "ai", label: "AI & Autonomy", icon: Bot },
    { id: "billing", label: "Billing", icon: CreditCard },
  ];

  /* avatar upload */
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarUrl(ev.target?.result as string);
        showToast("Avatar updated successfully");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
    showToast("API key copied to clipboard");
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    showToast("API key revoked");
  };

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: String(Date.now()),
      name: newKeyName,
      key: "df_live_" + Math.random().toString(36).slice(2, 10) + "..." + Math.random().toString(36).slice(2, 6),
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      lastUsed: "Just now",
      scopes: ["pipelines:read"],
    };
    setApiKeys((prev) => [newKey, ...prev]);
    setNewKeyName("");
    setShowNewKey(false);
    showToast("API key created");
  };

  return (
    <div className="max-w-6xl mx-auto flex gap-8 pb-12">
      <Toast {...toast} />
      <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* ── Sidebar Nav ── */}
      <div className="w-56 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">Settings</h1>
        <p className="text-[12px] text-zinc-500 mb-6">Manage your workspace configuration</p>
        <nav className="space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                activeTab === tab.id
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0">

        {/* ═══════════ PROFILE ═══════════ */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-[18px] font-semibold text-zinc-100 mb-0.5">My Profile</h2>
              <p className="text-[13px] text-zinc-500 mb-6">Manage your personal information and preferences.</p>

              {/* avatar + info */}
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#16161a] space-y-6">
                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border-2 border-indigo-500/40 flex items-center justify-center overflow-hidden cursor-pointer hover:border-indigo-400/60 transition-colors"
                    onClick={() => avatarRef.current?.click()}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-indigo-400" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => avatarRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[13px] font-medium transition-colors border border-zinc-700 active:scale-[0.98]"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                    </button>
                    <p className="text-[11px] text-zinc-600">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        defaultValue="pavan@example.com"
                        disabled
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800 text-zinc-500 text-[13px] cursor-not-allowed pr-8"
                      />
                      <Lock className="w-3.5 h-3.5 text-zinc-600 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* notifications */}
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-100 mb-1">Notification Preferences</h2>
              <p className="text-[12px] text-zinc-500 mb-4">Control how you receive alerts and updates.</p>
              <div className="rounded-xl border border-zinc-800 bg-[#16161a] divide-y divide-zinc-800/80">
                {[
                  { icon: Bell, title: "In-App Notifications", desc: "Real-time alerts for pipeline failures, AI approvals, and schema changes", on: notifApp, toggle: () => setNotifApp(!notifApp) },
                  { icon: Mail, title: "Email Digests", desc: "Daily summary of data quality scores, cost metrics, and pipeline health", on: notifEmail, toggle: () => setNotifEmail(!notifEmail) },
                  { icon: Zap, title: "Slack Integration", desc: "Push critical alerts to your team's Slack channel", on: notifSlack, toggle: () => setNotifSlack(!notifSlack) },
                  { icon: AlertTriangle, title: "PagerDuty Escalation", desc: "Escalate critical pipeline failures to on-call engineers", on: notifPagerDuty, toggle: () => setNotifPagerDuty(!notifPagerDuty) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.on ? "bg-indigo-500/10" : "bg-zinc-800"}`}>
                        <item.icon className={`w-4 h-4 ${item.on ? "text-indigo-400" : "text-zinc-500"}`} />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">{item.title}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</div>
                      </div>
                    </div>
                    <Toggle on={item.on} onToggle={item.toggle} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium transition-colors border border-zinc-700 active:scale-[0.98]">
                Cancel
              </button>
              <button
                onClick={() => showToast("Profile saved successfully")}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors shadow-lg shadow-indigo-900/30 active:scale-[0.98]"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ ORGANIZATION ═══════════ */}
        {activeTab === "organization" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-[18px] font-semibold text-zinc-100 mb-0.5">Organization Settings</h2>
              <p className="text-[13px] text-zinc-500 mb-6">Configure your workspace and team preferences.</p>

              <div className="p-6 rounded-xl border border-zinc-800 bg-[#16161a] space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Organization Name</label>
                    <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5">Slug</label>
                    <div className="flex items-center gap-0">
                      <span className="px-3 py-2.5 rounded-l-lg bg-zinc-800 border border-r-0 border-zinc-700 text-zinc-500 text-[13px]">dataflow.ai/</span>
                      <input type="text" value={orgSlug} onChange={(e) => setOrgSlug(e.target.value)}
                        className="flex-1 px-3 py-2.5 rounded-r-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" /> Default Timezone
                    </label>
                    <select value={orgTimezone} onChange={(e) => setOrgTimezone(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 transition-all">
                      <option value="America/New_York">Eastern (UTC-5)</option>
                      <option value="America/Chicago">Central (UTC-6)</option>
                      <option value="America/Denver">Mountain (UTC-7)</option>
                      <option value="America/Los_Angeles">Pacific (UTC-8)</option>
                      <option value="UTC">UTC</option>
                      <option value="Asia/Kolkata">India (IST, UTC+5:30)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Data Retention (days)
                    </label>
                    <select value={orgRetention} onChange={(e) => setOrgRetention(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 transition-all">
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">1 year</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* team members */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-[16px] font-semibold text-zinc-100 mb-0.5">Team Members</h2>
                  <p className="text-[12px] text-zinc-500">3 members in your organization</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors shadow-lg shadow-indigo-900/30 active:scale-[0.98]">
                  <Plus className="w-3.5 h-3.5" /> Invite Member
                </button>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-[#16161a] divide-y divide-zinc-800/80">
                {[
                  { name: "Pavan Kola", email: "pavan@dataflow.ai", role: "Admin", status: "Active" },
                  { name: "Sarah Chen", email: "sarah@dataflow.ai", role: "Editor", status: "Active" },
                  { name: "Marcus Johnson", email: "marcus@dataflow.ai", role: "Viewer", status: "Pending" },
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 flex items-center justify-center text-[13px] font-bold text-indigo-300">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">{member.name}</div>
                        <div className="text-[11px] text-zinc-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${member.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {member.status}
                      </span>
                      <select defaultValue={member.role} className="px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] focus:outline-none">
                        <option>Admin</option>
                        <option>Editor</option>
                        <option>Viewer</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => showToast("Organization settings saved")}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors shadow-lg shadow-indigo-900/30 active:scale-[0.98]">
                Save Organization
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ API KEYS ═══════════ */}
        {activeTab === "apikeys" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-zinc-100 mb-0.5">API Keys</h2>
                <p className="text-[13px] text-zinc-500">Manage programmatic access to the DataFlow API.</p>
              </div>
              <button
                onClick={() => setShowNewKey(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors shadow-lg shadow-indigo-900/30 active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" /> Create New Key
              </button>
            </div>

            {showNewKey && (
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.03] space-y-3">
                <label className="block text-[12px] font-medium text-zinc-300">Key Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Production ETL"
                    className="flex-1 px-3 py-2.5 rounded-lg bg-zinc-900/60 border border-zinc-700/50 text-zinc-200 text-[13px] focus:outline-none focus:border-indigo-500/50 transition-all placeholder-zinc-600"
                    onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                  />
                  <button onClick={handleCreateKey} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors active:scale-[0.98]">Generate</button>
                  <button onClick={() => setShowNewKey(false)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium transition-colors border border-zinc-700 active:scale-[0.98]">Cancel</button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-800 bg-[#16161a] divide-y divide-zinc-800/80">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Key className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-zinc-200">{apiKey.name}</div>
                        <div className="text-[11px] text-zinc-500">Created {apiKey.created} · Last used {apiKey.lastUsed}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setRevealedKey(revealedKey === apiKey.id ? null : apiKey.id)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors" title="Reveal key">
                        {revealedKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleCopyKey(apiKey.key)}
                        className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors" title="Copy key">
                        {copiedKey === apiKey.key ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteKey(apiKey.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors" title="Revoke key">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pl-12">
                    <code className="text-[12px] font-mono text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                      {revealedKey === apiKey.id ? "df_live_9k2xF9aLm7bR3zP1qWnYd8cV5tJhKe" : apiKey.key}
                    </code>
                    <div className="flex gap-1.5">
                      {apiKey.scopes.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <Key className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-[13px] text-zinc-500">No API keys. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ AI & AUTONOMY ═══════════ */}
        {activeTab === "ai" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-[18px] font-semibold text-zinc-100 mb-0.5">AI & Autonomy Config</h2>
              <p className="text-[13px] text-zinc-500 mb-6">Configure how AI agents behave in this workspace.</p>

              <div className="p-6 rounded-xl border border-zinc-800 bg-[#16161a] space-y-6">
                <div>
                  <h3 className="text-[14px] font-semibold text-zinc-200 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" /> Autonomy Level
                  </h3>
                  <p className="text-[12px] text-zinc-500 mb-4">Set the threshold for AI acting without human review.</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "manual", title: "Manual", desc: "AI only suggests. Every change requires explicit human approval.", color: "emerald" },
                      { id: "supervised", title: "Supervised", desc: "AI executes low-risk tasks (docs, metadata), asks permission for code/schema.", color: "indigo" },
                      { id: "autonomous", title: "Autonomous", desc: "AI fixes pipelines and evolves schema automatically. Logs everything.", color: "amber" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setAutonomyLevel(mode.id)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 relative ${
                          autonomyLevel === mode.id
                            ? "border-indigo-500/50 bg-indigo-500/[0.05] shadow-lg shadow-indigo-900/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                        }`}
                      >
                        {autonomyLevel === mode.id && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`text-[13px] font-semibold ${autonomyLevel === mode.id ? "text-indigo-400" : "text-zinc-300"} mb-1`}>{mode.title}</div>
                        <div className="text-[11px] text-zinc-500 leading-relaxed">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-zinc-800" />

                <div>
                  <h3 className="text-[14px] font-semibold text-zinc-200 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-violet-400" /> Model Selection
                  </h3>
                  <p className="text-[12px] text-zinc-500 mb-4">Choose the LLM backend for different task types.</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">Complex Reasoning</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Code generation, root cause analysis, schema design</div>
                      </div>
                      <select value={complexModel} onChange={(e) => setComplexModel(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] focus:outline-none focus:border-indigo-500">
                        <option value="gpt4o">GPT-4o (OpenAI)</option>
                        <option value="gemini-pro">Gemini 2.5 Pro (Google)</option>
                        <option value="claude-sonnet">Claude 4 Sonnet (Anthropic)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">Fast Tasks</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">NL-to-SQL, classification, summarization</div>
                      </div>
                      <select value={fastModel} onChange={(e) => setFastModel(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-[12px] focus:outline-none focus:border-indigo-500">
                        <option value="gemini-flash">Gemini 2.5 Flash (Google)</option>
                        <option value="gpt4o-mini">GPT-4o-mini (OpenAI)</option>
                        <option value="claude-haiku">Claude 3.5 Haiku (Anthropic)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-zinc-800" />

                <div>
                  <h3 className="text-[14px] font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400" /> Automation Features
                  </h3>
                  <div className="space-y-0 rounded-xl border border-zinc-800 divide-y divide-zinc-800/80">
                    <div className="flex items-center justify-between px-5 py-4">
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">Auto-Heal Pipelines</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">AI automatically diagnoses and patches failing pipeline runs</div>
                      </div>
                      <Toggle on={autoHeal} onToggle={() => setAutoHeal(!autoHeal)} />
                    </div>
                    <div className="flex items-center justify-between px-5 py-4">
                      <div>
                        <div className="text-[13px] font-medium text-zinc-200">Schema Evolution</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">Allow AI to propose and apply schema migrations on upstream changes</div>
                      </div>
                      <Toggle on={schemaEvolution} onToggle={() => setSchemaEvolution(!schemaEvolution)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => showToast("AI configuration saved")}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[13px] font-medium transition-colors shadow-lg shadow-indigo-900/30 active:scale-[0.98]">
                Save AI Config
              </button>
            </div>
          </div>
        )}

        {/* ═══════════ BILLING ═══════════ */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-[18px] font-semibold text-zinc-100 mb-0.5">Billing & Subscription</h2>
              <p className="text-[13px] text-zinc-500 mb-6">Manage your plan and payment methods.</p>

              {/* current plan */}
              <div className="p-6 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.05] to-violet-500/[0.03] mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">Current Plan</span>
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-100">Enterprise</h3>
                    <p className="text-[13px] text-zinc-400 mt-1">Unlimited pipelines, priority support, custom SLA</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-zinc-100">$2,499<span className="text-[14px] font-normal text-zinc-500">/mo</span></div>
                    <div className="text-[11px] text-zinc-500 mt-1">Billed annually · Renews Apr 1, 2027</div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-indigo-500/15">
                  {[
                    { label: "Pipelines", value: "Unlimited" },
                    { label: "Compute Hours", value: "10,000/mo" },
                    { label: "Storage", value: "50 TB" },
                    { label: "Team Seats", value: "25" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-[11px] text-zinc-500">{item.label}</div>
                      <div className="text-[14px] font-semibold text-zinc-200">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* usage this month */}
              <div className="p-6 rounded-xl border border-zinc-800 bg-[#16161a]">
                <h3 className="text-[14px] font-semibold text-zinc-200 mb-4">Usage This Month</h3>
                <div className="space-y-4">
                  {[
                    { label: "Compute Hours", used: 3742, total: 10000, color: "bg-indigo-500" },
                    { label: "Storage", used: 18.4, total: 50, unit: "TB", color: "bg-violet-500" },
                    { label: "API Calls", used: 284000, total: 500000, color: "bg-emerald-500" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-[12px] mb-1.5">
                        <span className="text-zinc-400">{item.label}</span>
                        <span className="font-medium text-zinc-300">
                          {typeof item.used === "number" && item.used > 999 ? item.used.toLocaleString() : item.used}
                          {item.unit ? ` ${item.unit}` : ""} / {typeof item.total === "number" && item.total > 999 ? item.total.toLocaleString() : item.total}
                          {item.unit ? ` ${item.unit}` : ""}
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${(Number(item.used) / Number(item.total)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* payment method */}
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-100 mb-4">Payment Method</h2>
              <div className="p-5 rounded-xl border border-zinc-800 bg-[#16161a] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 rounded bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white tracking-wider">VISA</span>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-zinc-200">Visa ending in 4242</div>
                    <div className="text-[11px] text-zinc-500">Expires 12/2028</div>
                  </div>
                </div>
                <button onClick={() => showToast("Payment method updated")}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[13px] font-medium transition-colors border border-zinc-700 active:scale-[0.98]">
                  Update Card
                </button>
              </div>
            </div>

            {/* invoices */}
            <div>
              <h2 className="text-[16px] font-semibold text-zinc-100 mb-4">Recent Invoices</h2>
              <div className="rounded-xl border border-zinc-800 bg-[#16161a] divide-y divide-zinc-800/80">
                {[
                  { date: "Mar 01, 2026", amount: "$2,499.00", status: "Paid" },
                  { date: "Feb 01, 2026", amount: "$2,499.00", status: "Paid" },
                  { date: "Jan 01, 2026", amount: "$2,499.00", status: "Paid" },
                ].map((inv, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-zinc-500" />
                      <span className="text-[13px] text-zinc-300">{inv.date}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[13px] font-medium text-zinc-200">{inv.amount}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-400">{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
