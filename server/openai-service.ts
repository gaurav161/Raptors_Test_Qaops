import OpenAI from 'openai';

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type GeneratedTestStep = {
  id: number;
  action: string;
  expected_result: string;
};

type GeneratedTestCase = {
  name: string;
  description: string;
  priority: string;
  type: string;
  preconditions: string;
  steps: GeneratedTestStep[];
  tags: string[];
};

export async function generateTestCase(
  featureDescription: string,
  numTestCases: number = 1
): Promise<GeneratedTestCase[]> {
  try {
    const prompt = `Generate ${numTestCases} test cases for the following feature or user story:
    
${featureDescription}

Each test case should include:
1. A descriptive name
2. A detailed description of what the test is verifying
3. Priority (High, Medium, or Low)
4. Type (Functional, Performance, Security, Usability, or Regression)
5. Preconditions
6. Test steps (each with an action and expected result)
7. Tags

Response should be structured as a JSON array of test cases with this format:
[
  {
    "name": "Test case name",
    "description": "Test case description",
    "priority": "High|Medium|Low",
    "type": "Functional|Performance|Security|Usability|Regression",
    "preconditions": "Any required setup or conditions",
    "steps": [
      {
        "id": 1,
        "action": "What the tester should do",
        "expected_result": "What should happen"
      },
      ...
    ],
    "tags": ["tag1", "tag2", ...]
  },
  ...
]`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const parsedContent = JSON.parse(content);
    
    // Check if we have a testCases property or if the response is already an array
    const testCases = Array.isArray(parsedContent) 
      ? parsedContent 
      : parsedContent.testCases || [];
    
    return testCases.map((tc: any) => ({
      name: tc.name,
      description: tc.description,
      priority: tc.priority,
      type: tc.type,
      preconditions: tc.preconditions,
      steps: tc.steps.map((step: any, idx: number) => ({
        id: step.id || idx + 1,
        action: step.action,
        expected_result: step.expected_result
      })),
      tags: tc.tags || []
    }));
  } catch (error) {
    console.error('Error generating test cases:', error);
    throw new Error(`Failed to generate test cases: ${error.message}`);
  }
}

export async function generateTestCasesFromFeatureName(
  featureName: string,
  numTestCases: number = 1
): Promise<GeneratedTestCase[]> {
  // For simple feature names, we'll ask OpenAI to imagine what the feature might entail
  const prompt = `Based on the feature name "${featureName}", imagine what this feature might do and generate ${numTestCases} test cases for it.`;
  return generateTestCase(prompt, numTestCases);
}