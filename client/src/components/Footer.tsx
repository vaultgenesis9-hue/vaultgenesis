import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-black text-foreground mb-4 uppercase tracking-wider">VaultGenesis</h3>
            <p className="text-sm text-muted-foreground">
              The complete Web3 platform for creating, trading, and managing crypto assets.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-2">
              <li><Link href="/token-creator"><a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Token Creator</a></Link></li>
              <li><Link href="/presale"><a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Presale</a></Link></li>
              <li><Link href="/staking"><a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Staking</a></Link></li>
              <li><Link href="/wallet"><a className="text-sm text-muted-foreground hover:text-foreground transition-colors">Wallet</a></Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black text-foreground mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2026 VaultGenesis. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
