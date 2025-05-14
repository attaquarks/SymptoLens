import React from "react";

interface StepProps {
  number: number;
  title: string;
  description: string;
}

const Step: React.FC<StepProps> = ({ number, title, description }) => (
  <div className="flex">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
      <span className="font-medium text-primary">{number}</span>
    </div>
    <div>
      <h3 className="text-sm font-medium text-neutral-700">{title}</h3>
      <p className="text-sm text-neutral-500">{description}</p>
    </div>
  </div>
);

interface TipProps {
  tip: string;
}

const Tip: React.FC<TipProps> = ({ tip }) => (
  <li className="flex items-start">
    <span className="material-icons text-primary text-xs mr-2 mt-1">check_circle</span>
    <span>{tip}</span>
  </li>
);

const InfoCard: React.FC = () => {
  const steps = [
    {
      number: 1,
      title: "Describe Symptoms",
      description: "Enter your symptoms in detail including when they started and how severe they are."
    },
    {
      number: 2,
      title: "Upload Images",
      description: "Add photos of visible symptoms for better analysis (optional but recommended)."
    },
    {
      number: 3,
      title: "Multimodal AI Analysis",
      description: "Our advanced AI analyzes both your description and images together, combining visual and textual information."
    },
    {
      number: 4,
      title: "Get Insights",
      description: "Review potential conditions and next steps for your healthcare journey."
    }
  ];

  const tips = [
    "Be as specific as possible about your symptoms",
    "Include clear, well-lit photos of visual symptoms",
    "Mention if symptoms change based on activities or time of day",
    "Include any relevant medical history or medications",
    "Upload images from different angles for better visual analysis"
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-card p-6 mb-6">
        <h2 className="text-xl font-semibold text-neutral-800 mb-4 flex items-center">
          <span className="material-icons text-primary mr-2">help_outline</span>
          How SymptoLens Works
        </h2>
        
        <div className="space-y-4">
          {steps.map((step) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
      </div>
      
      <div className="bg-[#F8C471]/10 rounded-xl shadow-card p-6">
        <div className="flex items-start mb-4">
          <span className="material-icons text-[#F6B24E] mr-3">tips_and_updates</span>
          <h2 className="text-lg font-semibold text-neutral-800">Tips for Best Results</h2>
        </div>
        
        <ul className="space-y-3 text-sm text-neutral-600">
          {tips.map((tip, index) => (
            <Tip key={index} tip={tip} />
          ))}
        </ul>
      </div>
    </>
  );
};

export default InfoCard;
