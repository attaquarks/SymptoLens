import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const About: React.FC = () => {
  return (
    <div className="bg-secondary min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">About SymptoLens</h1>
          <p className="text-lg text-neutral-600 mb-6">
            Learn more about our mission, technology, and commitment to health education.
          </p>
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center mr-3">
                    <span className="material-icons text-white">psychology</span>
                  </div>
                  <h2 className="text-2xl font-semibold text-neutral-800">Our Mission</h2>
                </div>
                
                <p className="text-neutral-600 mb-4">
                  SymptoLens was created to empower individuals with a better understanding of their health symptoms through 
                  the combination of artificial intelligence and visual analysis. Our mission is to bridge the gap between 
                  experiencing health concerns and seeking professional care by providing educational insights about potential conditions.
                </p>
                
                <p className="text-neutral-600 mb-4">
                  We believe that informed patients make better healthcare decisions. By helping people understand their symptoms 
                  more clearly, we hope to encourage appropriate medical consultation and reduce anxiety caused by uncertainty.
                </p>
                
                <div className="bg-[#F17D80]/10 border border-[#F17D80]/30 rounded-lg p-4 mt-6">
                  <div className="flex">
                    <span className="material-icons text-[#F17D80] mr-3 mt-0.5">info</span>
                    <p className="text-sm text-neutral-700">
                      SymptoLens is strictly an educational tool. We never store personal health information, and all 
                      analysis is performed securely using advanced AI models. Our goal is to support, not replace, the 
                      critical relationship between patients and healthcare providers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-4">Our Technology</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">code</span>
                      Multimodal Analysis
                    </h3>
                    <p className="text-neutral-600">
                      SymptoLens uses a combination of Natural Language Processing (NLP) and Computer Vision (CV) 
                      to analyze both textual descriptions and visual evidence of symptoms. This multimodal approach 
                      provides a more comprehensive understanding than either method alone.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">security</span>
                      Privacy-Focused Design
                    </h3>
                    <p className="text-neutral-600">
                      We process all data locally when possible and implement strict security measures for any 
                      cloud processing. Your symptom descriptions and images are not stored permanently and are 
                      used solely for the purpose of providing you with immediate analysis.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">psychology_alt</span>
                      Continuous Learning
                    </h3>
                    <p className="text-neutral-600">
                      Our AI models are continuously improved based on the latest medical research and anonymized 
                      usage patterns. This ensures that SymptoLens provides increasingly accurate and helpful 
                      information over time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Our Team</h2>
                
                <p className="text-neutral-600 mb-6">
                  SymptoLens was developed by a multidisciplinary team of healthcare professionals, AI researchers, 
                  and software engineers committed to improving healthcare through technology.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary text-sm">person</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Medical Advisors</h3>
                      <p className="text-xs text-neutral-500">Board-certified physicians across specialties</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary text-sm">psychology</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">AI Researchers</h3>
                      <p className="text-xs text-neutral-500">Experts in machine learning and computer vision</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="material-icons text-primary text-sm">code</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-neutral-800">Engineering Team</h3>
                      <p className="text-xs text-neutral-500">Software engineers with healthcare experience</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-[#F8C471]/10 border-[#F8C471]/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  <span className="material-icons text-[#F6B24E] mr-2">lightbulb</span>
                  Did You Know?
                </h2>
                
                <ul className="space-y-3 text-sm text-neutral-700">
                  <li className="flex items-start">
                    <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                    <span>Early symptom recognition can lead to more timely medical care</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                    <span>Visual symptoms often provide critical diagnostic information</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                    <span>AI can identify patterns in symptoms that might be overlooked</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
                    <span>Health literacy improves patient outcomes and satisfaction</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Contact Us</h2>
                
                <p className="text-neutral-600 mb-4">
                  Have questions or feedback about SymptoLens? We'd love to hear from you.
                </p>
                
                <a href="mailto:info@symptolens.com" className="text-primary hover:text-primary/90 flex items-center mb-2">
                  <span className="material-icons text-sm mr-2">email</span>
                  info@symptolens.com
                </a>
                
                <a href="#" className="text-primary hover:text-primary/90 flex items-center">
                  <span className="material-icons text-sm mr-2">forum</span>
                  Submit Feedback
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
