require('dotenv').config();
const vision = require('@google-cloud/vision');

async function testVision() {
  console.log('Testing Google Vision API credentials...\n');

  // Check if GOOGLE_CREDENTIALS env var is set
  if (!process.env.GOOGLE_CREDENTIALS) {
    console.log('❌ GOOGLE_CREDENTIALS env var is NOT set in .env');
    return;
  }
  console.log('✅ GOOGLE_CREDENTIALS env var found');

  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('✅ JSON parsed successfully');
    console.log('   Project ID:', credentials.project_id);
    console.log('   Client Email:', credentials.client_email);

    // Initialize Vision client
    const client = new vision.ImageAnnotatorClient({ credentials });
    console.log('✅ Vision client initialized');

    // Test with a public image URL
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/PNG_transparency_demonstration_1.png/280px-PNG_transparency_demonstration_1.png';
    
    console.log('\nCalling Vision API with a test image...');
    const [result] = await client.labelDetection(testImageUrl);
    const labels = result.labelAnnotations || [];

    if (labels.length > 0) {
      console.log('✅ Vision API is WORKING! Detected labels:');
      labels.slice(0, 5).forEach(label => {
        console.log(`   - ${label.description} (confidence: ${(label.score * 100).toFixed(1)}%)`);
      });
    } else {
      console.log('⚠️ API responded but returned no labels');
    }
  } catch (err) {
    console.log('❌ Vision API test FAILED');
    console.log('   Error:', err.message);
  }
}

testVision();
