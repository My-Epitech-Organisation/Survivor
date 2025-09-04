import AdminNavigation from "@/components/AdminNavigation";


export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
                        Admin Dashboard
                    </h1>
                    <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
                        Welcome to the admin management hub. Here you can manage platform content, users,
                        and view key metrics about platform usage and engagement.
                    </p>
                </div>

                {/* Dashboard content placeholder */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-app-surface rounded-lg shadow-md p-8">
                        <h3 className="text-2xl font-semibold text-app-text-primary mb-6">Dashboard</h3>
                        <p className="text-app-text-secondary mb-8">
                            This is where the dashboard content will go.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
