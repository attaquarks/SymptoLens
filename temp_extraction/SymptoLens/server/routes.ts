import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSymptomSchema, type SymptomAnalysis } from "@shared/schema";
import { z } from "zod";
import { analyzeSymptoms } from "./services/aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Submit symptom data endpoint
  app.post("/api/symptoms", async (req: Request, res: Response) => {
    try {
      // Validate the incoming data
      const validatedData = insertSymptomSchema.parse(req.body);
      
      // Create the symptom record
      const symptom = await storage.createSymptom(validatedData);
      
      // Perform analysis using our multimodal AI and knowledge base services
      const analysis = await analyzeSymptoms({
        description: validatedData.description,
        duration: validatedData.duration || undefined,
        severity: validatedData.severity || undefined,
        bodyLocation: validatedData.bodyLocation || undefined,
        images: validatedData.uploadedImages ? 
          Array.isArray(validatedData.uploadedImages) ? 
            validatedData.uploadedImages : [validatedData.uploadedImages]
          : []
      });
      
      // Update the stored symptom with the analysis
      await storage.updateSymptomAnalysis(symptom.id, analysis);
      
      // Return the analysis
      return res.status(200).json(analysis);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid input data", 
          errors: error.errors 
        });
      }
      
      console.error("Error creating symptom:", error);
      return res.status(500).json({ message: "Failed to process symptom data" });
    }
  });

  // Get symptom by id
  app.get("/api/symptoms/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid symptom ID" });
      }
      
      const symptom = await storage.getSymptom(id);
      if (!symptom) {
        return res.status(404).json({ message: "Symptom not found" });
      }
      
      return res.status(200).json(symptom);
    } catch (error) {
      console.error("Error fetching symptom:", error);
      return res.status(500).json({ message: "Failed to retrieve symptom" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
