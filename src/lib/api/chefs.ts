const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export const getChefProfile = async (chefId: string) => {
  try {
    const response = await fetch(`${API_URL}/user/chef/${chefId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch chef profile");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching chef profile:", error);
    throw error;
  }
};

export const getChefRecipes = async (chefId: string) => {
  try {
    const response = await fetch(`${API_URL}/recipes/chef/${chefId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch recipes");
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error fetching chef recipes:", error);
    throw error;
  }
};
