import StartupNavigation from '@/components/StartupNavigation';

export default function StartupOpportunities() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Opportunities
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Discover funding opportunities, partnership proposals, and growth possibilities for your startup.
                    </p>
                </div>

                {/* Opportunities content placeholder */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Funding Opportunities</h3>
                        <p className="text-gray-600 mb-6">
                            Browse available investment opportunities, grants, and funding programs
                            that match your startup&apos;s profile and industry.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-medium text-gray-900">Investment Rounds</h4>
                                <p className="text-gray-600">Active investment opportunities from VCs and angel investors.</p>
                            </div>
                            <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-medium text-gray-900">Grants & Programs</h4>
                                <p className="text-gray-600">Government grants and accelerator programs.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Partnership Opportunities</h3>
                        <p className="text-gray-600 mb-6">
                            Connect with other startups, established companies, and strategic partners
                            for collaboration and growth opportunities.
                        </p>
                        <div className="space-y-4">
                            <div className="border-l-4 border-purple-500 pl-4">
                                <h4 className="font-medium text-gray-900">Strategic Partnerships</h4>
                                <p className="text-gray-600">Collaboration opportunities with established companies.</p>
                            </div>
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-medium text-gray-900">Startup Collaborations</h4>
                                <p className="text-gray-600">Partner with other startups for mutual growth.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
