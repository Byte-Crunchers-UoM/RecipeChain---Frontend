const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const followChef = async (chefId: string | number, buyerId: string | number) => {
  try {
    const response = await fetch(`${API_URL}/user/${chefId}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ buyerId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to follow chef");
    }

    return await response.json();
  } catch (error) {
    console.error("Error following chef:", error);
    throw error;
  }
};
