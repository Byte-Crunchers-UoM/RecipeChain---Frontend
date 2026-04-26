'use client';

import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Recipe, Ingredient, Instruction } from '@/lib/types/recipe';
import { uploadToCloudinary } from '@/lib/cloudinary';

const formStyles = {
  fontFamily: "'Roboto', 'Arial', sans-serif",
};

interface ValidationErrors {
  [key: string]: string;
}

const FALLBACK_CHEF_ID = '65f1c2ab89d1e2f3a4b5c6d7';
const SUBMIT_STATUS: 'pending' | 'published' = 'pending';

const CUISINE_OPTIONS = ['Sri Lankan', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Mediterranean', 'American', 'Japanese'];
const DIETARY_TAGS_OPTIONS = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein'];
const MEAL_TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages', 'Appetizers'];
const GOAL_OPTIONS = ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Heart Healthy', 'Budget Friendly'];
const OCCASION_OPTIONS = ['Family Gathering', 'Party', 'Date Night', 'Meal Prep', 'Quick Weeknight', 'Holiday', 'Kids-Friendly'];

export default function AddRecipeForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Recipe>({
    chef_id: '', // Will be populated from localStorage
    title: '',
    description: '',
    category: '',
    cuisine: '',
    dietary_tags: '',
    goal: '',
    meal_type: '',
    occasion: '',
    image_url: '',
    difficulty_level: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    price: '',
    ingredients: [{ id: '1', name: '', quantity: '', unit: '' }],
    instructions: [{ id: '1', step: 1, description: '' }],
    chef_note: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [cuisineSearch, setCuisineSearch] = useState('');
  const [showCuisineDropdown, setShowCuisineDropdown] = useState(false);
  const cuisineRef = useRef<HTMLDivElement>(null);
  const [dietaryTagsSearch, setDietaryTagsSearch] = useState('');
  const [showDietaryTagsDropdown, setShowDietaryTagsDropdown] = useState(false);
  const dietaryTagsRef = useRef<HTMLDivElement>(null);
  const [mealTypeSearch, setMealTypeSearch] = useState('');
  const [showMealTypeDropdown, setShowMealTypeDropdown] = useState(false);
  const mealTypeRef = useRef<HTMLDivElement>(null);
  const [goalSearch, setGoalSearch] = useState('');
  const [showGoalDropdown, setShowGoalDropdown] = useState(false);
  const goalRef = useRef<HTMLDivElement>(null);
  const [occasionSearch, setOccasionSearch] = useState('');
  const [showOccasionDropdown, setShowOccasionDropdown] = useState(false);
  const occasionRef = useRef<HTMLDivElement>(null);

  const isValidObjectId = (value: string): boolean => /^[a-fA-F0-9]{24}$/.test(value);

  const getStoredChefId = (): string => {
    const directKeys = ['chef_id', 'chefId', 'user_id', 'userId', 'id'];

    for (const key of directKeys) {
      const value = localStorage.getItem(key);
      if (value && value.trim() && isValidObjectId(value.trim())) return value.trim();
    }

    const jsonKeys = ['user', 'currentUser', 'authUser'];
    for (const key of jsonKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const parsedChefId = parsed?.chef_id || parsed?.chefId || parsed?.user_id || parsed?.userId || parsed?.id || parsed?._id;
        if (typeof parsedChefId === 'string' && parsedChefId.trim() && isValidObjectId(parsedChefId.trim())) {
          return parsedChefId.trim();
        }
      } catch {
        // Ignore malformed JSON in storage
      }
    }

    return FALLBACK_CHEF_ID;
  };

  //Load chef_id from Local Storage on mount
  useEffect(() => {
    const savedId = getStoredChefId();
    if (savedId) {
      setFormData(prev => ({ ...prev, chef_id: savedId }));
    }
  }, []);

  // globally intercept wheel events on number inputs so we can block value changes
  useEffect(() => {
    const wheelHandler = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.tagName === 'INPUT' &&
        (target as HTMLInputElement).type === 'number'
      ) {
        // prevent default increments/decrements
        e.preventDefault();
        // manually scroll the document the same distance
        // this makes the wheel feel normal even though the input swallows the event
        if (window && typeof window.scrollBy === 'function') {
          window.scrollBy({ top: e.deltaY, left: 0 });
        }
      }
    };
    document.addEventListener('wheel', wheelHandler, { passive: false });
    return () => {
      document.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  // Close cuisine dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cuisineRef.current && !cuisineRef.current.contains(event.target as Node)) {
        setShowCuisineDropdown(false);
      }
      if (dietaryTagsRef.current && !dietaryTagsRef.current.contains(event.target as Node)) {
        setShowDietaryTagsDropdown(false);
      }
      if (mealTypeRef.current && !mealTypeRef.current.contains(event.target as Node)) {
        setShowMealTypeDropdown(false);
      }
      if (goalRef.current && !goalRef.current.contains(event.target as Node)) {
        setShowGoalDropdown(false);
      }
      if (occasionRef.current && !occasionRef.current.contains(event.target as Node)) {
        setShowOccasionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Validate form
 const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Title
    if (!formData.title || (typeof formData.title === 'string' && formData.title.trim().length === 0)) {
      errors.title = 'Recipe title is required';
    }

    // Description is optional, no validation needed

    // Numeric fields: allow editing as string, but validate before submit
    const getNum = (val: any) => {
      if (val === '' || val === null || typeof val === 'undefined') return NaN;
      const n = Number(val);
      return Number.isFinite(n) ? n : NaN;
    };

    const priceNum = getNum((formData as any).price);
    const prepNum = getNum((formData as any).prep_time);
    const cookNum = getNum((formData as any).cook_time);
    const servingsNum = getNum((formData as any).servings);

    if (isNaN(priceNum) || priceNum <= 0) errors.price = 'Price must be filled';
    if (isNaN(prepNum) || prepNum < 0) errors.prep_time = 'Prep time must be filled';
    if (isNaN(cookNum) || cookNum < 0) errors.cook_time = 'Cook time must be filled';
    if (isNaN(servingsNum) || servingsNum < 1) errors.servings = 'Servings must be filled';

    // Check ingredients (required)
    if (!Array.isArray(formData.ingredients) || formData.ingredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    } else {
      formData.ingredients.forEach((ing) => {
        if (!ing.name || (typeof ing.name === 'string' && ing.name.trim() === '')) {
          errors[`ingredient_${ing.id}_name`] = 'Ingredient name is required';
        }
        if (!ing.quantity || (typeof ing.quantity === 'string' && ing.quantity.trim() === '')) {
          errors[`ingredient_${ing.id}_quantity`] = 'quantity is required';
        }
        if (!ing.unit || (typeof ing.unit === 'string' && ing.unit.trim() === '')) {
          errors[`ingredient_${ing.id}_unit`] = 'unit is required';
        }
      });
    }

    // Check instructions (required)
    if (!Array.isArray(formData.instructions) || formData.instructions.length === 0) {
      errors.instructions = 'At least one instruction step is required';
    } else {
      formData.instructions.forEach((inst) => {
        if (!inst.description || (typeof inst.description === 'string' && inst.description.trim() === '')) {
          errors[`instruction_${inst.id}`] = 'Instruction step is required';
        }
      });
    }

    setValidationErrors(errors);



    // DEBUGGING: This will tell you exactly what is wrong in the F12 Console
    if (Object.keys(errors).length > 0) {
      console.warn("Frontend Validation Failed! Errors:", errors);
    }





    return Object.keys(errors).length === 0;
  };

  // Handle cuisine search
  const handleCuisineSearch = (value: string) => {
    setCuisineSearch(value);
    setShowCuisineDropdown(true);
    // Update formData with current search value for submission
    setFormData((prev: Recipe) => ({ ...prev, cuisine: value }));
  };

  const handleCuisineSelect = (cuisine: string) => {
    setFormData((prev: Recipe) => ({ ...prev, cuisine }));
    setCuisineSearch(cuisine);
    setShowCuisineDropdown(false);
  };

  const filteredCuisines = CUISINE_OPTIONS.filter((cui) =>
    cui.toLowerCase().includes(cuisineSearch.toLowerCase())
  );

  // Handle dietary tags search
  const handleDietaryTagsSearch = (value: string) => {
    setDietaryTagsSearch(value);
    setShowDietaryTagsDropdown(true);
    // Update formData with current search value for submission
    setFormData((prev: Recipe) => ({ ...prev, dietary_tags: value }));
  };

  const handleDietaryTagsSelect = (tag: string) => {
    setFormData((prev: Recipe) => ({ ...prev, dietary_tags: tag }));
    setDietaryTagsSearch(tag);
    setShowDietaryTagsDropdown(false);
  };

  const filteredDietaryTags = DIETARY_TAGS_OPTIONS.filter((tag) =>
    tag.toLowerCase().includes(dietaryTagsSearch.toLowerCase())
  );

  // Handle meal type search
  const handleMealTypeSearch = (value: string) => {
    setMealTypeSearch(value);
    setShowMealTypeDropdown(true);
    // Update formData with current search value for submission
    setFormData((prev: Recipe) => ({ ...prev, meal_type: value }));
  };

  const handleMealTypeSelect = (mealType: string) => {
    setFormData((prev: Recipe) => ({ ...prev, meal_type: mealType }));
    setMealTypeSearch(mealType);
    setShowMealTypeDropdown(false);
  };

  const filteredMealTypes = MEAL_TYPE_OPTIONS.filter((mealType) =>
    mealType.toLowerCase().includes(mealTypeSearch.toLowerCase())
  );

  // Handle goal search
  const handleGoalSearch = (value: string) => {
    setGoalSearch(value);
    setShowGoalDropdown(true);
    // Update formData with current search value for submission
    setFormData((prev: Recipe) => ({ ...prev, goal: value }));
  };

  const handleGoalSelect = (goal: string) => {
    setFormData((prev: Recipe) => ({ ...prev, goal }));
    setGoalSearch(goal);
    setShowGoalDropdown(false);
  };

  const filteredGoals = GOAL_OPTIONS.filter((goal) =>
    goal.toLowerCase().includes(goalSearch.toLowerCase())
  );

  // Handle occasion search
  const handleOccasionSearch = (value: string) => {
    setOccasionSearch(value);
    setShowOccasionDropdown(true);
    // Update formData with current search value for submission
    setFormData((prev: Recipe) => ({ ...prev, occasion: value }));
  };

  const handleOccasionSelect = (occasion: string) => {
    setFormData((prev: Recipe) => ({ ...prev, occasion }));
    setOccasionSearch(occasion);
    setShowOccasionDropdown(false);
  };

  const filteredOccasions = OCCASION_OPTIONS.filter((occasion) =>
    occasion.toLowerCase().includes(occasionSearch.toLowerCase())
  );

  // Handle image file selection
  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image size must be less than 5MB');
      return;
    }

    // Show preview immediately
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImageFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setError('');

    // Upload to Cloudinary
    setIsUploadingImage(true);
    const cloudinaryUrl = await uploadToCloudinary(file);
    setIsUploadingImage(false);

    if (cloudinaryUrl) {
      // Update formData with Cloudinary URL
      setFormData((prev: Recipe) => ({ ...prev, image_url: cloudinaryUrl }));
    } else {
      setError('Failed to upload image. Please try again.');
    }
  };

  // Handle basic input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['prep_time', 'cook_time', 'servings', 'price'];
    setFormData((prev: Recipe) => ({
      ...prev,
      [name]: numericFields.includes(name) ? value : value,
    }));
    // Clear error for this field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handle ingredient changes
  const handleIngredientChange = (
    id: string,
    field: keyof Ingredient,
    value: string
  ) => {
    setFormData((prev: Recipe) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing: Ingredient) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ),
    }));
    // Clear per-field validation error for this ingredient field
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`ingredient_${id}_${field}`];
      return newErrors;
    });
  };

  // Add new ingredient
  const addIngredient = () => {
    const newId = Date.now().toString();
    setFormData((prev: Recipe) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: newId, name: '', quantity: '', unit: '' },
      ],
    }));
  };

  // Remove ingredient
  const removeIngredient = (id: string) => {
    setFormData((prev: Recipe) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing: Ingredient) => ing.id !== id),
    }));
  };

  // Handle instruction changes
  const handleInstructionChange = (id: string, value: string) => {
    setFormData((prev: Recipe) => ({
      ...prev,
      instructions: prev.instructions.map((inst: Instruction) =>
        inst.id === id ? { ...inst, description: value } : inst
      ),
    }));
    // Clear per-step validation error for this instruction
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`instruction_${id}`];
      return newErrors;
    });
  };

  // Add new instruction
  const addInstruction = () => {
    const newId = Date.now().toString();
    const step = formData.instructions.length + 1;
    setFormData((prev: Recipe) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        { id: newId, step, description: '' },
      ],
    }));
  };

  // Remove instruction
  const removeInstruction = (id: string) => {
    setFormData((prev: Recipe) => {
      const filtered = prev.instructions.filter((inst: Instruction) => inst.id !== id);
      return {
        ...prev,
        instructions: filtered.map((inst: Instruction, index: number) => ({
          ...inst,
          step: index + 1,
        })),
      };
    });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const rawChefId = formData.chef_id || getStoredChefId() || FALLBACK_CHEF_ID;
      const chefId = isValidObjectId(rawChefId) ? rawChefId : FALLBACK_CHEF_ID;

      const normalizedIngredients = formData.ingredients
        .map((ingredient) => ({
          id: ingredient.id,
          name: ingredient.name.trim(),
          quantity: ingredient.quantity.trim(),
          unit: ingredient.unit.trim(),
        }));

      const normalizedInstructions = formData.instructions
        .map((instruction, index) => ({
          id: instruction.id,
          step: index + 1,
          description: instruction.description.trim(),
        }));

      const dietaryTagsValue = (formData as any).dietary_tags?.trim() || 'vegetarian';
      const dietaryTagsArray = dietaryTagsValue
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);

      const ingredientLines = normalizedIngredients.map((ingredient) =>
        `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`.trim()
      );

      const instructionLines = normalizedInstructions.map((instruction) => instruction.description);

      const recipePayload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        cuisine: formData.cuisine?.trim() || '',
        meal_type: (formData as any).meal_type?.trim() || '',
        goal: (formData as any).goal?.trim() || '',
        occasion: (formData as any).occasion?.trim() || '',
        difficulty_level: formData.difficulty_level || '',
        prep_time: Number((formData as any).prep_time) || 0,
        cook_time: Number((formData as any).cook_time) || 0,
        servings: Number((formData as any).servings) || 1,
        price: Number((formData as any).price) || 0,
        ingredients: ingredientLines,
        instructions: instructionLines,
        chef_note: formData.chef_note,
        image_url: formData.image_url || '', // Include Cloudinary image URL
        tags: {
          dietary_tags: dietaryTagsArray,
          goal: (formData as any).goal?.trim() || '',
          meal_type: (formData as any).meal_type?.trim() || '',
          occasion: (formData as any).occasion?.trim() || '',
          cuisine: formData.cuisine?.trim() || '',
        },
        dietary_tags: dietaryTagsArray,
        chef_id: chefId,
        status: SUBMIT_STATUS,
      };

      console.log('Submitting recipe with payload:', recipePayload);

      // Always send as JSON. The backend has no multipart parser (multer),
      // so sending FormData leaves req.body undefined and breaks validators.
      // Wire up image upload once multer is added on the backend.
      const response = await fetch('http://localhost:4000/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipePayload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create recipe';
        try {
          const errorData = await response.json();
          const detailItems: string[] = [];

          if (Array.isArray(errorData?.missingFields)) {
            detailItems.push(...errorData.missingFields);
          }

          if (Array.isArray(errorData?.errors)) {
            detailItems.push(...errorData.errors);
          }

          if (Array.isArray(errorData?.error)) {
            detailItems.push(...errorData.error);
          } else if (typeof errorData?.error === 'string') {
            detailItems.push(errorData.error);
          }

          errorMessage = errorData?.message || errorMessage;
          if (detailItems.length > 0) {
            errorMessage = `${errorMessage}: ${detailItems.join(', ')}`;
          }
        } catch {
          // Keep default error message when body is not JSON
        }

        throw new Error(errorMessage);
      }

      router.push('/recipes/submitted');
      return;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getFieldBorderColor = (fieldName: string): string => {
    return validationErrors[fieldName] ? '#ef4444' : '#cbd5e1';
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6" style={{ backgroundColor: '#f8fafb', ...formStyles }}>
      <h1 className="mb-8 text-center" style={{ color: '#1a2632', fontSize: '24px', fontWeight: 'bold' }}>Add New Recipe</h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
          {error}
        </div>
      )}

      {/* Basic Info Section */}
      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Recipe Information</h2>

        {/* Title - Required */}
        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Recipe Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
            <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{ borderColor: getFieldBorderColor('title'), color: '#1a2632' }}
            onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
            placeholder="Enter recipe title"
            
          />
          {validationErrors.title && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.title}</p>
          )}
        </div>

        {/* Tags (saved separately) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div style={{ position: 'relative' }} ref={cuisineRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Cuisine
            </label>
            <input
              type="text"
              value={cuisineSearch}
              onChange={(e) => handleCuisineSearch(e.target.value)}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.outlineColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                setShowCuisineDropdown(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
                setShowCuisineDropdown(false);
              }}
              className="no-autofill w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition"
              style={{ borderColor: '#cbd5e1', color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type cuisine name..."
            />
            {showCuisineDropdown && filteredCuisines.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '-1px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {filteredCuisines.map((cuisine) => (
                  <div
                    key={cuisine}
                    onMouseDown={(e) => { e.preventDefault(); handleCuisineSelect(cuisine); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: cuisineSearch === cuisine ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = cuisineSearch === cuisine ? '#e0f2fe' : '#ffffff'; }}
                  >
                    {cuisine}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={dietaryTagsRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Dietary Tags
            </label>
            <input
              type="text"
              value={dietaryTagsSearch}
              onChange={(e) => handleDietaryTagsSearch(e.target.value)}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.outlineColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                setShowDietaryTagsDropdown(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
                setShowDietaryTagsDropdown(false);
              }}
              className="no-autofill w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition"
              style={{ borderColor: '#cbd5e1', color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type dietary tag..."
            />
            {showDietaryTagsDropdown && filteredDietaryTags.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '-1px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {filteredDietaryTags.map((tag) => (
                  <div
                    key={tag}
                    onMouseDown={(e) => { e.preventDefault(); handleDietaryTagsSelect(tag); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: dietaryTagsSearch === tag ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = dietaryTagsSearch === tag ? '#e0f2fe' : '#ffffff'; }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={mealTypeRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Meal Type
            </label>
            <input
              type="text"
              value={mealTypeSearch}
              onChange={(e) => handleMealTypeSearch(e.target.value)}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.outlineColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                setShowMealTypeDropdown(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
                setShowMealTypeDropdown(false);
              }}
              className="no-autofill w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition"
              style={{ borderColor: '#cbd5e1', color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type meal type..."
            />
            {showMealTypeDropdown && filteredMealTypes.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '-1px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {filteredMealTypes.map((mealType) => (
                  <div
                    key={mealType}
                    onMouseDown={(e) => { e.preventDefault(); handleMealTypeSelect(mealType); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: mealTypeSearch === mealType ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = mealTypeSearch === mealType ? '#e0f2fe' : '#ffffff'; }}
                  >
                    {mealType}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div style={{ position: 'relative' }} ref={goalRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Goal
            </label>
            <input
              type="text"
              value={goalSearch}
              onChange={(e) => handleGoalSearch(e.target.value)}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.outlineColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                setShowGoalDropdown(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
                setShowGoalDropdown(false);
              }}
              className="no-autofill w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition"
              style={{ borderColor: '#cbd5e1', color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type goal..."
            />
            {showGoalDropdown && filteredGoals.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '-1px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {filteredGoals.map((goal) => (
                  <div
                    key={goal}
                    onMouseDown={(e) => { e.preventDefault(); handleGoalSelect(goal); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: goalSearch === goal ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = goalSearch === goal ? '#e0f2fe' : '#ffffff'; }}
                  >
                    {goal}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }} ref={occasionRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Occasion
            </label>
            <input
              type="text"
              value={occasionSearch}
              onChange={(e) => handleOccasionSearch(e.target.value)}
              onFocus={(e) => { 
                e.currentTarget.style.borderColor = '#0d9488';
                e.currentTarget.style.outlineColor = '#0d9488';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
                setShowOccasionDropdown(true);
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.boxShadow = 'none';
                setShowOccasionDropdown(false);
              }}
              className="no-autofill w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition"
              style={{ borderColor: '#cbd5e1', color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type occasion..."
            />
            {showOccasionDropdown && filteredOccasions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderTop: 'none',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 10,
                  marginTop: '-1px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                {filteredOccasions.map((occasion) => (
                  <div
                    key={occasion}
                    onMouseDown={(e) => { e.preventDefault(); handleOccasionSelect(occasion); }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      backgroundColor: occasionSearch === occasion ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = occasionSearch === occasion ? '#e0f2fe' : '#ffffff'; }}
                  >
                    {occasion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{ borderColor: getFieldBorderColor('description'), color: '#1a2632' }}
            onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
            placeholder="Describe your recipe"
          />
          {validationErrors.description && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.description}</p>
          )}
        </div>

        {/* Recipe Image Upload */}
        <div className="mb-4">
          <label className="block mb-2" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Recipe Image
          </label>

          {/* Drop zone */}
          <div
            className="w-full rounded-lg flex flex-col items-center justify-center py-10 px-6 transition"
            style={{
              border: '2px dashed #cbd5e1',
              backgroundColor: '#f8fafb',
              minHeight: '180px',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file || !file.type.startsWith('image/')) {
                setError('Please drop a valid image file');
                return;
              }
              if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
              }

              // Show preview immediately
              if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
              setImageFile(file);
              setImageFileName(file.name);
              setImagePreview(URL.createObjectURL(file));
              setError('');

              // Upload to Cloudinary
              setIsUploadingImage(true);
              const cloudinaryUrl = await uploadToCloudinary(file);
              setIsUploadingImage(false);

              if (cloudinaryUrl) {
                setFormData((prev: Recipe) => ({ ...prev, image_url: cloudinaryUrl }));
              } else {
                setError('Failed to upload image. Please try again.');
              }
            }}
          >
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Recipe preview"
                  className="rounded-lg object-cover border"
                  style={{ maxWidth: '240px', maxHeight: '150px', borderColor: '#e2e8f0' }}
                />
                {isUploadingImage && (
                  <div
                    className="absolute inset-0 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    <div style={{ color: '#ffffff', fontSize: '12px', fontWeight: '500' }}>
                      Uploading...
                    </div>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
                    setImagePreview(null);
                    setImageFileName('');
                    setImageFile(null);
                    setFormData((prev: Recipe) => ({ ...prev, image_url: '' }));
                  }}
                  disabled={isUploadingImage}
                  className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-white text-xs"
                  style={{ backgroundColor: '#ef4444', opacity: isUploadingImage ? 0.5 : 1, cursor: isUploadingImage ? 'not-allowed' : 'pointer' }}
                  title="Remove image"
                >
                  ✕
                </button>
                <p className="mt-2 text-center" style={{ color: '#64748b', fontSize: '11px' }}>{imageFileName}</p>
                {formData.image_url && !isUploadingImage && (
                  <p className="mt-1 text-center" style={{ color: '#16a34a', fontSize: '10px', fontWeight: '500' }}>✓ Uploaded to Cloudinary</p>
                )}
              </div>
            ) : (
              <>
                {/* Image placeholder icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="mb-3" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.4}>
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 15-5-5L5 21" />
                </svg>
                <p style={{ color: '#1a2632', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  Drop your image here, or browse
                </p>
                <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '16px' }}>
                  Supports: JPG, PNG (max 5MB)
                </p>

                {/* Choose File button */}
                <label
                  className="flex items-center gap-2 px-5 py-2 rounded-lg cursor-pointer transition hover:opacity-90"
                  style={{ backgroundColor: '#e0f2f1', color: '#0d9488', fontSize: '13px', fontWeight: '500' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0-4 4m4-4 4 4M4 20h16" />
                  </svg>
                  Choose File
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Difficulty Level */}
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Difficulty Level
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Price - Required */}
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Price ($) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="price"
              value={(formData as any).price || ''}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: getFieldBorderColor('price'), color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              onWheel={(e) => e.preventDefault()}
              placeholder="0.00"
            />
            {validationErrors.price && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.price}</p>
            )}
          </div>
        </div>
      </div>

      {/* Time & Servings Section */}
      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Cooking Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prep Time - Required */}
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Prep Time (min) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="prep_time"
              value={(formData as any).prep_time || ''}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: getFieldBorderColor('prep_time'), color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              onWheel={(e) => e.preventDefault()}
            />
            {validationErrors.prep_time && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.prep_time}</p>
            )}
          </div>

          {/* Cook Time - Required */}
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Cook Time (min) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="cook_time"
              value={(formData as any).cook_time || ''}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: getFieldBorderColor('cook_time'), color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              onWheel={(e) => e.preventDefault()}
            />
            {validationErrors.cook_time && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.cook_time}</p>
            )}
          </div>

          {/* Servings - Required */}
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Servings <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="servings"
              value={(formData as any).servings || ''}
              onChange={handleInputChange}
              min="1"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: getFieldBorderColor('servings'), color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              onWheel={(e) => e.preventDefault()}
            />
            {validationErrors.servings && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.servings}</p>
            )}
          </div>
        </div>
      </div>

      {/* Ingredients Section - Required */}
      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Ingredients <span style={{ color: '#ef4444' }}>*</span></h2>
        {validationErrors.ingredients && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{validationErrors.ingredients}</p>
        )}

        {formData.ingredients.map((ingredient, index) => (
          <div key={ingredient.id} className="mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#e2e8f0' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <div>
                <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
                  Ingredient Name
                </label>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) =>
                    handleIngredientChange(ingredient.id, 'name', e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ borderColor: getFieldBorderColor(`ingredient_${ingredient.id}_name`), color: '#1a2632' }}
                  onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
                  placeholder="e.g., Flour"
                />
                {validationErrors[`ingredient_${ingredient.id}_name`] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors[`ingredient_${ingredient.id}_name`]}</p>
                )}
              </div>

              <div>
                <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
                  Quantity
                </label>
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    handleIngredientChange(ingredient.id, 'quantity', e.target.value)
                  }
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ borderColor: getFieldBorderColor(`ingredient_${ingredient.id}_quantity`), color: '#1a2632' }}
                  onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
                  placeholder="e.g., 2"
                />
                {validationErrors[`ingredient_${ingredient.id}_quantity`] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors[`ingredient_${ingredient.id}_quantity`]}</p>
                )}
              </div>

              <div className="flex gap-2 items-start"> {/* items-start prevents vertical jumping */}
  <div className="flex-1">
    <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
      Unit
    </label>
    <input
      type="text"
      value={ingredient.unit}
      onChange={(e) => handleIngredientChange(ingredient.id, 'unit', e.target.value)}
      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
      style={{ borderColor: getFieldBorderColor(`ingredient_${ingredient.id}_unit`), color: '#1a2632' }}
      placeholder="e.g., cups"
    />
    {/* Wrap the error message so it stays in the column flow */}
    {validationErrors[`ingredient_${ingredient.id}_unit`] && (
      <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
        {validationErrors[`ingredient_${ingredient.id}_unit`]}
      </p>
    )}
  </div>

  {/* Move the button outside the input div and add margin-top to align with the input box */}
  {formData.ingredients.length > 1 && (
    <button
      type="button"
      onClick={() => removeIngredient(ingredient.id)}
      className="mt-6 px-3 py-2 rounded-lg hover:bg-red-50" 
      style={{ color: '#ef4444' }}
    >
      ✕
    </button>
  )}
</div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addIngredient}
          className="mt-4 px-4 py-2 border rounded-lg hover:bg-blue-50"
          style={{ borderColor: '#0d9488', color: '#0d9488' }}
        >
          + Add Ingredient
        </button>
      </div>

      {/* Instructions Section - Required */}
      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Instructions <span style={{ color: '#ef4444' }}>*</span></h2>
        {validationErrors.instructions && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{validationErrors.instructions}</p>
        )}

        {formData.instructions.map((instruction) => (
          <div key={instruction.id} className="mb-4 pb-4 border-b last:border-b-0" style={{ borderColor: '#e2e8f0' }}>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full font-semibold" style={{ backgroundColor: '#e0f2f1', color: '#0d9488' }}>
                  {instruction.step}
                </div>
              </div>

              <div className="flex-1">
                <textarea
                  value={instruction.description}
                  onChange={(e) =>
                    handleInstructionChange(instruction.id, e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ borderColor: getFieldBorderColor(`instruction_${instruction.id}`), color: '#1a2632' }}
                  onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
                  placeholder="Enter instruction step"
                />
                {validationErrors[`instruction_${instruction.id}`] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors[`instruction_${instruction.id}`]}</p>
                )}
              </div>

              {formData.instructions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(instruction.id)}
                  className="flex-shrink-0 px-3 py-2 rounded-lg hover:bg-red-50"
                  style={{ color: '#ef4444' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addInstruction}
          className="mt-4 px-4 py-2 border rounded-lg hover:bg-blue-50"
          style={{ borderColor: '#0d9488', color: '#0d9488' }}
        >
          + Add Step
        </button>
      </div>

      {/* Chef Note Section */}
      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Chef's Note</h2>

        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Additional Tips & Notes
          </label>
          <textarea
            name="chef_note"
            value={formData.chef_note}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
            onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
            placeholder="Share any special tips or notes about this recipe..."
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('recipeDraft', JSON.stringify(formData));
            alert('Recipe draft saved!');
          }}
          className="px-6 py-2 border rounded-lg hover:bg-gray-50"
          style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
        >
          Save Draft
        </button>

        <button
          type="submit"
          disabled={loading || isUploadingImage}
          className="px-6 py-2 text-white rounded-lg disabled:bg-gray-400"
          style={{ backgroundColor: loading || isUploadingImage ? '#64748b' : '#0d9488' }}
        >
          {loading ? 'Submitting...' : isUploadingImage ? 'Uploading Image...' : 'Submit Recipe'}
        </button>
      </div>
    </form>
  );
}
