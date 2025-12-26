require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

async function testLLM() {
  try {
    console.log('Testing Gemini 2.0 Flash...');
    const result = await model.generateContent('Say hello in one word');
    const response = await result.response;
    console.log('✅ LLM is working!');
    console.log('Response:', response.text());
  } catch (error) {
    console.log('❌ LLM test failed:');
    console.error(error.message);
  }
}

testLLM();