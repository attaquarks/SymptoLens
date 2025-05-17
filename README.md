# SymptoLens

SymptoLens is a modern web application built with React, Express, and TypeScript that provides advanced symptom analysis and medical assistance using AI technologies. It combines cutting-edge machine learning with structured medical reasoning to deliver accurate and contextually aware medical insights.

## Architecture Overview

### 1. Multimodal AI Model – Understanding Symptoms from Text and Images

#### Text Encoder
- Processes user's symptom descriptions using models like BERT/fine-tuned GPT on medical texts
- Extracts semantic meaning and medical context from textual inputs

#### Image Encoder
- Utilizes CNNs or Vision Transformers trained on medical imagery
- Extracts visual features from uploaded medical images

#### Fusion Module
- Merges text and image embeddings using advanced strategies like intermediate fusion
- Creates a unified representation of the user's condition

#### Prediction Layer
- Outputs a list of possible medical conditions
- Provides associated probabilities for each condition
- Ranks conditions based on confidence scores

### 2. Knowledge Base Reasoning Engine – Medical Validation and Contextual Intelligence

#### Knowledge Base
- Integrates multiple medical knowledge sources:
  - SNOMED CT (Systematized Nomenclature of Medicine)
  - ICD-11 (International Classification of Diseases)
  - Medical knowledge graphs
  - Epidemiological databases

#### Reasoning Engine
- Validates AI predictions through:
  - Cross-referencing with known medical facts
  - Demographic plausibility checks
- Refines and ranks conditions based on medical expertise

### 🔄 Integrated Workflow

1. User Input Processing
   - Text and image inputs are analyzed by the AI model
   - Initial condition predictions are generated

2. Medical Validation
   - Knowledge Base Reasoning Engine reviews predictions
   - Medical plausibility is assessed
   - Contextual factors are considered

3. Final Output Generation
   - Refined diagnosis list
   - Contextual medical information
   - Responsible health guidance

## Features

- Real-time symptom analysis
- AI-powered medical assistance
- Modern, responsive UI with Tailwind CSS
- Secure user authentication
- Real-time data processing
- Database integration with PostgreSQL
- File upload and management
- WebSocket support for real-time features

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Query

### Backend
- Express.js
- TypeScript
- PostgreSQL
- WebSocket support
- Passport.js for authentication
- TensorFlow.js for AI/ML capabilities

### AI/ML Integration
- OpenAI API
- TensorFlow.js
- BERT/GPT for text processing
- CNN/Vision Transformers for image analysis
- Medical knowledge base integration

## Project Structure

```
SymptoLens/
├── client/                 # Frontend React application
│   ├── src/               # Source files
│   └── index.html         # Entry HTML file
├── server/                # Backend Express application
│   ├── services/         # Business logic services
│   ├── db/              # Database related files
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # File storage handling
│   └── types.ts         # TypeScript type definitions
├── shared/               # Shared utilities and types
├── uploads/             # File upload directory
└── temp_extraction/     # Temporary file processing
```

## Getting Started

### Prerequisites

- Node.js (Latest LTS version)
- PostgreSQL
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/attaquarks/SymptoLens.git
cd SymptoLens
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
```

4. Initialize the database:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

## Security

- Secure session management
- Password hashing
- File upload validation
- CORS configuration
- Rate limiting


## License

This project is licensed under the MIT License - see the LICENSE file for details.

