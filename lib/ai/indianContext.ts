export const INDIAN_CONTEXT_PROMPTS = {
  road_damage: `Analyze road damage in INDIAN context. Indian roads have unique challenges:
- Massive potholes (2-6 feet craters) from monsoons and heavy traffic
- Mixed surfaces: concrete, asphalt, unpaved sections  
- Debris-filled holes with stones, plastic, garbage
- Waterlogged damage during rainy season

IMPORTANT: Only analyze if the image shows actual road damage (potholes, cracks, broken pavement). 
If the image shows something else (like garbage, drainage, etc.), set confidence to 0.

SEVERITY SCALE (Indian context):
1-3: Minor cracks, small potholes (< 1 foot)
4-6: Medium potholes (1-3 feet), two-wheeler damage risk  
7-8: Large potholes (3-6 feet), dangerous for cars/buses
9-10: Crater-like holes, road impassable, vehicle damage certain

Respond with JSON:
{
  "severity": number (1-10),
  "confidence": number (0-1),
  "contextualFactors": ["monsoon damage", "heavy traffic"],
  "recommendations": ["immediate repair", "traffic diversion"], 
  "urgencyLevel": "low|medium|high|critical",
  "indianSpecific": ["waterlogging risk", "two-wheeler hazard"]
}`,

  waste_pileup: `Analyze waste in INDIAN context. Indian waste scenarios are extreme:
- Garbage mountains 10-20 feet high are common
- Mixed waste: organic (60%), plastic (15%), hazardous materials
- Open burning creates toxic smoke and air pollution
- Stray animals foraging increases disease transmission
- Monsoons spread contaminated waste creating health emergencies

IMPORTANT: Only analyze if the image shows actual garbage/waste piles. 
If the image shows something else (like road damage, drainage, etc.), set confidence to 0.

SEVERITY SCALE (Indian context):
1-3: Small scattered litter
4-6: Medium pile (3-5 feet), attracting pests
7-8: Large dump (6-15 feet), burning, health hazard
9-10: Massive waste mountain, toxic, public health emergency

Respond with JSON format as above.`,

  water_drainage: `Analyze drainage in INDIAN context. Indian drainage problems are severe:
- Open drains with raw sewage through residential areas
- Entire roads become sewage rivers during monsoons  
- Black contaminated water mixing with rainwater
- Mosquito breeding causes dengue, malaria outbreaks
- People forced to wade through contaminated water daily

SEVERITY SCALE (Indian context):
1-3: Minor water stagnation, mostly clear
4-6: Moderate sewage overflow, bad odor
7-8: Road flooded with sewage, people avoiding area
9-10: Sewage river, epidemic risk, area uninhabitable

Respond with JSON format as above.`,

  street_lights: `Analyze street lighting in INDIAN context:
- Long highway stretches with zero lighting (accident-prone)
- Frequent power cuts causing darkness in urban areas
- Cable theft leaving areas dark for months
- Women's safety major concern in unlit areas
- Two-wheeler accident rates increase dramatically

SEVERITY SCALE (Indian context):
1-3: Few bulbs out, adequate lighting remains  
4-6: Partial lighting, some dangerous dark spots
7-8: Mostly dark, major safety and crime concern
9-10: Complete darkness, high accident/crime risk

Respond with JSON format as above.`,

  traffic_lights: `Analyze traffic signals in INDIAN context:
- Extremely heavy mixed traffic volumes
- Cars, buses, trucks, auto-rickshaws, motorcycles, cycles all together
- Non-functional signals create massive gridlocks and accidents
- Traffic police manually manage when signals fail
- Peak hour chaos when signals malfunction

SEVERITY SCALE (Indian context):
1-3: Minor timing issues, traffic still flowing
4-6: Intermittent failures, moderate delays
7-8: Complete failure, major jams, police intervention needed  
9-10: Multiple junction failure, city-wide gridlock

Respond with JSON format as above.`
};

export const NSFW_ANALYSIS_PROMPT = `You are a content moderation AI. Analyze this content for harmful/inappropriate material.

CRITICAL RULES:
1. CIVIC ISSUES ARE ALWAYS SAFE: Road damage, potholes, garbage, drainage, infrastructure problems, environmental issues = SAFE
2. EXPLICIT ADULT CONTENT IS ALWAYS HARMFUL: Nudity, sexual acts, pornographic material, adult websites = HARMFUL

HARMFUL CONTENT (Flag as isHarmful: true):
- NSFW: Nudity, sexual content, pornographic material, adult websites, sexual acts
- Profanity: Foul language, abuse, swearing, vulgar terms (fuck, bitch, madarchod, etc.)
- Violence: Actual violence, weapons, threats of physical harm, blood, gore
- Hate Speech: Targeted harassment, discrimination, slurs, hate groups
- Spam: Commercial scams, fake offers, clickbait, phishing

SAFE CONTENT (Flag as isHarmful: false):
- Civic infrastructure issues (roads, garbage, drainage, potholes, waste)
- Environmental problems (pollution, waste management, urban decay)
- Public safety concerns (street lights, traffic, maintenance)
- General urban issues and public infrastructure

EXAMPLES:
- Image of potholes/road damage = SAFE (isHarmful: false)
- Image of garbage pile = SAFE (isHarmful: false)
- Image of nude people/sexual content = HARMFUL (isHarmful: true)
- Image of adult website/porn = HARMFUL (isHarmful: true)
- Text with profanity: "fuck you bitch" = HARMFUL (isHarmful: true)
- Text with abuse: "madarchod behenchod" = HARMFUL (isHarmful: true)

Rate harm level 1-10 where:
1-3: Safe content (including all civic issues)
4-6: Mildly inappropriate, warning needed
7-8: Clearly harmful, user penalty warranted
9-10: Severe violation, immediate action required

Respond with JSON:
{
  "isHarmful": boolean,
  "harmScore": number (1-10),
  "categories": {
    "nsfw": number (0-1),
    "violence": number (0-1), 
    "hate": number (0-1),
    "spam": number (0-1)
  },
  "confidence": number (0-1),
  "reasoning": "explanation",
  "userPenalty": number (-10 for harmful, 0 for safe)
}`;
