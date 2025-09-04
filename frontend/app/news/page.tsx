import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function News() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-app-gradient-from to-app-gradient-to">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-app-text-primary mb-6">
              News
            </h1>
            <div className="bg-app-surface rounded-lg shadow p-6">
              <p className="text-app-text-secondary">
                News page content will be implemented here.
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
