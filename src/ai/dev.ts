import { config } from 'dotenv';
config();

// Import AI flows to ensure they're available
import '@/ai/flows/summarize-medical-records';
import '@/ai/flows/extract-record-info';
import '@/ai/flows/scan-report';
import '@/ai/flows/disease-predictor';

console.log('AI flows loaded successfully');