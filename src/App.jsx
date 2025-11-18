import SlidingCards from './components/SlidingCards'

function App() {
  const cards = [
    {
      title: 'Build visually, ship fast',
      description:
        'A modern slider component with smooth snapping, touch, wheel, and keyboard controls.',
      image:
        'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1600&auto=format&fit=crop',
      badge: 'Featured',
      ctaText: 'Learn more',
      ctaHref: '#',
    },
    {
      title: 'Accessible and responsive',
      description:
        'Full-width layout, dynamic dots, and proper ARIA labels for inclusive UX.',
      image:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1600&auto=format&fit=crop',
      badge: 'A11y',
      ctaText: 'Docs',
      ctaHref: '#',
    },
    {
      title: 'Highly customizable',
      description:
        'Pass your own cards, enable auto-play, and control height and content freely.',
      image:
        'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1600&auto=format&fit=crop',
      ctaText: 'Get Started',
      ctaHref: '#',
    },
  ]

  return (
    <div className="min-h-screen bg-black">
      <SlidingCards cards={cards} height="h-[90vh]" autoPlay={true} autoPlayInterval={5000} />
    </div>
  )
}

export default App
