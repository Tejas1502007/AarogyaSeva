import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-medical-records.ts';
import '@/ai/flows/extract-record-info.ts';
import '@/ai/flows/scan-report.ts';
import '@/ai/flows/disease-predictor.ts';

    
