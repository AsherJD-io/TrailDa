import { useEffect, useRef } from 'react'

const BOOKING_URL = 'https://calendar.app.google/1SVu6faw9GNBHzxb7'

// The five-stage pipeline, carried forward from the original "How TrailDa works" row.
const PIPELINE = [
  'Operational data',
  'Ingestion',
  'Normalization and quality',
  'Analytics',
  'Intelligence and next steps',
]

// Illustrative example signals for H-Facto. These are deliberately generic
// examples of the kind of thing the capability is designed to surface. They are
// not real monitored events, customer data or live integrations.
const EXAMPLES = [
  {
    tag: 'Signal',
    title: 'A quiet change that matters',
    body: 'A small shift in one area, repeated over time, becomes a pattern worth noticing before it grows.',
  },
  {
    tag: 'Context',
    title: 'What actually changed',
    body: 'Related activity is connected so a change is explained by the business around it, not shown in isolation.',
  },
  {
    tag: 'Attention',
    title: 'What deserves a look',
    body: 'The surface highlights what is unusual and relevant, instead of asking someone to watch everything at once.',
  },
  {
    tag: 'Next step',
    title: 'What to do about it',
    body: 'Each surfaced signal carries a practical suggestion, so monitoring turns into a decision rather than a report.',
  },
]

export default function App() {
  const diagramRef = useRef(null)

  // Gentle, purposeful motion for the connected-operations diagram. It advances
  // the "surfaced" highlight through the legend lanes so the visual tells the
  // story: signals gather, a change emerges, a signal is surfaced, a next step
  // appears. Every meaningful element also exists in the static markup, and the
  // whole animation is skipped under prefers-reduced-motion (see index.css).
  useEffect(() => {
    const root = diagramRef.current
    if (!root) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return

    let frame = 0
    let running = true
    const lanes = Array.from(root.querySelectorAll('[data-lane]'))
    if (!lanes.length) return
    const diagram = root.querySelector('.diagram')

    const step = () => {
      if (!running) return
      frame += 1
      const active = Math.floor(frame / 45) % lanes.length
      lanes.forEach((lane, idx) => lane.classList.toggle('is-active', idx === active))
      // Surface the highlighted nodes once the story reaches "a signal is
      // surfaced" / "a next step appears" (lanes 3 and 4).
      if (diagram) diagram.classList.toggle('is-surfacing', active >= 2)
      requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
    return () => {
      running = false
    }
  }, [])

  // Staggered reveal for the process and signal sections as they scroll into
  // view. Purely additive: content is present and readable without it, and the
  // whole effect is skipped under prefers-reduced-motion (see index.css).
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduce.matches) return
    const targets = document.querySelectorAll('[data-reveal]')
    if (!targets.length || typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  // Scroll-spy: mark the nav link whose section is currently in view so the
  // pill shows a selected tab. Skipped under reduced-motion; the links still
  // work as plain anchors.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    const setCurrent = (hash) => {
      document.querySelectorAll('.site-nav a').forEach((a) => {
        a.classList.toggle('is-current', a.getAttribute('href') === hash)
      })
    }
    if (reduce.matches || typeof IntersectionObserver === 'undefined') return
    const sections = ['#how-it-works', '#h-facto', '#story']
      .map((sel) => document.querySelector(sel))
      .filter(Boolean)
    if (!sections.length) return

    const spy = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setCurrent('#' + visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    )
    sections.forEach((s) => spy.observe(s))
    return () => spy.disconnect()
  }, [])

  return (
    <div className="page">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="TrailDa home">
            <img src="/trailda-logo.png" alt="" className="brand-logo" width="3601" height="1891" />
            <span className="brand-name">TrailDa</span>
          </a>
          <nav className="site-nav" aria-label="Primary">
            <a href="#how-it-works">How it works</a>
            <a href="#h-facto">H-Facto</a>
            <a href="#story">Story</a>
          </nav>
          <a
            className="btn btn-primary btn-sm header-cta"
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Book a session
          </a>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="hero" id="top">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">H-Facto by TrailDa</p>
              <h1>See what is happening across your business, before it becomes a problem.</h1>
              <p className="lede">
                H-Facto is TrailDa&apos;s real-time operational monitoring and intelligence
                capability. It follows the data your business already produces, connects the
                signals, and helps you understand what is changing, what deserves attention, and
                what to do next.
              </p>
              <div className="hero-actions">
                <a className="btn btn-secondary" href="#how-it-works">
                  See how it works
                </a>
              </div>
              <p className="hero-note">
                TrailDa is in early development. H-Facto is being validated against real
                operational data before wider release.
              </p>
            </div>

            {/* Original animated diagram: operational signals flowing into a connected
                system, a change emerging, a signal surfaced, a next step visible. */}
            <div className="hero-visual" ref={diagramRef}>
              <div className="diagram">
                <div className="diagram-stage" aria-hidden="true">
                  <div className="signal-layer">
                    <span className="signal s1" />
                    <span className="signal s2" />
                    <span className="signal s3" />
                    <span className="signal s4" />
                  </div>

                  <svg className="diagram-svg" viewBox="0 0 320 320" role="presentation">
                    <defs>
                      <linearGradient id="pathGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.05" />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.55" />
                      </linearGradient>
                    </defs>
                    <path className="path p1" d="M40 60 L150 150" stroke="url(#pathGrad)" />
                    <path className="path p2" d="M280 70 L170 150" stroke="url(#pathGrad)" />
                    <path className="path p3" d="M50 260 L150 170" stroke="url(#pathGrad)" />
                    <path className="path p4" d="M275 255 L170 170" stroke="url(#pathGrad)" />
                    <circle className="core-ring" cx="160" cy="160" r="46" />
                    <circle className="core" cx="160" cy="160" r="30" />
                    <circle className="core-dot" cx="160" cy="160" r="6" />
                    <circle className="node n1" cx="40" cy="60" r="7" />
                    <circle className="node n2" cx="280" cy="70" r="7" />
                    <circle className="node n3" cx="50" cy="260" r="7" />
                    <circle className="node n4" cx="275" cy="255" r="7" />
                    <circle className="node surf f1" cx="120" cy="110" r="5" />
                    <circle className="node surf f2" cx="205" cy="118" r="5" />
                    <circle className="node surf f3" cx="112" cy="212" r="5" />
                    <circle className="node surf f4" cx="208" cy="208" r="5" />
                  </svg>
                </div>

                <ol className="diagram-legend">
                  <li data-lane="0" className="lane">
                    <span className="lane-dot" />
                    Signals gather
                  </li>
                  <li data-lane="1" className="lane">
                    <span className="lane-dot" />
                    A change emerges
                  </li>
                  <li data-lane="2" className="lane">
                    <span className="lane-dot" />
                    A signal is surfaced
                  </li>
                  <li data-lane="3" className="lane">
                    <span className="lane-dot" />
                    A next step appears
                  </li>
                </ol>
                <p className="diagram-caption">
                  An illustration of how H-Facto connects operational signals. Not a live console
                  and not customer data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="section" id="problem">
          <div className="container narrow">
            <p className="section-eyebrow">The problem</p>
            <h2>Too much happens at once to see clearly.</h2>
            <div className="prose">
              <p>
                Businesses run on many moving parts at once: contracts, sites, inventory, vendors,
                staff, energy and money. Important activity is easily missed simply because too
                much is happening at the same time.
              </p>
              <p>
                Without structured visibility, decisions are made late, costs drift, and recurring
                operational mistakes go unexplained. H-Facto exists to close that gap: to watch
                the whole picture, notice what matters, and say so in time to act.
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="section alt" id="how-it-works">
          <div className="container">
            <p className="section-eyebrow">How it works</p>
            <h2>From operational data to a clear next step.</h2>
            <p className="section-intro">
              H-Facto follows the same path TrailDa uses across the platform: take the data a
              business already generates, make it reliable, and turn it into intelligence.
            </p>
            <ol className="pipeline">
              {PIPELINE.map((stage, i) => (
                <li
                  className="pipeline-step"
                  key={stage}
                  data-reveal
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <span className="pipeline-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pipeline-label">{stage}</span>
                </li>
              ))}
            </ol>
            <p className="section-foot">
              The platform works with existing operational data rather than requiring complex new
              infrastructure.
            </p>
          </div>
        </section>

        {/* H-Facto deep dive */}
        <section className="section" id="h-facto">
          <div className="container">
            <p className="section-eyebrow">H-Facto</p>
            <h2>Monitoring that turns into intelligence.</h2>
            <div className="feature-grid">
              <article className="feature">
                <h3>Real-time monitoring</h3>
                <p>
                  See what is happening across the different areas of the business as it happens,
                  from one place, instead of assembling the picture by hand.
                </p>
              </article>
              <article className="feature">
                <h3>Operational intelligence</h3>
                <p>
                  Day-to-day records on money, stock, projects, energy, customers and vendors are
                  connected into clear explanations of what changed and why.
                </p>
              </article>
              <article className="feature">
                <h3>Decision support</h3>
                <p>
                  Practical guidance on what to improve and what to do next, grounded in the
                  business&apos;s own data rather than generic advice.
                </p>
              </article>
            </div>

            <div className="examples">
              <h3 className="examples-title">What that looks like in practice</h3>
              <div className="example-grid">
                {EXAMPLES.map((ex, i) => (
                  <article
                    className="example"
                    key={ex.title}
                    data-reveal
                    style={{ transitionDelay: `${i * 90}ms` }}
                  >
                    <span className="example-tag">{ex.tag}</span>
                    <h4>{ex.title}</h4>
                    <p>{ex.body}</p>
                  </article>
                ))}
              </div>
              <p className="examples-note">
                These are illustrative examples of the kind of value H-Facto is designed to
                provide, drawn from the intended behaviour rather than from live customer activity.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section alt" id="story">
          <div className="container narrow">
            <p className="section-eyebrow">Our story</p>
            <h2>Built from operational experience.</h2>
            <div className="prose">
              <p>
                TrailDa grew out of the founder&apos;s engineering background in agricultural and
                environmental systems, later work across energy-system operations, facility
                management and finance, and data engineering practice. Across each of those settings
                the same pattern appeared: many moving parts, and important activity that is easy to
                miss when too much is happening at once.
              </p>
              <p>
                Those experiences shaped a focus on reliable data infrastructure and operational
                intelligence for real-world sectors. H-Facto is the first capability built directly
                on that idea, and the wider TrailDa platform is being developed around it.
              </p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing" id="contact">
          <div className="container narrow closing-inner">
            <h2>See what H-Facto could surface in your business.</h2>
            <p>
              Book a short session to walk through your operations and where clearer visibility
              would help. TrailDa is in early development and open to conversations with businesses
              interested in operational intelligence.
            </p>
            <div className="hero-actions center">
              <a className="btn btn-primary" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                Book a session
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-lockup">
            <span className="footer-brand">TrailDa</span>
            <span className="footer-note">Operational intelligence for businesses</span>
          </div>
          <span className="footer-copy">© 2026 TrailDa</span>
        </div>
      </footer>
    </div>
  )
}
