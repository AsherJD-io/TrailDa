import { useEffect, useRef, useState } from 'react'

const BOOKING_URL = 'https://calendar.app.google/1SVu6faw9GNBHzxb7'

// Desktop pill navigation and mobile menu share one source of truth, so the
// links can never drift apart and no route is invented anywhere.
const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#h-facto', label: 'H-Facto' },
  { href: '#story', label: 'Story' },
]

// The five-stage pipeline, carried forward from the original "How TrailDa works" row.
const PIPELINE = [
  'Operational data',
  'Ingestion',
  'Normalization and quality',
  'Analytics',
  'Intelligence and next steps',
]

// Time the mobile signal rests on each stage before moving to the next. Long
// enough to read the highlight arrive and ease in, short enough that the whole
// progression stays legible rather than feeling like a slideshow.
const STAGE_MS = 1800

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
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = 'mobile-menu'
  // Mobile pipeline progression. signalVisible flips once the signal starts
  // moving; signalY is the measured offset from the top of the pipeline to the
  // active stage's centre, so the point and the highlighted stage are always the
  // same number and can never drift. Which stage is active lives on the DOM as
  // is-active / is-done, toggled imperatively so it cannot fight the reveal
  // effect's own is-revealed class.
  const [signalVisible, setSignalVisible] = useState(false)
  const [signalY, setSignalY] = useState(0)
  const toggleRef = useRef(null)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const wasOpenRef = useRef(false)
  const pipelineRef = useRef(null)
  const stepRefs = useRef([])

  // A full-screen overlay has to behave like a dialog, not a dropdown. Escape
  // closes it and returns focus to the control that opened it, the page cannot
  // scroll behind it, and a resize past the breakpoint cannot leave the overlay
  // stranded over the desktop layout.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    // Simple focus wrap so Tab cannot escape the overlay to the page behind.
    const onTab = (e) => {
      if (e.key !== 'Tab') return
      const panel = panelRef.current
      if (!panel) return
      const items = Array.from(
        panel.querySelectorAll('a[href], button:not([disabled])')
      ).filter((el) => el.offsetParent !== null)
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    const mq = window.matchMedia('(min-width: 621px)')
    const onWide = () => {
      if (mq.matches) setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('keydown', onTab, true)
    mq.addEventListener('change', onWide)

    // Lock the background scroll. The scrolling element here is <html>, so
    // overflow has to be locked on both elements or the page still moves.
    const html = document.documentElement
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: document.body.style.overflow,
    }
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keydown', onTab, true)
      mq.removeEventListener('change', onWide)
      html.style.overflow = prev.htmlOverflow
      document.body.style.overflow = prev.bodyOverflow
    }
  }, [menuOpen])

  // Move focus into the overlay on open so keyboard and screen-reader users
  // land inside it rather than behind it. On close, the now-removed panel
  // would leave focus on <body>, so hand it back to the control that opened it.
  useEffect(() => {
    if (menuOpen) {
      wasOpenRef.current = true
      const frame = requestAnimationFrame(() => {
        if (closeRef.current) closeRef.current.focus()
      })
      return () => cancelAnimationFrame(frame)
    }
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      if (toggleRef.current) toggleRef.current.focus()
    }
  }, [menuOpen])

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

  // Mobile pipeline progression. The five stages stack vertically below 620px,
  // so the travelling signal moves down a rail beside them and each stage lights
  // as the signal reaches it.
  //
  // The signal is positioned from measured geometry rather than fixed offsets:
  // stage cards have variable heights once labels wrap at 320px, so the offset
  // for each stage is read from the live DOM and recomputed on resize. The stage
  // index and the signal offset come from the same measurement, so the point and
  // the highlighted stage cannot drift apart.
  //
  // Runs only on the stacked layout, and not at all under reduced motion.
  useEffect(() => {
    const pipeline = pipelineRef.current
    if (!pipeline) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    // The rail only exists where the stages stack.
    const stacked = window.matchMedia('(max-width: 620px)')
    if (reduce.matches || typeof IntersectionObserver === 'undefined') return

    const steps = () => Array.from(pipeline.querySelectorAll('.pipeline-step'))

    // Offset from the pipeline's top to each stage's centre, measured live.
    const centres = () => {
      const base = pipeline.getBoundingClientRect().top
      return steps().map((el) => {
        const r = el.getBoundingClientRect()
        return r.top - base + r.height / 2
      })
    }

    let timer = null
    let positions = centres()
    let index = 0

    // Move to a stage: update the offset and the active state together. The
    // offset is read from the live DOM at the moment of the move, so the point
    // and the highlighted stage always describe the same element.
    //
    // The classes are toggled imperatively rather than rendered from state.
    // React rewrites className on every render, and the reveal effect adds
    // is-revealed through classList; a React-managed class string would silently
    // drop it, leaving the stage invisible.
    const paint = (i) => {
      stepRefs.current.forEach((el, n) => {
        if (!el) return
        el.classList.toggle('is-active', n === i)
        el.classList.toggle('is-done', i !== null && n < i)
      })
    }
    const goTo = (i) => {
      positions = centres()
      index = i
      paint(i)
      setSignalVisible(true)
      if (!positions.length) return
      setSignalY(positions[i] ?? 0)
    }

    // Start only once the stage cards have finished their reveal transition.
    // Measuring while they are still translating would capture a moving centre,
    // and a re-render triggered mid-transition competes with the reveal
    // animation for the same frame.
    let started = false
    const start = () => {
      if (started || !stacked.matches) return
      started = true
      goTo(0)
      const tick = () => {
        const next = (index + 1) % PIPELINE.length
        goTo(next)
        timer = window.setTimeout(tick, STAGE_MS)
      }
      timer = window.setTimeout(tick, STAGE_MS)
    }

    const stop = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = null
      }
    }

    // Begin when the pipeline scrolls into view so the signal does not run
    // unseen above the fold. The cards reveal on a 0.5s transition, so wait for
    // that to land before starting the sequence.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) window.setTimeout(start, 600)
          else stop()
        })
      },
      { threshold: 0.2 }
    )
    io.observe(pipeline)

    // Re-measure on resize: label wrapping at narrow widths changes card
    // heights, so the rail anchors must follow the new layout.
    const onResize = () => {
      positions = centres()
      if (timer && index < positions.length) setSignalY(positions[index] ?? 0)
      if (!stacked.matches) {
        stop()
        paint(-1)
      }
    }
    window.addEventListener('resize', onResize)

    // Card heights also settle after the reveal transition and after web fonts
    // load, neither of which fires a resize event. Re-measure on a short settle
    // rather than observing every step: a ResizeObserver on the cards would fire
    // on the reveal transition it is trying to measure, and that feedback loop
    // starves the reveal animation so stages never become visible.
    const settle = window.setTimeout(() => {
      positions = centres()
      if (timer && index < positions.length) setSignalY(positions[index] ?? 0)
    }, 900)

    return () => {
      stop()
      window.clearTimeout(settle)
      io.disconnect()
      window.removeEventListener('resize', onResize)
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
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right-side actions: on desktop the pill nav already pushes this
              group to the far right. On mobile it holds only the menu control,
              since the booking CTA lives inside the overlay. */}
          <div className="header-actions">
            <a
              className="btn btn-primary btn-sm header-cta"
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a session
            </a>

            {/* Mobile menu control: a two-stroke mark that reads as open, and
                rotates into an explicit close symbol while the overlay is up.
                Hidden on desktop, where the pill navigation is primary. */}
            <button
              id="menu-toggle"
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="menu-icon" aria-hidden="true">
                <span className="menu-icon-line" />
                <span className="menu-icon-line" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen navigation overlay. Opaque, so the page beneath cannot
          distract. Locked into the space below the browser chrome with a
          dynamic viewport height and respect for the safe-area insets.

          This is deliberately a sibling of the header, not a child of it: the
          header is position: sticky, which would make it the containing block
          for a fixed descendant and shrink inset: 0 to the header's own 60px. */}
      <div
        id={menuId}
        ref={panelRef}
        className={`mobile-menu${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!menuOpen}
      >
        <div className="mobile-menu-inner">
          <div className="mobile-menu-top">
            <span className="mobile-menu-brand">
              <img
                src="/trailda-logo.png"
                alt=""
                className="brand-logo"
                width="3601"
                height="1891"
              />
              <span className="mobile-menu-brand-name">TrailDa</span>
            </span>
            <button
              ref={closeRef}
              type="button"
              className="menu-close"
              aria-label="Close menu"
              aria-controls={menuId}
              onClick={() => {
                setMenuOpen(false)
                toggleRef.current?.focus()
              }}
            >
              <span className="menu-icon" aria-hidden="true">
                <span className="menu-icon-line" />
                <span className="menu-icon-line" />
              </span>
            </button>
          </div>

          <nav className="mobile-menu-nav" aria-label="Mobile">
            <p className="mobile-menu-eyebrow">Menu</p>
            <ul className="mobile-menu-list">
              {NAV_LINKS.map((link, i) => (
                <li
                  key={link.href}
                  className="mobile-menu-item"
                  style={{ '--i': i }}
                >
                  <a
                    href={link.href}
                    className="mobile-menu-link"
                    onClick={(e) => {
                      // Do the navigation ourselves. React re-renders the
                      // overlay out of the DOM the moment menuOpen flips, and
                      // the browser's own anchor handling would then move
                      // focus to a target the re-render just removed, leaving
                      // focus on <body>. Scrolling explicitly keeps the jump,
                      // while focus is returned to the opener below.
                      e.preventDefault()
                      setMenuOpen(false)
                      const target = document.querySelector(link.href)
                      if (target) {
                        const reduce =
                          window.matchMedia('(prefers-reduced-motion: reduce)')
                            .matches
                        target.scrollIntoView({
                          behavior: reduce ? 'auto' : 'smooth',
                        })
                      }
                      if (history.replaceState) history.replaceState(null, '', link.href)
                    }}
                  >
                    <span className="mobile-menu-index" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="mobile-menu-label">{link.label}</span>
                    <span className="mobile-menu-arrow" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M5 12h13M12 5l7 7-7 7"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mobile-menu-foot">
            <a
              className="btn btn-primary mobile-menu-cta"
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book a session
            </a>
            <p className="mobile-menu-note">Operational intelligence for businesses</p>
          </div>
        </div>
      </div>

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
            <ol className="pipeline" ref={pipelineRef}>
              {PIPELINE.map((stage, i) => (
                <li
                  className="pipeline-step"
                  key={stage}
                  data-reveal
                  data-stage={i}
                  ref={(el) => {
                    if (stepRefs.current) stepRefs.current[i] = el
                  }}
                  style={{ transitionDelay: `${i * 90}ms` }}
                >
                  <span className="pipeline-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="pipeline-label">{stage}</span>
                </li>
              ))}
              {/* Mobile only: the signal point that travels the progress rail from
                  stage 01 to stage 05. Positioned by measured geometry in JS, so
                  it lands on each stage's real centre whatever the card heights
                  are at 320/360/390px. Hidden on desktop, which keeps the
                  horizontal travelling signal. */}
              <span
                className={`pipeline-signal${signalVisible ? ' is-visible' : ''}`}
                aria-hidden="true"
                style={{ transform: `translateY(${signalY}px)` }}
              />
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
