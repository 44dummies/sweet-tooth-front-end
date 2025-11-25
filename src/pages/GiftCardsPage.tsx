import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift } from "lucide-react";
import ModernNavbar from "@/components/ModernNavbar";
import GiftCardPurchase from "@/components/GiftCardPurchase";
import GiftCardBalance from "@/components/GiftCardBalance";

const GiftCardsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-12 px-3 md:px-4 overflow-x-hidden relative" style={{ scrollBehavior: 'smooth' }}>
      <ModernNavbar />
      <div className="max-w-5xl mx-auto pt-4 md:pt-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-3 md:mb-4 animate-pulse">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Gift Cards
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto px-2">
            Share the sweetness! Purchase digital gift cards for your loved ones or check your gift card balance.
          </p>
        </div>

        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="purchase">Purchase Gift Card</TabsTrigger>
            <TabsTrigger value="balance">Check Balance</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-6">
            <GiftCardPurchase />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
              <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="text-2xl md:text-3xl mb-2 md:mb-3">🎁</div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Perfect Gift</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Let them choose their favorite treats from our menu
                </p>
              </div>
              <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="text-2xl md:text-3xl mb-2 md:mb-3">⚡</div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Instant Delivery</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Gift cards are delivered instantly via email
                </p>
              </div>
              <div className="p-4 md:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-105">
                <div className="text-2xl md:text-3xl mb-2 md:mb-3">📅</div>
                <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">Valid 1 Year</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Plenty of time to enjoy sweet treats
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="balance">
            <GiftCardBalance />
          </TabsContent>
        </Tabs>

        <div className="mt-12 p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <h3 className="font-semibold mb-4">How Gift Cards Work</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Purchasers:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Choose an amount (or enter a custom amount)</li>
                <li>• Add recipient details and a personal message</li>
                <li>• Complete your purchase</li>
                <li>• Gift card code is sent to recipient's email</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">For Recipients:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Receive gift card code via email</li>
                <li>• Use code at checkout when ordering</li>
                <li>• Check remaining balance anytime</li>
                <li>• Valid for 1 year from purchase date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftCardsPage;
