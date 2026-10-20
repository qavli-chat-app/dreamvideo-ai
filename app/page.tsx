'use client';

import { useEffect, useState } from 'react';

type SavedConcept = { id: string; prompt: string; mode: 'text-to-video' | 'image-to-video'; ratio: string; style: string; duration: string; savedAt: string };
const STORAGE_KEY = 'dreamvideo-ai-concepts-v1';
const examples = [
  'A tiny astronaut walking through a field of glowing flowers',
  'A cinematic rainy street in a futuristic city at blue hour',
  'A paper dragon unfolding into a real flying creature'
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [ratio, setRatio] = useState('9:16');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('5');
  const [status, setStatus] = useState('');
  const [serviceStatus, setServiceStatus] = useState('Checking service…');
  const [saved, setSaved] = useState<SavedConcept[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setSaved(JSON.parse(stored) as SavedConcept[]);
    } catch { /* Storage may be unavailable; the workspace still works. */ }
    setReady(true);
    fetch('/api/health')
      .then(async response => {
        if (!response.ok) throw new Error('Health check failed');
        const data = await response.json();
        setServiceStatus(data.generation === 'disabled-until-provider-setup' ? 'Website online · Video engine not connected' : data.generation === 'adapter-not-implemented' ? 'Website online · Provider adapter missing' : 'Website online');
      })
      .catch(() => setServiceStatus('Service status unavailable'));
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)); } catch { /* Keep current session usable. */ }
  }, [saved, ready]);

  function saveConcept() {
    const clean = prompt.trim();
    if (clean.length < 5) { setStatus('Add a little more detail before saving your concept.'); return; }
    const item: SavedConcept = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, prompt: clean, mode, ratio, style, duration, savedAt: new Date().toLocaleString() };
    setSaved(current => [item, ...current].slice(0, 30));
    setStatus('Concept saved on this device. No video has been generated.');
  }

  async function generate() {
    setStatus('Checking video generation service…');
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode, aspectRatio: ratio, style, durationSeconds: Number(duration) })
      });
      const data = await response.json();
      setStatus(data.error || (response.ok ? 'Job queued.' : 'Generation unavailable.'));
    } catch { setStatus('Could not reach the server. Your concept can still be saved on this device.'); }
  }

  return <main className="shell">
    <nav className="nav">
      <a className="brand" href="#"><span className="brandMark">✦</span> dreamvideo<span className="brandAI">AI</span></a>
      <span className="navPill"><i /> CREATIVE STUDIO</span>
      <a className="navLink" href="#projects">My concepts ↓</a>
    </nav>
    <section className="hero">
      <div className="eyebrow"><span>✦</span> YOUR IMAGINATION, IN MOTION</div>
      <h1>Dream it.<br/><em>See it move.</em></h1>
      <p className="subhead">Build cinematic video ideas, keep your prompts organized, and prepare your next creation in one studio.</p>
      <div className="serviceBanner"><span className="serviceDot" /> <span>{serviceStatus}</span><a href="/api/health" target="_blank" rel="noreferrer">Health check ↗</a></div>
      <div className="workspace">
        <div className="workspaceHead"><div><span className="liveDot"/> <b>CREATE WORKSPACE</b></div><span className="privateTag">✧ Concepts stay in this browser</span></div>
        <div className="modeTabs">
          <button className={mode === 'text-to-video' ? 'active' : ''} onClick={() => { setMode('text-to-video'); setStatus(''); }}>✎ &nbsp;Text to video</button>
          <button className={mode === 'image-to-video' ? 'active' : ''} onClick={() => { setMode('image-to-video'); setStatus('Image-to-video is not connected yet. Use text-to-video to prepare a prompt.'); }}>▧ &nbsp;Image to video <small>NOT CONNECTED</small></button>
        </div>
        {mode === 'image-to-video' && <p className="notice">Image upload and image-to-video processing are not connected yet. You can still save your idea as a concept.</p>}
        <label className="fieldLabel" htmlFor="prompt">DESCRIBE YOUR VIDEO</label>
        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={2000} placeholder="A dreamy cinematic scene of a lone traveler crossing a glowing lavender desert at sunset…" />
        <div className="promptMeta"><span>{prompt.length}/2000 characters</span><button type="button" onClick={() => { setPrompt(''); setStatus(''); }}>Clear prompt</button></div>
        <div className="examples"><span>QUICK START IDEAS</span>{examples.map(x => <button key={x} onClick={() => { setPrompt(x); setStatus(''); }}>↗ {x}</button>)}</div>
        <div className="settings">
          <label>ASPECT RATIO<select value={ratio} onChange={e => setRatio(e.target.value)}><option value="9:16">9:16 · Portrait</option><option value="16:9">16:9 · Landscape</option><option value="1:1">1:1 · Square</option></select></label>
          <label>VISUAL STYLE<select value={style} onChange={e => setStyle(e.target.value)}><option value="cinematic">Cinematic</option><option value="animation">Animation</option><option value="realistic">Realistic</option><option value="educational">Educational</option><option value="futuristic">Futuristic</option></select></label>
          <label>PLANNED LENGTH<select value={duration} onChange={e => setDuration(e.target.value)}>{['5','10','15','20'].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></label>
        </div>
        <div className="actionRow">
          <button className="saveConcept" onClick={saveConcept} disabled={prompt.trim().length < 5}>Save concept <span>＋</span></button>
          <button className="generate" disabled={!prompt.trim() || mode !== 'text-to-video'} onClick={generate}><span>✦</span> Try video generation <b>→</b></button>
        </div>
        {status && <p className="status" role="status">{status}</p>}
        <p className="disclaimer">Honest preview: saving concepts works now. Real video generation requires a configured and tested video provider; this app will not pretend a video was created.</p>
      </div>
    </section>
    <section className="projects" id="projects">
      <div className="projectsHead"><div><div className="sectionKicker">YOUR CREATIVE LIBRARY</div><h2>Saved concepts</h2></div><span className="countPill">{saved.length} / 30</span></div>
      {!saved.length ? <div className="emptyState"><span>✧</span><h3>Your next idea starts here</h3><p>Write a prompt above and tap “Save concept”. Your saved concepts stay in this browser on this device.</p></div> :
        <div className="savedGrid">{saved.map(item => <article className="savedCard" key={item.id}><div className="savedCardTop"><span>{item.style}</span><span>{item.ratio}</span></div><p>{item.prompt}</p><div className="savedMeta">{item.duration}s planned · {item.savedAt}</div><div className="savedActions"><button onClick={() => { setPrompt(item.prompt); setMode('text-to-video'); setRatio(item.ratio); setStyle(item.style); setDuration(item.duration); setStatus('Concept loaded into the editor.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit concept</button><button onClick={() => setSaved(current => current.filter(x => x.id !== item.id))}>Delete</button></div></article>)}</div>}
      {!!saved.length && <button className="clearLibrary" onClick={() => { setSaved([]); setStatus('Saved concepts cleared from this browser.'); }}>Clear saved library</button>}
    </section>
    <section className="how" id="how"><div className="sectionKicker">BUILT FOR CREATIVE WORKFLOWS</div><h2>From a spark to a scene.</h2><div className="steps"><article><span>01</span><h3>Describe the moment</h3><p>Write the subject, movement, atmosphere, and camera details in your own words.</p></article><article><span>02</span><h3>Shape your vision</h3><p>Choose the aspect ratio, visual style, and planned length for your idea.</p></article><article><span>03</span><h3>Save and refine</h3><p>Keep up to 30 concepts on this device, reload them into the editor, or remove them anytime.</p></article></div></section>
    <footer><a className="brand" href="#"><span className="brandMark">✦</span> dreamvideo<span className="brandAI">AI</span></a><span>Creative studio · Video engine status shown honestly</span></footer>
  </main>;
}
