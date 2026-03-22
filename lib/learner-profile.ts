import { prisma } from "@/lib/db";
import { anthropic, FAST_MODEL } from "@/lib/claude";

const DEFAULT_USER_ID = "default-user";

export async function getLearnerProfile(): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  return user?.learnerProfile || "";
}

// After a conversation ends, ask Claude to extract key observations
// and merge them into the existing profile
export async function updateLearnerProfile(
  conversationMessages: Array<{ role: string; content: string }>
): Promise<void> {
  if (conversationMessages.length < 4) return; // Too short to learn from

  const currentProfile = await getLearnerProfile();

  const conversationText = conversationMessages
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  try {
    const response = await anthropic.messages.create({
      model: FAST_MODEL,
      max_tokens: 500,
      system: `You maintain a concise learner profile for a French student. The profile tracks:
- Common grammar mistakes they make (patterns, not one-offs)
- Topics/vocabulary they're strong in
- Topics/vocabulary they struggle with
- Their apparent interests (what they like talking about)
- Their confidence level and communication style
- Any personal details they've shared (name, job, hobbies, etc.)

Keep the profile concise — bullet points, max 15 lines. Merge new observations with existing ones. Remove duplicates. If a previous weakness seems resolved, note the improvement. This profile will be injected into future conversation prompts so Claude can personalize the experience.

Return ONLY the updated profile text, no preamble or explanation.`,
      messages: [
        {
          role: "user",
          content: `CURRENT PROFILE:\n${currentProfile || "(empty — first conversation)"}\n\nNEW CONVERSATION:\n${conversationText}\n\nReturn the updated learner profile.`,
        },
      ],
    });

    const newProfile =
      response.content[0].type === "text" ? response.content[0].text : "";

    if (newProfile.trim()) {
      await prisma.user.update({
        where: { id: DEFAULT_USER_ID },
        data: { learnerProfile: newProfile.trim() },
      });
    }
  } catch (error) {
    // Profile update is non-critical — don't break the app if it fails
    console.error("Failed to update learner profile:", error);
  }
}
