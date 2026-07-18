"use client"

import { useState } from "react"
import { Check, ArrowLeft, ArrowRight, Zap, Shield, Sparkles, SendToBackIcon as BackIcon, X, CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

const plans = [
  {
    id: "normal",
    name: "Normal",
    subtitle: "Getting Started",
    price: "Free",
    period: "forever",
    description: "Perfect to try out the platform and get a feel for our tools.",
    features: [
      "Up to 1,000 subscribers",
      "5 email campaigns per month",
      "Basic templates",
      "Email support",
      "Basic analytics",
    ],
    buttonText: "Start Free Trial",
    popular: false,
    color: "from-cyan-500 to-blue-600",
    textColor: "text-white",
    subtitleColor: "text-cyan-100",
    buttonClass: "bg-white text-blue-600 hover:bg-gray-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    icon: <Shield className="h-6 w-6 text-white" />
  },
  {
    id: "popular",
    name: "Popular",
    subtitle: "Most Chosen",
    price: "$9.99",
    period: "/mo",
    description: "Best for growing campaigns and reaching a wider audience.",
    features: [
      "Up to 10,000 subscribers",
      "Unlimited email campaigns",
      "Premium templates",
      "Priority support",
      "Advanced analytics",
      "A/B testing",
      "Automation workflows",
    ],
    buttonText: "Get Started",
    popular: true,
    color: "from-orange-500 to-red-500",
    textColor: "text-white",
    subtitleColor: "text-orange-100",
    buttonClass: "bg-white text-orange-600 hover:bg-gray-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    icon: <Zap className="h-6 w-6 text-white" />
  },
  {
    id: "future",
    name: "Future",
    subtitle: "Enterprise Grade",
    price: "$29.99",
    period: "/mo",
    originalPrice: "$49.99",
    description: "Maximum power, infinite scale, and dedicated infrastructure.",
    features: [
      "Everything in Popular plan",
      "Up to 25,000 subscribers",
      "White-label emails",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced segmentation",
    ],
    buttonText: "Claim Offer",
    popular: false,
    color: "from-fuchsia-500 to-purple-600",
    textColor: "text-white",
    subtitleColor: "text-fuchsia-100",
    buttonClass: "bg-white text-purple-600 hover:bg-gray-50 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    badge: "50% OFF",
    icon: <Sparkles className="h-6 w-6 text-white" />
  },
]

export default function UpgradePage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<any>(null)
  const { toast } = useToast()

  const handlePlanSelect = (plan: any) => {
    if (plan.id === "normal") {
      toast({
        title: "Current Plan",
        description: "You are already subscribed to the Normal plan.",
      })
      return
    }
    
    setSelectedPlan(plan.id)
    setSelectedPlanDetails(plan)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative">
      {/* Background glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Back to Dashboard Button */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-gray-200 dark:border-white/10"
          >
            <BackIcon className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-6">
            Scale your reach.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">
              Supercharge your campaigns.
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your business. Upgrade anytime as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {plans.map((plan) => {
            const isPopular = plan.popular;
            
            return (
              <div 
                key={plan.id}
                className={`relative group rounded-3xl transition-all duration-500 ${
                  isPopular ? 'md:-mt-8 md:mb-8 scale-105 z-10 shadow-2xl' : 'hover:scale-105 hover:shadow-xl opacity-90 hover:opacity-100 z-0 shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-5 inset-x-0 flex justify-center z-20">
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                      Most Chosen
                    </span>
                  </div>
                )}
                
                {/* Discount Badge */}
                {plan.badge && !isPopular && (
                  <div className="absolute -top-4 -right-2 z-20">
                    <span className="bg-rose-500 text-white text-xs font-bold py-1 px-3 rounded-lg shadow-lg rotate-12 inline-block">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`h-full rounded-3xl p-8 bg-gradient-to-br ${plan.color} ${plan.textColor} ${!isPopular ? 'border border-gray-200 dark:border-white/10' : ''} overflow-hidden relative`}>
                  
                  {/* Subtle noise/texture for popular plan */}
                  {isPopular && (
                    <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none mix-blend-overlay"></div>
                  )}

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${isPopular ? 'bg-white/20' : 'bg-white/10 backdrop-blur-sm'}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <p className={`text-sm font-medium ${plan.subtitleColor}`}>
                          {plan.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter">{plan.price}</span>
                        <span className={`text-sm font-semibold ${plan.subtitleColor}`}>
                          {plan.period}
                        </span>
                      </div>
                      {plan.originalPrice && (
                        <div className={`mt-1 text-sm font-medium line-through ${plan.subtitleColor}`}>
                          Normally {plan.originalPrice}
                        </div>
                      )}
                      <p className={`mt-4 text-sm leading-relaxed ${plan.subtitleColor}`}>
                        {plan.description}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 shrink-0 text-white" />
                          <span className={`text-sm font-medium ${plan.textColor}`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanSelect(plan)}
                      disabled={plan.id === "normal"}
                      className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                        plan.id === "normal" 
                          ? "bg-black/10 text-white/70 cursor-not-allowed dark:bg-white/10 dark:text-white/50 border border-white/20" 
                          : plan.buttonClass
                      }`}
                    >
                      {plan.id === "normal" ? "Current Plan" : plan.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Checkout Modal */}
      {isModalOpen && selectedPlanDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-500 dark:bg-[#0f1115]">
            <div className="flex h-full flex-col md:flex-row">
              {/* Left Side: Plan Summary */}
              <div className={`flex w-full flex-col justify-between bg-gradient-to-br ${selectedPlanDetails.color} p-8 text-white md:w-2/5`}>
                <div>
                  <div className="mb-6 inline-flex rounded-xl bg-white/20 p-3 backdrop-blur-sm">
                    {selectedPlanDetails.icon}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">{selectedPlanDetails.name} Plan</h3>
                  <p className="text-sm opacity-90">{selectedPlanDetails.description}</p>
                </div>
                
                <div className="mt-8">
                  <div className="mb-2 text-sm font-medium opacity-80">Total Due Today</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{selectedPlanDetails.price}</span>
                    <span className="text-sm opacity-80">{selectedPlanDetails.period}</span>
                  </div>
                </div>
              </div>
              
              {/* Right Side: Billing Form (Mockup) */}
              <div className="flex w-full flex-col justify-center p-8 md:w-3/5">
                <div className="mb-6 flex items-center justify-between">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Secure Checkout</h4>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  setIsModalOpen(false);
                  toast({
                    title: "Success!",
                    description: `You have successfully upgraded to the ${selectedPlanDetails.name} plan.`,
                  })
                }}>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                    <input type="email" placeholder="you@company.com" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/50 dark:text-white dark:focus:border-orange-500" required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">Card Details</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/50 dark:text-white dark:focus:border-orange-500" required />
                    </div>
                  </div>
                  
                  <button type="submit" className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${selectedPlanDetails.color} px-4 py-3 text-sm font-bold text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-95`}>
                    <Lock className="h-4 w-4" />
                    Pay {selectedPlanDetails.price}
                  </button>
                  <p className="mt-4 text-center text-xs text-gray-400">
                    Payments are secure and encrypted.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
