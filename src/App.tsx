import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Menu, Medal, Trophy, X } from 'lucide-react';
import { eventConfig } from './config/event';
import { gallery, highlights, leaderboard, schedule, sports, stats, teams } from './data/eventData';
import './styles.css';
import './brand.css';

const nav = [['Home','home'], ['Highlights','highlights'], ['Sports','sports'], ['Teams','teams'], ['Schedule','schedule'], ['Gallery','gallery']] as const;

function Countdown() {
  const [remaining, setRemaining] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = Math.max(0, new Date(eventConfig.date).getTime() - Date.now());
      setRemaining({ d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60 });
    };
    update(); const id = window.setInterval(update, 1000); return () => window.clearInterval(id);
  }, []);
  return <div className="countdown" aria-label="Countdown to event">{Object.entries(remaining).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2,'0')}</strong><span>{label === 'd' ? 'Days' : label === 'h' ? 'Hours' : label === 'm' ? 'Mins' : 'Secs'}</span></div>)}</div>;
}

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const [shown, setShown] = useState(0);
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (reduced) { setShown(value); return; }
      const start = performance.now(); const duration = 1400;
      const tick = (now: number) => { const progress = Math.min((now - start) / duration, 1); setShown(Math.round(value * (1 - Math.pow(1-progress,3)))); if (progress < 1) requestAnimationFrame(tick); }; requestAnimationFrame(tick); observer.disconnect();
    }, { threshold: .35 }); observer.observe(ref); return () => observer.disconnect();
  }, [ref, value, reduced]);
  return <div ref={setRef}><strong>{shown}{suffix}</strong></div>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const filtered = useMemo(() => filter === 'All' ? gallery : gallery.filter(item => item.category === filter), [filter]);
  const reveal = { initial: { opacity: 0, y: reduced ? 0 : 32 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .15 }, transition: { duration: .65 } };

  const closeMenu = () => setMenuOpen(false);
  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setLightbox(null); if (event.key === 'ArrowRight') setLightbox((lightbox + 1) % filtered.length); if (event.key === 'ArrowLeft') setLightbox((lightbox - 1 + filtered.length) % filtered.length); };
    window.addEventListener('keydown', onKey); document.body.style.overflow='hidden'; return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow=''; };
  }, [lightbox, filtered.length]);

  return <div className="app">
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Primary navigation">
        <a href="#home" className="brand" aria-label="Gadgeon Sports Day home"><span className="brand-mark"><img src={eventConfig.logoUrl} alt="Gadgeon" /></span><span>GADGEON<br/><b>SPORTS DAY</b></span></a>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>{nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={closeMenu}>{label}</a>)}</div>
        <a className="nav-cta" href={eventConfig.registrationUrl || '#register'} onClick={closeMenu}>Join the team <ArrowUpRight size={16}/></a>
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" aria-expanded={menuOpen}>{menuOpen ? <X/> : <Menu/>}</button>
      </nav>
    </header>

    <main>
      <section id="home" className="hero-section">
        <div className="hero-bg"/><div className="hero-grid"/><div className="orb orb-one"/><div className="orb orb-two"/><div className="speed-line line-one"/><div className="speed-line line-two"/>
        <div className="hero-content container">
          <motion.div initial={{opacity:0,x:-30}} animate={{opacity:1,x:0}} transition={{duration:.7}} className="eyebrow"><span/> THE GAME OF GREATNESS <b>2026</b></motion.div>
          <motion.h1 initial={{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:.85,delay:.12}}>GADGEON<br/><em>SPORTS DAY</em></motion.h1>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.35}} className="hero-bottom">
            <div><h2>ONE TEAM. ONE SPIRIT. ONE VICTORY.</h2><p>Celebrating the power of teamwork, passion, and performance.</p><div className="hero-actions"><a className="btn primary" href="#sports">Explore the Games <ArrowDown size={18}/></a><a className="btn ghost" href="#teams">Meet the Teams</a></div></div>
            <div className="countdown-card"><div className="countdown-head"><CalendarDays size={18}/> COUNTDOWN TO GAME DAY</div><Countdown/><div className="event-meta"><MapPin size={15}/> {eventConfig.venue}</div></div>
          </motion.div>
        </div>
        <a className="scroll-cue" href="#highlights" aria-label="Scroll to highlights"><span>Scroll to discover</span><ArrowDown size={18}/></a>
      </section>

      <section id="highlights" className="section highlights-section"><div className="container"><motion.div {...reveal} className="section-heading"><div><span className="kicker">THE SPIRIT OF SPORTS</span><h2>More than a <em>game.</em></h2></div><p>Four moments. One unforgettable experience.<br/>Built by people, powered by passion.</p></motion.div>
        <div className="highlight-grid">{highlights.map((item,i) => <motion.article {...reveal} transition={{duration:.55,delay:i*.08}} className="highlight-card" key={item.title}><span className="card-no">{item.number}</span><item.icon size={34}/><h3>{item.title}</h3><p>{item.text}</p><div className="card-line"/></motion.article>)}</div>
      </div></section>

      <section id="sports" className="section sports-section"><div className="container"><motion.div {...reveal} className="section-heading"><div><span className="kicker">CHOOSE YOUR ARENA</span><h2>SPORTS <em>LINEUP</em></h2></div><p>Every sport has a story.<br/>Find yours on the field.</p></motion.div>
        <div className="sports-grid">{sports.map((sport,i) => <motion.article {...reveal} transition={{duration:.55,delay:(i%4)*.07}} className="sport-card" key={sport.name}><img src={sport.image} alt={`${sport.name} placeholder sports image`} loading="lazy"/><div className="sport-shade"/><div className="sport-tag">0{i+1} / {sport.tag}</div><h3>{sport.name}</h3><span className="sport-arrow"><ArrowUpRight/></span></motion.article>)}</div>
      </div></section>

      <section id="teams" className="section teams-section"><div className="container"><motion.div {...reveal} className="section-heading"><div><span className="kicker">UNITED BY COLORS</span><h2>MEET THE <em>TEAMS</em></h2></div><p>Team names and identities shown as placeholders.<br/>Ready to replace with confirmed details.</p></motion.div>
        <div className="teams-layout"><div className="team-grid">{teams.map((team,i)=><motion.article {...reveal} transition={{duration:.55,delay:i*.06}} className="team-card" key={team.name}><div className="team-logo" style={{'--team':team.color} as React.CSSProperties}>{team.initials}</div><div><span>TEAM {String(i+1).padStart(2,'0')}</span><h3>{team.name}</h3><p>{team.members} members • {team.captain}</p></div></motion.article>)}</div>
        <motion.div {...reveal} className="leaderboard"><div className="board-head"><div><span>DEMO DATA</span><h3>Leaderboard</h3></div><Trophy/></div>{leaderboard.map((team,i)=><div className="board-row" key={team.name}><b>{i+1}</b><div className="mini-logo" style={{background:team.color}}>{team.initials}</div><strong>{team.name}</strong><span className="medals"><i title="Gold">{team.gold}</i><i title="Silver">{team.silver}</i><i title="Bronze">{team.bronze}</i></span><em>{team.points} pts</em></div>)}</motion.div></div>
      </div></section>

      <section id="schedule" className="section schedule-section"><div className="container"><motion.div {...reveal} className="section-heading"><div><span className="kicker">THE MATCH PLAN</span><h2>EVENT <em>SCHEDULE</em></h2></div><p>Editable placeholder schedule.<br/>Replace with confirmed event timings.</p></motion.div><div className="timeline">{schedule.map((item,i)=><motion.article {...reveal} transition={{duration:.55,delay:i*.07}} className="timeline-row" key={item.title}><div className="timeline-time"><Clock3 size={16}/><strong>{item.time}</strong></div><div className="timeline-dot"/><div className="timeline-card"><span>{item.status}</span><h3>{item.title}</h3><p><MapPin size={15}/>{item.venue}</p></div></motion.article>)}</div></div></section>

      <section id="gallery" className="section gallery-section"><div className="container"><motion.div {...reveal} className="section-heading gallery-head"><div><span className="kicker">GAME MOMENTS</span><h2>THE ENERGY <em>CAPTURED</em></h2></div><div className="filters" role="group" aria-label="Gallery filters">{['All','Action','Team','Celebration'].map(name=><button className={filter===name?'active':''} onClick={()=>setFilter(name)} key={name}>{name}</button>)}</div></motion.div><motion.div layout className="gallery-grid">{filtered.map((image,i)=><motion.button layout initial={{opacity:0}} animate={{opacity:1}} className="gallery-item" key={image.src} onClick={()=>setLightbox(i)} aria-label={`Open image: ${image.alt}`}><img src={image.src} alt={image.alt} loading="lazy"/><span>{image.category}</span></motion.button>)}</motion.div></div></section>

      <section className="section stats-section"><div className="container"><motion.div {...reveal} className="stats-label"><Medal size={18}/> SAMPLE FIGURES — READY TO UPDATE</motion.div><div className="stats-grid">{stats.map(stat=><motion.div {...reveal} className="stat" key={stat.label}><Counter value={stat.value} suffix={stat.suffix}/><span>{stat.label}</span></motion.div>)}</div></div></section>

      <section id="register" className="cta-section"><div className="cta-bg"/><div className="container cta-content"><motion.div {...reveal}><span className="kicker">THE FIELD IS CALLING</span><h2>READY TO PLAY.<br/><em>READY TO WIN.</em></h2><p>Bring your energy, represent your team, and make Sports Day 2026 unforgettable.</p></motion.div><motion.a {...reveal} className="btn primary cta-btn" href={eventConfig.registrationUrl || '#home'} onClick={eventConfig.registrationUrl ? undefined : (e)=>e.preventDefault()}>{eventConfig.registrationUrl ? 'Join the Celebration' : 'Join the Celebration — Link Placeholder'}<ArrowUpRight/></motion.a></div></section>
    </main>

    <footer><div className="container footer-grid"><div><a href="#home" className="brand footer-brand"><span className="brand-mark"><img src={eventConfig.logoUrl} alt="Gadgeon" /></span><span>GADGEON<br/><b>SPORTS DAY</b></span></a><p>One team. One spirit.<br/>One unforgettable day.</p></div><div><h3>Explore</h3>{nav.slice(1).map(([label,id])=><a key={id} href={`#${id}`}>{label}</a>)}</div><div><h3>Event info</h3><p>{eventConfig.venue}</p><a href={`mailto:${eventConfig.contactEmail.split(' ')[0]}`}>{eventConfig.contactEmail}</a></div><div><h3>Gadgeon Sports Day 2026</h3><p>Celebrating people through sport.</p></div></div><div className="container copyright"><span>© 2026 Gadgeon Sports Day. All rights reserved.</span><span>Designed for the team.</span></div></footer>

    <AnimatePresence>{lightbox !== null && <motion.div className="lightbox" role="dialog" aria-modal="true" aria-label="Gallery image viewer" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(null)}><button className="lightbox-close" aria-label="Close gallery" onClick={()=>setLightbox(null)}><X/></button><button className="lightbox-nav left" aria-label="Previous image" onClick={(e)=>{e.stopPropagation();setLightbox((lightbox-1+filtered.length)%filtered.length)}}><ChevronLeft/></button><motion.img key={filtered[lightbox].src} initial={{scale:.94,opacity:0}} animate={{scale:1,opacity:1}} src={filtered[lightbox].src} alt={filtered[lightbox].alt} onClick={(e)=>e.stopPropagation()}/><button className="lightbox-nav right" aria-label="Next image" onClick={(e)=>{e.stopPropagation();setLightbox((lightbox+1)%filtered.length)}}><ChevronRight/></button></motion.div>}</AnimatePresence>
  </div>;
}
export default App;
