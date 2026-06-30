import { Star, Heart, Shield, Zap, Crown, Gem, ArrowRight, Users, MessageCircle, CreditCard, Lock, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#E11D48]/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#E11D48]/10 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-[#E11D48]">
                <Crown className="w-4 h-4" />
                <span>Premium Companion Marketplace</span>
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
                Discover <span className="text-gradient-crimson">Exceptional</span>
                <br />
                Connections
              </h1>

              <p className="text-lg text-[#A09B8C] max-w-lg leading-relaxed">
                Elite companions, curated experiences, and secure connections. Your journey to unforgettable moments starts here.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-full font-semibold transition-all"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/browse"
                  className="inline-flex items-center gap-2 px-8 py-4 glass hover:bg-white/10 text-white rounded-full font-semibold transition-all"
                >
                  Explore Companions
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-[#A09B8C]">
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#E11D48]" />
                  Verified Profiles
                </span>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#E11D48]" />
                  Secure Payments
                </span>
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#E11D48]" />
                  Global Access
                </span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden glass">
                <Image
                  src="/assets/companion-avatar-1.jpg"
                  alt="Elite companion"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E11D48] flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">2,500+</p>
                  <p className="text-sm text-[#A09B8C]">Active Members</p>
                </div>
              </div>
              <div className="absolute -top-6 -right-6 glass rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E11D48] flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">4.9</p>
                  <p className="text-sm text-[#A09B8C]">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Why Choose <span className="text-gradient-crimson">ELITEHUB</span>
            </h2>
            <p className="text-[#A09B8C] max-w-2xl mx-auto">
              The premier platform for premium companionship, built with security, elegance, and your satisfaction in mind.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Verified & Secure",
                description: "Every profile is manually verified. Your privacy and security are our top priorities.",
              },
              {
                icon: CreditCard,
                title: "Easy Payments",
                description: "Seamless payment integration with PesaPal. Top up your wallet and spend with confidence.",
              },
              {
                icon: MessageCircle,
                title: "Real-time Chat",
                description: "Connect instantly with companions through our secure messaging platform.",
              },
              {
                icon: Gem,
                title: "Premium Content",
                description: "Exclusive albums, custom requests, and personalized experiences from top companions.",
              },
              {
                icon: Zap,
                title: "Instant Bookings",
                description: "Browse, filter, and connect with companions in real-time. No waiting, no hassle.",
              },
              {
                icon: Heart,
                title: "Favorites & Gifts",
                description: "Save your favorite companions and send virtual gifts to show appreciation.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-[#E11D48]/10 flex items-center justify-center mb-6 group-hover:bg-[#E11D48]/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-[#E11D48]" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-[#A09B8C] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companions */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-2">
                Featured <span className="text-gradient-crimson">Companions</span>
              </h2>
              <p className="text-[#A09B8C]">Handpicked elite companions available now</p>
            </div>
            <Link
              href="/browse"
              className="hidden md:inline-flex items-center gap-2 text-[#E11D48] hover:text-[#E11D48]/80 font-semibold transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="glass rounded-2xl overflow-hidden hover:bg-white/10 transition-all group"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={`/assets/companion-avatar-${i}.jpg`}
                    alt={`Companion ${i}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#E11D48]/90 text-white text-xs font-semibold">
                      <Star className="w-3 h-3 fill-white" />
                      4.9
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">Elite Companion {i}</h3>
                  <p className="text-sm text-[#A09B8C] mb-3">Nairobi, Kenya</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#E11D48] font-semibold">KES 5,000/hr</span>
                    <Link
                      href="/register"
                      className="px-4 py-2 rounded-full bg-[#E11D48]/10 hover:bg-[#E11D48]/20 text-[#E11D48] text-sm font-semibold transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#E11D48]/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
                Ready to Elevate Your <span className="text-gradient-crimson">Experience</span>?
              </h2>
              <p className="text-[#A09B8C] max-w-2xl mx-auto mb-8 text-lg">
                Join thousands of satisfied members who have discovered exceptional connections through ELITEHUB.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#E11D48] hover:bg-[#E11D48]/90 text-white rounded-full font-semibold transition-all"
                >
                  Create Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-8 py-4 glass hover:bg-white/10 text-white rounded-full font-semibold transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-display text-2xl font-bold text-gradient-crimson mb-4">ELITEHUB</h3>
              <p className="text-sm text-[#A09B8C]">
                Premium companion marketplace connecting elite individuals with exceptional experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-[#A09B8C]">
                <li><Link href="/browse" className="hover:text-white transition-colors">Browse</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[#A09B8C]">
                <li><Link href="#" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Partners</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[#A09B8C]">
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-[#A09B8C]">
            <p>&copy; {new Date().getFullYear()} ELITEHUB. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
