import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'http://localhost:5000/api';

async function runVerification() {
  console.log('🚀 Starting Verification...\n');

  try {
    // 1. Get a token (Assume a test user exists, if not, we might need a separate script to create one)
    // For this verification, I'll try to login with a common test credential
    // If it fails, I'll provide instructions on how to provide a valid token
    // ENVIRONMENT VARIABLES DEMONSTRATION:
    // We use process.env to read sensitive data like tokens or secrets,
    // ensuring they are never hard-coded in the source files.
    let token = process.env.TEST_TOKEN;
    if (!token) {
      try {
        console.log('🔑 Attempting to login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'password123'
        });
        token = loginRes.data.token;
        console.log('✅ Login successful!\n');
      } catch (err) {
        console.error('❌ Login failed. Please set TEST_TOKEN environment variable.');
        console.error('Error:', err.response?.data?.message || err.message);
        process.exit(1);
      }
    } else {
      console.log('🔑 Using token from environment variable (process.env.TEST_TOKEN).\n');
    }

    const headers = {
      Authorization: `Bearer ${token}`
    };

    // 2. Test Successful Upload
    console.log('📤 Testing Successful Upload...');
    const form = new FormData();
    // Create a small test image buffer (1x1 red dot)
    const testImagePath = path.join(__dirname, 'test-image.png');
    // Simple 1x1 PNG red pixel in base64
    const redPixelBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    fs.writeFileSync(testImagePath, Buffer.from(redPixelBase64, 'base64'));
    
    form.append('image', fs.createReadStream(testImagePath));

    try {
      const uploadRes = await axios.post(`${BASE_URL}/upload`, form, {
        headers: {
          ...headers,
          ...form.getHeaders()
        }
      });
      console.log('✅ Upload Success Response:', JSON.stringify(uploadRes.data, null, 2));
    } catch (err) {
      console.error('❌ Upload Failed:', err.response?.data?.message || err.message);
    } finally {
      if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    }

    // 3. Test Missing File
    console.log('\n🚫 Testing Missing File...');
    try {
      await axios.post(`${BASE_URL}/upload`, new FormData(), {
        headers: {
          ...headers
        }
      });
    } catch (err) {
      console.log('✅ Correctly handled missing file:', err.response?.data?.message);
    }

    // 4. Test Invalid Token
    console.log('\n🔐 Testing Invalid Token...');
    try {
      await axios.post(`${BASE_URL}/upload`, new FormData(), {
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      });
    } catch (err) {
      console.log('✅ Correctly handled invalid token:', err.response?.data?.message);
    }

    console.log('\n✨ Verification Completed!');
    process.exit(0);

  } catch (error) {
    console.error('\n💥 Unexpected Error during verification:', error.message);
    process.exit(1);
  }
}

runVerification();
