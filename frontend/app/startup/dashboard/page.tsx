import StartupNavigation from '@/components/StartupNavigation';

export default function StartupDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Startup Dashboard
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Welcome to your startup management hub. Monitor your progress, manage opportunities,
                        and connect with potential investors and partners.
                    </p>
                </div>

                {/* Dashboard content placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
                        <p className="text-gray-600">Dashboard metrics and analytics will be displayed here.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <p className="text-gray-600">Latest updates and activities will be shown here.</p>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Tasks</h3>
                        <p className="text-gray-600">Important tasks and deadlines will be listed here.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
