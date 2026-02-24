import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Wallet() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [sendTo, setSendTo] = useState("");

  const walletAssets = [
    { symbol: "VG", balance: "50,000", value: "$12,500" },
    { symbol: "USDC", balance: "5,000", value: "$5,000" },
    { symbol: "ETH", balance: "2.5", value: "$6,250" },
  ];

  const handleSend = () => {
    if (!sendAmount || !sendTo) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success(`Sent ${sendAmount} tokens to ${sendTo}`);
    setSendAmount("");
    setSendTo("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">WALLET</h1>
          <p className="text-lg text-muted-foreground mb-12">Manage your crypto assets</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-wider">Send Tokens</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sendTo" className="text-foreground font-bold uppercase text-sm">Recipient Address</Label>
                    <Input
                      id="sendTo"
                      placeholder="0x..."
                      value={sendTo}
                      onChange={(e) => setSendTo(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sendAmount" className="text-foreground font-bold uppercase text-sm">Amount</Label>
                    <Input
                      id="sendAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    size="lg"
                    className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase"
                  >
                    SEND
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-wider">Your Assets</h2>
                {walletAssets.map((asset) => (
                  <Card key={asset.symbol} className="p-6 bg-card border-border flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{asset.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{asset.balance}</p>
                    </div>
                    <p className="text-lg font-bold text-accent">{asset.value}</p>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Wallet Address</h3>
                <p className="font-mono text-sm text-foreground break-all mb-4">0x742d35Cc6634C0532925a3b844Bc9e7595f8f2e</p>
                <Button size="sm" className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase">
                  COPY
                </Button>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Total Balance</h3>
                <p className="text-3xl font-black text-accent">$23,750</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
