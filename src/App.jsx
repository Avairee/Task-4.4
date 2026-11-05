import React, { useEffect, useMemo, useState } from 'react';

const STORE = 'acl-foundboard-v3';
const seed = [
  { id: 'f1', title: 'Black backpack', category: 'accessories', status: 'lost', location: 'Library - second floor', description: 'Black backpack with a small red keychain. Left near the study desks.', owner: 'you', created: 'Oct 23', emoji: '🎒' },
  { id: 'f2', title: 'Dark backpack', category: 'accessories', status: 'found', location: 'Library - main stairwell', description: 'Found a dark backpack with a small red keychain near the library stairs.', owner: 'other', created: 'Oct 24', emoji: '🎒', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f3', title: 'Student ID card', category: 'documents', status: 'found', location: 'Near Gate 3', description: 'A student card was turned in. No personal details are published.', owner: 'other', created: 'Oct 24', emoji: '🪪', collectionPoint: 'Student Services Office', handoverStatus: 'received' },
  { id: 'f4', title: 'Wireless earbuds', category: 'electronics', status: 'lost', location: 'Main cafeteria', description: 'White earbuds in a distinctive blue case. Lost on Monday.', owner: 'other', created: 'Oct 24', emoji: '🎧' },
  { id: 'f5', title: 'Earbuds in blue case', category: 'electronics', status: 'found', location: 'Cafeteria entrance', description: 'White earbuds in a blue charging case found near the coffee counter.', owner: 'other', created: 'Oct 25', emoji: '🎧', collectionPoint: '', handoverStatus: 'reported' },
  { id: 'f6', title: 'Blue sports bottle', category: 'other', status: 'lost', location: 'Sports Hall - lockers', description: 'Tall blue metal water bottle, possibly left after practice.', owner: 'other', created: 'Oct 25', emoji: '🥤' },
  { id: 'f7', title: 'Metal water bottle', category: 'other', status: 'found', location: 'Sports Hall - benches', description: 'Blue reusable metal bottle found after a basketball session.', owner: 'other', created: 'Oct 25', emoji: '🥤', collectionPoint: 'Campus Security Desk', handoverStatus: 'received' },
  { id: 'f8', title: 'Engineering lab coat', category: 'clothing', status: 'claimed', location: 'Building C', description: 'Owner verified the item and collected it from the reception desk.', owner: 'you', created: 'Oct 22', emoji: '🥼', collectionPoint: 'Library Reception', handoverStatus: 'released' },
  { id: 'f9', title: 'Small notebook', category: 'other', status: 'lost', location: 'C7 lecture room', description: 'Brown cover with handwritten engineering notes.', owner: 'other', created: 'Oct 25', emoji: '📒' },
  { id: 'f10', title: 'Scientific calculator', category: 'electronics', status: 'lost', location: 'B2 lecture hall', description: 'Black scientific calculator with a protective cover.', owner: 'other', created: 'Oct 26', emoji: '🧮' },
  { id: 'f11', title: 'Calculator', category: 'electronics', status: 'found', location: 'B2 study area', description: 'Scientific calculator with a black cover, found on a desk.', owner: 'you', created: 'Oct 26', emoji: '🧮', collectionPoint: 'Library Reception', handoverStatus: 'received' },
  { id: 'f12', title: 'Canvas tote bag', category: 'accessories', status: 'lost', location: 'Main campus bus stop', description: 'Beige tote with green writing on one side.', owner: 'other', created: 'Oct 26', emoji: '👜' },
  { id: 'f13', title: 'USB flash drive', category: 'electronics', status: 'found', location: 'Building A computer lab', description: 'A small black flash drive was found beside a workstation.', owner: 'other', created: 'Oct 27', emoji: '💾', collectionPoint: '', handoverStatus: 'reported' },
];
const categories = ['all', 'electronics', 'clothing', 'documents', 'accessories', 'other'];
const statuses = ['lost', 'found', 'claimed'];
const clean = { title: '', category: '', status: '', location: '', description: '' };

function getSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    return Array.isArray(saved) ? saved : seed;
  } catch {
    return seed;
  }
}

const cap = (value) => value.charAt(0).toUpperCase() + value.slice(1);

function validate(form, reports, id) {
  const errors = {};
  if (!form.title.trim() || form.title.trim().length < 2) errors.title = 'Enter at least 2 characters.';
  if (!categories.slice(1).includes(form.category)) errors.category = 'Choose an item category.';
  if (!statuses.includes(form.status)) errors.status = 'Choose lost, found or claimed.';
  const duplicate = reports.some((report) => report.id !== id
    && report.title.toLowerCase() === form.title.trim().toLowerCase()
    && (report.location || '').toLowerCase() === (form.location || '').trim().toLowerCase());
  if (duplicate) {
    errors.title = 'That title is already reported at this location.';
    errors.location = 'Try a more specific location if this is a different item.';
  }
  return errors;
}

export default function App() {
  const [items, setItems] = useState(getSaved);
  const [page, setPage] = useState('board');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewStatus, setViewStatus] = useState('all');
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState(clean);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState('');
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => localStorage.setItem(STORE, JSON.stringify(items)), [items]);

  const filtered = useMemo(() => items.filter((item) => (
    (cat === 'all' || item.category === cat)
    && (viewStatus === 'all' || item.status === viewStatus)
    && (filterStatus === 'all' || item.status === filterStatus)
    && `${item.title} ${item.location} ${item.description}`.toLowerCase().includes(q.toLowerCase())
  )), [items, q, cat, filterStatus, viewStatus]);

  const displayStatus = viewStatus !== 'all' ? viewStatus : filterStatus;
  const hasActiveFilters = Boolean(q.trim() || cat !== 'all' || filterStatus !== 'all');
  const boardColumns = [
    { key: 'lost', title: 'LOST', sub: 'Searching for these things', icon: '↗' },
    { key: 'found', title: 'FOUND', sub: 'Looking for the owners', icon: '⌁' },
    { key: 'claimed', title: 'CLAIMED', sub: 'Back where they belong', icon: '✓' },
  ].filter((column) => displayStatus === 'all' || column.key === displayStatus);

  function clearFilters() {
    setQ('');
    setCat('all');
    setFilterStatus('all');
  }

  function showStatus(status) {
    setViewStatus(status);
    setFilterStatus('all');
    setPage('board');
    setMessage('');
  }

  function create() {
    setCurrent(null);
    setForm({ ...clean });
    setFieldErrors({});
    setPage('form');
  }

  function edit(row) {
    if (row.owner !== 'you') return;
    setCurrent(row.id);
    setForm({ title: row.title, category: row.category, status: row.status, location: row.location, description: row.description });
    setFieldErrors({});
    setOpenMenu(null);
    setPage('form');
  }

  function submit(event) {
    event.preventDefault();
    const errors = validate(form, items, current);
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      requestAnimationFrame(() => document.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }
    const data = {
      ...form,
      title: form.title.trim(),
      location: form.location.trim(),
      description: form.description.trim(),
      owner: 'you',
      created: 'Today',
      emoji: current ? items.find((item) => item.id === current)?.emoji : '📌',
      ...(current ? {} : { collectionPoint: '', handoverStatus: 'reported' }),
    };
    if (current) {
      setItems(items.map((item) => (item.id === current ? { ...item, ...data } : item)));
      setMessage('Report updated.');
    } else {
      setItems([{ id: `f-${Date.now()}`, ...data }, ...items]);
      setMessage('Your report has been posted.');
    }
    setFieldErrors({});
    setPage('board');
    setCurrent(null);
  }

  function reset() {
    setItems(seed);
    setViewStatus('all');
    clearFilters();
    setMessage('Example reports restored.');
  }

  const fieldProps = (name) => ({
    'aria-invalid': fieldErrors[name] ? 'true' : undefined,
    'aria-describedby': fieldErrors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="notice-app">
      <header className="header">
        <div className="headline">
          <span className="sun" aria-hidden="true">✳</span>
          <button onClick={() => { setViewStatus('all'); clearFilters(); setPage('board'); }} className="wordmark">FOUND<span>on campus</span></button>
          <p>Community noticeboard</p>
        </div>
        <nav className="header-links" aria-label="Noticeboard views">
          <button className={viewStatus === 'all' && page === 'board' ? 'active' : ''} onClick={() => { setViewStatus('all'); clearFilters(); setPage('board'); }}>Noticeboard</button>
          <button className={viewStatus === 'lost' ? 'active' : ''} onClick={() => showStatus('lost')}>Missing items</button>
          <button className={viewStatus === 'found' ? 'active' : ''} onClick={() => showStatus('found')}>Recently found</button>
        </nav>
        <button className="report-button" onClick={create}>+ Post a report</button>
      </header>

      <div className="ruleline"><span>SEARCH • DISCOVER • REUNITE</span><span>Helping lost things find their way back.</span></div>

      {page === 'board' ? (
        <main className="workspace">
          <aside className="filters">
            <p className="kicker">YOUR NOTICEBOARD</p>
            <h1>Lost something?<br /><em>You're in the right place.</em></h1>
            <p className="intro">Browse what the campus community has shared or post what you've lost or found.</p>
            <div className="filterbox">
              <div className="filter-heading"><h3>Browse reports</h3><span className="live-label">Live filters</span></div>
              <label>Search items<input value={q} onChange={(event) => setQ(event.target.value)} placeholder="What are you looking for?" /></label>
              <label>Item category<select value={cat} onChange={(event) => setCat(event.target.value)}><option value="all">All categories</option>{categories.slice(1).map((category) => <option key={category} value={category}>{cap(category)}</option>)}</select></label>
              <label>Report status<select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{cap(status)}</option>)}</select></label>
              <div className="filter-summary" aria-live="polite"><strong>{filtered.length}</strong> {filtered.length === 1 ? 'report' : 'reports'} match your view.</div>
              <button className="clear-filter-button" onClick={clearFilters} disabled={!hasActiveFilters}>Clear all filters</button>
            </div>
            <div className="side-message"><span aria-hidden="true">📍</span><strong>Lost or found something?</strong><p>Every report gets us a little closer.</p><button onClick={create}>Share your report →</button></div>
            <button className="reset" onClick={reset}>Reset demo data</button>
          </aside>

          <section className="board">
            <div className="board-top"><div><p className="kicker">CAMPUS COMMUNITY</p><h2>{viewStatus === 'lost' ? 'Missing items' : viewStatus === 'found' ? 'Recently found' : filterStatus !== 'all' ? `${cap(filterStatus)} reports` : 'Latest notices'} <span>({filtered.length})</span></h2></div><span className="time-note">Updated today</span></div>
            {hasActiveFilters && <div className="active-filters" aria-label="Active filters"><span>Showing filtered results</span>{q.trim() && <button onClick={() => setQ('')}>Search: “{q.trim()}” ×</button>}{cat !== 'all' && <button onClick={() => setCat('all')}>Category: {cap(cat)} ×</button>}{filterStatus !== 'all' && <button onClick={() => setFilterStatus('all')}>Status: {cap(filterStatus)} ×</button>}</div>}
            {message && <div className="message" role="status">{message}<button aria-label="Dismiss message" onClick={() => setMessage('')}>×</button></div>}
            <div className={`board-grid ${displayStatus !== 'all' ? 'single-column-view' : ''}`}>{boardColumns.map((column) => {
              const reports = filtered.filter((item) => item.status === column.key);
              return <div className="board-column" key={column.key}>
                <div className="column-head"><span className={`col-icon ${column.key}`} aria-hidden="true">{column.icon}</span><div><strong>{column.title}</strong><small>{column.sub}</small></div><span className="col-count">{reports.length}</span></div>
                <div className="sticky-list">{reports.map((item) => <article className="sticky" key={item.id}>
                  <div className="sticky-top"><span>{item.category}</span><span className={`status-badge ${item.status}`}>{cap(item.status)}</span><div className="menu-holder"><button className="menu" onClick={() => setOpenMenu(openMenu === item.id ? null : item.id)} aria-label={`Actions for ${item.title}`} aria-expanded={openMenu === item.id} aria-haspopup="menu">•••</button>{openMenu === item.id && <div className="menu-popup" role="menu">{item.owner === 'you' ? <button role="menuitem" onClick={() => edit(item)}>Edit your report</button> : <span>Reported by another student</span>}</div>}</div></div>
                  <div className="sticky-emoji" aria-hidden="true">{item.emoji}</div><h3>{item.title}</h3><p>{item.description || 'No additional description.'}</p>
                  {item.status !== 'lost' && <div className={`handover-note ${item.handoverStatus}`}><strong>{item.handoverStatus === 'received' && item.collectionPoint ? 'Ready to recover' : item.handoverStatus === 'released' ? 'Reunited' : 'Reported only'}</strong><span>{item.handoverStatus === 'received' && item.collectionPoint ? `Held at ${item.collectionPoint}` : item.handoverStatus === 'released' ? 'Collected by the verified owner' : 'Not yet confirmed at a collection point'}</span></div>}
                  <div className="sticky-bottom"><span>⌖ {item.location || 'Location not provided'}</span><small>{item.created}</small></div>
                </article>)}{reports.length === 0 && <div className="empty-column"><strong>No {column.key} reports match.</strong><span>Try clearing a filter to see more.</span>{hasActiveFilters && <button onClick={clearFilters}>Clear filters</button>}</div>}</div>
              </div>;
            })}</div>
          </section>
        </main>
      ) : (
        <main className="report-page">
          <div className="crumbs"><button onClick={() => setPage('board')}>← Noticeboard</button><span>/</span><span>{current ? 'Edit report' : 'Report an item'}</span></div>
          <div className="report-layout"><div className="report-intro"><span className="seal" aria-hidden="true">✳</span><p className="kicker">HELP THE COMMUNITY</p><h1>{current ? 'Update your report.' : 'Tell us what happened.'}</h1><p>Small details can help someone recognize their belongings.</p><div className="paper-note">Your report will appear on the public campus noticeboard with the details you provide.</div></div>
            <section className="form-paper"><header><p>{current ? 'EDIT NOTICE / FORM 01' : 'NEW NOTICE / FORM 01'}</p><h2>{current ? 'Edit report' : 'Report an item'}</h2><span className="required-note">* Required fields</span></header>
              <form onSubmit={submit} noValidate>
                <label><span>Item title <b>*</b></span><input {...fieldProps('title')} required value={form.title} onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))} placeholder="e.g., Black backpack" />{fieldErrors.title && <span className="field-error" id="title-error">{fieldErrors.title}</span>}</label>
                <label><span>Status <b>*</b></span><select {...fieldProps('status')} required value={form.status} onChange={(event) => setForm((state) => ({ ...state, status: event.target.value }))}><option value="">Choose one</option>{statuses.map((status) => <option key={status} value={status}>{cap(status)}</option>)}</select>{fieldErrors.status && <span className="field-error" id="status-error">{fieldErrors.status}</span>}</label>
                <label><span>Category <b>*</b></span><select {...fieldProps('category')} required value={form.category} onChange={(event) => setForm((state) => ({ ...state, category: event.target.value }))}><option value="">Select item category</option>{categories.slice(1).map((category) => <option key={category} value={category}>{cap(category)}</option>)}</select>{fieldErrors.category && <span className="field-error" id="category-error">{fieldErrors.category}</span>}</label>
                <label><span>Last known location</span><input {...fieldProps('location')} value={form.location} onChange={(event) => setForm((state) => ({ ...state, location: event.target.value }))} placeholder="Location (optional)" />{fieldErrors.location && <span className="field-error" id="location-error">{fieldErrors.location}</span>}</label>
                <label><span>More details</span><textarea rows="6" value={form.description} onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))} placeholder="Describe your item" /></label>
                {Object.keys(fieldErrors).length > 0 && <div className="form-error" role="alert">Please fix the highlighted fields before publishing.</div>}
                <div className="form-actions"><button type="button" onClick={() => setPage('board')}>Go back</button><button className="report-button" type="submit">{current ? 'Save report' : 'Publish notice'}</button></div>
              </form>
            </section>
          </div>
        </main>
      )}
      <footer className="pagefooter"><span>FOUND / Campus noticeboard</span><span>Community project • Demo only</span></footer>
    </div>
  );
}
