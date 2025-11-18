import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * SlidingCards
 * - Full-width, edge-to-edge slider
 * - Interactive: touch scroll, mouse wheel, keyboard arrows, buttons, dots
 * - Animations: image parallax/zoom, content fade/slide, control hover
 *
 * Props:
 * - cards: Array<{ id?: string|number, title: string, description?: string, image?: string, ctaText?: string, ctaHref?: string, badge?: string }>
 * - height: string (Tailwind height class, e.g. "h-[70vh]" or "h-96")
 * - autoPlay: boolean (default false)
 * - autoPlayInterval: number (ms, default 4000)
 */
export default function SlidingCards({
  cards = [],
  height = 'h-[70vh]',
  autoPlay = false,
  autoPlayInterval = 4000,
}) {
  const containerRef = useRef(null)
  const [active, setActive] = useState(0)
  const count = cards.length

  const safeCards = useMemo(() => {
    if (cards && cards.length) return cards
    // Fallback demo cards
    return [
      {
        title: 'Create faster',
        description: 'Design, build, and iterate at the speed of thought with a frictionless workflow.',
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
        badge: 'New',
        ctaText: 'Get Started',
        ctaHref: '#',
      },
      {
        title: 'Delightful by default',
        description: 'Polished interactions, rich animations, and accessible components out of the box.',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
        badge: 'Pro',
        ctaText: 'Explore',
        ctaHref: '#',
      },
      {
        title: 'Scale confidently',
        description: 'From idea to production with performance, testing, and deploy baked in.',
        image: 'https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'Docs',
        ctaHref: '#',
      },
    ]
  }, [cards])

  // Observe slides to track which is most visible
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const slides = Array.from(el.querySelectorAll('[data-slide]'))
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const idx = Number(visible.target.getAttribute('data-index'))
          setActive(idx)
        }
      },
      { root: el, threshold: [0.5, 0.75, 0.9] }
    )

    slides.forEach((s) => observer.observe(s))

    const onKey = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)

    const onWheel = (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollBy({ left: e.deltaY, behavior: 'smooth' })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('keydown', onKey)
      el.removeEventListener('wheel', onWheel)
    }
  }, [])

  // Autoplay
  useEffect(() => {
    if (!autoPlay) return
    const el = containerRef.current
    if (!el) return

    const id = setInterval(() => {
      next()
    }, autoPlayInterval)

    return () => clearInterval(id)
  }, [autoPlay, autoPlayInterval, active])

  const scrollToIndex = (idx) => {
    const el = containerRef.current
    if (!el) return
    const width = el.clientWidth
    el.scrollTo({ left: idx * width, behavior: 'smooth' })
  }

  const prev = () => {
    const idx = (active - 1 + safeCards.length) % safeCards.length
    scrollToIndex(idx)
  }

  const next = () => {
    const idx = (active + 1) % safeCards.length
    scrollToIndex(idx)
  }

  const contentVariants = {
    inactive: { opacity: 0, y: 20, filter: 'blur(2px)' },
    active: { opacity: 1, y: 0, filter: 'blur(0px)' },
  }

  const imageVariants = {
    inactive: { scale: 1, opacity: 0.95 },
    active: { scale: 1.05, opacity: 1 },
  }

  return (
    <div className={`w-full relative ${height}`} role="region" aria-roledescription="carousel" aria-label="Featured slides">
      {/* Slider */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth scrollbar-hide relative"
        aria-live="polite"
      >
        <div className="flex w-full h-full">
          {safeCards.map((card, i) => (
            <article
              key={card.id ?? i}
              data-slide
              data-index={i}
              className="min-w-full w-full h-full snap-start relative"
              aria-roledescription="slide"
              aria-label={`${card.title} (${i + 1} of ${safeCards.length})`}
            >
              {/* Background image with subtle zoom when active */}
              {card.image && (
                <motion.img
                  src={card.image}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  variants={imageVariants}
                  initial="inactive"
                  animate={active === i ? 'active' : 'inactive'}
                  transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.6 }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

              {/* Content */}
              <div className="relative h-full flex items-center">
                <div className="max-w-6xl mx-auto px-6 sm:px-10">
                  <div className="inline-flex items-center gap-2 mb-4">
                    {card.badge && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 backdrop-blur">
                        {card.badge}
                      </span>
                    )}
                    <span className="h-1 w-1 rounded-full bg-white/40" />
                    <span className="text-white/70 text-xs">
                      {String(i + 1).padStart(2, '0')} / {String(safeCards.length).padStart(2, '0')}
                    </span>
                  </div>

                  <motion.h2
                    className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white drop-shadow mb-4"
                    variants={contentVariants}
                    initial="inactive"
                    animate={active === i ? 'active' : 'inactive'}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  >
                    {card.title}
                  </motion.h2>

                  {card.description && (
                    <motion.p
                      className="text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mb-6"
                      variants={contentVariants}
                      initial="inactive"
                      animate={active === i ? 'active' : 'inactive'}
                      transition={{ duration: 0.6, delay: 0.05, ease: 'easeOut' }}
                    >
                      {card.description}
                    </motion.p>
                  )}

                  {(card.ctaText || card.ctaHref) && (
                    <motion.div
                      className="flex items-center gap-3"
                      variants={contentVariants}
                      initial="inactive"
                      animate={active === i ? 'active' : 'inactive'}
                      transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                    >
                      <a
                        href={card.ctaHref || '#'}
                        className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white text-gray-900 font-semibold shadow/50 shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5 transition"
                      >
                        {card.ctaText || 'Learn more'}
                      </a>
                      <button
                        onClick={next}
                        className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur transition"
                      >
                        Next
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Left/Right Controls */}
      {count > 1 && (
        <>
          <motion.button
            aria-label="Previous slide"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            aria-label="Next slide"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/30 px-2.5 py-2 rounded-full backdrop-blur">
          {safeCards.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                active === i ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'
              }`}
            />)
          )}
        </div>
      )}
    </div>
  )
}

// Hide native scrollbar for Webkit
// Scoped locally to avoid global CSS requirements.
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.innerHTML = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  `
  document.head.appendChild(style)
}
