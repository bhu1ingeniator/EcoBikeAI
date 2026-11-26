export function BikeIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="5.5" cy="17" r="3.5" />
      <circle cx="18.5" cy="17" r="3.5" />
      <path d="M5.5 17 9 9h6l3.5 8" />
      <path d="M9 9l3 8" />
      <path d="M14 6h2" />
    </svg>
  );
}

export default function Landing({ onStart }) {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-brand">
          <span className="lp-logo"><BikeIcon /></span>
          EcoBike <span>AI</span>
        </div>
        <div className="lp-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#technology">Technology</a>
        </div>
        <div className="lp-nav-right">
          <button className="lp-signin" onClick={onStart}>Sign In</button>
          <button className="cta" onClick={onStart}>Get Started</button>
        </div>
      </nav>

      <section className="lp-hero">
        <div>
          <div className="lp-pill">AI-powered bike intelligence</div>
          <h1>Ride Smarter.<br /><span>Choose Greener.</span></h1>
          <p>
            Explore bike specifications, compare mileage and CO₂ emissions,
            and get AI-driven suggestions for the Indian and global markets.
          </p>
          <div className="lp-actions">
            <button className="cta lg" onClick={onStart}>Explore Dashboard →</button>
            <a className="ghost lg" href="#features">Discover Features</a>
          </div>
          <div className="lp-badges">
            <span>India & Global Data</span>
            <span>Data-driven Insights</span>
          </div>
        </div>

        <div className="lp-hero-card">
          <div className="lp-hc-head">
            <div>
              <small>Environmental Overview</small>
              <h4>Bike Intelligence</h4>
            </div>
            <span className="lp-hc-icon"><BikeIcon /></span>
          </div>
          <div className="lp-hc-grid">
            <div className="lp-mini">
              <span>Mileage Analytics</span>
              <strong>Compare</strong>
              <small>Across bike models</small>
            </div>
            <div className="lp-mini">
              <span>AI Suggestions</span>
              <strong>Discover</strong>
              <small>Smarter bike choices</small>
            </div>
          </div>
          <div className="lp-hc-strip">
            <strong>Explore sustainable mobility</strong>
            <small>Compare specifications and environmental estimates.</small>
          </div>
        </div>
      </section>

      <section id="features" className="lp-features">
        <p className="eyebrow">What EcoBike AI offers</p>
        <h2>Understand your bike beyond performance.</h2>
        <p className="lp-sub">
          One platform to explore bike specifications, efficiency and environmental performance.
        </p>
        <div className="lp-grid">
          <Feature num="01" title="Bike Explorer"
            text="Explore bike brands, models, variants and technical specifications." />
          <Feature num="02" title="Performance Analytics" highlight
            text="Compare mileage, specifications and estimated environmental impact." />
          <Feature num="03" title="AI Intelligence"
            text="Get contextual suggestions and ask questions about any bike in the dataset." />
        </div>
      </section>

      <section id="about" className="lp-cta-band">
        <h2>Make informed choices. Move towards a greener future.</h2>
        <p>EcoBike AI brings bike data and AI-powered analysis together in one place.</p>
        <button className="cta lg" onClick={onStart}>Start Exploring</button>
      </section>

      <footer id="technology" className="lp-footer">
        <p>Built with Java 21, Spring Boot, PostgreSQL, React and Google Gemini.</p>
        <p>© 2026 EcoBike AI. Built for smarter, more sustainable mobility.</p>
      </footer>
    </div>
  );
}

function Feature({ num, title, text, highlight }) {
  return (
    <div className={`lp-card${highlight ? " hl" : ""}`}>
      <span className="lp-num">{num}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}