'use client';
import { useState } from 'react';

const examples = ['A tiny astronaut walking through a field of glowing flowers', 'A cinematic rainy street in a futuristic city at blue hour', 'A paper dragon unfolding into a real flying creature'];
export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'text-to-video' | 'image-to-video'>('text-to-video');
  const [ratio, setRatio] = useState('9:16');
  const [style, setStyle] = useState('cinematic');
  const [duration, setDuration] = useState('5');
  const [status, setStatus] = useState('');
  async function generate() {
    setStatus('Checking generation service…');
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt, mode, aspectRatio: ratio, style, durationSeconds: Number(duration) }) });
      const data = await response.json();
      setStatus(data.error || (response.ok ? 'Job queued.' : 'Generation unavailable.'));
    } catch { setStatus('Could not reach the server. Please try again later.'); }
  }
  return <main className="shell">
    <nav className="nav"><a className="brand" href="#"><span className="brandMark">✦</span> dreamvideo<span className="brandAI">AI</span></a><span className="navPill"><i /> CREATIVE STUDIO</span><a className="navLink" href="#how">How it works ↗</a></nav>
    <section className="hero"><div className="eyebrow"><span>✦</span> YOUR IMAGINATION, IN MOTION</div><h1>Dream it.<br/><em>See it move.</em></h1><p className="subhead">Turn the scenes in your head into cinematic video concepts. Your next story starts with a single prompt.</p>
      <div className="workspace"><div className="workspaceHead"><div><span className="liveDot"/> <b>CREATE WORKSPACE</b></div><span className="privateTag">✧ Private by design</span></div>
        <div className="modeTabs"><button className={mode === 'text-to-video' ? 'active' : ''} onClick={() => setMode('text-to-video')}>✎ &nbsp;Text to video</button><button className={mode === 'image-to-video' ? 'active' : ''} onClick={() => setMode('image-to-video')}>▧ &nbsp;Image to video <small>PLANNED</small></button></div>
        {mode === 'image-to-video' && <p className="notice">Image-to-video uploads are not enabled in this starter yet. Switch to text-to-video to continue.</p>}
        <label className="fieldLabel" htmlFor="prompt">DESCRIBE YOUR VIDEO</label><textarea id="prompt" value={prompt} onChange={e => setPrompt(e.target.value)} maxLength={2000} placeholder="A dreamy cinematic scene of a lone traveler crossing a glowing lavender desert at sunset…" />
        <div className="examples"><span>NEED INSPIRATION?</span>{examples.map(x => <button key={x} onClick={() => setPrompt(x)}>↗ {x}</button>)}</div>
        <div className="settings"><label>ASPECT RATIO<select value={ratio} onChange={e => setRatio(e.target.value)}><option value="9:16">9:16 · Portrait</option><option value="16:9">16:9 · Landscape</option><option value="1:1">1:1 · Square</option></select></label><label>VISUAL STYLE<select value={style} onChange={e => setStyle(e.target.value)}><option value="cinematic">Cinematic</option><option value="animation">Animation</option><option value="realistic">Realistic</option><option value="educational">Educational</option><option value="futuristic">Futuristic</option></select></label><label>DURATION<select value={duration} onChange={e => setDuration(e.target.value)}>{['5','10','15','20'].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></label></div>
        <button className="generate" disabled={!prompt.trim() || mode !== 'text-to-video'} onClick={generate}><span>✦</span> Generate video concept <b>→</b></button>
        {status && <p className="status" role="status">{status}</p>}<p className="disclaimer">Generation is disabled until a real provider and secure backend are configured. No fake videos.</p>
      </div>
    </section>
    <section className="how" id="how"><div className="sectionKicker">MADE FOR YOUR NEXT BIG IDEA</div><h2>From a spark to a scene.</h2><div className="steps"><article><span>01</span><h3>Describe the moment</h3><p>Set the mood, motion, subject, and details in your own words.</p></article><article><span>02</span><h3>Shape your vision</h3><p>Choose a format, style, and duration for the concept you imagine.</p></article><article><span>03</span><h3>Bring it to life</h3><p>A verified video provider will be required before real generation can begin.</p></article></div></section>
    <footer><a className="brand" href="#"><span className="brandMark">✦</span> dreamvideo<span className="brandAI">AI</span></a><span>Made for curious minds · Preview build</span></footer>
  </main>;
}