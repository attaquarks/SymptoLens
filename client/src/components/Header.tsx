import React from "react";
import { Link, useLocation } from "wouter";

const Header: React.FC = () => {
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mr-3">
                <span className="material-icons text-white">biotech</span>
              </div>
              <h1 className="text-xl font-semibold text-primary">SymptoLens</h1>
            </div>
          </Link>
        </div>
        
        <nav>
          <ul className="flex space-x-8">
            <li>
              <Link href="/">
                <span className={`font-medium cursor-pointer flex items-center ${
                  location === "/" 
                    ? "text-primary" 
                    : "text-neutral-600 hover:text-primary"
                }`}>
                  <span className="material-icons text-sm mr-1">home</span>
                  Home
                </span>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <span className={`font-medium cursor-pointer flex items-center ${
                  location === "/about" 
                    ? "text-primary" 
                    : "text-neutral-600 hover:text-primary"
                }`}>
                  <span className="material-icons text-sm mr-1">info</span>
                  About
                </span>
              </Link>
            </li>
            <li>
              <Link href="/help">
                <span className={`font-medium cursor-pointer flex items-center ${
                  location === "/help" 
                    ? "text-primary" 
                    : "text-neutral-600 hover:text-primary"
                }`}>
                  <span className="material-icons text-sm mr-1">help_outline</span>
                  Help
                </span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
