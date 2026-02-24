import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Staking() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stakeAmount, setStakeAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("VG");

  const stakingTokens = [
    { symbol: "VG", apy: "45%", staked: "2,500,000", earned: "125,000" },
    { symbol: "USDC", apy: "12%", staked: "500,000", earned: "60,000" },
    { symbol: "ETH", apy: "8%", staked: "100", earned: "8" },
  ];

  const handleStake = () => {
    if (!stakeAmount) {
      toast.error("Please enter an amount");
      return;
    }
    toast.success(`Successfully staked ${stakeAmount} ${selectedToken}!`);
    setStakeAmount("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">STAKING</h1>
          <p className="text-lg text-muted-foreground mb-12">Earn rewards by staking your tokens</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-wider">Stake Tokens</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground font-bold uppercase text-sm">Select Token</Label>
                    <select
                      value={selectedToken}
                      onChange={(e) => setSelectedToken(e.target.value)}
                      className="mt-2 w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
                    >
                      {stakingTokens.map((t) => (
                        <option key={t.symbol} value={t.symbol}>{t.symbol}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="stakeAmount" className="text-foreground font-bold uppercase text-sm">Amount</Label>
                    <Input
                      id="stakeAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleStake}
                    size="lg"
                    className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase"
                  >
                    STAKE NOW
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-wider">Your Positions</h2>
                {stakingTokens.map((token) => (
                  <Card key={token.symbol} className="p-6 bg-card border-border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{token.symbol}</h3>
                        <p className="text-sm text-muted-foreground">APY: {token.apy}</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-foreground text-foreground">
                        UNSTAKE
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase font-bold">Staked</p>
                        <p className="font-bold text-foreground mt-2">{token.staked}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase font-bold">Earned</p>
                        <p className="font-bold text-accent mt-2">{token.earned}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Total Rewards</h3>
                <p className="text-3xl font-black text-accent">$193,000</p>
                <Button size="sm" className="w-full mt-4 bg-foreground text-background hover:bg-accent font-bold uppercase">
                  CLAIM ALL
                </Button>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Total Staked</h3>
                <p className="text-3xl font-black text-foreground">$3.1M</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
