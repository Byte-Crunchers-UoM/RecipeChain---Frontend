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

export const getChefProfile = async (chefId: string) => {
  // Gracefully handle demo user to prevent backend UUID parsing errors
  if (chefId === "demo-user-id") {
    return {
      seller: {
        display_name: "Demo Chef",
        full_name: "Gordon Ramsay (Demo)",
        address: "London, UK",
        bio: "This is a demonstration chef profile. I specialize in fine dining and teaching people how to cook simple, elegant meals.",
        followers_count: 1234,
        verify_badge_status: "verified"
      },
      socials: {
        facebook: "https://facebook.com",
        instagram: "https://instagram.com"
      }
    };
  }

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
  // Gracefully handle demo user to prevent backend UUID parsing errors
  if (chefId === "demo-user-id") {
    return [
      {
        id: "demo-recipe-1",
        title: "Demo Truffle Pasta",
        description: "A delicious demonstration recipe.",
        price: 15,
        rating: 4.8,
        prepTime: "30 mins",
        tags: { tag_id: "tag-1", dietary_tags: "Vegetarian" }
      },
      {
        id: "demo-recipe-2",
        title: "Classic Beef Wellington",
        description: "My signature dish.",
        price: 45,
        rating: 4.9,
        prepTime: "2 hrs",
        tags: { tag_id: "tag-2", dietary_tags: "High Protein" }
      }
    ];
  }

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
