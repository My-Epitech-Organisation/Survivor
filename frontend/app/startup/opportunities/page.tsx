import StartupNavigation from '@/components/StartupNavigation';

export default function StartupOpportunities() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                        Opportunities
                    </h1>
                    <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
                        Discover funding opportunities, partnership proposals, and growth possibilities for your startup.
                    </p>
                </div>

                {/* Opportunities content placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-app-surface rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-app-text-primary mb-6">Funding Opportunities</h3>
                        <p className="text-app-text-secondary mb-6">
                            Browse available investment opportunities, grants, and funding programs
                            that match your startup&apos;s profile and industry.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-app-blue-primary pl-4">
                                <h4 className="font-medium text-app-text-primary">Investment Rounds</h4>
                                <p className="text-app-text-secondary">Active investment opportunities from VCs and angel investors.</p>
                            </div>
                            <div className="border-l-4 border-app-green-primary pl-4">
                                <h4 className="font-medium text-app-text-primary">Grants & Programs</h4>
                                <p className="text-app-text-secondary">Government grants and accelerator programs.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-app-surface rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-app-text-primary mb-6">Partnership Opportunities</h3>
                        <p className="text-app-text-secondary mb-6">
                            Connect with other startups, established companies, and strategic partners
                            for collaboration and growth opportunities.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-app-purple-primary pl-4">
                                <h4 className="font-medium text-app-text-primary">Strategic Partnerships</h4>
                                <p className="text-app-text-secondary">Collaboration opportunities with established companies.</p>
                            </div>
                            <div className="border-l-4 border-app-orange-primary pl-4">
                                <h4 className="font-medium text-app-text-primary">Startup Collaborations</h4>
                                <p className="text-app-text-secondary">Partner with other startups for mutual growth.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
