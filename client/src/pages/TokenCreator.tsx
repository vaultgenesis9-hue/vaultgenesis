import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function TokenCreator() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    decimals: "9",
    initialSupply: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.symbol || !formData.initialSupply) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success(`Token "${formData.name}" created successfully!`);
    setFormData({ name: "", symbol: "", description: "", decimals: "9", initialSupply: "" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">CREATE TOKEN</h1>
            <p className="text-lg text-muted-foreground mb-12">
              Launch your meme coin in seconds. No coding required.
            </p>

            <Card className="p-8 bg-card border-border">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-foreground font-bold uppercase text-sm">
                    Token Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Doge Moon"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="symbol" className="text-foreground font-bold uppercase text-sm">
                    Token Symbol *
                  </Label>
                  <Input
                    id="symbol"
                    name="symbol"
                    placeholder="e.g., DMOON"
                    maxLength={6}
                    value={formData.symbol}
                    onChange={handleChange}
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-foreground font-bold uppercase text-sm">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your token..."
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-2 w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <Label htmlFor="decimals" className="text-foreground font-bold uppercase text-sm">
                    Decimals
                  </Label>
                  <Input
                    id="decimals"
                    name="decimals"
                    type="number"
                    min="0"
                    max="18"
                    value={formData.decimals}
                    onChange={handleChange}
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <div>
                  <Label htmlFor="initialSupply" className="text-foreground font-bold uppercase text-sm">
                    Initial Supply *
                  </Label>
                  <Input
                    id="initialSupply"
                    name="initialSupply"
                    type="number"
                    placeholder="e.g., 1000000"
                    value={formData.initialSupply}
                    onChange={handleChange}
                    className="mt-2 bg-input border-border text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-foreground text-background hover:bg-accent font-bold uppercase"
                >
                  CREATE TOKEN
                </Button>
              </form>
            </Card>

            <Card className="mt-8 p-6 bg-card border-border">
              <h3 className="font-bold text-foreground mb-4 uppercase tracking-wider">What happens next?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Your token will be deployed to the blockchain</li>
                <li>✓ You'll receive the token contract address</li>
                <li>✓ You can then set up presale or staking</li>
                <li>✓ Share your token with the community</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
