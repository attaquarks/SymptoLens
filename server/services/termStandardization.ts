
import { knowledgeBase } from './knowledgeBase';

interface TermMapping {
  standard: string;
  variations: string[];
}

export class TermStandardization {
  private termMappings: TermMapping[] = [
    {
      standard: "fever",
      variations: ["high temperature", "elevated temperature", "febrile", "pyrexia"]
    },
    {
      standard: "headache",
      variations: ["head pain", "cephalgia", "head discomfort", "cranial pain"]
    },
    {
      standard: "nausea",
      variations: ["feeling sick", "queasy", "sick to stomach", "emesis"]
    }
  ];

  public standardizeTerm(input: string): string {
    const lowerInput = input.toLowerCase();
    
    for (const mapping of this.termMappings) {
      if (mapping.variations.some(v => lowerInput.includes(v.toLowerCase()))) {
        return mapping.standard;
      }
    }
    
    return input;
  }

  public standardizeSymptoms(symptoms: string[]): string[] {
    return symptoms.map(symptom => this.standardizeTerm(symptom));
  }
}

export const termStandardization = new TermStandardization();
