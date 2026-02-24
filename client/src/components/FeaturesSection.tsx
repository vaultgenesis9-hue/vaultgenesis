import { Zap, Lock, TrendingUp, Wallet, Bot, Shield } from "lucide-react";
import { Link } from "wouter";

const features = [
  {
    icon: Zap,
    title: "Token Creator",
    description: "Launch your meme coin in seconds with our simple token creation tool",
    href: "/token-creator",
  },
  {
    icon: Lock,
    title: "Presale",
    description: "Run a secure presale for your platform token with tiered pricing",
    href: "/presale",
  },
  {
    icon: TrendingUp,
    title: "Staking",
    description: "Earn rewards by staking tokens and participating in the ecosystem",
    href: "/staking",
  },
  {
    icon: Wallet,
    title: "Wallet",
    description: "Secure wallet to hold, send, and receive your crypto assets",
    href: "/wallet",
  },
  {
    icon: Bot,
    title: "Bot Trading",
    description: "Automated trading bot that trades based on market conditions",
    href: "/bot-trading",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Enterprise-grade security with multi-signature wallets and audits",
    href: "#",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-background border-t border-border">
      <div className="container">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-foreground uppercase tracking-tighter">
            Everything You Need
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A complete Web3 platform for creating, trading, and managing your crypto assets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.title} href={feature.href}>
                <a className="group p-8 bg-card border border-border rounded-lg hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/20">
                  <Icon className="w-12 h-12 text-accent mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-bold text-foreground mb-3 uppercase tracking-wider">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </a>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
