import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const faqs = [
    {
      question: "How do I place an order?",
      answer:
        "You can place an order by clicking the 'Pre-Order Now' button in the navbar or 'Order Now' button in the mobile menu. Select your desired products, fill in your details, and confirm your order. We'll contact you via WhatsApp to confirm delivery details.",
    },
    {
      question: "What are your delivery timeframes?",
      answer:
        "Delivery times vary based on your location and order complexity. Generally, orders are delivered within 2-7 days. Custom cake orders may take longer depending on the design. You can specify your preferred delivery date during checkout.",
    },
    {
      question: "Do you offer custom cakes?",
      answer:
        "Yes! We specialize in custom cakes. During the checkout process, you can specify your design preferences, flavors, dietary requirements, and any special messages in the 'Cake Specifications' section. Our team will contact you to finalize the design.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including bank transfers, M-Pesa, and other mobile money services. Payment details will be confirmed when we contact you to finalize your order.",
    },
    {
      question: "Can I modify or cancel my order?",
      answer:
        "You can modify or cancel your order within 24 hours of placing it. Please contact us immediately at +254795436192 or muindidamian@gmail.com with your order details.",
    },
    {
      question: "Do you cater for dietary restrictions?",
      answer:
        "Absolutely! We can accommodate various dietary needs including vegan, gluten-free, sugar-free, and allergy-friendly options. Please specify your requirements in the order notes, and our team will work with you.",
    },
    {
      question: "How are orders packaged?",
      answer:
        "All orders are carefully packaged in secure, branded boxes to ensure freshness and presentation. We use appropriate padding and insulation for delivery. Special care is taken for delicate items.",
    },
    {
      question: "What is your refund policy?",
      answer:
        "We stand behind our products. If you receive a damaged or unsatisfactory order, please contact us immediately with photos. We will either provide a replacement or full refund within 24 hours.",
    },
    {
      question: "Do you offer bulk orders or corporate catering?",
      answer:
        "Yes! We offer special pricing for bulk orders and corporate events. Please contact us directly at +254795436192 or muindidamian@gmail.com to discuss your specific needs.",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach us via email at muindidamian@gmail.com, phone at +254795436192, or through our website. We aim to respond within 2 hours during business hours.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8 relative">
      <ModernNavbar />
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Find answers to common questions about our products and services.
        </p>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border rounded-lg overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary transition-colors"
              >
                <h3 className="text-lg font-semibold text-left">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${
                    openItems.includes(index) ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openItems.includes(index) && (
                <div className="px-6 py-4 bg-secondary/30 border-t">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 bg-primary/10 border border-primary/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Can't find the answer you're looking for? Please contact us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:muindidamian@gmail.com"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full transition-colors"
            >
              Email Us
            </a>
            <a
              href="tel:+254795436192"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full transition-colors"
            >
              Call Us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
