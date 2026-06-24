import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, useInView } from "framer-motion";
import {
  Flame,
  Shield,
  CreditCard,
  Sparkles,
  Star,
  Gift,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ObsidianFlow from "@/components/effects/ObsidianFlow";
import { trpc } from "@/providers/trpc";

// ─── Fade In Section ─────────────────────────────────────────────────
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Navigation ──────────────────────────────────────────────────────
function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Discover", href: "#featured" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Blog", href: "/blog" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass glass-border" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gradient-crimson" style={{ fontFamily: "'Playfair Display', serif" }}>
            EliteHub
          </span>
          <div className="w-2 h-2 rounded-full bg-[#E11D48]" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors"
              >
                {link.label}
              </a>
            )
          )}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-[#F5E6D3] hover:text-white hover:bg-white/5">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full px-5">
              Join Free
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#F5E6D3]"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass glass-border border-t-0 px-6 pb-6">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] py-2"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              )
            )}
            <div className="flex gap-3 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button variant="outline" className="w-full border-white/10 text-[#F5E6D3]">
                  Login
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                <Button className="w-full gradient-crimson text-white border-0">
                  Join Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero Section ────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ObsidianFlow />
      <div className="hero-glow absolute inset-0 pointer-events-none" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xs font-medium tracking-[0.2em] text-[#E11D48] mb-6 uppercase"
        >
          The Premium Companion Platform
        </motion.p>

        <div className="mb-6">
          {["Connect.", "Earn.", "Thrive."].map((word, i) => (
            <motion.h1
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 * (i + 1), ease: "easeOut" }}
              className="text-5xl sm:text-6xl md:text-7xl font-bold text-[#F5E6D3] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {word}
            </motion.h1>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-base text-[#9CA3AF] max-w-xl mx-auto mb-8 leading-relaxed"
        >
          The all-in-one platform for elite companions and discerning clients.
          Secure messaging, instant payments, and AI-powered growth tools.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/register">
            <Button
              size="lg"
              className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-rose-900/30"
            >
              Start Earning <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/browse">
            <Button
              size="lg"
              variant="outline"
              className="glass glass-border text-[#F5E6D3] hover:bg-white/5 rounded-full px-8 py-6 text-base"
            >
              Explore Companions
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="flex items-center justify-center gap-6 text-xs text-[#9CA3AF] tracking-wide"
        >
          <span><span className="text-[#F5E6D3] font-semibold">2,400+</span> Companions</span>
          <span className="w-1 h-1 rounded-full bg-[#9CA3AF]" />
          <span><span className="text-[#F5E6D3] font-semibold">$1.2M+</span> Paid Out</span>
          <span className="w-1 h-1 rounded-full bg-[#9CA3AF]" />
          <span><span className="text-[#F5E6D3] font-semibold">50K+</span> Clients</span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Companions ─────────────────────────────────────────────
function FeaturedSection() {
  const { data } = trpc.user.getFeatured.useQuery({ limit: 6 });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 340, behavior: "smooth" });
    }
  };

  return (
    <section id="featured" className="py-20 px-6 relative">
      <div className="max-w-[1440px] mx-auto">
        <FadeInSection>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Flame className="w-5 h-5 text-[#E11D48]" />
              <h2
                className="text-3xl font-bold text-[#F5E6D3]"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Featured Companions
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => scroll(-1)}
                className="w-10 h-10 rounded-full glass glass-border flex items-center justify-center text-[#F5E6D3] hover:border-[#E11D48]/30 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll(1)}
                className="w-10 h-10 rounded-full glass glass-border flex items-center justify-center text-[#F5E6D3] hover:border-[#E11D48]/30 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </FadeInSection>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {data?.map((companion, i) => (
            <FadeInSection key={companion.id} delay={i * 0.1}>
              <Link to="/browse" className="block flex-shrink-0">
                <div
                  className="w-[300px] rounded-xl overflow-hidden card-shadow group cursor-pointer"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative h-[360px] overflow-hidden">
                    <img
                      src={companion.avatar ?? "/assets/companion-avatar-1.jpg"}
                      alt={companion.name ?? "Companion"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {companion.isFeatured && (
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium gradient-gold text-[#0A0A0F]">
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">
                        {companion.name}
                      </h3>
                      <p className="text-sm text-[#9CA3AF]">
                        {companion.location}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </FadeInSection>
          ))}

          {!data?.length &&
            [1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="w-[300px] flex-shrink-0 rounded-xl overflow-hidden card-shadow"
              >
                <div className="relative h-[360px]">
                  <img
                    src={`/assets/companion-avatar-${i}.jpg`}
                    alt={`Companion ${i}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">
                      {["Sophia Chen", "Marcus Rivera", "Isabella Romano", "Victoria Ashford", "James Whitfield", "Anastasia Volkov"][i - 1]}
                    </h3>
                    <p className="text-sm text-[#9CA3AF]">
                      {["New York", "London", "Milan", "Los Angeles", "Dubai", "Paris"][i - 1]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      icon: <Sparkles className="w-6 h-6 text-white" />,
      title: "Create Your Profile",
      description:
        "Set up your premium profile with photos, bio, and pricing. Our AI helps optimize for maximum visibility.",
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      title: "Connect & Earn",
      description:
        "Message clients securely, sell exclusive content, receive gifts. All payments are instant and secure.",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: "Grow Automatically",
      description:
        "Our AI handles marketing, social media, SEO blog posts, and ad campaigns while you focus on what you do best.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 relative">
      <div className="max-w-[1440px] mx-auto">
        <FadeInSection className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            How It Works
          </h2>
          <p className="text-[#9CA3AF] max-w-lg mx-auto">
            Three simple steps to start your journey on EliteHub
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <FadeInSection key={i} delay={i * 0.15}>
              <div className="glass glass-border rounded-xl p-8 hover:border-[#E11D48]/20 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-full gradient-crimson flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-rose-900/30 transition-shadow">
                  {step.icon}
                </div>
                <div className="text-xs text-[#E11D48] font-medium mb-2 tracking-wider uppercase">
                  Step {i + 1}
                </div>
                <h3 className="text-xl font-bold text-[#F5E6D3] mb-3">{step.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{step.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features Grid ───────────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure Messaging",
      description: "End-to-end encrypted DMs with automatic contact detection",
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Instant Payments",
      description: "M-Pesa & international card payments with auto 50/50 split",
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Content Studio",
      description: "Auto-generate blog posts, social media, and marketing",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Featured Placement",
      description: "Pay to appear on the homepage carousel",
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: "Gift System",
      description: "Clients send gifts, companions receive 50% instantly",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "CEO Dashboard",
      description: "Real-time analytics, reports, and campaign management",
    },
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        <FadeInSection className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Platform Features
          </h2>
          <p className="text-[#9CA3AF] max-w-lg mx-auto">
            Everything you need to succeed, all in one platform
          </p>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <FadeInSection key={i} delay={i * 0.08}>
              <div className="glass glass-border rounded-xl p-6 hover:border-[#E11D48]/20 transition-all duration-300 group h-full">
                <div className="w-12 h-12 rounded-lg bg-[#E11D48]/10 flex items-center justify-center text-[#E11D48] mb-4 group-hover:bg-[#E11D48]/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[#F5E6D3] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{feature.description}</p>
              </div>
            </FadeInSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing Section ─────────────────────────────────────────────────
function PricingSection() {
  return (
    <section id="pricing" className="py-20 px-6">
      <div className="max-w-[1440px] mx-auto">
        <FadeInSection className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl font-bold text-[#F5E6D3] mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Choose Your Path
          </h2>
          <p className="text-[#9CA3AF] max-w-lg mx-auto">
            Transparent pricing with no hidden fees
          </p>
        </FadeInSection>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Companion Plan */}
          <FadeInSection delay={0}>
            <div className="glass glass-border-glow rounded-xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 gradient-crimson" />
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">Companion Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#F5E6D3]">$20</span>
                  <span className="text-sm text-[#9CA3AF]">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Premium profile with photos",
                  "Earn 50% of all media sales + gifts",
                  "Unlimited client conversations",
                  "AI-powered growth tools",
                  "Withdrawal system",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#9CA3AF]">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className="w-full gradient-crimson text-white border-0 hover:opacity-90 rounded-full">
                  Start Earning
                </Button>
              </Link>
            </div>
          </FadeInSection>

          {/* Client Plan */}
          <FadeInSection delay={0.15}>
            <div className="glass glass-border rounded-xl p-8 relative overflow-hidden">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#F5E6D3] mb-1">Client Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-[#F5E6D3]">$30</span>
                  <span className="text-sm text-[#9CA3AF]">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse & filter companion profiles",
                  "Unlimited messaging",
                  "Send gifts (50/50 split)",
                  "Featured visibility option",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[#9CA3AF]">
                    <div className="w-5 h-5 rounded-full bg-[#10B981]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className="w-full glass glass-border text-[#F5E6D3] hover:bg-white/5 rounded-full">
                  Join as Client
                </Button>
              </Link>
            </div>
          </FadeInSection>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-16 px-6">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-gradient-crimson" style={{ fontFamily: "'Playfair Display', serif" }}>
                EliteHub
              </span>
              <div className="w-2 h-2 rounded-full bg-[#E11D48]" />
            </div>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              The premier platform for elite companionship. Secure, automated, and designed for success.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-4">Platform</h4>
            <ul className="space-y-2">
              {["Discover", "How It Works", "Pricing", "Blog", "FAQ"].map((item) => (
                <li key={item}>
                  <Link to={item === "Discover" ? "/browse" : item === "Blog" ? "/blog" : "/"} className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-4">Legal</h4>
            <ul className="space-y-2">
              {["Terms of Service", "Privacy Policy", "Content Guidelines", "18+ Policy"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[#F5E6D3] mb-4">Connect</h4>
            <ul className="space-y-2">
              {["Support", "Twitter", "Instagram"].map((item) => (
                <li key={item}>
                  <span className="text-sm text-[#9CA3AF] hover:text-[#F5E6D3] transition-colors cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
          <p className="text-xs text-[#9CA3AF]">
            &copy; 2026 EliteHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium">
            <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
            18+ Only
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Main Landing Page ───────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <Navigation />
      <HeroSection />
      <FeaturedSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
