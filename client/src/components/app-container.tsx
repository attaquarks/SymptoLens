import { ReactNode } from "react";

interface AppContainerProps {
  children: ReactNode;
}

export default function AppContainer({ children }: AppContainerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary-dark h-7 w-7"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              <path d="M3.22 12H9.5l.5-1 .5 1h6.28" />
            </svg>
            <h1 className="text-xl md:text-2xl font-heading font-semibold text-neutral-900">
              SymptoLens
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="hidden md:block bg-white text-primary border border-primary px-4 py-2 rounded-md hover:bg-primary-light hover:text-white transition">
              Help
            </button>
            <button className="hidden md:block bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition">
              Sign In
            </button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="md:hidden h-6 w-6 text-neutral-700"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer Section */}
      <footer className="bg-neutral-800 text-neutral-300 py-8 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-medium mb-4 font-heading">SymptoLens</h3>
              <p className="text-sm">
                AI-powered symptom analysis providing preliminary insights for better health
                decisions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    For Healthcare Providers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Medical Library
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Research Papers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Our Team
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Medical Disclaimer
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-neutral-700 text-sm text-center">
            <p>
              &copy; {new Date().getFullYear()} SymptoLens. All rights reserved. SymptoLens is not a medical device
              and is not intended to diagnose, treat, cure, or prevent any disease.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
