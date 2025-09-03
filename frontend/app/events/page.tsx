import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Calendar from '@/components/Calendar';
import { Event } from '@/types/event';

// Mock events data
const mockEvents: Event[] = [
  {
    id: 1,
    name: "Tech Conference 2025",
    dates: "2025-09-15",
    location: "San Francisco, CA",
    description: "Annual technology conference featuring the latest innovations in AI, blockchain, and cybersecurity.",
    event_type: "conference",
    target_audience: "Developers, Tech Professionals"
  },
  {
    id: 2,
    name: "Startup Workshop",
    dates: "2025-09-20",
    location: "New York, NY",
    description: "Hands-on workshop for aspiring entrepreneurs to learn about building successful startups.",
    event_type: "workshop",
    target_audience: "Entrepreneurs, Students"
  },
  {
    id: 3,
    name: "Networking Mixer",
    dates: "2025-09-25",
    location: "Los Angeles, CA",
    description: "Connect with like-minded professionals in the tech industry over drinks and appetizers.",
    event_type: "pitch session",
    target_audience: "Tech Professionals"
  },
  {
    id: 4,
    name: "AI Seminar",
    dates: "2025-10-05",
    location: "Boston, MA",
    description: "Deep dive into artificial intelligence and machine learning applications in business.",
    event_type: "workshop",
    target_audience: "Data Scientists, Engineers"
  },
  {
    id: 5,
    name: "Developer Meetup",
    dates: "2025-10-12",
    location: "Seattle, WA",
    description: "Monthly meetup for local developers to share knowledge and collaborate on projects.",
    event_type: "Workshop",
    target_audience: "Developers"
  },
  {
    id: 6,
    name: "Digital Marketing Webinar",
    dates: "2025-10-18",
    location: "Online",
    description: "Learn the latest digital marketing strategies and tools to grow your business online.",
    event_type: "webinar",
    target_audience: "Marketers, Business Owners"
  },
  {
    id: 7,
    name: "Blockchain Summit",
    dates: "2025-11-10",
    location: "Miami, FL",
    description: "Exploring the future of blockchain technology and cryptocurrency innovations.",
    event_type: "conference",
    target_audience: "Crypto Enthusiasts, Investors"
  },
  {
    id: 8,
    name: "UX Design Workshop",
    dates: "2025-11-15",
    location: "Austin, TX",
    description: "Interactive workshop on user experience design principles and best practices.",
    event_type: "workshop",
    target_audience: "Designers, Product Managers"
  },
  {
    id: 9,
    name: "Investor Pitch Day",
    dates: "2025-11-22",
    location: "Chicago, IL",
    description: "Startup founders present their ideas to potential investors and VCs.",
    event_type: "pitch session",
    target_audience: "Startups, Investors"
  },
  {
    id: 10,
    name: "Cybersecurity Seminar",
    dates: "2025-12-08",
    location: "Washington, DC",
    description: "Latest trends and threats in cybersecurity with expert panel discussions.",
    event_type: "Pitch session",
    target_audience: "Security Professionals, IT Managers"
  },
  {
    id: 11,
    name: "React Workshop",
    dates: "2025-09-05",
    location: "Portland, OR",
    description: "Learn advanced React patterns and best practices for modern web development.",
    event_type: "workshop",
    target_audience: "Frontend Developers"
  },
  {
    id: 12,
    name: "Data Science Meetup",
    dates: "2025-09-10",
    location: "San Diego, CA",
    description: "Monthly gathering for data scientists to share insights and network.",
    event_type: "Workshop",
    target_audience: "Data Scientists"
  }
];

export default function Events() {
  return (
    <div className="min-h-screen bg-app-surface-hover">
      <Navigation />

      <main className="w-full mx-auto py-3 px-2 sm:py-6 sm:px-4 lg:px-8 max-w-screen-xl">
        <div className="py-3 sm:py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-app-text-primary mb-4 sm:mb-6">Events Calendar</h1>
          <div className="mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-app-text-secondary">
              Discover upcoming events, conferences, workshops, and networking opportunities in the tech industry.
            </p>
          </div>
          <Calendar events={mockEvents} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
