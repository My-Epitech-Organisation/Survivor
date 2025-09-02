import StartupNavigation from '@/components/StartupNavigation';

export default function StartupProfile() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Startup Profile
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Manage your startup&apos;s profile, team information, and company details.
                    </p>
                </div>

                {/* Profile content placeholder */}
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Company Information</h3>
                        <p className="text-gray-600 mb-8">
                            Profile management features will be implemented here, including company details,
                            team member management, and startup information.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                                <p className="text-gray-600">Company name, description, industry, etc.</p>
                            </div>

                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Team Management</h4>
                                <p className="text-gray-600">Add and manage team members and roles.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
