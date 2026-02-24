import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TokenCreator from "./pages/TokenCreator";
import Presale from "./pages/Presale";
import Staking from "./pages/Staking";
import Wallet from "./pages/Wallet";
import BotTrading from "./pages/BotTrading";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/token-creator"} component={TokenCreator} />
      <Route path={"/presale"} component={Presale} />
      <Route path={"/staking"} component={Staking} />
      <Route path={"/wallet"} component={Wallet} />
      <Route path={"/bot-trading"} component={BotTrading} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
