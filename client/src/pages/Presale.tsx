import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Presale() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);

  const presaleStats = {
    totalRaised: "$1,250,000",
    totalTokens: "5,000,000 VG",
    tokenPrice: "$0.25",
    progress: 75,
    timeRemaining: "5 days 12 hours",
  };

  const handleBuyTokens = () => {
    if (!walletConnected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Successfully purchased ${amount} VG tokens!`);
    setAmount("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">PRESALE</h1>
          <p className="text-lg text-muted-foreground mb-12">
            Get early access to VG tokens at a special presale price
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-wider">Presale Progress</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground uppercase font-bold">Raised</span>
                    <span className="font-bold text-foreground">{presaleStats.totalRaised}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div
                      className="bg-accent h-3 rounded-full"
                      style={{ width: `${presaleStats.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 p-6 bg-background rounded-lg border border-border">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Token Price</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{presaleStats.tokenPrice}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Total Tokens</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{presaleStats.totalTokens}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Time Left</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{presaleStats.timeRemaining}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground uppercase font-bold">Progress</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{presaleStats.progress}%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="amount" className="text-foreground font-bold uppercase text-sm">
                    Amount (USDC)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount in USDC"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-input border-border text-foreground"
                  />
                  <div className="text-sm text-muted-foreground">
                    You will receive: {amount ? (parseFloat(amount) / 0.25).toFixed(0) : "0"} VG tokens
                  </div>
                  <Button
                    onClick={handleBuyTokens}
                    size="lg"
                    className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase"
                  >
                    {walletConnected ? "BUY TOKENS" : "CONNECT WALLET TO BUY"}
                  </Button>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Wallet</h3>
                {walletConnected ? (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">Connected</p>
                    <p className="font-mono text-sm text-foreground mb-4">0x742d...8f2e</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-foreground text-foreground"
                      onClick={() => setWalletConnected(false)}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    className="w-full bg-foreground text-background hover:bg-accent font-bold"
                    onClick={() => setWalletConnected(true)}
                  >
                    Connect Wallet
                  </Button>
                )}
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Presale Tiers</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier 1</span>
                    <span className="text-foreground">$0.20 (SOLD OUT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier 2</span>
                    <span className="text-accent font-bold">$0.25 (CURRENT)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tier 3</span>
                    <span className="text-foreground">$0.30 (UPCOMING)</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
