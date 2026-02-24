import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Admin() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const stats = [
    { label: "Total Users", value: "1,234" },
    { label: "Tokens Created", value: "314" },
    { label: "Total Volume", value: "$2.4M" },
    { label: "Active Bots", value: "89" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <main className="pt-24 pb-20">
        <div className="container">
          <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter">ADMIN DASHBOARD</h1>
          <p className="text-lg text-muted-foreground mb-12">Manage the VaultGenesis platform</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6 bg-card border-border">
                <p className="text-sm text-muted-foreground uppercase font-bold mb-2">{stat.label}</p>
                <p className="text-3xl font-black text-foreground">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-black text-foreground mb-4 uppercase tracking-wider">User Management</h2>
              <p className="text-muted-foreground mb-4">View and manage platform users</p>
              <Button className="bg-foreground text-background hover:bg-accent font-bold uppercase">Manage Users</Button>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-black text-foreground mb-4 uppercase tracking-wider">Transaction Monitoring</h2>
              <p className="text-muted-foreground mb-4">Monitor all platform transactions</p>
              <Button className="bg-foreground text-background hover:bg-accent font-bold uppercase">View Transactions</Button>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-black text-foreground mb-4 uppercase tracking-wider">Token Management</h2>
              <p className="text-muted-foreground mb-4">Manage created tokens</p>
              <Button className="bg-foreground text-background hover:bg-accent font-bold uppercase">Manage Tokens</Button>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-black text-foreground mb-4 uppercase tracking-wider">Platform Settings</h2>
              <p className="text-muted-foreground mb-4">Configure platform settings</p>
              <Button className="bg-foreground text-background hover:bg-accent font-bold uppercase">Settings</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
