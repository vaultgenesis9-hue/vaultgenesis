import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { CheckCircle, Upload, ChevronRight, ChevronLeft, Coins } from "lucide-react";

const STEPS = ["Basic Info", "Supply & Decimals", "Logo Upload", "Review & Deploy"];

interface FormData {
  name: string;
  symbol: string;
  description: string;
  decimals: string;
  initialSupply: string;
  logoUrl: string;
  logoFile: File | null;
}

export default function TokenCreator() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [contractAddress, setContractAddress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    symbol: "",
    description: "",
    decimals: "9",
    initialSupply: "",
    logoUrl: "",
    logoFile: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setFormData({ ...formData, logoFile: file, logoUrl: url });
  };

  const validateStep = () => {
    if (currentStep === 0) {
      if (!formData.name.trim()) { toast.error("Token name is required"); return false; }
      if (!formData.symbol.trim()) { toast.error("Token symbol is required"); return false; }
      if (formData.symbol.length > 10) { toast.error("Symbol must be 10 characters or less"); return false; }
    }
    if (currentStep === 1) {
      if (!formData.initialSupply || isNaN(Number(formData.initialSupply)) || Number(formData.initialSupply) <= 0) {
        toast.error("Enter a valid initial supply"); return false;
      }
      const dec = Number(formData.decimals);
      if (isNaN(dec) || dec < 0 || dec > 18) { toast.error("Decimals must be between 0 and 18"); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setCurrentStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleDeploy = async () => {
    setIsDeploying(true);
    await new Promise(r => setTimeout(r, 2500));
    const mockAddress = "0x" + Array.from({ length: 40 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
    setContractAddress(mockAddress);
    setIsDeploying(false);
    setDeployed(true);
    toast.success(`Token "${formData.name}" deployed successfully!`);
  };

  const resetForm = () => {
    setFormData({ name: "", symbol: "", description: "", decimals: "9", initialSupply: "", logoUrl: "", logoFile: null });
    setCurrentStep(0);
    setDeployed(false);
    setContractAddress("");
  };

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
    isDark
      ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-white/20'
      : 'bg-black/5 border-black/10 text-black placeholder-gray-400 focus:ring-black/20'
  }`;

  const cardClass = `rounded-2xl border backdrop-blur-sm p-6 sm:p-8 ${
    isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-black/10'
  }`;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-[#fafaf8]'} relative overflow-hidden`}>
      {/* Animated background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        {[1, 2, 3].map(i => (
          <div key={i} className={`absolute rounded-full animate-float-glow-${i}`} style={{
            width: i === 1 ? '600px' : '400px',
            height: i === 1 ? '800px' : '500px',
            background: isDark
              ? 'radial-gradient(rgba(255,255,255,0.25) 0%, rgba(0,0,0,0) 70%)'
              : 'radial-gradient(rgba(80,80,80,0.35) 0%, rgba(250,250,248,0) 70%)',
            filter: 'blur(80px)',
            opacity: isDark ? 0.5 : 0.7,
          }} />
        ))}
      </div>

      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      <main className="relative z-10 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-black mb-2 uppercase tracking-tighter ${isDark ? 'text-white' : 'text-black'}`}>
            TOKEN CREATOR
          </h1>
          <p className={`text-sm sm:text-base mb-10 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Deploy your meme coin in minutes
          </p>

          {/* Success Screen */}
          {deployed ? (
            <div className={`${cardClass} text-center`}>
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Token Deployed!</h2>
              <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Your token <strong>{formData.name} ({formData.symbol})</strong> has been successfully deployed to the blockchain.
              </p>

              {/* Token Preview Card */}
              <div className={`rounded-xl border p-4 mb-6 text-left ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                <div className="flex items-center gap-4 mb-4">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Token logo" className="w-14 h-14 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                      {formData.symbol.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className={`text-lg font-black ${isDark ? 'text-white' : 'text-black'}`}>{formData.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formData.symbol}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className={isDark ? 'text-gray-500' : 'text-gray-500'}>Supply</p><p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{Number(formData.initialSupply).toLocaleString()}</p></div>
                  <div><p className={isDark ? 'text-gray-500' : 'text-gray-500'}>Decimals</p><p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{formData.decimals}</p></div>
                  <div className="col-span-2"><p className={isDark ? 'text-gray-500' : 'text-gray-500'}>Contract Address</p><p className={`font-mono text-xs break-all font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>{contractAddress}</p></div>
                </div>
              </div>

              <Button onClick={resetForm} className={`w-full rounded-lg py-2 px-4 font-semibold text-xs uppercase tracking-wide ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}>
                Create Another Token
              </Button>
            </div>
          ) : (
            <>
              {/* Step Indicators */}
              <div className="flex items-center justify-between mb-8">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i < currentStep
                          ? 'bg-green-500 text-white'
                          : i === currentStep
                          ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                          : isDark ? 'bg-white/10 text-gray-500' : 'bg-black/10 text-gray-400'
                      }`}>
                        {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={`text-xs mt-1 hidden sm:block ${i === currentStep ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-gray-600' : 'text-gray-400')}`}>
                        {step}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 ${i < currentStep ? 'bg-green-500' : isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className={cardClass}>
                {/* Step 1: Basic Info */}
                {currentStep === 0 && (
                  <div className="space-y-5">
                    <h2 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Basic Information</h2>
                    <div>
                      <Label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Token Name *</Label>
                      <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Moon Coin" className={inputClass} />
                    </div>
                    <div>
                      <Label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Token Symbol *</Label>
                      <Input name="symbol" value={formData.symbol} onChange={handleChange} placeholder="e.g. MOON" maxLength={10} className={inputClass} />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Max 10 characters</p>
                    </div>
                    <div>
                      <Label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Description</Label>
                      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your token..." rows={3}
                        className={`${inputClass} resize-none`} />
                    </div>
                  </div>
                )}

                {/* Step 2: Supply & Decimals */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <h2 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Supply & Decimals</h2>
                    <div>
                      <Label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Initial Supply *</Label>
                      <Input name="initialSupply" type="number" value={formData.initialSupply} onChange={handleChange} placeholder="e.g. 1000000000" className={inputClass} />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Total number of tokens to mint</p>
                    </div>
                    <div>
                      <Label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Decimals</Label>
                      <Input name="decimals" type="number" value={formData.decimals} onChange={handleChange} min="0" max="18" className={inputClass} />
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Recommended: 9 (Solana) or 18 (EVM). Range: 0–18</p>
                    </div>
                    {/* Live Preview */}
                    {formData.name && formData.symbol && formData.initialSupply && (
                      <div className={`rounded-xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                        <p className={`text-xs uppercase font-bold mb-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Live Preview</p>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                            {formData.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <p className={`font-black ${isDark ? 'text-white' : 'text-black'}`}>{formData.name} <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>({formData.symbol})</span></p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{Number(formData.initialSupply).toLocaleString()} tokens · {formData.decimals} decimals</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Logo Upload */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <h2 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Token Logo</h2>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                        isDark ? 'border-white/20 hover:border-white/40' : 'border-black/20 hover:border-black/40'
                      }`}
                    >
                      {formData.logoUrl ? (
                        <div className="flex flex-col items-center gap-3">
                          <img src={formData.logoUrl} alt="Token logo preview" className="w-24 h-24 rounded-full object-cover border-4 border-white/20" />
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Click to change logo</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className={`w-10 h-10 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>Upload Logo</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>PNG, JPG, GIF up to 2MB · Recommended: 256×256px</p>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Logo is optional — you can skip this step</p>
                  </div>
                )}

                {/* Step 4: Review & Deploy */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <h2 className={`text-xl font-black mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Review & Deploy</h2>

                    {/* Token Preview Card */}
                    <div className={`rounded-xl border p-5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                      <div className="flex items-center gap-4 mb-4">
                        {formData.logoUrl ? (
                          <img src={formData.logoUrl} alt="Token logo" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-lg ${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}`}>
                            {formData.symbol ? formData.symbol.slice(0, 2) : <Coins className="w-6 h-6" />}
                          </div>
                        )}
                        <div>
                          <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{formData.name}</p>
                          <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{formData.symbol}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div><p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Initial Supply</p><p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{Number(formData.initialSupply).toLocaleString()}</p></div>
                        <div><p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Decimals</p><p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{formData.decimals}</p></div>
                        {formData.description && (
                          <div className="col-span-2"><p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Description</p><p className={`font-bold ${isDark ? 'text-white' : 'text-black'}`}>{formData.description}</p></div>
                        )}
                      </div>
                    </div>

                    <div className={`rounded-xl border p-4 text-sm ${isDark ? 'bg-yellow-900/20 border-yellow-700/30 text-yellow-400' : 'bg-yellow-50 border-yellow-300 text-yellow-700'}`}>
                      ⚠️ Deploying a token is irreversible. Please review all details carefully before proceeding.
                    </div>

                    <Button
                      onClick={handleDeploy}
                      disabled={isDeploying}
                      className={`w-full rounded-lg py-2 px-4 font-semibold text-xs uppercase tracking-wide ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      {isDeploying ? (
                        <span className="flex items-center gap-2"><span className="animate-spin">⟳</span> Deploying...</span>
                      ) : "Deploy Token"}
                    </Button>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 gap-3">
                  <Button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    variant="outline"
                    className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide border ${
                      isDark ? 'border-white/20 text-white hover:bg-white/10' : 'border-black/20 text-black hover:bg-black/5'
                    } disabled:opacity-30`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  {currentStep < STEPS.length - 1 && (
                    <Button
                      onClick={nextStep}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wide ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
