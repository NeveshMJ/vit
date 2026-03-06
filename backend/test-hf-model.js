async function testCivicModel() {
  console.log('Testing Custom Civic ML Model credentials...\n');

  try {
    // 1. Import the Gradio client (dynamic import works perfectly with CommonJS)
    const { Client } = await import('@gradio/client');
    console.log('✅ Gradio client loaded');

    // 2. Connect to your specific live Hugging Face Space
    const client = await Client.connect("Nevesh06/Blaze");
    console.log('✅ Connected to Hugging Face Space: Nevesh06/Blaze');

    // 3. Fetch a test image and convert it to a Blob 
    // (Using a generic pothole image URL for testing)
    const testImageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Pothole_on_a_road.jpg/800px-Pothole_on_a_road.jpg';
    
    console.log('\nFetching test image...');
    const response = await fetch(testImageUrl);
    const imageBlob = await response.blob();
    console.log('✅ Test image ready');

    // 4. Call your custom predict_issue endpoint!
    console.log('\nCalling Civic ML Model...');
    const result = await client.predict("/predict_issue", {
        img: imageBlob,
    });

    // 5. Output the results
    if (result && result.data) {
      console.log('✅ ML Model is WORKING! Detected Issue:\n');
      
      // Gradio wraps the return JSON in an array, so we grab data[0]
      const prediction = result.data[0]; 
      
      console.log(`   🚨 Issue: ${prediction.issue}`);
      console.log(`   🏢 Department: ${prediction.department}`);
      console.log(`   📊 Confidence: ${(prediction.confidence * 100).toFixed(1)}%`);
      
    } else {
      console.log('⚠️ API responded but returned no data');
    }

  } catch (err) {
    console.log('❌ ML API test FAILED');
    console.log('   Error:', err.message);
  }
}

testCivicModel();