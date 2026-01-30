import { FUNCTIONS_BASE_URL, isFunctionsConfigured } from "@/config/functions";
import { ChecklistItem } from "@/types";

export async function getAiAssistantResponse({
  jobType,
  jurisdiction,
  checklistItems,
  userPrompt,
}: {
  jobType: string;
  jurisdiction: string;
  checklistItems: ChecklistItem[];
  userPrompt: string;
}): Promise<string | null> {
  if (!isFunctionsConfigured()) return null;

  const incomplete = checklistItems.filter((item) => item.status !== "COMPLETE");
  const checklistSummary = incomplete.map((item) => `- ${item.title}: ${item.description}`).join("\n");

  const system = `You are PermitPath's assistant for ${jurisdiction} permit documentation.\n" +
    "Keep responses short, actionable, and friendly.\n" +
    "Use markdown sparingly (bold for emphasis).\n" +
    "If unsure, suggest taking a photo or following the checklist.\n" +
    "Do not fabricate permit rules; encourage verifying with the jurisdiction.`;

  const user = `Job type: ${jobType}\nChecklist items:\n${checklistSummary}\n\nUser prompt: ${userPrompt}`;

  const response = await fetch(`${FUNCTIONS_BASE_URL}/openaiChat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : null;
}
