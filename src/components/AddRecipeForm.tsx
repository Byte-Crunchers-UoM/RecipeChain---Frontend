'use client';

import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Recipe, Ingredient,Instructions } from '@/lib/types/recipe';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';


const formStyles = {
  fontFamily: "'Roboto', 'Arial', sans-serif",
};

interface ValidationErrors {
  [key: string]: string;
}

const CUISINE_OPTIONS = ['Sri Lankan', 'Italian', 'Chinese', 'Mexican', 'Indian', 'Thai', 'Mediterranean', 'American', 'Japanese'];
const DIETARY_TAGS_OPTIONS = ['Vegan', 'Vegetarian', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein'];
const MEAL_TYPE_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts', 'Beverages', 'Appetizers'];
const GOAL_OPTIONS = ['Weight Loss', 'Weight Gain', 'Muscle Building', 'Heart Healthy', 'Budget Friendly'];
const OCCASION_OPTIONS = ['Family Gathering', 'Party', 'Date Night', 'Meal Prep', 'Quick Weeknight', 'Holiday', 'Kids-Friendly'];

export default function AddRecipeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recipeId = searchParams.get('id');

  const { user } = useAuth();
  
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  type FormRecipeData = Omit<Recipe, 'recipe_id' | 'sellers' | 'rating' | 'rating_avg' | 'reviews_count'>;
  
  const [formData, setFormData] = useState<FormRecipeData>({
    chef_id: '',
    title: '',
    description: '',
    cuisine: '',
    dietary_tags: '',
    goal: '',
    meal_type: '',
    occasion: '',
    image_url: '',
    difficulty_level: '',
    category: '',
    prep_time: 0,
    cook_time: 0,
    servings: 0,
    price: 0,
    ingredients: [{ id: '1', name: '', quantity: '', unit: '' }],
    instructions: [{ id: '1', step: 1, description: '' }],
    chef_note: ''
  });

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

 useEffect(() => {
  if (recipeId) {
    async function fetchDraftRecipe() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('recipes')
          .select(`
            *,
            tags (
              cuisine,
              dietary_tags,
              goal,
              meal_type,
              occasion
            )
          `)
          .eq('recipe_id', recipeId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          let parsedIngredients = data.ingredients;
          
          if (Array.isArray(parsedIngredients) && parsedIngredients.length > 0) {
            parsedIngredients = parsedIngredients.map((ing: any, index: number) => ({
              id: ing.id || Date.now().toString() + index + Math.random(),
              name: String(ing.name || (typeof ing === 'string' ? ing : '')).replace(/[\[\]"]/g, ''),
              quantity: String(ing.quantity || '').replace(/[\[\]"]/g, ''),
              unit: String(ing.unit || '').replace(/[\[\]"]/g, '')
            }));
          } else {
            
            parsedIngredients = [{ id: Date.now().toString(), name: '', quantity: '', unit: '' }];
          }

          // --- INSTRUCTIONS PARSING ---
          let parsedInstructions = data.instructions;
          
          if (Array.isArray(parsedInstructions) && parsedInstructions.length > 0) {
            parsedInstructions = parsedInstructions.map((desc: any, index: number) => ({
              id: Date.now().toString() + index + Math.random(),
              step: index + 1,
              description: String(desc.description || (typeof desc === 'string' ? desc : '')).replace(/[\[\]"]/g, '')
            }));
          } else {
           
            parsedInstructions = [{ id: Date.now().toString(), step: 1, description: '' }];
          }

          const tagRecord = Array.isArray(data.tags) ? data.tags[0] : data.tags;
          const cleanVal = (val: any) => {
            if (!val) return '';
            if (Array.isArray(val)) return val.join(', ').replace(/[\[\]"]/g, '');
            return String(val).replace(/[\[\]"]/g, '');
          };

          setFormData({
            chef_id: data.chef_id || '',
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            cuisine: tagRecord?.cuisine || data.cuisine || '',
            dietary_tags: cleanVal(tagRecord?.dietary_tags),
            goal: cleanVal(tagRecord?.goal || data.goal),
            meal_type: cleanVal(tagRecord?.meal_type || data.meal_type),
            occasion: cleanVal(tagRecord?.occasion || data.occasion),
            image_url: data.image_url || '',
            difficulty_level: data.difficulty_level || '',
            prep_time: data.prep_time !== null ? Number(data.prep_time) : 0,
            cook_time: data.cook_time !== null ? Number(data.cook_time) : 0,
            servings: data.servings !== null ? Number(data.servings) : 0,
            price: data.price !== null ? Number(data.price) : 0,
            ingredients: parsedIngredients,
            instructions: parsedInstructions,
            chef_note: data.chef_note || '',
          });

          if (data.image_url) {
            setImagePreview(data.image_url);
          }
        }
      } catch (err: any) {
        console.error('Error fetching draft recipe:', err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchDraftRecipe();
  }
}, [recipeId]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        e.preventDefault();
      }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    if (user?.user_id) {
      setFormData(prev => ({ 
        ...prev, 
        chef_id: user.user_id 
      }));
    }
  }, [user]); 

  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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

  const getStoredChefId = (): string => {
    if (user?.user_id) {
      return user.user_id;
    }

    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        const chefId = parsed?.user_id || parsed?.id || parsed?.chef_id;
        if (chefId) return chefId;
      } catch (e) {
        console.error("Error parsing local storage user", e);
      }
    }

    return '';
  };

  useEffect(() => {
    const savedId = getStoredChefId();
    setFormData(prev => ({ ...prev, chef_id: savedId }));
  }, [user]); 

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

  // Auto-save form data to localStorage
        useEffect(() => {
          const formDataToSave = {
            ...formData,
            ingredients: formData.ingredients,
            instructions: formData.instructions,
          };
          localStorage.setItem('recipeDraftForm', JSON.stringify(formDataToSave));
        }, [formData]);

        // Load form data from localStorage on mount
        useEffect(() => {
          const savedFormData = localStorage.getItem('recipeDraftForm');
          if (savedFormData) {
            try {
              const parsedData = JSON.parse(savedFormData);
              setFormData(parsedData);
            } catch (e) {
              console.error('Error parsing saved form data:', e);
            }
          }
        }, []); // Only run on mount

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.title || (typeof formData.title === 'string' && formData.title.trim().length === 0)) {
      errors.title = 'Recipe title is required';
    }

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
      });
    }

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

    return Object.keys(errors).length === 0;
  };

  const handleCuisineSearch = (value: string) => {
    setCuisineSearch(value);
    setShowCuisineDropdown(true);
    setFormData((prev: FormRecipeData) => ({ ...prev, cuisine: value }));
  };

  const handleCuisineSelect = (cuisine: string) => {
    setFormData((prev: FormRecipeData) => ({ ...prev, cuisine }));
    setCuisineSearch(cuisine);
    setShowCuisineDropdown(false);
  };

  const filteredCuisines = CUISINE_OPTIONS.filter((cui) =>
    cui.toLowerCase().includes(cuisineSearch.toLowerCase())
  );

  const handleDietaryTagsSearch = (value: string) => {
    setDietaryTagsSearch(value);
    setShowDietaryTagsDropdown(true);
    setFormData((prev: FormRecipeData) => ({ ...prev, dietary_tags: value }));
  };

  const handleDietaryTagsSelect = (tag: string) => {
    setFormData((prev: FormRecipeData) => ({ ...prev, dietary_tags: tag }));
    setDietaryTagsSearch(tag);
    setShowDietaryTagsDropdown(false);
  };

  const filteredDietaryTags = DIETARY_TAGS_OPTIONS.filter((tag) =>
    tag.toLowerCase().includes(dietaryTagsSearch.toLowerCase())
  );

  const handleMealTypeSelect = (mealType: string) => {
    const currentMealTypes = formData.meal_type ? formData.meal_type.split(',').map((m) => m.trim()) : [];
    let updatedMealTypes: string[];

    if (currentMealTypes.includes(mealType)) {
      updatedMealTypes = currentMealTypes.filter((m) => m !== mealType);
    } else {
      updatedMealTypes = [...currentMealTypes, mealType];
    }

    setFormData((prev: FormRecipeData) => ({ ...prev, meal_type: updatedMealTypes.join(', ') }));
    setMealTypeSearch('');
  };

  const removeMealType = (typeToRemove: string) => {
    const currentMealTypes = formData.meal_type ? formData.meal_type.split(',').map((m) => m.trim()) : [];
    const updatedMealTypes = currentMealTypes.filter((m) => m !== typeToRemove);
    setFormData((prev: FormRecipeData) => ({ ...prev, meal_type: updatedMealTypes.join(', ') }));
  };

  const filteredMealTypes = MEAL_TYPE_OPTIONS.filter((mealType) =>
    mealType.toLowerCase().includes(mealTypeSearch.toLowerCase())
  );

  const handleGoalSearch = (value: string) => {
    setGoalSearch(value);
    setShowGoalDropdown(true);
    setFormData((prev: FormRecipeData) => ({ ...prev, goal: value }));
  };

  const handleGoalSelect = (goal: string) => {
    setFormData((prev: FormRecipeData) => ({ ...prev, goal }));
    setGoalSearch(goal);
    setShowGoalDropdown(false);
  };

  const filteredGoals = GOAL_OPTIONS.filter((goal) =>
    goal.toLowerCase().includes(goalSearch.toLowerCase())
  );

  const handleOccasionSelect = (occasion: string) => {
    const currentOccasions = formData.occasion ? formData.occasion.split(',').map((o) => o.trim()) : [];
    let updatedOccasions: string[];

    if (currentOccasions.includes(occasion)) {
      updatedOccasions = currentOccasions.filter((o) => o !== occasion);
    } else {
      updatedOccasions = [...currentOccasions, occasion];
    }

    setFormData((prev: FormRecipeData) => ({ ...prev, occasion: updatedOccasions.join(', ') }));
    setOccasionSearch('');
  };

  const removeOccasion = (occasionToRemove: string) => {
    const currentOccasions = formData.occasion ? formData.occasion.split(',').map((o) => o.trim()) : [];
    const updatedOccasions = currentOccasions.filter((o) => o !== occasionToRemove);
    setFormData((prev: FormRecipeData) => ({ ...prev, occasion: updatedOccasions.join(', ') }));
  };

  const filteredOccasions = OCCASION_OPTIONS.filter((occasion) =>
    occasion.toLowerCase().includes(occasionSearch.toLowerCase())
  );

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImageFileName(file.name);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericFields = ['prep_time', 'cook_time', 'servings', 'price'];
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      [name]: numericFields.includes(name) ? value : value,
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const handleIngredientChange = (
    id: string,
    field: keyof Ingredient,
    value: string
  ) => {
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing: Ingredient) =>
        ing.id === id ? { ...ing, [field]: value } : ing
      ),
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`ingredient_${id}_${field}`];
      return newErrors;
    });
  };

  const addIngredient = () => {
    const newId = Date.now().toString();
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { id: newId, name: '', quantity: '', unit: '' },
      ],
    }));
  };

  const removeIngredient = (id: string) => {
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      ingredients: prev.ingredients.filter((ing: Ingredient) => ing.id !== id),
    }));
  };

  const handleInstructionChange = (id: string, value: string) => {
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      instructions: prev.instructions.map((inst: Instructions) =>
        inst.id === id ? { ...inst, description: value } : inst
      ),
    }));
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`instruction_${id}`];
      return newErrors;
    });
  };

  const addInstruction = () => {
    const newId = Date.now().toString();
    const step = formData.instructions.length + 1;
    setFormData((prev: FormRecipeData) => ({
      ...prev,
      instructions: [
        ...prev.instructions,
        { id: newId, step, description: '' },
      ],
    }));
  };

  const removeInstruction = (id: string) => {
    setFormData((prev: FormRecipeData) => {
      const filtered = prev.instructions.filter((inst: Instructions) => inst.id !== id);
      return {
        ...prev,
        instructions: filtered.map((inst: Instructions, index: number) => ({
          ...inst,
          step: index + 1,
        })),
      };
    });
  };

  const executeSubmit = async () => {
    const currentChefId = user?.user_id || getStoredChefId();
    if (!currentChefId) {
      alert("User session not found. Please log in again.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      let cloudinaryUrl = formData.image_url;
      if (imageFile) {
        setIsUploadingImage(true);
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (uploadedUrl) {
          cloudinaryUrl = uploadedUrl;
        } else {
          throw new Error('Failed to upload image. Please try again.');
        }
        setIsUploadingImage(false);
      }

      const recipePayload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        price: Number(formData.price) || 0,
        prep_time: Number(formData.prep_time) || 0,
        cook_time: Number(formData.cook_time) || 0,
        servings: Number(formData.servings) || 0,
        difficulty_level: formData.difficulty_level || null,
        chef_note: formData.chef_note || '',
        image_url: cloudinaryUrl,
        
        status: 'draft',
        approval_status: 'pending',
        chef_id: currentChefId,
    
        
        ingredients: formData.ingredients.map(ing => ({
          name: String(ing.name || '').trim(),
          quantity: String(ing.quantity || '').trim(),
          unit: String(ing.unit || '').trim()
        })),

        instructions: formData.instructions.map(ins => String(ins.description || '').trim()),
        
        tags: {
          dietary_tags: formData.dietary_tags 
        ? formData.dietary_tags.split(',').map(t => t.trim()).filter(t => t !== '') 
        : [],
          cuisine: formData.cuisine || '',
          goal: formData.goal || '',
          meal_type: formData.meal_type || '',
          occasion: formData.occasion || ''
        }
      };

      let response;
      if (recipeId) {
        response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipePayload),
        });
      } else {
        response = await fetch('http://localhost:4000/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(recipePayload),
        });
      }

      const result = await response.json();

      if (!response.ok) {
        let errorMessage = result.message || 'Failed to add recipe';
        if (Array.isArray(result.errors)) {
          errorMessage += `: ${result.errors.join(', ')}`;
        }
        throw new Error(errorMessage);
      }

      router.push('/seller/recipes/submitted');
      localStorage.removeItem('recipeDraftForm'); 

    } catch (err: any) {
      console.error("Submission Error:", err);
      setError(err.message || 'An error occurred during submission');
    } finally {
      setLoading(false);
    }
  };

  const constClickStyle = (e: any) => {
    e.currentTarget.style.borderColor = '#0d9488';
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)';
  };

  const constBlurStyle = (e: any, fieldName?: string) => {
    e.currentTarget.style.borderColor = fieldName && validationErrors[fieldName] ? '#ef4444' : '#cbd5e1';
    e.currentTarget.style.boxShadow = 'none';
  };

  const handleSubmitClick = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsWarningModalOpen(true);
  };

  const getFieldBorderColor = (fieldName: string): string => {
    return validationErrors[fieldName] ? '#ef4444' : '#cbd5e1';
  };

  return (
    <form noValidate onSubmit={handleSubmitClick} className="max-w-4xl mx-auto p-6" style={{ backgroundColor: '#f8fafb', ...formStyles }}>
      <h1 className="mb-8 text-center" style={{ color: '#1a2632', fontSize: '24px', fontWeight: 'bold' }}>
        {recipeId ? 'Edit Draft Recipe' : 'Add New Recipe'}
      </h1>

      {error && (
        <div className="mb-6 p-4 rounded-lg border" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b' }}>
          {error}
        </div>
      )}

      <div className="mb-8 p-6 rounded-lg shadow-sm border bg-white" style={{ borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Recipe Information</h2>

        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Recipe Title <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            name="title"
            id="recipe-title" 
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg transition outline-none"
            style={{ 
              borderColor: getFieldBorderColor('title'), 
              color: '#1a2632' 
            }}
            onFocus={constClickStyle}
            onBlur={(e) => constBlurStyle(e, 'title')}
            placeholder="Enter recipe title"
            required 
          />
          {validationErrors.title && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div style={{ position: 'relative' }} ref={cuisineRef}>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Cuisine
            </label>
            <input
              type="text"
              name="cuisine" 
              id="cuisine-input"   
              value={cuisineSearch || formData.cuisine}
              onChange={(e) => handleCuisineSearch(e.target.value)}
              onFocus={(e) => { constClickStyle(e); setShowCuisineDropdown(true); }}
              onBlur={(e) => { constBlurStyle(e); setTimeout(() => setShowCuisineDropdown(false), 200); }}
              className="no-autofill w-full px-4 py-2 border rounded-lg transition outline-none"
              style={{ borderColor: getFieldBorderColor('cuisine'), color: '#1a2632', backgroundColor: '#ffffff' }}
              placeholder="Type cuisine name..."
              autoComplete="off" 
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
                      backgroundColor: formData.cuisine === cuisine ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = formData.cuisine === cuisine ? '#e0f2fe' : '#ffffff'; }}
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
              value={dietaryTagsSearch || (Array.isArray(formData.dietary_tags) ? formData.dietary_tags.join(', ') : formData.dietary_tags) || ''}
              onChange={(e) => handleDietaryTagsSearch(e.target.value)}
              onFocus={(e) => { constClickStyle(e); setShowDietaryTagsDropdown(true); }}
              onBlur={(e) => { constBlurStyle(e); setTimeout(() => setShowDietaryTagsDropdown(false), 200); }}
              className="no-autofill w-full px-4 py-2 border rounded-lg transition outline-none"
              style={{ borderColor: getFieldBorderColor('dietary_tags'), color: '#1a2632', backgroundColor: '#ffffff' }}
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
                      backgroundColor: formData.dietary_tags === tag ? '#e0f2fe' : '#ffffff',
                      borderBottom: '1px solid #f1f5f9',
                      fontSize: '14px',
                      color: '#1a2632',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = formData.dietary_tags === tag ? '#e0f2fe' : '#ffffff'; }}
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
            <div 
              className="w-full px-4 py-2 border rounded-lg bg-white flex flex-wrap gap-2 items-center min-h-[42px] transition outline-none"
              style={{ borderColor: getFieldBorderColor('meal_type'), color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e)}
            >
              {formData.meal_type && formData.meal_type.split(',').map((item) => (
                item.trim() && (
                  <span key={item.trim()} className="flex items-center gap-1 bg-[#e0f2f1] text-[#0d9488] px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm">
                    {item.trim()}
                    <button type="button" onClick={() => removeMealType(item.trim())} className="text-[#0d9488] hover:text-red-500 font-bold ml-1">
                      ×
                    </button>
                  </span>
                )
              ))}
              <input
                type="text"
                value={mealTypeSearch}
                onChange={(e) => {
                  setMealTypeSearch(e.target.value);
                  setShowMealTypeDropdown(true);
                }}
                onFocus={() => setShowMealTypeDropdown(true)}
                onBlur={() => setTimeout(() => setShowMealTypeDropdown(false), 200)}
                placeholder={formData.meal_type ? "" : "Type meal type..."}
                className="outline-none flex-1 min-w-[60px] text-[13px] bg-transparent"
              />
            </div>
            
            {showMealTypeDropdown && filteredMealTypes.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 15,
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
                      fontSize: '14px',
                      color: '#1a2632',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
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
              value={goalSearch || formData.goal}
              onChange={(e) => handleGoalSearch(e.target.value)}
              onFocus={(e) => { constClickStyle(e); setShowGoalDropdown(true); }}
              onBlur={(e) => { constBlurStyle(e); setTimeout(() => setShowGoalDropdown(false), 200); }}
              className="no-autofill w-full px-4 py-2 border rounded-lg transition outline-none"
              style={{ borderColor: getFieldBorderColor('goal'), color: '#1a2632', backgroundColor: '#ffffff' }}
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
                    onMouseDown={(e) => {                         
                      e.preventDefault();                      
                      handleGoalSelect(goal);        
                    }}
                    style={{
                      padding: '10px 12px',                     
                      cursor: 'pointer',                       
                      backgroundColor: formData.goal === goal ? '#e0f2fe' : '#ffffff',  
                      borderBottom: '1px solid #f1f5f9',      
                      fontSize: '14px',                       
                      color: '#1a2632',                     
                      transition: 'background-color 0.2s',        
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}  
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = formData.goal === goal ? '#e0f2fe' : '#ffffff'; }}  
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
            <div 
              className="w-full px-4 py-2 border rounded-lg bg-white flex flex-wrap gap-2 items-center min-h-[42px] transition outline-none"
              style={{ borderColor: getFieldBorderColor('occasion'), color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e)}
            >
              {formData.occasion && formData.occasion.split(',').map((item) => (
                item.trim() && (
                  <span key={item.trim()} className="flex items-center gap-1 bg-[#e0f2f1] text-[#0d9488] px-2 py-0.5 rounded text-[11px] font-semibold shadow-sm">
                    {item.trim()}
                    <button type="button" onClick={() => removeOccasion(item.trim())} className="text-[#0d9488] hover:text-red-500 font-bold ml-1">
                      ×
                    </button>
                  </span>
                )
              ))}
              <input
                type="text"
                value={occasionSearch}
                onChange={(e) => {
                  setOccasionSearch(e.target.value);
                  setShowOccasionDropdown(true);
                }}
                onFocus={() => setShowOccasionDropdown(true)}
                onBlur={() => setTimeout(() => setShowOccasionDropdown(false), 200)}
                placeholder={formData.occasion ? "" : "Type occasion..."}
                className="outline-none flex-1 min-w-[60px] text-[13px] bg-transparent"
              />
            </div>
            
            {showOccasionDropdown && filteredOccasions.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0 0 8px 8px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  zIndex: 15,
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
                      fontSize: '14px',
                      color: '#1a2632',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    {occasion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg transition outline-none"
            style={{ 
              borderColor: getFieldBorderColor('description'), 
              color: '#1a2632' 
            }}
            onFocus={constClickStyle}
            onBlur={(e) => constBlurStyle(e, 'description')}
            placeholder="Describe your recipe"
          />
          {validationErrors.description && (
            <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.description}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Recipe Image
          </label>
          <div
            className="w-full rounded-lg flex flex-col items-center justify-center py-10 px-6 transition"
            style={{
              border: '2px dashed #cbd5e1',
              backgroundColor: '#f8fafb',
              minHeight: '180px',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
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

              if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
              setImageFile(file);
              setImageFileName(file.name);
              setImagePreview(URL.createObjectURL(file));
              setError('');
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
                    setFormData((prev: FormRecipeData) => ({ ...prev, image_url: '' }));
                  }}
                  disabled={isUploadingImage}
                  className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-white text-xs"
                  style={{ backgroundColor: '#ef4444', opacity: isUploadingImage ? 0.5 : 1, cursor: isUploadingImage ? 'not-allowed' : 'pointer' }}
                  title="Remove image"
                >
                  ✕
                </button>
                <p className="mt-2 text-center" style={{ color: '#64748b', fontSize: '11px' }}>{imageFileName}</p>
                <p className="mt-1 text-center" style={{ color: '#0d9488', fontSize: '10px', fontWeight: '500' }}>✓ Image selected (will upload on submit)</p>
              </div>
            ) : (
              <>
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
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Difficulty Level
            </label>
            <select
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e)}
            >
              <option value="">Select difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Price (XRP) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="number"
              name="price"
              value={(formData as any).price || ''}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              style={{ borderColor: getFieldBorderColor('price'), color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e, 'price')}
              placeholder="0.00"
            />
            {validationErrors.price && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.price}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Cooking Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e, 'prep_time')}
            />
            {validationErrors.prep_time && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.prep_time}</p>
            )}
          </div>

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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e, 'cook_time')}
            />
            {validationErrors.cook_time && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.cook_time}</p>
            )}
          </div>

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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={constClickStyle}
              onBlur={(e) => constBlurStyle(e, 'servings')}
            />
            {validationErrors.servings && (
              <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors.servings}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Ingredients <span style={{ color: '#ef4444' }}>*</span></h2>
        {validationErrors.ingredients && (
          <p style={{ color: '#ef4444', fontSize: '11px', marginBottom: '12px' }}>{validationErrors.ingredients}</p>
        )}

        {formData.ingredients.map((ingredient, index) => (
          <div 
            key={ingredient.id || `ingredient-${index}`} 
            className="mb-4 pb-4 border-b last:border-b-0" 
            style={{ borderColor: '#e2e8f0' }}
          >
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
                  onFocus={constClickStyle}
                  onBlur={(e) => constBlurStyle(e, `ingredient_${ingredient.id}_name`)}
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
                  onFocus={constClickStyle}
                  onBlur={(e) => constBlurStyle(e, `ingredient_${ingredient.id}_quantity`)}
                  placeholder="e.g., 2"
                />
                {validationErrors[`ingredient_${ingredient.id}_quantity`] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors[`ingredient_${ingredient.id}_quantity`]}</p>
                )}
              </div>

              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) => handleIngredientChange(ingredient.id, 'unit', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                    style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
                    onFocus={constClickStyle}
                    onBlur={(e) => constBlurStyle(e, `ingredient_${ingredient.id}_unit`)}
                    placeholder="e.g., cups"
                  />
                  {validationErrors[`ingredient_${ingredient.id}_unit`] && (
                    <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block' }}>
                      {validationErrors[`ingredient_${ingredient.id}_unit`]}
                    </p>
                  )}
                </div>

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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
                  style={{ 
                    borderColor: '#cbd5e1', 
                    color: '#1a2632' 
                  }}
                  onFocus={constClickStyle}
                  onBlur={(e) => constBlurStyle(e, `instruction_${instruction.id}`)}
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

      <div className="mb-8 p-6 rounded-lg shadow-sm border" style={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0' }}>
        <h2 className="mb-4" style={{ color: '#1a2632', fontSize: '16px', fontWeight: '600' }}>Chef&apos;s Note</h2>

        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Additional Tips & Notes
          </label>
          <textarea
            name="chef_note"
            value={formData.chef_note}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
            style={{ 
              borderColor: '#cbd5e1', 
              color: '#1a2632' 
            }}
            onFocus={constClickStyle}
            onBlur={(e) => constBlurStyle(e)}
            placeholder="Share any special tips or notes about this recipe..."
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        {!recipeId && (
          <button
            type="button"
            onClick={async () => {
              try {
                if (!formData.title || formData.title.trim() === '') {
                  alert('Please fill the title to save as a draft.');
                  return;
                }

                const currentChefId = user?.user_id || getStoredChefId();
                if (!currentChefId) {
                  alert('User not authenticated. Please log in again.');
                  return;
                }

                let draftImageUrl = formData.image_url || null;
                if (imageFile) {
                  setIsUploadingImage(true);
                  const uploadedUrl = await uploadToCloudinary(imageFile);
                  setIsUploadingImage(false);
                  if (!uploadedUrl) {
                    throw new Error('Failed to upload image. Please try again.');
                  }
                  draftImageUrl = uploadedUrl;
                }

                const cleanIngredients = formData.ingredients
                  ? formData.ingredients
                      .filter(i => i.name && i.name.trim() !== '')
                      .map(i => ({
                        name: i.name.trim(),
                        quantity: i.quantity ? i.quantity.trim() : '',
                        unit: i.unit ? i.unit.trim() : ''
                      }))
                  : [];

                const cleanInstructions = formData.instructions
                  ? formData.instructions
                      .filter(i => i.description && i.description.trim() !== '')
                      .map(i => i.description.trim())
                  : [];

                const draftData = {
                  chef_id: currentChefId,
                  title: formData.title.trim(),
                  description: formData.description ? formData.description.trim() : null,
                  image_url: draftImageUrl,
                  difficulty_level: formData.difficulty_level || null,
                  prep_time: formData.prep_time !== 0 ? Number(formData.prep_time) : null,
                  cook_time: formData.cook_time !== 0 ? Number(formData.cook_time) : null,
                  servings: formData.servings !== 0 ? Number(formData.servings) : null,
                  price: formData.price !== 0 ? Number(formData.price) : null,
                  ingredients: cleanIngredients.length > 0 ? cleanIngredients : [],
                  instructions: cleanInstructions.length > 0 ? cleanInstructions : [],
                  chef_note: formData.chef_note ? formData.chef_note.trim() : null,
                  status: 'draft',
                  approval_status: 'draft',
                  tags: {
                    dietary_tags: typeof formData.dietary_tags === 'string' 
  ? formData.dietary_tags.split(',').map((t: string) => t.trim()).filter((t: string) => t !== '') 
  : [],
                    cuisine: formData.cuisine || '',
                    goal: formData.goal || '',
                    meal_type: formData.meal_type || '',
                    occasion: formData.occasion || ''
                  }
                };

                let response;
                if (recipeId) {
                  response = await fetch(`http://localhost:4000/api/recipes/${recipeId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(draftData),
                  });
                } else {
                  response = await fetch('http://localhost:4000/api/recipes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(draftData),
                  });
                }

                const responseData = await response.json();

                if (!response.ok) {
                  console.error('API Error:', responseData);
                  throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
                }

                localStorage.removeItem('recipeDraftForm');
                setIsSuccessModalOpen(true);
              } catch (error) {
                setIsUploadingImage(false);
                console.error('Error saving draft:', error);
                const message = error instanceof Error ? error.message : String(error);
                alert(`Failed to save draft: ${message}`);
              }
            }}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 transition"
            style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
          >
            Save Draft
          </button>
        )}

        <button
          type="submit"
          disabled={loading || isUploadingImage}
          className="px-6 py-2 text-white rounded-lg disabled:bg-gray-400 transition"
          style={{ backgroundColor: loading || isUploadingImage ? '#64748b' : '#0d9488' }}
        >
          {loading ? 'Submitting...' : isUploadingImage ? 'Uploading Image...' : 'Submit Recipe'}
        </button>
      </div>

      {isWarningModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '450px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 12px', color: '#1a2632', fontSize: '18px', fontWeight: 'bold' }}>
              Are you sure you want to submit?
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0 0 24px' }}>
              Once submitted, this recipe cannot be edited. Please double check the details before proceeding.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => {
                  setIsWarningModalOpen(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Cancel, I&apos;ll recheck
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsWarningModalOpen(false);
                  executeSubmit();
                }}
                style={{
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ margin: '0 0 16px', color: '#1a2632', fontSize: '18px' }}>
              Recipe draft successfully saved to database!
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              <button 
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  router.push('/seller/dashboard');
                }}
                style={{
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Go to the dashboard
              </button>

              <button 
                type="button"
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  router.push('/seller/recipes/add');
                }}
                style={{
                  backgroundColor: '#e0f2f1',
                  color: '#0d9488',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Add new recipe
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

function mealTypeSearch(val: any) {
  if (!val) return '';
  return typeof val === 'string' ? val : '';
}

function getBorderColor(fieldName: string): string {
  return '#cbd5e1';
}

function getBorderColorInput(fieldName: string): string {
  return '#cbd5e1';
}

function TypeSearch(val: any) {
  if (!val) return '';
  return typeof val === 'string' ? val : '';
}