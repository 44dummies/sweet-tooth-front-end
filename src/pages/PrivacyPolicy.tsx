import ModernNavbar from "@/components/ModernNavbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col pb-20 md:pb-8 relative">
      <ModernNavbar />
      <main className="container mx-auto px-4 py-6 md:py-8 flex-1 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Sweet Tooth ("we" or "us" or "our") operates the website. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our website and the choices you have associated with that data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information Collection and Use</h2>
            <p className="mb-3">We collect several different types of information for various purposes to provide and improve our service to you.</p>
            <h3 className="font-semibold mb-2">Types of Data Collected:</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Personal Data:</strong> Name, email address, phone number, address, and delivery information</li>
              <li><strong>Order Information:</strong> Products ordered, quantities, delivery dates, and special requests</li>
              <li><strong>Payment Information:</strong> We do not directly collect payment information; it is processed securely through third-party providers</li>
              <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and time spent on our website</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Use of Data</h2>
            <p className="mb-3">Sweet Tooth uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To allow you to participate in interactive features of our website</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information to improve our service</li>
              <li>To monitor the usage of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Links to Other Sites</h2>
            <p>
              Our website may contain links to other sites that are not operated by us. If you click on a third-party link, you will be directed to that third party's site. We strongly advise you to review the Privacy Policy of every site you visit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Children's Privacy</h2>
            <p>
              Our service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: muindidamian@gmail.com
              <br />
              Phone: +254795436192
              <br />
              Address: 160 Mwihoko Road, Nairobi, Kenya
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
