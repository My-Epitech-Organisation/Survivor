import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jeb-gradient-from to-jeb-gradient-to/50">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="font-heading text-3xl font-bold text-app-text-primary mb-8">
            About
          </h1>

          {/* Mission & Vision Section */}
          <section className="mb-12">
            <div className="bg-app-surface rounded-lg shadow p-8">
              <h2 className="font-heading text-2xl font-semibold text-app-text-primary mb-6">
                Mission & Vision
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-heading text-lg font-medium text-app-text-primary mb-2">
                    Our Mission
                  </h3>
                  <p className="text-app-text-secondary leading-relaxed">
                    To cultivate a vibrant ecosystem where entrepreneurs thrive.
                    Through hands-on mentorship, strategic partnerships and seed
                    investment up to £200k, we turn bold visions into scalable
                    businesses.
                  </p>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium text-app-text-primary mb-2">
                    Our Vision
                  </h3>
                  <p className="text-app-text-secondary leading-relaxed">
                    To build a thriving global ecosystem where every
                    entrepreneur has access to the tools, knowledge, and network
                    necessary to create impactful solutions that drive positive
                    change in the world. We envision a future where innovation
                    knows no boundaries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-12">
            <div className="bg-app-surface rounded-lg shadow p-8">
              <h2 className="font-heading text-2xl font-semibold text-app-text-primary mb-6">
                Our Team
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">JJ</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary">
                    James Johnson
                  </h3>
                  <p className="text-app-text-secondary text-sm">
                    CEO & Co-Founder
                  </p>
                  <p className="text-app-text-secondary text-xs mt-2">
                    Visionary leader with 10+ years in startup ecosystem
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">EE</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary">
                    Emma Edwards
                  </h3>
                  <p className="text-app-text-secondary text-sm">
                    CTO & Co-Founder
                  </p>
                  <p className="text-app-text-secondary text-xs mt-2">
                    Tech innovator specializing in scalable solutions
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">BB</span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-app-text-primary">
                    Benjamin Brown
                  </h3>
                  <p className="text-app-text-secondary text-sm">
                    Head of Operations
                  </p>
                  <p className="text-app-text-secondary text-xs mt-2">
                    Operations expert focused on growth and efficiency
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Partners Section */}
          <section className="mb-12">
            <div className="bg-app-surface rounded-lg shadow p-8">
              <h2 className="font-heading text-2xl font-semibold text-app-text-primary mb-6">
                Our Partners
              </h2>
              <p className="text-app-text-secondary mb-6">
                We collaborate with leading organizations to provide the best
                support for our startup community.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-blue-600 font-bold">VC</span>
                    </div>
                    <p className="text-sm text-gray-600">VentureCapital</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-green-600 font-bold">TI</span>
                    </div>
                    <p className="text-sm text-gray-600">Tech Innovators</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-purple-600 font-bold">SI</span>
                    </div>
                    <p className="text-sm text-gray-600">Startup Incubator</p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <span className="text-orange-600 font-bold">GA</span>
                    </div>
                    <p className="text-sm text-gray-600">Growth Accelerator</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="mb-12">
            <div className="bg-app-surface rounded-lg shadow p-8">
              <h2 className="font-heading text-2xl font-semibold text-app-text-primary mb-6">
                Contact Us
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-heading text-lg font-medium text-app-text-primary mb-4">
                    Get in Touch
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm">📧</span>
                      </div>
                      <div>
                        <p className="text-app-text-secondary text-sm">Email</p>
                        <a
                          href="mailto:contact@survivor.com"
                          className="text-blue-600 hover:underline"
                        >
                          contact@survivor.com
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-green-600 text-sm">📞</span>
                      </div>
                      <div>
                        <p className="text-app-text-secondary text-sm">Phone</p>
                        <a
                          href="tel:+1234567890"
                          className="text-blue-600 hover:underline"
                        >
                          +1 (234) 567-890
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 text-sm">📍</span>
                      </div>
                      <div>
                        <p className="text-app-text-secondary text-sm">
                          Address
                        </p>
                        <p className="text-app-text-primary">
                          123 Innovation Street
                        </p>
                        <p className="text-app-text-primary">
                          Tech City, TC 12345
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-heading text-lg font-medium text-app-text-primary mb-4">
                    Office Hours
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-app-text-secondary">
                        Monday - Friday
                      </span>
                      <span className="text-app-text-primary">
                        9:00 AM - 6:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-text-secondary">Saturday</span>
                      <span className="text-app-text-primary">
                        10:00 AM - 4:00 PM
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-app-text-secondary">Sunday</span>
                      <span className="text-app-text-primary">Closed</span>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-app-text-secondary text-sm">
                      Have questions or want to schedule a meeting? Feel free to
                      reach out to us through any of the contact methods above.
                      We&apos;re here to help!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
