import StartupNavigation from '@/components/StartupNavigation';

export default function StartupMessaging() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <StartupNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        Messaging Center
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                        Connect with investors, partners, and other startups through our messaging platform.
                    </p>
                </div>

                {/* Messaging content placeholder */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Messages</h3>
                        <p className="text-gray-600 mb-8">
                            Messaging functionality will be implemented here, including direct messages,
                            group conversations, and communication with potential investors and partners.
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div>
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Conversations</h4>
                                <p className="text-gray-600">List of active conversations and contacts.</p>
                            </div>

                            <div className="lg:col-span-2">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Chat Area</h4>
                                <p className="text-gray-600">Real-time messaging interface will be displayed here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
