import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function BotTrading() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");

  const activeBots = [
    { id: 1, token: "VG", status: "Active", profit: "+$2,450", trades: 24 },
    { id: 2, token: "USDC", status: "Active", profit: "+$890", trades: 12 },
    { id: 3, token: "ETH", status: "Paused", profit: "+$1,200", trades: 8 },
  ];

  const handleCreateBot = () => {
    if (!buyPrice || !sellPrice) {
      toast.error("Please fill in all fields");
      return;
    }
    toast.success("Bot created successfully!");
    setBuyPrice("");
    setSellPrice("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">BOT TRADING</h1>
          <p className="text-lg text-muted-foreground mb-12">Automate your trading with AI-powered bots</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-8 bg-card border-border">
                <h2 className="text-2xl font-black mb-6 uppercase tracking-wider">Create Trading Bot</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="buyPrice" className="text-foreground font-bold uppercase text-sm">Buy Price (USD)</Label>
                    <Input
                      id="buyPrice"
                      type="number"
                      placeholder="Enter buy price"
                      value={buyPrice}
                      onChange={(e) => setBuyPrice(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sellPrice" className="text-foreground font-bold uppercase text-sm">Sell Price (USD)</Label>
                    <Input
                      id="sellPrice"
                      type="number"
                      placeholder="Enter sell price"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      className="mt-2 bg-input border-border text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleCreateBot}
                    size="lg"
                    className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase"
                  >
                    CREATE BOT
                  </Button>
                </div>
              </Card>

              <div className="space-y-4">
                <h2 className="text-2xl font-black uppercase tracking-wider">Active Bots</h2>
                {activeBots.map((bot) => (
                  <Card key={bot.id} className="p-6 bg-card border-border">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{bot.token} TRADING BOT</h3>
                        <p className={`text-sm font-bold ${bot.status === "Active" ? "text-accent" : "text-muted-foreground"}`}>
                          {bot.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="border-foreground text-foreground">
                        {bot.status === "Active" ? "PAUSE" : "RESUME"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase font-bold">Profit</p>
                        <p className="font-bold text-accent mt-2">{bot.profit}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase font-bold">Trades</p>
                        <p className="font-bold text-foreground mt-2">{bot.trades}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Total Profit</h3>
                <p className="text-3xl font-black text-accent">+$4,540</p>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">Total Trades</h3>
                <p className="text-3xl font-black text-foreground">44</p>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
