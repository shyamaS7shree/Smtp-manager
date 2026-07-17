"use client"

import { useState } from "react"
import { Check, ArrowLeft, ArrowRight, Mail, BarChart3, Shield, SendToBackIcon as BackIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

const paymentMethods = [
  { name: "PayPal", logo: "/placeholder.svg?height=40&width=80" },
  { name: "Bitcoin", logo: "/placeholder.svg?height=40&width=80" },
  { name: "Visa", logo: "/placeholder.svg?height=40&width=80" },
  { name: "MasterCard", logo: "/placeholder.svg?height=40&width=80" },
]

const plans = [
  {
    id: "free",
    name: "30-day",
    subtitle: "free trial",
    price: "Free",
    period: "",
    description: "no credit card required",
    features: [
      "Up to 1,000 subscribers",
      "5 email campaigns per month",
      "Basic templates",
      "Email support",
      "Basic analytics",
    ],
    buttonText: "Start Free Trial",
    popular: false,
    color: "border-orange-200 bg-white",
  },
  {
    id: "pro",
    name: "One fixed price",
    subtitle: "",
    price: "$8.99",
    period: "/mo",
    description: "Most popular plan",
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
    color: "border-orange-500 bg-orange-500 text-white",
  },
  {
    id: "limited",
    name: "Limited time",
    subtitle: "50% off",
    price: "$4.49",
    period: "/mo",
    originalPrice: "$8.99",
    description: "Save 50% for first 6 months",
    features: [
      "Everything in Pro plan",
      "Up to 25,000 subscribers",
      "White-label emails",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced segmentation",
    ],
    buttonText: "Claim Offer",
    popular: false,
    color: "border-orange-200 bg-orange-50",
    badge: "50% OFF",
  },
]

const allPlans = [
  ...plans,
  {
    id: "enterprise",
    name: "Enterprise",
    subtitle: "custom solution",
    price: "Custom",
    period: "",
    description: "Tailored for your business",
    features: [
      "Unlimited subscribers",
      "Custom features",
      "Dedicated infrastructure",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee",
    ],
    buttonText: "Contact Sales",
    popular: false,
    color: "border-gray-200 bg-gray-50",
  },
  {
    id: "startup",
    name: "Startup",
    subtitle: "growing business",
    price: "$19.99",
    period: "/mo",
    description: "Perfect for growing teams",
    features: [
      "Up to 50,000 subscribers",
      "Team collaboration",
      "Advanced automation",
      "Custom domains",
      "API access",
      "Priority support",
    ],
    buttonText: "Choose Plan",
    popular: false,
    color: "border-blue-200 bg-blue-50",
  },
]

export default function UpgradePage() {
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0)
  const [showAllPlans, setShowAllPlans] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)

  const displayedPlans = showAllPlans ? allPlans : plans
  const visiblePlans = displayedPlans.slice(currentPlanIndex, currentPlanIndex + 3)

  const nextPlans = () => {
    if (currentPlanIndex + 3 < displayedPlans.length) {
      setCurrentPlanIndex(currentPlanIndex + 1)
    }
  }

  const prevPlans = () => {
    if (currentPlanIndex > 0) {
      setCurrentPlanIndex(currentPlanIndex - 1)
    }
  }

  const handlePlanSelect = (plan: any) => {
    if (plan.id === "free") {
      // Handle free trial signup
      alert("Free trial activated! Welcome to SMTPMASTER!")
      return
    }
    setSelectedPlan(plan)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            <BackIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Pricing Plan</h1>
          <p className="text-gray-600 mb-8">We accepted payment method by</p>

          {/* Payment Methods */}
          <div className="flex justify-center items-center gap-6 mb-12 flex-wrap">
            {paymentMethods.map((method, index) => (
              <div key={index} className="grayscale hover:grayscale-0 transition-all duration-300">
                <Image
                  src={method.logo || "/placeholder.svg"}
                  alt={method.name}
                  width={60}
                  height={30}
                  className="h-8 w-auto opacity-60 hover:opacity-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Cards Container */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevPlans}
            disabled={currentPlanIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <button
            onClick={nextPlans}
            disabled={currentPlanIndex + 3 >= displayedPlans.length}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-full shadow-lg transition-all duration-200"
          >
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
            {visiblePlans.map((plan, index) => (
              <Card
                key={plan.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? "ring-2 ring-orange-500 scale-105 shadow-xl" : "hover:scale-105"
                } ${plan.color}`}
              >
                {plan.badge && <Badge className="absolute top-4 right-4 bg-orange-500 text-white">{plan.badge}</Badge>}

                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-b-lg text-sm font-medium">
                    Most Popular
                  </div>
                )}

                <CardHeader className="text-center pb-4 pt-8">
                  <CardTitle className={`text-2xl font-bold ${plan.popular ? "text-white" : "text-orange-500"}`}>
                    {plan.name}
                  </CardTitle>
                  {plan.subtitle && (
                    <CardDescription className={`text-lg ${plan.popular ? "text-orange-100" : "text-orange-400"}`}>
                      {plan.subtitle}
                    </CardDescription>
                  )}

                  <div className="mt-4">
                    <div className="flex items-baseline justify-center gap-1">
                      {plan.originalPrice && (
                        <span className="text-lg text-gray-400 line-through">{plan.originalPrice}</span>
                      )}
                      <span className={`text-4xl font-bold ${plan.popular ? "text-white" : "text-gray-800"}`}>
                        {plan.price}
                      </span>
                      <span className={`text-lg ${plan.popular ? "text-orange-100" : "text-gray-600"}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-2 ${plan.popular ? "text-orange-100" : "text-gray-500"}`}>
                      {plan.description}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check
                          className={`h-4 w-4 ${plan.popular ? "text-orange-200" : "text-orange-500"} flex-shrink-0`}
                        />
                        <span className={`text-sm ${plan.popular ? "text-white" : "text-gray-600"}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanSelect(plan)}
                    className={`w-full py-3 font-semibold transition-all duration-200 ${
                      plan.popular
                        ? "bg-white text-orange-500 hover:bg-orange-50"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* View More Plans Button */}
        <div className="text-center mt-12">
          <Button
            onClick={() => setShowAllPlans(!showAllPlans)}
            variant="outline"
            className="px-8 py-3 text-orange-500 border-orange-500 hover:bg-orange-50 font-semibold"
          >
            {showAllPlans ? "View Less Plans" : "View More Plans"}
          </Button>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-500 text-sm mt-8">Pricing in USD. Excludes any applicable tax.</p>

        {/* Features Comparison */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Marketing</h3>
              <p className="text-gray-600 text-sm">Create beautiful email campaigns with our drag-and-drop editor</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Advanced Analytics</h3>
              <p className="text-gray-600 text-sm">Track opens, clicks, and conversions with detailed reports</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Secure & Reliable</h3>
              <p className="text-gray-600 text-sm">99.9% uptime guarantee with enterprise-grade security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Purchase</h3>
              <p className="text-gray-600">You're upgrading to {selectedPlan.name}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{selectedPlan.name}</span>
                <span className="font-bold text-orange-500">
                  {selectedPlan.price}
                  {selectedPlan.period}
                </span>
              </div>
              {selectedPlan.originalPrice && (
                <div className="text-sm text-gray-500">
                  Regular price: <span className="line-through">{selectedPlan.originalPrice}/mo</span>
                </div>
              )}
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Your payment is secured with 256-bit SSL encryption</span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setSelectedPlan(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={(e) => {
                    e.preventDefault()
                    alert("Payment successful! Welcome to your new plan!")
                    setSelectedPlan(null)
                  }}
                >
                  Complete Purchase
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
