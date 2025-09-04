import StartupNavigation from "@/components/StartupNavigation";

export default function StartupProfile() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
      <StartupNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary mb-6">
            Startup Profile
          </h1>
          <p className="text-xl text-app-text-secondary max-w-3xl mx-auto mb-8">
            Manage your startup&apos;s profile, team information, and company
            details.
          </p>
        </div>

        {/* Profile content placeholder */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-app-surface rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-semibold text-app-text-primary mb-6">
              Company Information
            </h3>
            <p className="text-app-text-secondary mb-8">
              Profile management features will be implemented here, including
              company details, team member management, and startup information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-medium text-app-text-primary mb-4">
                  Basic Information
                </h4>
                <p className="text-app-text-secondary">
                  Company name, description, industry, etc.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium text-app-text-primary mb-4">
                  Team Management
                </h4>
                <p className="text-app-text-secondary">
                  Add and manage team members and roles.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
