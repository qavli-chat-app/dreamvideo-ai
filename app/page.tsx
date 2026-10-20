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
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [generatedName, setGeneratedName] = useState('');

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
        setServiceStatus(data.generation === 'disabled-until-provider-setup' ? 'Website online · Cloud AI provider not connected' : data.generation === 'adapter-not-implemented' ? 'Website online · Cloud AI provider not connected' : 'Website online');
      })
      .catch(() => setServiceStatus('Service status unavailable'));
    return () => {
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
    };
    // The object URL is cleaned up when the component unmounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setStatus('Concept saved on this device.');
  }

  async function generateMotionVideo() {
    if (prompt.trim().length < 5 || isGenerating) return;
    if (typeof window === 'undefined' || !('MediaRecorder' in window)) {
      setStatus('This browser cannot export video. Try the latest Chrome browser on your device.');
      return;
    }
    setIsGenerating(true);
    setStatus('Creating your motion video in this browser… keep this page open.');
    try {
      const canvas = document.createElement('canvas');
      const dimensions = ratio === '16:9' ? [1280, 720] : ratio === '1:1' ? [800, 800] : [720, 1280];
      canvas.width = dimensions[0];
      canvas.height = dimensions[1];
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not available in this browser.');
      const w = canvas.width, h = canvas.height;
      const lines: string[] = [];
      const words = prompt.trim().split(/\s+/);
      let line = '';
      const maxChars = ratio === '16:9' ? 27 : 19;
      for (const word of words) {
        if ((line + ' ' + word).trim().length > maxChars && line) { lines.push(line); line = word; }
        else line = (line + ' ' + word).trim();
      }
      if (line) lines.push(line);
      const titleLines = lines.slice(0, ratio === '16:9' ? 4 : 6);
      const durationMs = Number(duration) * 1000;
      const stream = canvas.captureStream(30);
      const mimeType = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      const finished = new Promise<Blob>((resolve, reject) => {
        recorder.onerror = () => reject(new Error('The browser could not encode the video. Try Chrome or a shorter duration.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || 'video/webm' }));
      });
      const start = performance.now();
      const draw = (now: number) => {
        const t = Math.min(1, (now - start) / durationMs);
        const gradient = ctx.createLinearGradient(w * (0.15 + 0.35 * Math.sin(t * Math.PI * 2)), 0, w, h);
        if (style === 'futuristic') { gradient.addColorStop(0, '#070b24'); gradient.addColorStop(.5, '#182e63'); gradient.addColorStop(1, '#47156b'); }
        else if (style === 'animation') { gradient.addColorStop(0, '#32115e'); gradient.addColorStop(.5, '#6d3ac4'); gradient.addColorStop(1, '#f28cba'); }
        else if (style === 'educational') { gradient.addColorStop(0, '#092c3c'); gradient.addColorStop(.5, '#164e63'); gradient.addColorStop(1, '#4f46a5'); }
        else if (style === 'realistic') { gradient.addColorStop(0, '#14213d'); gradient.addColorStop(.55, '#4a3f65'); gradient.addColorStop(1, '#b56c73'); }
        else { gradient.addColorStop(0, '#100b2e'); gradient.addColorStop(.52, '#42216b'); gradient.addColorStop(1, '#b65e8b'); }
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h);
        const glowX = w * (.5 + .25 * Math.sin(t * Math.PI * 2));
        const glowY = h * (.31 + .045 * Math.cos(t * Math.PI * 2));
        const glow = ctx.createRadialGradient(glowX, glowY, 4, glowX, glowY, Math.min(w, h) * .34);
        glow.addColorStop(0, 'rgba(255,225,186,.38)'); glow.addColorStop(1, 'rgba(255,225,186,0)');
        ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
        for (let i = 0; i < 42; i++) {
          const x = ((i * 137.5 + t * w * (.08 + (i % 4) * .025)) % w);
          const y = (i * 83.7) % h;
          ctx.globalAlpha = .18 + .48 * ((Math.sin(t * 8 + i) + 1) / 2);
          ctx.fillStyle = i % 3 === 0 ? '#f4d7a2' : '#ffffff';
          ctx.beginPath(); ctx.arc(x, y, Math.max(1, w / 500), 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = Math.max(1, w / 800);
        ctx.beginPath(); ctx.ellipse(w / 2, h * .34, w * (.22 + .015 * Math.sin(t * 6)), h * .055, -.12 + .05 * Math.sin(t * 5), 0, Math.PI * 2); ctx.stroke();
        const fontSize = Math.min(w / 12, h / (titleLines.length * 2.8), 68);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,.42)'; ctx.shadowBlur = 18;
        ctx.fillStyle = '#fff8ed'; ctx.font = `700 ${fontSize}px Arial, sans-serif`;
        const lineHeight = fontSize * 1.25;
        const textY = h * .53 - ((titleLines.length - 1) * lineHeight) / 2 + (1 - t) * h * .025;
        titleLines.forEach((text, index) => ctx.fillText(text, w / 2, textY + index * lineHeight, w * .84));
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,238,205,.9)'; ctx.font = `600 ${Math.max(12, w / 55)}px Arial, sans-serif`;
        ctx.fillText('DREAMVIDEO  ✦  MOTION STUDIO', w / 2, h * .88);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(w * .12, h * .94, w * .76, Math.max(2, h / 500));
        ctx.fillStyle = '#e7c98b'; ctx.fillRect(w * .12, h * .94, w * .76 * t, Math.max(2, h / 500));
        if (t < 1) requestAnimationFrame(draw);
        else {
          // Hold the final frame briefly so the video ends cleanly.
          window.setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 250);
        }
      };
      recorder.start(250);
      requestAnimationFrame(draw);
      const blob = await finished;
      stream.getTracks().forEach(track => track.stop());
      if (!blob.size) throw new Error('The browser returned an empty video. Please retry.');
      if (generatedUrl) URL.revokeObjectURL(generatedUrl);
      const url = URL.createObjectURL(blob);
      setGeneratedUrl(url);
      setGeneratedName(`dreamvideo-${Date.now()}.webm`);
      setStatus('Your motion video is ready. Preview it below or save the WebM file.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Could not create video in this browser.');
    } finally {
      setIsGenerating(false);
    }
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
      <p className="subhead">Turn a prompt into a cinematic animated motion video, right in your browser. No API key or paid plan required.</p>
      <div className="serviceBanner"><span className="serviceDot" /> <span>{serviceStatus} · Free local motion-video export is built in</span><a href="/api/health" target="_blank" rel="noreferrer">Health ↗</a></div>
      <div className="workspace">
        <div className="workspaceHead"><div><span className="liveDot"/> <b>CREATE WORKSPACE</b></div><span className="privateTag">✧ Local browser rendering</span></div>
        <div className="modeTabs">
          <button className={mode === 'text-to-video' ? 'active' : ''} onClick={() => { setMode('text-to-video'); setStatus(''); }}>✎ &nbsp;Text to motion video</button>
          <button className={mode === 'image-to-video' ? 'active' : ''} onClick={() => { setMode('image-to-video'); setStatus('Image-to-video is not connected. Use text-to-motion to create a video now.'); }}>▧ &nbsp;Image to video <small>NOT CONNECTED</small></button>
        </div>
        {mode === 'image-to-video' && <p className="notice">Image-to-video AI is not connected. Switch to text-to-motion video to create an animated clip now.</p>}
        <label className="fieldLabel" htmlFor="prompt">DESCRIBE YOUR VIDEO</label>
        <textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={2000} placeholder="A dreamy cinematic scene of a lone traveler crossing a glowing lavender desert at sunset…" />
        <div className="promptMeta"><span>{prompt.length}/2000 characters</span><button type="button" onClick={() => { setPrompt(''); setStatus(''); }}>Clear prompt</button></div>
        <div className="examples"><span>QUICK START IDEAS</span>{examples.map(x => <button key={x} onClick={() => { setPrompt(x); setMode('text-to-video'); setStatus(''); }}>↗ {x}</button>)}</div>
        <div className="settings">
          <label>ASPECT RATIO<select value={ratio} onChange={e => setRatio(e.target.value)}><option value="9:16">9:16 · Portrait</option><option value="16:9">16:9 · Landscape</option><option value="1:1">1:1 · Square</option></select></label>
          <label>VISUAL STYLE<select value={style} onChange={e => setStyle(e.target.value)}><option value="cinematic">Cinematic</option><option value="animation">Animation</option><option value="realistic">Realistic</option><option value="educational">Educational</option><option value="futuristic">Futuristic</option></select></label>
          <label>VIDEO LENGTH<select value={duration} onChange={e => setDuration(e.target.value)}>{['5','10','15','20'].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></label>
        </div>
        <div className="actionRow">
          <button className="saveConcept" onClick={saveConcept} disabled={prompt.trim().length < 5}>Save concept <span>＋</span></button>
          <button className="generate" disabled={!prompt.trim() || mode !== 'text-to-video' || isGenerating} onClick={generateMotionVideo}><span>✦</span> {isGenerating ? 'Creating video…' : 'Create motion video'} <b>→</b></button>
        </div>
        {status && <p className="status" role="status">{status}</p>}
        {isGenerating && <p className="progressNote">Keep this page open while your device renders the clip. Longer videos may take a little while on a phone.</p>}
        {generatedUrl && <div className="videoResult"><div className="videoResultHead"><span>✦ YOUR VIDEO</span><span>WEBM · {duration}s</span></div><video className="videoPreview" src={generatedUrl} controls playsInline /> <a className="downloadVideo" href={generatedUrl} download={generatedName}>Download video <span>↓</span></a></div>}
        <p className="disclaimer">This free built-in tool creates an animated text-and-motion video locally in your browser. It does not synthesize AI footage of real scenes. Cloud AI text-to-video and image-to-video still need a compatible hosted model.</p>
      </div>
    </section>
    <section className="projects" id="projects">
      <div className="projectsHead"><div><div className="sectionKicker">YOUR CREATIVE LIBRARY</div><h2>Saved concepts</h2></div><span className="countPill">{saved.length} / 30</span></div>
      {!saved.length ? <div className="emptyState"><span>✧</span><h3>Your next idea starts here</h3><p>Write a prompt above and tap “Save concept”. Your saved concepts stay in this browser on this device.</p></div> :
        <div className="savedGrid">{saved.map(item => <article className="savedCard" key={item.id}><div className="savedCardTop"><span>{item.style}</span><span>{item.ratio}</span></div><p>{item.prompt}</p><div className="savedMeta">{item.duration}s planned · {item.savedAt}</div><div className="savedActions"><button onClick={() => { setPrompt(item.prompt); setMode('text-to-video'); setRatio(item.ratio); setStyle(item.style); setDuration(item.duration); setStatus('Concept loaded into the editor.'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Edit concept</button><button onClick={() => setSaved(current => current.filter(x => x.id !== item.id))}>Delete</button></div></article>)}</div>}
      {!!saved.length && <button className="clearLibrary" onClick={() => { setSaved([]); setStatus('Saved concepts cleared from this browser.'); }}>Clear saved library</button>}
    </section>
    <section className="how" id="how"><div className="sectionKicker">BUILT FOR CREATIVE WORKFLOWS</div><h2>From a spark to a scene.</h2><div className="steps"><article><span>01</span><h3>Describe your idea</h3><p>Write the scene or story you want to express.</p></article><article><span>02</span><h3>Choose a format</h3><p>Set portrait, landscape, square, style, and clip length.</p></article><article><span>03</span><h3>Render and download</h3><p>Render an animated video in your browser and download the WebM file.</p></article></div></section>
    <footer><a className="brand" href="#"><span className="brandMark">✦</span> dreamvideo<span className="brandAI">AI</span></a><span>Free local motion-video studio · Cloud AI not yet connected</span></footer>
  </main>;
}
