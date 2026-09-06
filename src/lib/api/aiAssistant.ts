export type AIChatRole = "user" | "assistant";

export type AIChatMessage = {
  role: AIChatRole;
  content: string;
};

type ApiMessageResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  reply?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as ApiMessageResponse | null;

    throw new Error(
      errorData?.message ||
        errorData?.error ||
        "AI assistant request failed"
    );
  }

  return data as T;
}

export async function askAIShoppingAssistant(payload: {
  prompt: string;
  messages?: AIChatMessage[];
}): Promise<string> {
  const response = await fetch(`${API_URL}/ai/shopping-assistant`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      prompt: payload.prompt,
      messages: payload.messages || [],
    }),
  });

  const data = await parseJson<ApiMessageResponse>(response);

  if (!data.reply) {
    throw new Error("AI assistant did not return a reply");
  }

  return data.reply;
}