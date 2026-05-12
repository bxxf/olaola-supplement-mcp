import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { McpAppContext } from "../mcp/context.js";
import type { PromptModule } from "../mcp/prompt.js";

export const supplementIntakePrompt: PromptModule = {
  register(server: McpServer, _context: McpAppContext): void {
    server.registerPrompt(
      "supplement_intake",
      {
        title: "Supplement Intake",
        description:
          "Start a supplement recommendation/audit conversation by collecting current stack, medications, conditions, goals, diet, and safety context before using product retrieval tools.",
        argsSchema: {
          userGoal: z.string().optional().describe("User's initial goal, if already known."),
          locale: z.string().optional().describe("Response locale. Defaults to cs-CZ."),
        },
      },
      ({ userGoal, locale }) => ({
        description: "Structured intake prompt for supplement recommendation and cart audit workflows.",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: buildSupplementIntakePrompt({
                userGoal,
                locale: locale ?? "cs-CZ",
              }),
            },
          },
        ],
      }),
    );
  },
};

function buildSupplementIntakePrompt(input: { userGoal: string | undefined; locale: string }): string {
  const knownGoal = input.userGoal ? `\nKnown initial user goal: ${input.userGoal}` : "";

  return `You are helping with supplement selection, supplement cart audit, and supplement combination safety.

Locale: ${input.locale}.${knownGoal}

Before recommending products, changing a cart, generating a quick-buy URL, or assessing combinations, first collect the minimum safety and relevance context. Ask concise questions in the user's language. Do not ask every possible question if the user already provided the answer.

Required intake before recommendations:
1. Current supplements: name, dose, serving frequency, and how long they have been taking each.
2. Current medications and relevant medical context: prescription drugs, anticoagulants/blood thinners, thyroid medication, antidepressants, antibiotics, pregnancy/breastfeeding, kidney/liver disease, planned surgery, diagnosed conditions. If they do not want to share details, ask them to confirm whether any apply.
3. Goal and priority: e.g. sleep, energy, sport performance, digestion, immunity, cognition, skin/hair, longevity, deficiency correction.
4. Basic profile: age range, sex, diet pattern, fish intake, sun exposure, training load, sleep issues, caffeine/alcohol, allergies/intolerances.
5. Labs if available: vitamin D 25-OH, ferritin/iron, B12, folate, lipids, HbA1c/glucose, liver/kidney markers. If unavailable, state confidence is lower.
6. Budget and preference: capsules/powder/liquid, vegan, subscription vs one-time, max monthly spend.

Safety behavior:
- Treat current supplements, owned products, ingredient exclusions, and product feedback as conversation context. This MCP is stateless by default and does not store sensitive supplement history.
- If OlaOla account credentials are configured and the user asks about previous purchases, fetch order history live instead of relying on stored memory.
- Do not diagnose or prescribe treatment.
- Flag medication/condition interactions and advise clinician/pharmacist review when relevant.
- Be explicit when confidence is low because labs or medication details are missing.
- Prefer "keep / consider / skip / ask clinician / test first" over absolute claims.
- For product retrieval, generate focused search queries yourself and use product candidate tools only after intake is sufficient.
- Product retrieval queries must be short and atomic. Use multiple one-topic queries such as "energie", "únava", "hořčík", "vitamin b12", "železo", not one long keyword string.
- Let the model do ranking and reasoning; do not assume OlaOla search order is medical relevance.
- Before comparing close candidates, explaining whether a multi-ingredient product has enough of a key ingredient, or judging value-for-money, fetch product details and check the actual composition and dosing text. Do not infer ingredient amounts from product names or marketing benefits.

If the user asks to move fast, ask only the critical blocker questions first:
- What supplements are you already taking, including dose?
- Are you taking any medications or do any of these apply: blood thinners, thyroid meds, antidepressants, antibiotics, pregnancy/breastfeeding, kidney/liver disease, planned surgery?
- What is your main goal and budget?`;
}
