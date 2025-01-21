import React, { useState } from 'react';
import styles from './MaterialStandardization.module.css';
import Papa from 'papaparse';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: "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",
  dangerouslyAllowBrowser: true 
});

export default function MaterialStandardizationPage() {

  const [templateFields, setTemplateFields] = useState({
    primary: '',
    secondary: '',
    tertiary: '',
    other: ''
  });

  const [uploadedFile, setUploadedFile] = useState(null);

  const [results, setResults] = useState({
    standardized: [],
    oversized: [],
    uncleansed: [],
    characteristic_notavailable: []
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const [progress, setProgress] = useState(0);

  // New state for example transformations
  const [transformations, setTransformations] = useState([
    { input: '', output: '' }  // Initial empty transformation
  ]);

  // Function to add new transformation
  const addTransformation = () => {
    setTransformations([...transformations, { input: '', output: '' }]);
  };

  // Function to update transformation
  const updateTransformation = (index, field, value) => {
    const newTransformations = transformations.map((t, i) => {
      if (i === index) {
        return { ...t, [field]: value };
      }
      return t;
    });
    setTransformations(newTransformations);
  };

  // Function to remove transformation
  const removeTransformation = (index) => {
    if (transformations.length > 1) {
      setTransformations(transformations.filter((_, i) => i !== index));
    }
  };

  const processDescriptionWithAI = async (material) => {
    try {
      const originalDesc = material.Description || material.description || material.DESCRIPTION || Object.values(material)[0];
      
      // Create example transformations text from state
      const exampleTransformations = transformations
        .filter(t => t.input && t.output) // Only use complete examples
        .map(t => `Input: "${t.input}"
Output: "${t.output}"`)
        .join('\n\n');
      
      const prompt = `
Task: Standardize material descriptions following specific patterns.

EXAMPLE PATTERNS:
Primary (must be first word): ${templateFields.primary}
Secondary (size/rating): ${templateFields.secondary}
Tertiary (material/type): ${templateFields.tertiary}
Other specs: ${templateFields.other}

EXAMPLE TRANSFORMATIONS:
${exampleTransformations}

INPUT DESCRIPTION: "${originalDesc}"

RULES:
1. Output must be in UPPERCASE
2. Maximum 40 characters
3. Must follow order: PRIMARY SECONDARY TERTIARY OTHER
4. Must match pattern of examples
5. First word MUST match pattern from Primary examples
6. At least one of Secondary and Tertiary must be present in the description.
7. if cleaned description is more than 40 characters, try retaining primary, secondary, tertiary, and any other specs that are present in the description may be trimmed.
7. If you are not sure that the material can be standardized, output "UNCLEANSED"

Now standardize the input description: "${originalDesc}"

if more than 40 characters, output "OVERSIZED"
if you are not finding either 'Secondary' and 'Tertiary' in the description or if you are not sure that the material can be standardized, output "UNCLEANSED"
if primary characteristic is missing, output "CHARACTERISTIC_NOT_AVAILABLE"

Output only the standardized description or one of these keywords: CHARACTERISTIC_NOT_AVAILABLE, OVERSIZED, UNCLEANSED`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a precise material description standardization expert. Output only the standardized description without any additional text or quotes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 60
      });

      // Clean up the AI response
      let result = completion.choices[0].message.content.trim()
        // Remove any "Output:" or "Standardized Description:" prefix
        .replace(/^(Output:|Standardized Description:)\s*/i, '')
        // Remove any surrounding quotes
        .replace(/^["']|["']$/g, '')
        // Remove any extra whitespace
        .trim();

      console.log('Original:', originalDesc);
      console.log('Cleaned AI Response:', result);

      switch (result) {
        case 'CHARACTERISTIC_NOT_AVAILABLE':
          return {
            type: 'characteristic_notavailable',
            material: {
              ...material,
              originalDescription: originalDesc
            }
          };
        case 'OVERSIZED':
          return {
            type: 'oversized',
            material: {
              ...material,
              originalDescription: originalDesc,
              standardDescription: result
            }
          };
        case 'UNCLEANSED':
          return {
            type: 'uncleansed',
            material: {
              ...material,
              originalDescription: originalDesc
            }
          };
        default:
          return {
            type: 'standardized',
            material: {
              ...material,
              originalDescription: originalDesc,
              standardDescription: result
            }
          };
      }
    } catch (error) {
      console.error('AI Processing Error:', error);
      return { type: 'uncleansed', material };
    }
  };

  const handleProcess = async () => {
    if (!uploadedFile) {
      alert('Please upload a file first');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    Papa.parse(uploadedFile, {
      header: true, // Make sure this is true to parse CSV with headers
      skipEmptyLines: true,
      complete: async (results) => {
        // Debug the parsed CSV data
        console.log('Parsed CSV data:', results.data);
        console.log('CSV Headers:', results.meta.fields);

        const processed = {
          standardized: [],
          oversized: [],
          uncleansed: [],
          characteristic_notavailable: []
        };

        // Process in smaller batches
        const batchSize = 3;

        for (let i = 0; i < results.data.length; i += batchSize) {
          const batch = results.data.slice(i, i + batchSize);
          console.log('Processing batch:', batch);
          
          const batchPromises = batch.map(row => 
            processDescriptionWithAI(row)
          );
          
          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach(({ type, material }) => {
            processed[type].push(material);
          });

          // Update progress
          const currentProgress = Math.round(((i + batchSize) / results.data.length) * 100);
          setProgress(Math.min(currentProgress, 100));
          setResults({...processed});
          
          // Add delay between batches
          if (i + batchSize < results.data.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }

        // Generate and download CSV files
        Object.entries(processed).forEach(([type, data]) => {
          if (data.length > 0) {
            const csv = Papa.unparse(data);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}_materials.csv`;
            a.click();
          }
        });

        setIsProcessing(false);
        setProgress(100);
      }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Material Description Standardization</h1>

      <div className={styles.templateSection}>
        <h2>Example Descriptions</h2>
        <div className={styles.templateFields}>
          <div className={styles.field}>
            <label>Primary Characteristic Examples</label>
            <textarea
              value={templateFields.primary}
              onChange={(e) => setTemplateFields(prev => ({...prev, primary: e.target.value}))}
              placeholder="e.g., GASKET, SEAL, O-RING"
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Secondary Characteristic Examples</label>
            <textarea
              value={templateFields.secondary}
              onChange={(e) => setTemplateFields(prev => ({...prev, secondary: e.target.value}))}
              placeholder="e.g., 2 INCH 300#, 3 INCH 600#"
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Tertiary Characteristic Examples</label>
            <textarea
              value={templateFields.tertiary}
              onChange={(e) => setTemplateFields(prev => ({...prev, tertiary: e.target.value}))}
              placeholder="e.g., SPIRAL WOUND SS316, SW SS304"
              rows={3}
            />
          </div>

          <div className={styles.field}>
            <label>Other Specification Examples</label>
            <textarea
              value={templateFields.other}
              onChange={(e) => setTemplateFields(prev => ({...prev, other: e.target.value}))}
              placeholder="e.g., RING JOINT, RTJ"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* New transformations section */}
      <div className={styles.transformationsSection}>
        <h2>Example Transformations</h2>
        <div className={styles.transformationsList}>
          {transformations.map((transformation, index) => (
            <div key={index} className={styles.transformationItem}>
              <div className={styles.transformationFields}>
                <div className={styles.field}>
                  <label>Input Example</label>
                  <textarea
                    value={transformation.input}
                    onChange={(e) => updateTransformation(index, 'input', e.target.value)}
                    placeholder="e.g., spiral wound gasket, 2 inch 300#, ss316"
                    rows={2}
                  />
                </div>
                <div className={styles.field}>
                  <label>Output Example</label>
                  <textarea
                    value={transformation.output}
                    onChange={(e) => updateTransformation(index, 'output', e.target.value)}
                    placeholder="e.g., GASKET 2&quot; 300# SW SS316"
                    rows={2}
                  />
                </div>
              </div>
              <button
                onClick={() => removeTransformation(index)}
                className={styles.removeButton}
                disabled={transformations.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addTransformation}
            className={styles.addButton}
          >
            + Add Example
          </button>
        </div>
      </div>

      <div className={styles.uploadSection}>
        <h2>Upload Materials File</h2>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setUploadedFile(e.target.files[0])}
          className={styles.fileInput}
        />
      </div>

      <button
        onClick={handleProcess}
        className={styles.processButton}
        disabled={isProcessing || !uploadedFile}
      >
        {isProcessing ? 'Processing...' : 'Process Materials'}
      </button>

      {isProcessing && (
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{width: `${progress}%`}}
          />
          <span>{progress}%</span>
        </div>
      )}

      {Object.entries(results).map(([type, materials]) => (
        materials.length > 0 && (
          <div key={type} className={styles.resultSection}>
            <h3>
              {type === 'characteristic_notavailable' 
                ? 'Missing Primary Characteristic' 
                : type.charAt(0).toUpperCase() + type.slice(1) + ' Materials'}
            </h3>
            <p>Count: {materials.length}</p>
            <div className={styles.preview}>
              {materials.slice(0, 3).map((material, index) => (
                <div key={index} className={styles.previewItem}>
                  <p>Original: {material.originalDescription}</p>
                  {material.standardDescription && (
                    <p>Standardized: {material.standardDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}
    </div>
  );
}