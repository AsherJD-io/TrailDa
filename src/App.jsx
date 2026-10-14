export default function App() {
  return (
    <main className="page">
      <section className="hero">
        <div className="container">
          <img
            src="/trailda-logo.png"
            alt="TrailDa logo"
            className="hero-logo"
          />

          <div className="badge">
            AI-powered operational intelligence for businesses
          </div>

          <h1>TrailDa</h1>

          <p className="hero-text">
            TrailDa trails a business&apos;s operational data and context, turns it
            into intelligence, and helps the business understand what to improve and
            what to do next.
          </p>

          <div className="tags">
            <span>Operational intelligence</span>
            <span>AI/ML</span>
            <span>Data infrastructure</span>
            <span>B2B</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid two">
          <div>
            <h2>The problem</h2>
            <p>
              Businesses run on many moving parts at once: contracts, sites,
              inventory, vendors, staff, energy and money. Important activity is
              easily missed simply because too much is happening at the same time.
            </p>

            <p>
              Without structured visibility, decisions are made late, costs drift,
              and recurring operational mistakes go unexplained.
            </p>
          </div>

          <div className="card">
            <h2>The solution</h2>

            <p>
              TrailDa is an AI-powered operational intelligence platform that
              collects the data a business already generates, organises it, and
              turns it into clear guidance on what is happening and what to do
              next.
            </p>

            <p>
              The platform works with existing operational data rather than
              requiring complex new infrastructure.
            </p>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <h2>How TrailDa works</h2>

          <div className="grid five">
            <div className="card small">Operational data</div>
            <div className="card small">Ingestion</div>
            <div className="card small">Normalization and quality</div>
            <div className="card small">Analytics</div>
            <div className="card small">Intelligence and next steps</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid three">
          <div className="card">
            <h3>Real-time monitoring</h3>
            <p>
              See what is happening across the different areas of the business as
              it happens, from one place.
            </p>
          </div>

          <div className="card">
            <h3>Operational intelligence</h3>
            <p>
              Turn day-to-day records on money, stock, projects, energy, customers
              and vendors into clear explanations of what changed and why.
            </p>
          </div>

          <div className="card">
            <h3>Decision support</h3>
            <p>
              Get practical guidance on what to improve and what to do next,
              grounded in the business&apos;s own data.
            </p>
          </div>
        </div>
      </section>

      <section className="section green">
        <div className="container grid two">
          <div>
            <h2>Where TrailDa is</h2>

            <p>
              TrailDa is in early development. The immediate focus is validating
              the platform against real operational data before wider rollout.
            </p>
          </div>

          <div>
            <h2>Founder story</h2>

            <p>
              TrailDa grew out of the founder&apos;s engineering background in
              agricultural and environmental systems, later work across
              energy-system operations, facility management and finance, and
              data engineering practice. Those experiences shaped a focus on
              reliable data infrastructure and operational intelligence for
              real-world sectors.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container card contact">
          <h2>Contact</h2>

          <p>
            TrailDa is currently in early development and open to conversations
            with businesses and ecosystem partners interested in operational
            intelligence.
          </p>

          <p className="email">trailda.dss@gmail.com</p>
        </div>
      </section>
    </main>
  );
}
