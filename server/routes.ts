import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { analyzeSymptomsWithImage } from "./services/symptom-analyzer";
import { randomUUID } from "crypto";
import fs from "fs";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(process.cwd(), "uploads");
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${randomUUID()}`;
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/heic"];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and HEIC images are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Sample API to check if the server is running
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API endpoint for symptom analysis
  app.post(
    "/api/analyze", 
    upload.single("image"), 
    async (req, res) => {
      try {
        const { description, age, gender, imageDescription } = req.body;
        
        if (!description) {
          return res.status(400).json({ error: "Symptom description is required" });
        }
        
        // Get the uploaded image path if exists
        const imagePath = req.file?.path;
        
        // Analyze symptoms
        const results = await analyzeSymptomsWithImage({
          textSymptoms: description,
          imagePath,
          imageDescription: imageDescription || "",
          patientAge: parseInt(age) || 0,
          patientGender: gender || "unknown",
        });
        
        // Store the analysis in the database if a user is logged in
        // This would require authentication middleware
        
        // Return the results
        res.json(results);
      } catch (error: any) {
        console.error("Error analyzing symptoms:", error);
        res.status(500).json({ error: error.message || "An error occurred during analysis" });
      }
    }
  );

  // User registration endpoint
  app.post("/api/users/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create the user
      const user = await storage.createUser({ username, password });
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error: any) {
      console.error("Error registering user:", error);
      res.status(500).json({ error: error.message || "An error occurred during registration" });
    }
  });

  // Get medical conditions reference data
  app.get("/api/medical-conditions", async (req, res) => {
    try {
      const conditions = await storage.getAllMedicalConditions();
      res.json(conditions);
    } catch (error: any) {
      console.error("Error fetching medical conditions:", error);
      res.status(500).json({ error: error.message || "An error occurred while fetching conditions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
