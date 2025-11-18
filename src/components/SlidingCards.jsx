import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * SlidingCards
 * - Full-width, edge-to-edge slider
 * - Interactive: touch scroll, mouse wheel, keyboard arrows, buttons, dots
 * - Animations: image parallax/zoom, content fade/slide, control hover
 * - Responsive: 1/2/3 cards per view (mobile/tablet/desktop)
 * - 3D tilt on hover for foreground content
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
  const [activePage, setActivePage] = useState(0)
  const [perView, setPerView] = useState(1)
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
      {
        title: 'Ship quality',
        description: 'Built-in testing and performance profiling to keep you moving fast.',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop',
        ctaText: 'Try Now',
        ctaHref: '#',
      },
    ]
  }, [cards])

  // Determine how many cards per view based on width (mobile/tablet/desktop)
  useEffect(() => {
    const calcPerView = () => {
      const w = typeof window !== 'undefined' ? window.innerWidth : 0
      if (w >= 1024) return 3
      if (w >= 768) return 2
      return 1
    }
    const update = () => setPerView(calcPerView())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const pageCount = Math.max(1, Math.ceil(safeCards.length / perView))

  // Scroll helpers
  const scrollToPage = (pageIdx) => {
    const el = containerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(pageIdx, pageCount - 1))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  const prev = () => scrollToPage((activePage - 1 + pageCount) % pageCount)
  const next = () => scrollToPage((activePage + 1) % pageCount)

  // Track active page by scroll position
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const page = Math.round(el.scrollLeft / el.clientWidth)
      setActivePage(page)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    // Also observe intersections for accessibility and finer-grain state if needed

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
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onKey)
      el.removeEventListener('wheel', onWheel)
    }
  }, [pageCount])

  // Autoplay advances by page
  useEffect(() => {
    if (!autoPlay) return
    const id = setInterval(() => {
      next()
    }, autoPlayInterval)
    return () => clearInterval(id)
  }, [autoPlay, autoPlayInterval, activePage, pageCount])

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
              className="flex-shrink-0 basis-full md:basis-1/2 lg:basis-1/3 h-full snap-start relative"
              aria-roledescription="slide"
              aria-label={`${card.title} (${i + 1} of ${safeCards.length})`}
            >
              {/* Background image with subtle zoom when the slide's page is active */}
              {card.image && (
                <motion.img
                  src={card.image}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  variants={imageVariants}
                  initial="inactive"
                  // Slightly stronger zoom when this card is within the active page range
                  animate={
                    Math.floor(i / perView) === activePage ? 'active' : 'inactive'
                  }
                  transition={{ type: 'spring', stiffness: 80, damping: 20, mass: 0.6 }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/20" />

              {/* Foreground content with 3D tilt on hover */}
              <div className="relative h-full flex items-center">
                <div className="w-full px-4 sm:px-6">
                  <motion.div
                    className="max-w-6xl mx-auto px-4 sm:px-8 py-6 rounded-xl bg-white/0 lg:bg-white/0 text-left [transform-style:preserve-3d]"
                    whileHover={{ rotateX: -3, rotateY: 3, scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    style={{ perspective: 1000 }}
                  >
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
                      className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow mb-2 md:mb-3"
                      variants={contentVariants}
                      initial="inactive"
                      animate={Math.floor(i / perView) === activePage ? 'active' : 'inactive'}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                      {card.title}
                    </motion.h2>

                    {card.description && (
                      <motion.p
                        className="text-sm sm:text-base md:text-lg lg:text-xl text-white/85 max-w-2xl mb-4 md:mb-6"
                        variants={contentVariants}
                        initial="inactive"
                        animate={Math.floor(i / perView) === activePage ? 'active' : 'inactive'}
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
                        animate={Math.floor(i / perView) === activePage ? 'active' : 'inactive'}
                        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
                      >
                        <a
                          href={card.ctaHref || '#'}
                          className="inline-flex items-center justify-center px-4 md:px-5 py-2.5 rounded-lg bg-white text-gray-900 font-semibold shadow/50 shadow-white/10 hover:shadow-white/20 hover:-translate-y-0.5 transition"
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
                  </motion.div>
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
            aria-label="Previous"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>
          <motion.button
            aria-label="Next"
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

      {/* Dots as pages */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/30 px-2.5 py-2 rounded-full backdrop-blur">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              aria-label={`Go to panel ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activePage === i ? 'w-6 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
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
