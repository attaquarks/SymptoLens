import React from "react";
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-3">
                <span className="material-icons text-primary">biotech</span>
              </div>
              <h2 className="text-xl font-semibold text-white">SymptoLens</h2>
            </div>
            <p className="text-neutral-400 text-sm">
              AI Powered Symptom Analysis. Using artificial intelligence for educational purposes only.
            </p>
          </div>
          
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase text-neutral-300 mb-4">About</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about"><span className="text-neutral-400 hover:text-white cursor-pointer">Our Mission</span></Link></li>
                <li><Link href="/about"><span className="text-neutral-400 hover:text-white cursor-pointer">How It Works</span></Link></li>
                <li><Link href="/about"><span className="text-neutral-400 hover:text-white cursor-pointer">Technology</span></Link></li>
                <li><Link href="/about"><span className="text-neutral-400 hover:text-white cursor-pointer">Privacy & Security</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-neutral-300 mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/help"><span className="text-neutral-400 hover:text-white cursor-pointer">Health Library</span></Link></li>
                <li><Link href="/help"><span className="text-neutral-400 hover:text-white cursor-pointer">Common Symptoms</span></Link></li>
                <li><Link href="/help"><span className="text-neutral-400 hover:text-white cursor-pointer">Find a Doctor</span></Link></li>
                <li><Link href="/help"><span className="text-neutral-400 hover:text-white cursor-pointer">Research</span></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold uppercase text-neutral-300 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-neutral-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white">Disclaimer</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-700 text-center text-neutral-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SymptoLens. All rights reserved. This tool is for educational purposes only and is not a substitute for professional medical advice.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
