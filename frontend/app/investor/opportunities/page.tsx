import InvestorNavigation from "@/components/InvestorNavigation";

export default function InvestorOpportunities() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <InvestorNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Investment Opportunities
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Discover promising startups, innovative projects, and growth
            opportunities for your investment portfolio.
          </p>
        </div>

        {/* Opportunities content placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-app-surface rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-app-text-primary mb-6">
              Startup Opportunities
            </h3>
            <p className="text-app-text-secondary mb-6">
              Browse promising startups seeking investment in various stages of
              development, from seed to growth phase.
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-app-blue-primary pl-4">
                <h4 className="font-medium text-app-text-primary">
                  Early-Stage Startups
                </h4>
                <p className="text-app-text-secondary">
                  Seed and pre-seed opportunities with high growth potential.
                </p>
              </div>
              <div className="border-l-4 border-app-green-primary pl-4">
                <h4 className="font-medium text-app-text-primary">
                  Growth-Stage Companies
                </h4>
                <p className="text-app-text-secondary">
                  Series A and beyond investments with proven traction.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-app-surface rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-app-text-primary mb-6">
              Industry Sectors
            </h3>
            <p className="text-app-text-secondary mb-6">
              Explore investment opportunities across different industry sectors
              and technology domains.
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-app-purple-primary pl-4">
                <h4 className="font-medium text-app-text-primary">
                  Technology & Software
                </h4>
                <p className="text-app-text-secondary">
                  SaaS, AI/ML, blockchain, and other tech opportunities.
                </p>
              </div>
              <div className="border-l-4 border-app-orange-primary pl-4">
                <h4 className="font-medium text-app-text-primary">
                  Sustainability & Green Tech
                </h4>
                <p className="text-app-text-secondary">
                  Climate tech, renewable energy, and sustainable solutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
