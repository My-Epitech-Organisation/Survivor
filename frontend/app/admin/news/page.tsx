import AdminNavigation from "@/components/AdminNavigation";


export default function AdminNews() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                        News Management
                    </h1>
                </div>

                {/* News content placeholder */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-app-surface rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-app-text-primary mb-6">News</h3>
                        <p className="text-app-text-secondary mb-8">
                            This is where the news management content will go.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
