/**
 * Upteky NexusAI - Automated Backend & AI Verification Suite
 * Run with: node test_backend.mjs
 */

import { buildSystemPrompt } from "./src/lib/ai/prompts.ts";
import { executeWorkflow } from "./src/lib/workflow/orchestrator.ts";
import { calculateCustomROI, UPTEKY_BENCHMARKS } from "./src/lib/data/analytics.ts";
import { INITIAL_AGENTS } from "./src/lib/data/agents.ts";
import { DEMO_SCENARIOS } from "./src/lib/data/scenarios.ts";
import { routeChatStream } from "./src/lib/ai/router.ts";

async function runTests() {
  console.log("=================================================");
  console.log("🚀 UPTEKY NEXUSAI - BACKEND & AI TEST SUITE");
  console.log("=================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // 1. Prompts & Channel Decoration
  console.log("--- 1. Testing Domain Prompts & Channel Rules ---");
  const waPrompt = buildSystemPrompt("manufacturing", "whatsapp");
  assert(waPrompt.includes("JM PlastoPack"), "Manufacturing prompt references JM PlastoPack");
  assert(waPrompt.includes("FORMATTING FOR WHATSAPP"), "WhatsApp channel decorator applied");
  assert(waPrompt.includes("emojis"), "WhatsApp prompt enforces emoji usage");

  const emailPrompt = buildSystemPrompt("pharma", "email");
  assert(emailPrompt.includes("Game of Pharma"), "Pharma prompt references Game of Pharma");
  assert(emailPrompt.includes("FORMATTING FOR EMAIL"), "Email channel decorator applied");

  // 2. Agents & Templates Dataset
  console.log("\n--- 2. Testing Pre-Configured Agents ---");
  assert(INITIAL_AGENTS.length === 4, "Loaded 4 core industry agents");
  const jmAgent = INITIAL_AGENTS.find((a) => a.id === "agent-plastopack-02");
  assert(jmAgent && jmAgent.channel.includes("whatsapp"), "JM PlastoPack agent configured with WhatsApp");

  // 3. Demo Scenarios
  console.log("\n--- 3. Testing Demo Scenarios ---");
  assert(DEMO_SCENARIOS.length === 4, "Loaded 4 demo scenarios for judges");

  // 4. Workflow Orchestration Engine
  console.log("\n--- 4. Testing Multi-Agent Workflow Engine ---");
  const workflowResult = await executeWorkflow(undefined, {
    channel: "whatsapp",
    sender: "+91-9988776655",
    message: "Need 10,000 custom packaging bottles delivered to Ahmedabad GIDC.",
  });
  assert(workflowResult.status === "success", "Workflow executed with status: success");
  assert(workflowResult.steps.length === 4, "Workflow executed 4 pipeline steps");
  assert(workflowResult.steps[1].type === "ai_eval", "Step 2 performed AI Intent Evaluation");
  assert(workflowResult.totalDurationMs < 1000, `Workflow executed in ${workflowResult.totalDurationMs}ms (< 1s)`);

  // 5. Analytics & Custom ROI Engine
  console.log("\n--- 5. Testing ROI Calculation Engine ---");
  assert(UPTEKY_BENCHMARKS.recoveredLeadsPercentage === 52.0, "Case benchmark shows 52% lead recovery");
  const roi = calculateCustomROI(5000, 200000);
  assert(roi.automatedInquiries === 3900, "Automated 78% of 5,000 inquiries (3,900)");
  assert(roi.roiMultiplier > 10, `Generated ${roi.roiMultiplier}x ROI multiplier for client`);

  // 6. Multi-Model AI Router (Resilient Streaming Fallback)
  console.log("\n--- 6. Testing Multi-Model AI Router Stream ---");
  const streamResult = await routeChatStream({
    messages: [{ role: "user", content: "What is your MOQ for plastic packaging?" }],
    channel: "whatsapp",
    vertical: "manufacturing",
    model: "auto",
  });
  assert(streamResult.stream !== undefined, "Router generated ReadableStream");
  assert(streamResult.resolvedProvider !== undefined, `Router resolved to: ${streamResult.resolvedProvider} (${streamResult.modelName})`);

  // Read first chunk from stream
  const reader = streamResult.stream.getReader();
  const { value } = await reader.read();
  const textChunk = new TextDecoder().decode(value);
  assert(textChunk.length > 0, `Stream returned content: "${textChunk.slice(0, 30)}..."`);
  reader.releaseLock();

  console.log("\n=================================================");
  console.log(`🎯 TEST RESULTS: ${passed}/${total} TESTS PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log("=================================================\n");
}

runTests().catch(console.error);
