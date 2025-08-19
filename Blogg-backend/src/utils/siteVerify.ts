// Define the expected Turnstile response type
interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export const siteverify = async (
  formData: FormData
): Promise<TurnstileResponse> => {
  const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const result = await fetch(url, {
    body: formData,
    method: "POST",
  });

  if (!result.ok) {
    throw new Error(`Turnstile verification failed: ${result.status}`);
  }

  return result.json() as Promise<TurnstileResponse>;
};
