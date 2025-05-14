import React from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

const Help: React.FC = () => {
  return (
    <div className="bg-secondary min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 mb-4">Help & Resources</h1>
          <p className="text-lg text-neutral-600 mb-6">
            Find answers to common questions and learn how to get the most out of SymptoLens.
          </p>
        </section>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Frequently Asked Questions</h2>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-neutral-200 py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      Is SymptoLens a diagnostic tool?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      No, SymptoLens is not a diagnostic tool. It's an educational resource that helps you understand potential
                      conditions related to your symptoms. SymptoLens does not provide medical diagnoses, and all information
                      should be reviewed with a qualified healthcare professional.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2" className="border-b border-neutral-200 py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      How accurate is the symptom analysis?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      SymptoLens uses advanced AI to analyze your symptoms, but it has limitations. The analysis is based on the
                      information you provide and the quality of any uploaded images. It's designed to offer educational insights
                      rather than definitive conclusions. Always consult with a healthcare professional for proper evaluation.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-3" className="border-b border-neutral-200 py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      How does image analysis work?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      When you upload an image, our computer vision system analyzes visual patterns and characteristics related to 
                      various health conditions. The system looks for specific visual indicators in skin conditions, eye appearances, 
                      or other visible symptoms. This visual analysis is combined with your text description for a more comprehensive 
                      overview of potential conditions.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-4" className="border-b border-neutral-200 py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      Is my data private and secure?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      Yes, we take your privacy seriously. Your symptom descriptions and images are processed securely and are not 
                      stored permanently. We do not share your personal health information with third parties. All data is encrypted 
                      during transmission and any temporary storage. For more details, please review our Privacy Policy.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-5" className="border-b border-neutral-200 py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      What types of symptoms can SymptoLens analyze?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      SymptoLens can analyze a wide range of symptoms, including but not limited to skin conditions, eye issues, 
                      headaches, digestive symptoms, respiratory concerns, and general pain or discomfort. The system works best 
                      when you provide detailed descriptions and relevant images for visual symptoms.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-6" className="py-2">
                    <AccordionTrigger className="text-lg font-medium text-neutral-800 hover:no-underline">
                      Can I save or share my analysis results?
                    </AccordionTrigger>
                    <AccordionContent className="text-neutral-600">
                      Yes, you can save your analysis results by using the bookmark icon on the results page. You can also print 
                      the results or take screenshots to share with your healthcare provider. We recommend bringing your SymptoLens 
                      results to medical appointments to facilitate more informed discussions with your doctor.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
            
            <Card className="mt-8">
              <CardContent className="p-6">
                <h2 className="text-2xl font-semibold text-neutral-800 mb-6">How to Use SymptoLens</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="font-medium text-primary">1</span>
                      </div>
                      Describe Your Symptoms
                    </h3>
                    <p className="text-neutral-600 ml-11">
                      Start by providing a detailed description of your symptoms. Include when they started, how severe 
                      they are, and any factors that make them better or worse. Be specific about the location, sensation, 
                      and any patterns you've noticed.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="font-medium text-primary">2</span>
                      </div>
                      Upload Relevant Images
                    </h3>
                    <p className="text-neutral-600 ml-11">
                      For visual symptoms like skin conditions, eye issues, or any visible signs, upload clear, well-lit 
                      images. Take photos in natural light if possible, and make sure they're in focus. Multiple angles 
                      can provide better insights.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="font-medium text-primary">3</span>
                      </div>
                      Review Your Analysis
                    </h3>
                    <p className="text-neutral-600 ml-11">
                      After submitting your information, you'll receive an analysis of potential related conditions. 
                      Remember that these are possibilities, not diagnoses. The analysis includes relevant information 
                      about each condition and suggested next steps.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2 flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <span className="font-medium text-primary">4</span>
                      </div>
                      Consult with Healthcare Providers
                    </h3>
                    <p className="text-neutral-600 ml-11">
                      Use your SymptoLens results as a starting point for discussions with healthcare professionals. 
                      Share the analysis with your doctor to provide context for your symptoms and concerns. Always 
                      follow the advice of qualified medical professionals.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-[#45B39D]/10 border-[#45B39D]/30">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
                  <span className="material-icons text-primary mr-2">local_hospital</span>
                  When to Seek Immediate Medical Care
                </h2>
                
                <p className="text-neutral-700 text-sm mb-4">
                  Certain symptoms require urgent medical attention. Do not wait for an online analysis if you experience:
                </p>
                
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Difficulty breathing or shortness of breath</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Chest pain or pressure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Sudden severe headache</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Sudden confusion or difficulty speaking</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Severe abdominal pain</span>
                  </li>
                  <li className="flex items-start">
                    <span className="material-icons text-[#F17D80] text-sm mr-2 mt-0.5">emergency</span>
                    <span>Loss of consciousness</span>
                  </li>
                </ul>
                
                <div className="mt-4 pt-4 border-t border-[#45B39D]/30">
                  <p className="text-neutral-700 text-sm font-medium">
                    In case of emergency, call your local emergency number (e.g., 911 in the US) or go to the nearest emergency room.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Educational Resources</h2>
                
                <div className="space-y-4">
                  <a href="#" className="block p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <h3 className="text-primary font-medium mb-1 flex items-center">
                      <span className="material-icons text-sm mr-2">menu_book</span>
                      Understanding Common Symptoms
                    </h3>
                    <p className="text-sm text-neutral-600">
                      A guide to recognizing and describing common health symptoms accurately.
                    </p>
                  </a>
                  
                  <a href="#" className="block p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <h3 className="text-primary font-medium mb-1 flex items-center">
                      <span className="material-icons text-sm mr-2">menu_book</span>
                      Talking to Your Doctor
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Tips for effective communication with healthcare providers about your symptoms.
                    </p>
                  </a>
                  
                  <a href="#" className="block p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <h3 className="text-primary font-medium mb-1 flex items-center">
                      <span className="material-icons text-sm mr-2">menu_book</span>
                      Health Symptom Diary
                    </h3>
                    <p className="text-sm text-neutral-600">
                      How to track your symptoms over time for better health insights.
                    </p>
                  </a>
                  
                  <a href="#" className="block p-3 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                    <h3 className="text-primary font-medium mb-1 flex items-center">
                      <span className="material-icons text-sm mr-2">menu_book</span>
                      Visual Symptoms Guide
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Understanding and documenting visual health symptoms with photography.
                    </p>
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Need More Help?</h2>
                
                <p className="text-neutral-600 mb-4">
                  If you have questions about using SymptoLens or need additional assistance, our support team is here to help.
                </p>
                
                <div className="space-y-3">
                  <a href="#" className="text-primary hover:text-primary/90 flex items-center">
                    <span className="material-icons text-sm mr-2">email</span>
                    Email Support
                  </a>
                  
                  <a href="#" className="text-primary hover:text-primary/90 flex items-center">
                    <span className="material-icons text-sm mr-2">help_center</span>
                    Knowledge Base
                  </a>
                  
                  <a href="#" className="text-primary hover:text-primary/90 flex items-center">
                    <span className="material-icons text-sm mr-2">chat</span>
                    Live Chat (9am-5pm EST)
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;
