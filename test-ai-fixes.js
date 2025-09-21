// Test script to verify AI fixes
const { MultiProviderAI } = require('./lib/ai/multiProviderAI.ts');

async function testFixes() {
  const ai = new MultiProviderAI();
  
  console.log('🧪 Testing AI Fixes...\n');
  
  // Test 1: Road damage image with waste description (should have low confidence for waste category)
  console.log('Test 1: Road damage image with waste description');
  try {
    const result1 = await ai.analyzeContent({
      description: "too much waste has piling on this road from years",
      issueType: "waste_pileup",
      userId: "test-user"
    });
    
    console.log('NSFW Analysis:', result1.nsfwAnalysis);
    console.log('Civic Analysis:', result1.civicAnalysis);
    console.log('Expected: Low confidence for waste_pileup category\n');
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }
  
  // Test 2: Explicit content (should be flagged as harmful)
  console.log('Test 2: Explicit content detection');
  try {
    const result2 = await ai.analyzeContent({
      description: "pornographic content with nude people",
      issueType: "road_damage",
      userId: "test-user"
    });
    
    console.log('NSFW Analysis:', result2.nsfwAnalysis);
    console.log('Expected: isHarmful: true\n');
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }
  
  // Test 3: Civic content (should be safe)
  console.log('Test 3: Civic content (should be safe)');
  try {
    const result3 = await ai.analyzeContent({
      description: "large potholes on main road causing traffic issues",
      issueType: "road_damage",
      userId: "test-user"
    });
    
    console.log('NSFW Analysis:', result3.nsfwAnalysis);
    console.log('Expected: isHarmful: false\n');
  } catch (error) {
    console.log('Error:', error.message, '\n');
  }
  
  console.log('✅ Tests completed!');
}

testFixes();
