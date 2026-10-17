import { useEffect, useMemo, useState } from "react";

const STATUSES = ["Wishlist", "Applied", "Interview", "Offer", "Rejected"];
const emptyForm = { company: "", role: "", status: "Applied", appliedDate: new Date().toISOString().slice(0, 10), location: "", jobUrl: "", notes: "" };

async function api(path, { token, ...options } = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("jat_token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("jat_user") || "null"); } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadApplications(currentToken = token) {
    const data = await api("/api/applications", { token: currentToken });
    setApplications(data);
  }

  useEffect(() => {
    if (!token) return;
    loadApplications().catch((err) => { setMessage(err.message); if (err.message.toLowerCase().includes("session")) logout(); });
  }, [token]);

  function logout() {
    localStorage.removeItem("jat_token");
    localStorage.removeItem("jat_user");
    setToken(""); setUser(null); setApplications([]); setMessage("");
  }

  async function handleAuth(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const data = await api(endpoint, { method: "POST", body: JSON.stringify(auth) });
      localStorage.setItem("jat_token", data.token);
      localStorage.setItem("jat_user", JSON.stringify(data.user));
      setToken(data.token); setUser(data.user); setAuth({ name: "", email: "", password: "" });
    } catch (err) { setMessage(err.message); }
    finally { setBusy(false); }
  }

  function startCreate() {
    setEditingId(""); setForm({ ...emptyForm, appliedDate: new Date().toISOString().slice(0, 10) }); setShowForm(true); setMessage("");
  }
  function startEdit(app) {
    setEditingId(app._id);
    setForm({ company: app.company || "", role: app.role || "", status: app.status || "Applied", appliedDate: app.appliedDate ? new Date(app.appliedDate).toISOString().slice(0, 10) : "", location: app.location || "", jobUrl: app.jobUrl || "", notes: app.notes || "" });
    setShowForm(true); setMessage("");
  }
  async function saveApplication(e) {
    e.preventDefault(); setBusy(true); setMessage("");
    try {
      const payload = { ...form, appliedDate: form.appliedDate || undefined };
      if (editingId) await api(`/api/applications/${editingId}`, { token, method: "PATCH", body: JSON.stringify(payload) });
      else await api("/api/applications", { token, method: "POST", body: JSON.stringify(payload) });
      await loadApplications(); setShowForm(false); setEditingId(""); setForm(emptyForm);
      setMessage(editingId ? "Application updated." : "Application added.");
    } catch (err) { setMessage(err.message); }
    finally { setBusy(false); }
  }
  async function deleteApplication(id) {
    if (!window.confirm("Delete this application?")) return;
    try { await api(`/api/applications/${id}`, { token, method: "DELETE" }); setApplications(items => items.filter(item => item._id !== id)); setMessage("Application deleted."); }
    catch (err) { setMessage(err.message); }
  }

  const filtered = useMemo(() => applications.filter(app => {
    const statusMatch = filter === "All" || app.status === filter;
    const haystack = `${app.company} ${app.role} ${app.location} ${app.notes}`.toLowerCase();
    return statusMatch && haystack.includes(query.toLowerCase());
  }), [applications, filter, query]);

  const counts = useMemo(() => Object.fromEntries(["All", ...STATUSES].map(status => [status, status === "All" ? applications.length : applications.filter(a => a.status === status).length])), [applications]);

  if (!token) return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="brand"><span className="brand-icon">J</span> Trackwise</div>
        <div className="story-content">
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Make your job search feel <em>less like a job.</em></h1>
          <p>Keep every application, follow-up, and interview organized in one calm, focused workspace.</p>
          <div className="story-points"><span>✓ One clear overview</span><span>✓ Progress you can see</span><span>✓ Your search, your pace</span></div>
        </div>
        <span className="story-footer">A personal workspace for your next move.</span>
      </section>
      <section className="auth-panel">
        <div className="dev-pill"><span /> WORK IN PROGRESS</div>
        <div className="auth-card">
          <div className="mobile-brand brand"><span className="brand-icon">J</span> Trackwise</div>
          <span className="eyebrow">{authMode === "login" ? "WELCOME BACK" : "LET'S GET STARTED"}</span>
          <h2>{authMode === "login" ? "Sign in to your space" : "Create your account"}</h2>
          <p className="muted">{authMode === "login" ? "Pick up where your job search left off." : "A little organization goes a long way."}</p>
          {message && <div className="notice error">{message}</div>}
          <form className="stack-form" onSubmit={handleAuth}>
            {authMode === "register" && <label>Full name<input value={auth.name} onChange={e => setAuth({ ...auth, name: e.target.value })} placeholder="Your name" required minLength="2" /></label>}
            <label>Email address<input type="email" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} placeholder="At least 8 characters" minLength="8" required /></label>
            <button className="primary wide" disabled={busy}>{busy ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
          </form>
          <p className="switch-auth">{authMode === "login" ? "New to Trackwise?" : "Already have an account?"} <button className="text-button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setMessage(""); }}>{authMode === "login" ? "Create an account" : "Sign in"}</button></p>
          <p className="security-note">🔒 Your applications are private to your account.</p>
        </div>
      </section>
    </main>
  );

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-icon">J</span> Trackwise</div>
        <div className="sidebar-label">WORKSPACE</div>
        <button className="nav-item active"><span>▦</span> Applications <span className="nav-count">{applications.length}</span></button>
        <div className="sidebar-bottom">
          <div className="profile-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>
          <div className="profile-info"><strong>{user?.name || "Your account"}</strong><small>{user?.email || ""}</small></div>
          <button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out">↗</button>
        </div>
      </aside>
      <section className="main-panel">
        <header className="topbar"><div><span className="eyebrow">YOUR CAREER WORKSPACE</span><h1>Applications</h1></div><div className="top-actions"><span className="dev-pill"><span /> IN DEVELOPMENT</span><button className="primary" onClick={startCreate}>＋ Add application</button></div></header>
        <div className="welcome-row"><div><h2>Keep your momentum going{user?.name ? `, ${user.name.split(" ")[0]}` : ""}.</h2><p className="muted">Every small step brings the next opportunity closer.</p></div><div className="today-date">{new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div></div>
        {message && <div className={`notice ${message.includes("error") ? "error" : ""}`}>{message}<button onClick={() => setMessage("")}>×</button></div>}
        <section className="stats-grid">
          <div className="stat-card"><div className="stat-top"><span>Total applications</span><span className="stat-icon violet">▦</span></div><strong>{counts.All}</strong><small>Across your job search</small></div>
          <div className="stat-card"><div className="stat-top"><span>In progress</span><span className="stat-icon blue">◷</span></div><strong>{counts.Applied + counts.Interview}</strong><small>Applied or interviewing</small></div>
          <div className="stat-card"><div className="stat-top"><span>Interviews</span><span className="stat-icon amber">✦</span></div><strong>{counts.Interview}</strong><small>Conversations underway</small></div>
          <div className="stat-card"><div className="stat-top"><span>Offers</span><span className="stat-icon green">↗</span></div><strong>{counts.Offer}</strong><small>New possibilities</small></div>
        </section>
        <section className="applications-section">
          <div className="section-heading"><div><h2>Your applications</h2><p className="muted">A little progress, one application at a time.</p></div><div className="search-box"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applications…" /></div></div>
          <div className="filters">{["All", ...STATUSES].map(status => <button key={status} onClick={() => setFilter(status)} className={`filter-chip ${filter === status ? "selected" : ""}`}>{status}<span>{counts[status]}</span></button>)}</div>
          {showForm && <form className="application-form" onSubmit={saveApplication}>
            <div className="form-heading"><h3>{editingId ? "Edit application" : "Add an application"}</h3><button type="button" className="icon-button" onClick={() => setShowForm(false)}>×</button></div>
            <div className="form-grid">
              <label>Company *<input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required maxLength="120" placeholder="e.g. Acme Inc." /></label>
              <label>Job title *<input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} required maxLength="120" placeholder="e.g. Frontend Developer" /></label>
              <label>Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></label>
              <label>Application date<input type="date" value={form.appliedDate} onChange={e => setForm({ ...form, appliedDate: e.target.value })} /></label>
              <label>Location<input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / Hyderabad" /></label>
              <label>Job URL<input type="url" value={form.jobUrl} onChange={e => setForm({ ...form, jobUrl: e.target.value })} placeholder="https://…" /></label>
              <label className="full-width">Notes<textarea rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Recruiter, follow-up, interview details…" /></label>
            </div>
            <div className="form-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Add application"}</button></div>
          </form>}
          {filtered.length === 0 ? <div className="empty-state"><div className="empty-art">↗</div><h3>{applications.length ? "No matching applications" : "Your next opportunity starts here"}</h3><p>{applications.length ? "Try another search or status filter." : "Add your first application to start building your career story."}</p>{!applications.length && <button className="primary" onClick={startCreate}>＋ Add your first application</button>}</div> :
            <div className="application-list">{filtered.map(app => <article className="application-card" key={app._id}>
              <div className="company-logo">{app.company.slice(0, 1).toUpperCase()}</div>
              <div className="application-main"><div className="application-title"><h3>{app.role}</h3><span className={`status status-${app.status.toLowerCase()}`}>{app.status}</span></div><p className="company-name">{app.company}</p><div className="application-meta"><span>⌖ {app.location || "Location not specified"}</span><span>▦ {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "Date not set"}</span>{app.jobUrl && <a href={app.jobUrl} target="_blank" rel="noreferrer">View listing ↗</a>}</div>{app.notes && <p className="app-notes">{app.notes}</p>}</div>
              <div className="card-actions"><button className="secondary small" onClick={() => startEdit(app)}>Edit</button><button className="icon-button danger-text" onClick={() => deleteApplication(app._id)} title="Delete" aria-label={`Delete ${app.role}`}>⌫</button></div>
            </article>)}</div>}
        </section>
        <footer className="footer-note">Built for your next chapter <span>·</span> Trackwise <span>·</span> <strong>Work in progress</strong></footer>
      </section>
    </main>
  );
}
