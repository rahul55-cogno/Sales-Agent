import  { useState } from 'react';
import { 
  Search, 
  Brain, 
  Users, 
  Shield, 
  Zap, 
  ArrowRight, 
  Menu, 
  X,
  Star,
  TrendingUp,
  Database
} from 'lucide-react';

function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Brain className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Nexus</span>
              </div>
            </div>
            
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {/* Product Dropdown */}
                <div className="relative group">
                  <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Product
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="space-y-3">
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Search className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Universal Search</div>
                            <div className="text-sm text-gray-500">Search across all your tools</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">AI Assistant</div>
                            <div className="text-sm text-gray-500">Get intelligent answers</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Database className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Integrations</div>
                            <div className="text-sm text-gray-500">Connect 100+ apps</div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Solutions Dropdown */}
                <div className="relative group">
                  <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Solutions
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="space-y-3">
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">For Teams</div>
                            <div className="text-sm text-gray-500">Boost team productivity</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Enterprise</div>
                            <div className="text-sm text-gray-500">Scale with confidence</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="font-medium text-gray-900">Analytics</div>
                            <div className="text-sm text-gray-500">Measure knowledge impact</div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources Dropdown */}
                <div className="relative group">
                  <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors flex items-center">
                    Resources
                    <svg className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </a>
                  <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="space-y-3">
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-blue-600">📚</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Documentation</div>
                            <div className="text-sm text-gray-500">API docs and guides</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-blue-600">📝</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Blog</div>
                            <div className="text-sm text-gray-500">Latest insights and tips</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-blue-600">🎓</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Learning Center</div>
                            <div className="text-sm text-gray-500">Tutorials and best practices</div>
                          </div>
                        </a>
                        <a href="#" className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="h-5 w-5 bg-blue-100 rounded flex items-center justify-center mt-0.5">
                            <span className="text-xs font-bold text-blue-600">💬</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Community</div>
                            <div className="text-sm text-gray-500">Connect with other users</div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing - Simple link */}
                <a href="#" className="text-gray-600 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <button className="text-gray-600 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Get Started
              </button>
            </div>

            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="text-gray-600 hover:text-blue-600 p-2"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Product</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Solutions</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Resources</a>
              <a href="#" className="block px-3 py-2 text-gray-600 hover:text-blue-600">Pricing</a>
              <div className="pt-4 pb-2 space-y-2">
                <button className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600">
                  Sign In
                </button>
                <button className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Find anything across your
              <span className="text-blue-600"> entire company</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Nexus transforms how your team discovers, shares, and leverages knowledge. 
              Search across all your apps, documents, and conversations with AI-powered precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg flex items-center transition-all transform hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 hover:border-blue-600 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Watch Demo
              </button>
            </div>
            
            {/* Hero Image Placeholder */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center space-x-4 mb-6">
                  <Search className="h-6 w-6 text-gray-400" />
                  <div className="flex-1 bg-gray-50 rounded-lg py-3 px-4">
                    <span className="text-gray-500">Search for "Q3 marketing strategy"...</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to unlock your company's knowledge
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Powerful search capabilities combined with intelligent insights to help your team work smarter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: "Universal Search",
                description: "Search across all your tools, documents, and conversations from one unified interface."
              },
              {
                icon: Brain,
                title: "AI-Powered Insights",
                description: "Get intelligent answers and recommendations based on your company's collective knowledge."
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-level security with permissions that respect your existing access controls."
              },
              {
                icon: Users,
                title: "Team Collaboration",
                description: "Share discoveries, create knowledge bases, and connect with subject matter experts."
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description: "Get results in milliseconds across petabytes of data with our advanced indexing."
              },
              {
                icon: Database,
                title: "100+ Integrations",
                description: "Connect with all your favorite tools including Slack, Notion, Google Drive, and more."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "500+", label: "Enterprise Customers" },
              { number: "10M+", label: "Searches Per Day" },
              { number: "99.9%", label: "Uptime SLA" },
              { number: "50%", label: "Time Saved" }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by industry leaders
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "Nexus has completely transformed how our team finds and shares information. What used to take hours now takes minutes.",
                author: "Sarah Chen",
                role: "VP of Engineering",
                company: "TechCorp"
              },
              {
                quote: "The AI insights have helped us discover connections and patterns we never knew existed in our data.",
                author: "Michael Rodriguez",
                role: "Chief Data Officer",
                company: "DataFlow"
              },
              {
                quote: "Implementation was seamless and the ROI was immediate. Our knowledge workers are 50% more productive.",
                author: "Emily Johnson",
                role: "Director of Operations",
                company: "Scale Inc"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-600">{testimonial.role}</div>
                  <div className="text-gray-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to unlock your company's knowledge?
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Join thousands of teams who have transformed how they work with Nexus.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white hover:bg-gray-100 text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Start Free Trial
            </button>
            <button className="border-2 border-white hover:bg-white hover:text-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Brain className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold">Nexus</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                The intelligent knowledge platform for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Nexus. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;