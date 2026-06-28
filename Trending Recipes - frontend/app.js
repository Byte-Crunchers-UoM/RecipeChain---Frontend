const API_BASE_URL = 'http://localhost:4000/api/recipes';
const recipeGrid = document.getElementById('recipe-grid');
const recipeCount = document.getElementById('recipe-count');
const categoryTabs = document.getElementById('category-tabs');

let allRecipes = [];

// Fetch recipes from API
async function fetchTrendingRecipes(category = null) {
    try {
        recipeGrid.innerHTML = '<div class="loader">Loading trending recipes...</div>';
        
        let url = `${API_BASE_URL}/trending?limit=20`;
        if (category && category !== 'all') {
            url += `&category=${category}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            allRecipes = data.recipes;
            renderRecipes(allRecipes);
        } else {
            recipeGrid.innerHTML = `<div class="loader">Error: ${data.message}</div>`;
        }
    } catch (error) {
        console.error('Fetch error:', error);
        recipeGrid.innerHTML = '<div class="loader">Failed to connect to the backend. Make sure the server is running on port 4000.</div>';
    }
}

// Render recipe cards
function renderRecipes(recipes) {
    if (!recipes || recipes.length === 0) {
        recipeGrid.innerHTML = '<div class="loader">No trending recipes found for this category.</div>';
        recipeCount.textContent = '0 recipes';
        return;
    }

    recipeCount.textContent = `${recipes.length} recipes`;
    recipeGrid.innerHTML = '';

    recipes.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        
        // Handle difficulty class
        const difficultyClass = (recipe.difficulty_level || 'Medium').toLowerCase();
        
        // Handle average rating
        const rating = (recipe.average_rating || recipe.rating || 0).toFixed(1);
        
        // Handle reviews count
        const reviewsCount = recipe.rating_count || 0;

        // Handle purchase count
        const purchaseCount = recipe.purchase_count || 0;

        card.innerHTML = `
            <div class="card-image-container">
                <img src="${recipe.image_url || 'https://via.placeholder.com/400x300?text=Recipe+Image'}" alt="${recipe.title}" class="recipe-image">
                <span class="badge ${difficultyClass}">${recipe.difficulty_level || 'Medium'}</span>
                <div class="rating-badge">
                    <i data-lucide="star" style="width:14px; height:14px; fill:#fbbf24;"></i>
                    <span>${rating}</span>
                </div>
            </div>
            <div class="card-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="chef-info">
                    <i data-lucide="chef-hat" style="width:16px; height:16px;"></i>
                    <span>${recipe.chef_name || 'Chef'}</span>
                    <span class="reviews-count">• ${reviewsCount} reviews</span>
                </div>
                <div class="card-footer">
                    <div class="meta-info">
                        <div class="meta-item">
                            <i data-lucide="clock" style="width:16px; height:16px;"></i>
                            <span>${recipe.cook_time || '30'} mins</span>
                        </div>
                        <div class="meta-item">
                            <i data-lucide="users" style="width:16px; height:16px;"></i>
                            <span>${purchaseCount} buys</span>
                        </div>
                    </div>
                    <a href="#" class="view-recipe">
                        View
                        <i data-lucide="arrow-right" style="width:16px; height:16px;"></i>
                    </a>
                </div>
            </div>
        `;
        recipeGrid.appendChild(card);
    });

    // Re-initialize Lucide icons for new elements
    lucide.createIcons();
}

// Category filter handling
categoryTabs.addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
        // Update UI
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        // Fetch new data
        const category = e.target.getAttribute('data-category');
        fetchTrendingRecipes(category);
    }
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    fetchTrendingRecipes();
});
