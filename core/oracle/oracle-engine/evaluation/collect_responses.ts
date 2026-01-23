/**
 * Agent Runner - Collect AI Responses for Evaluation
 * 
 * This script runs test queries against the AI chat endpoint
 * and collects responses for evaluation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const CHAT_ENDPOINT = `${API_BASE_URL}/api/chat`;
const INPUT_FILE = path.join(__dirname, '../pi-forge-quantum-genesis/quantum_test_data.jsonl');
const OUTPUT_FILE = path.join(__dirname, 'evaluation_dataset.jsonl');

interface TestQuery {
  query: string;
  component: string;
  expected_response: string;
  context: string;
  quantum_phase: string;
  evaluation_focus: string;
}

interface EvaluationRecord {
  query: string;
  response: string;
  expected_response: string;
  context: string;
  component: string;
  quantum_phase: string;
  evaluation_focus: string;
  timestamp: string;
  response_time_ms: number;
  success: boolean;
  error?: string;
}

/**
 * Call the AI chat endpoint with a query
 */
async function callChatEndpoint(query: string, context: string): Promise<{ response: string; responseTimeMs: number }> {
  const startTime = Date.now();
  
  const systemPrompt = `You are the Quantum Pi Forge AI Assistant. Context: ${context}`;
  
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: query }
      ],
      systemPrompt,
    }),
  });

  const responseTimeMs = Date.now() - startTime;

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  // Handle streaming response
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  let fullResponse = '';
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fullResponse += decoder.decode(value, { stream: true });
  }

  return { response: fullResponse, responseTimeMs };
}

/**
 * Read test queries from JSONL file
 */
async function readTestQueries(): Promise<TestQuery[]> {
  const queries: TestQuery[] = [];
  
  const fileStream = fs.createReadStream(INPUT_FILE);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line.trim()) {
      queries.push(JSON.parse(line));
    }
  }

  return queries;
}

/**
 * Main function to collect responses
 */
async function collectResponses(): Promise<void> {
  console.log('🚀 Starting response collection for evaluation...');
  console.log(`📁 Input file: ${INPUT_FILE}`);
  console.log(`📁 Output file: ${OUTPUT_FILE}`);
  console.log(`🌐 API endpoint: ${CHAT_ENDPOINT}`);
  console.log('');

  // Read test queries
  const queries = await readTestQueries();
  console.log(`📊 Found ${queries.length} test queries`);
  console.log('');

  // Collect responses
  const results: EvaluationRecord[] = [];
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`[${i + 1}/${queries.length}] Processing: ${query.query.substring(0, 50)}...`);

    const record: EvaluationRecord = {
      query: query.query,
      response: '',
      expected_response: query.expected_response,
      context: query.context,
      component: query.component,
      quantum_phase: query.quantum_phase,
      evaluation_focus: query.evaluation_focus,
      timestamp: new Date().toISOString(),
      response_time_ms: 0,
      success: false,
    };

    try {
      const { response, responseTimeMs } = await callChatEndpoint(query.query, query.context);
      record.response = response;
      record.response_time_ms = responseTimeMs;
      record.success = true;
      console.log(`  ✅ Success (${responseTimeMs}ms)`);
    } catch (error) {
      record.error = error instanceof Error ? error.message : 'Unknown error';
      record.success = false;
      console.log(`  ❌ Error: ${record.error}`);
    }

    results.push(record);

    // Add a small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Write results to JSONL file
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputStream = fs.createWriteStream(OUTPUT_FILE);
  for (const record of results) {
    outputStream.write(JSON.stringify(record) + '\n');
  }
  outputStream.end();

  // Print summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  const avgResponseTime = results
    .filter(r => r.success)
    .reduce((sum, r) => sum + r.response_time_ms, 0) / successCount || 0;

  console.log('');
  console.log('📊 Collection Summary:');
  console.log(`  ✅ Successful: ${successCount}`);
  console.log(`  ❌ Failed: ${failCount}`);
  console.log(`  ⏱️  Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`  📁 Output saved to: ${OUTPUT_FILE}`);
}

// Run the collector
collectResponses().catch(console.error);
