// HuggingFace Gradio-based civic issue classifier (Nevesh06/Blaze)
// @gradio/client is ESM-only, so we use dynamic import inside async functions

// ============================================================
// DEPARTMENT MAPPING — keywords from Vision API labels → department
// ============================================================
const DEPARTMENT_KEYWORDS = {
  'Water Resources': {
    keywords: [
      'water', 'pipe', 'pipeline', 'flood', 'flooding', 'drain', 'drainage',
      'sewage', 'sewer', 'leak', 'leaking', 'plumbing', 'tap', 'faucet',
      'water supply', 'borewell', 'well', 'tank', 'overhead tank', 'pump',
      'waterlogging', 'stagnant water', 'canal', 'river', 'pond', 'reservoir',
      'water contamination', 'dirty water', 'water body', 'puddle', 'swimming pool',
      'moisture', 'wet', 'liquid', 'fluid', 'sprinkler', 'hydrant', 'valve',
      'water pipe', 'water tank', 'water damage', 'water overflow'
    ],
    weight: 1.0
  },
  'Electricity': {
    keywords: [
      'electric', 'electricity', 'wire', 'wiring', 'cable', 'power line',
      'transformer', 'pole', 'power pole', 'utility pole', 'streetlight',
      'street light', 'lamp', 'lamp post', 'bulb', 'light', 'lighting',
      'electric pole', 'power outage', 'blackout', 'short circuit',
      'electrical', 'voltage', 'current', 'generator', 'inverter',
      'circuit breaker', 'meter', 'electric meter', 'fuse', 'switch',
      'overhead line', 'high tension', 'conductor', 'insulator',
      'power grid', 'substation', 'energy', 'neon', 'fluorescent',
      'led', 'electrical equipment', 'power supply', 'electric line'
    ],
    weight: 1.0
  },
  'Roads & Highways': {
    keywords: [
      'road', 'highway', 'pothole', 'crack', 'asphalt', 'pavement',
      'footpath', 'sidewalk', 'bridge', 'flyover', 'overpass', 'underpass',
      'speed breaker', 'speed bump', 'divider', 'median', 'curb',
      'road damage', 'road construction', 'tar', 'concrete', 'gravel',
      'lane', 'intersection', 'junction', 'roundabout', 'road sign',
      'traffic sign', 'barricade', 'guardrail', 'railing', 'manhole',
      'road surface', 'street', 'avenue', 'boulevard', 'path', 'trail',
      'cobblestone', 'bitumen', 'roadwork', 'paving', 'road marking',
      'zebra crossing', 'crosswalk', 'pedestrian', 'roadway', 'infrastructure'
    ],
    weight: 1.0
  },
  'Sanitation': {
    keywords: [
      'garbage', 'trash', 'waste', 'dump', 'litter', 'debris', 'rubbish',
      'dustbin', 'bin', 'dumpster', 'compost', 'recycling', 'junk',
      'pollution', 'dirty', 'filth', 'mess', 'unhygienic', 'unsanitary',
      'toilet', 'restroom', 'latrine', 'sewage', 'sanitation',
      'cleaning', 'sweeping', 'disposal', 'waste management',
      'plastic', 'plastic waste', 'polythene', 'bottle', 'cans',
      'food waste', 'organic waste', 'landfill', 'decomposition',
      'stench', 'smell', 'odor', 'foul smell', 'rot', 'rotten',
      'contamination', 'hazardous waste', 'biomedical waste'
    ],
    weight: 1.0
  },
  'Public Health': {
    keywords: [
      'hospital', 'clinic', 'medical', 'health', 'disease', 'infection',
      'mosquito', 'pest', 'insect', 'rat', 'rodent', 'cockroach',
      'dengue', 'malaria', 'epidemic', 'pandemic', 'vaccination',
      'medicine', 'pharmacy', 'doctor', 'nurse', 'patient',
      'ambulance', 'emergency', 'first aid', 'health hazard',
      'contamination', 'polluted', 'toxic', 'chemical', 'smoke',
      'air pollution', 'respiratory', 'safety', 'biohazard',
      'stagnant', 'breeding ground', 'larvae', 'fly', 'flies',
      'public health', 'hygiene', 'disinfection', 'sanitizer'
    ],
    weight: 1.0
  },
  'Education': {
    keywords: [
      'school', 'college', 'university', 'classroom', 'education',
      'student', 'teacher', 'blackboard', 'whiteboard', 'desk',
      'chair', 'bench', 'library', 'book', 'notebook', 'stationery',
      'playground', 'campus', 'laboratory', 'computer lab',
      'hostel', 'canteen', 'auditorium', 'sports', 'academic',
      'tuition', 'exam', 'scholarship', 'learning'
    ],
    weight: 0.8
  },
  'Transport': {
    keywords: [
      'bus', 'bus stop', 'bus stand', 'bus station', 'bus shelter',
      'traffic', 'traffic light', 'traffic signal', 'traffic jam',
      'vehicle', 'car', 'truck', 'auto', 'rickshaw', 'train',
      'railway', 'metro', 'station', 'platform', 'parking',
      'accident', 'collision', 'transport', 'transportation',
      'commute', 'transit', 'route', 'highway', 'signal',
      'pedestrian crossing', 'overloaded', 'public transport'
    ],
    weight: 0.9
  },
  'Revenue': {
    keywords: [
      'land', 'property', 'boundary', 'survey', 'deed', 'title',
      'encroachment', 'illegal construction', 'demolition',
      'tax', 'revenue', 'registration', 'document', 'certificate',
      'patta', 'chitta', 'adangal', 'land record', 'measurement'
    ],
    weight: 0.7
  },
  'Agriculture': {
    keywords: [
      'farm', 'crop', 'field', 'agriculture', 'farming', 'harvest',
      'irrigation', 'fertilizer', 'pesticide', 'soil', 'seed',
      'tractor', 'plowing', 'cattle', 'livestock', 'poultry',
      'paddy', 'rice', 'wheat', 'vegetable', 'fruit', 'garden',
      'horticulture', 'plantation', 'orchard', 'greenhouse',
      'drought', 'pest attack', 'crop damage', 'agricultural land'
    ],
    weight: 0.8
  }
};

/**
 * Analyze an image using the HuggingFace Gradio Space (Nevesh06/Blaze).
 * Accepts a base64-encoded image string (with or without data URI prefix).
 * Returns { labels, objects, detectedText, webEntities, source, directDepartment, directReason, directConfidence }
 */
async function analyzeImage(base64Image) {
  try {
    // Ensure proper data URI format so we can build a Blob from it
    let dataUri = base64Image;
    if (!dataUri.startsWith('data:')) {
      dataUri = `data:image/jpeg;base64,${dataUri}`;
    }

    // Convert the base64 data URI to a Blob
    const base64Data = dataUri.split(',')[1];
    const mimeType = dataUri.split(';')[0].split(':')[1] || 'image/jpeg';
    const byteCharacters = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([byteCharacters], { type: mimeType });

    console.log('[HF Vision] Connecting to Nevesh06/Blaze...');
    const { Client } = await import('@gradio/client');
    const hfClient = await Client.connect('Nevesh06/Blaze');
    console.log('[HF Vision] Connected. Sending image for prediction...');

    const result = await hfClient.predict('/predict_issue', { img: imageBlob });

    if (!result || !result.data || !result.data[0]) {
      throw new Error('HuggingFace model returned empty response');
    }

    const prediction = result.data[0];
    console.log(`[HF Vision] Prediction: issue="${prediction.issue}", department="${prediction.department}", confidence=${(prediction.confidence * 100).toFixed(1)}%`);

    return {
      labels: [{ description: (prediction.issue || '').toLowerCase(), score: prediction.confidence || 0.8 }],
      objects: [],
      detectedText: '',
      webEntities: [],
      source: 'hf-gradio',
      directDepartment: prediction.department,
      directReason: prediction.issue,
      directConfidence: prediction.confidence
    };
  } catch (error) {
    console.error('[HF Vision] HuggingFace model failed:', error.message);
    // Return empty result — mapToDepartment will do keyword fallback
    return { labels: [], objects: [], detectedText: '', webEntities: [], source: 'none' };
  }
}

/**
 * Map Vision API results to the most appropriate department.
 * Returns { department, confidence, detectedLabels, reason }
 */
function mapToDepartment(visionResults) {
  const { labels, objects, detectedText, webEntities, source, directDepartment, directReason, directConfidence } = visionResults;

  // If HuggingFace model directly returned a department, validate and use it
  if (directDepartment && source === 'hf-gradio') {
    const validDepts = [...Object.keys(DEPARTMENT_KEYWORDS), 'General'];
    const matched = validDepts.find(d => d.toLowerCase() === directDepartment.toLowerCase());
    if (matched) {
      const confidence = directConfidence != null
        ? Math.min(Math.round(directConfidence * 100), 99)
        : 85;
      return {
        department: matched,
        confidence,
        detectedLabels: labels.slice(0, 8).map(l => l.description),
        matchedKeywords: [],
        reason: directReason || `ML model detected: ${matched}`,
        source
      };
    }
  }

  // If OpenRouter vision model directly returned a department, validate and use it
  if (directDepartment && source === 'openrouter-vision') {
    const validDepts = [...Object.keys(DEPARTMENT_KEYWORDS), 'General'];
    const matched = validDepts.find(d => d.toLowerCase() === directDepartment.toLowerCase());
    if (matched) {
      return {
        department: matched,
        confidence: 85,
        detectedLabels: labels.slice(0, 8).map(l => l.description),
        matchedKeywords: [],
        reason: directReason || `AI vision detected: ${matched}`,
        source
      };
    }
  }

  // Combine all detected terms into a single searchable text
  const allTerms = [
    ...labels.map(l => ({ term: l.description, score: l.score, source: 'label' })),
    ...objects.map(o => ({ term: o.name, score: o.score, source: 'object' })),
    ...webEntities.map(w => ({ term: w.description, score: w.score || 0.5, source: 'web' }))
  ];

  // Score each department
  const scores = {};
  const matchedKeywords = {};

  for (const [department, config] of Object.entries(DEPARTMENT_KEYWORDS)) {
    scores[department] = 0;
    matchedKeywords[department] = [];

    for (const item of allTerms) {
      for (const keyword of config.keywords) {
        if (item.term.includes(keyword) || keyword.includes(item.term)) {
          const contribution = item.score * config.weight *
            (item.source === 'label' ? 1.2 : item.source === 'object' ? 1.0 : 0.8);
          scores[department] += contribution;
          if (!matchedKeywords[department].includes(keyword)) {
            matchedKeywords[department].push(keyword);
          }
        }
      }
    }

    // Also check detected text
    if (detectedText) {
      for (const keyword of config.keywords) {
        if (detectedText.includes(keyword)) {
          scores[department] += 0.5 * config.weight;
          if (!matchedKeywords[department].includes(keyword)) {
            matchedKeywords[department].push(`text:${keyword}`);
          }
        }
      }
    }
  }

  // Sort departments by score
  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .filter(([, score]) => score > 0);

  if (sorted.length === 0) {
    return {
      department: 'General',
      confidence: 0,
      detectedLabels: labels.slice(0, 8).map(l => l.description),
      reason: 'Could not match image to a specific department',
      allScores: scores,
      source: source || 'keyword-mapping'
    };
  }

  const [topDept, topScore] = sorted[0];
  const totalScore = sorted.reduce((sum, [, s]) => sum + s, 0);
  const confidence = totalScore > 0 ? Math.min(Math.round((topScore / totalScore) * 100), 99) : 0;

  return {
    department: topDept,
    confidence,
    detectedLabels: labels.slice(0, 8).map(l => l.description),
    matchedKeywords: matchedKeywords[topDept],
    reason: `Detected: ${matchedKeywords[topDept].slice(0, 5).join(', ')}`,
    allScores: Object.fromEntries(sorted.slice(0, 3)),
    source: source || 'keyword-mapping'
  };
}

/**
 * Full pipeline: Analyze image and return auto-detected department.
 */
async function detectDepartmentFromImage(base64Image) {
  try {
    const visionResults = await analyzeImage(base64Image);
    const departmentResult = mapToDepartment(visionResults);

    console.log(`[Vision] Auto-detected department: ${departmentResult.department} (${departmentResult.confidence}% confidence)`);
    console.log(`[Vision] Source: ${departmentResult.source}`);
    console.log(`[Vision] Reason: ${departmentResult.reason}`);

    return departmentResult;
  } catch (error) {
    console.error('[Vision API] Department detection failed:', error.message);
    // Return a fallback
    return {
      department: 'General',
      confidence: 0,
      detectedLabels: [],
      reason: 'Vision API analysis failed: ' + error.message,
      error: true
    };
  }
}

module.exports = { analyzeImage, mapToDepartment, detectDepartmentFromImage };
