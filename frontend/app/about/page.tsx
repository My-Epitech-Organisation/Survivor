import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">About</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">About page content will be implemented here.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
