export default function Landing({ onStart }) {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-brand">EcoBike<span>AI</span></div>
        <div className="lp-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
        <button className="cta" onClick={onStart}>Get Started</button>
      </nav>

      <section className="lp-hero">
        <div className="lp-pill">AI-powered bike intelligence</div>
        <h1>Ride smarter.<br /><span>Choose greener.</span></h1>
        <p>
          Explore bike specifications, compare mileage and CO₂ emissions,
          and get AI-driven suggestions for the Indian and global markets.
        </p>
        <div className="lp-actions">
          <button className="cta" onClick={onStart}>Explore dashboard →</button>
          <a className="ghost" href="#features">Discover features</a>
        </div>
        <div className="lp-badges">
          <span>India & Global data</span>
          <span>Data-driven insights</span>
        </div>
      </section>

      <section id="features" className="lp-features">
        <p className="eyebrow">What EcoBike AI offers</p>
        <h2>Understand your bike beyond the spec sheet.</h2>
        <div className="lp-grid">
          <Feature title="Bike Explorer" text="Browse brands, models, variants and technical specifications." />
          <Feature title="Performance Analytics" text="Compare mileage, engine, weight and estimated CO₂ side by side." />
          <Feature title="AI Intelligence" text="Get suggestions about each bike, from daily use to maintenance." />
        </div>
      </section>

      <section id="about" className="lp-cta-band">
        <h2>Make informed choices. Move towards a greener future.</h2>
        <button className="cta" onClick={onStart}>Start exploring</button>
      </section>

      <footer className="lp-footer">
        © 2026 EcoBike AI. Built for smarter, more sustainable mobility.
      </footer>
    </div>
  );
}

function Feature({ title, text }) {
  return (
    <div className="lp-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}