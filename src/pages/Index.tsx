import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Warehouse, Truck, Shield, Zap, Star, ArrowRight, Thermometer, MapPin, Sprout } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import ChatWidget from "@/components/ChatWidget";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6 } }),
};

const features = [
  { icon: Warehouse, title: "Cold Storage Booking", desc: "Find and book temperature-controlled warehouses near you in seconds.", color: "bg-accent text-accent-foreground" },
  { icon: Truck, title: "Farm Vehicle Hire", desc: "Book refrigerated trucks, pickups, and mini-trucks for seamless transport.", color: "bg-secondary/10 text-secondary" },
  { icon: Shield, title: "Secure Payments", desc: "QR-based entry codes and secure digital payment processing.", color: "bg-accent text-accent-foreground" },
  { icon: Zap, title: "Real-Time Tracking", desc: "Live tracking of your cargo with instant status updates.", color: "bg-secondary/10 text-secondary" },
];

const stats = [
  { value: "500+", label: "Warehouses" },
  { value: "1200+", label: "Vehicles" },
  { value: "50K+", label: "Farmers" },
  { value: "₹2Cr+", label: "Saved" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Agricultural landscape" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/20" />
        </div>
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          >
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> India's #1 Agri-Logistics Platform
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-6xl font-display font-extrabold text-primary-foreground leading-tight mb-6">
              Book Cold Storage &<br />Farm Vehicles <span className="text-secondary">Instantly</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-lg">
              Connect with nearby warehouses and transport. Reduce post-harvest losses. Grow your income — all from your phone.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4">
              <Link to="/explore">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8 h-12">
                  <Warehouse className="w-5 h-5 mr-2" /> Find Cold Storage
                </Button>
              </Link>
              <Link to="/vehicles">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-semibold text-base px-8 h-12">
                  <Truck className="w-5 h-5 mr-2" /> Hire a Vehicle
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-primary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <p className="text-3xl md:text-4xl font-display font-extrabold text-primary-foreground">{s.value}</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">From cold storage booking to farm vehicle hire — all in one platform built for Indian farmers.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className="p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-shadow duration-300 border border-border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className={`w-12 h-12 rounded-lg ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-accent/30">
        <div className="container mx-auto px-4">
          <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to get started</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Search Nearby", desc: "Use your location to find cold storages and vehicles near you.", icon: MapPin },
              { step: "2", title: "Compare & Book", desc: "Compare prices, temperature, availability and book instantly.", icon: Thermometer },
              { step: "3", title: "Track & Manage", desc: "Get QR entry codes, track vehicles, manage from your dashboard.", icon: Star },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">Ready to Reduce Post-Harvest Losses?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg mx-auto">Join thousands of farmers saving money with smarter cold storage and transport.</p>
            <Link to="/auth?mode=signup">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold text-base px-8 h-12">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center">
                <Sprout className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-primary-foreground">AgriStore</span>
            </div>
            <p className="text-sm text-primary-foreground/50">© 2026 AgriStore. Built for Indian Farmers 🇮🇳</p>
          </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
};

export default Index;
