/*'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Recipe, Ingredient, Instruction } from '@/lib/types/recipe';

const formStyles = {
  fontFamily: "'Roboto', 'Arial', sans-serif",
};

interface ValidationErrors {
  [key: string]: string;
}

export default function AddRecipeForm() {
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
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  //Load chef_id from Local Storage on mount
    useEffect(() => {
    const savedId = localStorage.getItem('chef_id');
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

  // Required fields
  const requiredFields = ['title', 'price', 'prep_time', 'cook_time', 'servings'];

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

    // Check ingredients (required) - set per-field errors
    if (!Array.isArray(formData.ingredients) || formData.ingredients.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    } else {
      formData.ingredients.forEach((ing) => {
        if (!ing.name || (typeof ing.name === 'string' && ing.name.trim() === '')) {
          errors[`ingredient_${ing.id}_name`] = 'Ingredient name is required';
        }
        if (!ing.quantity || (typeof ing.quantity === 'string' && ing.quantity.trim() === '')) {
          errors[`ingredient_${ing.id}_quantity`] = 'Ingredient quantity is required';
        }
        if (!ing.unit || (typeof ing.unit === 'string' && ing.unit.trim() === '')) {
          errors[`ingredient_${ing.id}_unit`] = 'Ingredient unit is required';
        }
      });
    }

    // Check instructions (required) - per-step errors
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
      const response = await fetch('http://localhost:4000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // build payload and coerce numeric fields to numbers
          title: formData.title,
          description: formData.description,
          image_url: formData.image_url,
          difficulty_level: formData.difficulty_level,
          prep_time: Number((formData as any).prep_time) || 0,
          cook_time: Number((formData as any).cook_time) || 0,
          servings: Number((formData as any).servings) || 1,
          price: Number((formData as any).price) || 0,
          ingredients: formData.ingredients,
          instructions: formData.instructions,
          chef_note: formData.chef_note,
          tags: {
            dietary_tags: (formData as any).dietary_tags || '',
            goal: (formData as any).goal || '',
            meal_type: (formData as any).meal_type || '',
            occasion: (formData as any).occasion || '',
            cuisine: formData.cuisine || '',
          },
          chef_id: formData.chef_id,
          status: 'pending',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create recipe');
      }

      setSuccess(true);
      const currentChefId = localStorage.getItem('chef_id') || '';
      setFormData({
        chef_id: currentChefId,
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

      setTimeout(() => setSuccess(false), 3000);
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
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Cuisine
            </label>
            <input
              type="text"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              placeholder="e.g., Italian, Asian, Mexican"
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Dietary Tags
            </label>
            <input
              type="text"
              name="dietary_tags"
              value={(formData as any).dietary_tags || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              placeholder="e.g., vegetarian, gluten-free"
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Meal Type
            </label>
            <input
              type="text"
              name="meal_type"
              value={(formData as any).meal_type || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              placeholder="e.g., breakfast, lunch, dinner"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Goal
            </label>
            <input
              type="text"
              name="goal"
              value={(formData as any).goal || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              placeholder="e.g., weight loss, muscle gain, general health"
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
              Occasion
            </label>
            <input
              type="text"
              name="occasion"
              value={(formData as any).occasion || ''}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
              style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
              onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
              placeholder="e.g., party, holiday, everyday"
            />
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

        {/* Image URL */}
        <div className="mb-4">
          <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
            Image URL
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
            style={{ borderColor: '#cbd5e1', color: '#1a2632' }}
            onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
            placeholder="https://example.com/image.jpg"
          />
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

              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1" style={{ color: '#1a2632', fontSize: '12px', fontWeight: '500' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      handleIngredientChange(ingredient.id, 'unit', e.target.value)
                    }
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ borderColor: getFieldBorderColor(`ingredient_${ingredient.id}_unit`), color: '#1a2632' }}
                    onFocus={(e) => { e.currentTarget.style.outlineColor = '#0d9488'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(13, 148, 136, 0.1)'; }}
                    placeholder="e.g., cups"
                  />
                </div>

                {validationErrors[`ingredient_${ingredient.id}_unit`] && (
                  <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>{validationErrors[`ingredient_${ingredient.id}_unit`]}</p>
                )}
                {formData.ingredients.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient.id)}
                    className="self-end px-3 py-2 rounded-lg hover:bg-red-50"
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
        {success && (
          <div className="flex-1 p-4 rounded-lg border" style={{ backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534' }}>
            Recipe submitted successfully! Waiting for admin approval.
          </div>
        )}

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
          disabled={loading}
          className="px-6 py-2 text-white rounded-lg disabled:bg-gray-400"
          style={{ backgroundColor: loading ? '#64748b' : '#0d9488' }}
        >
          {loading ? 'Submitting...' : 'Submit Recipe'}
        </button>
      </div>
    </form>
  );
}
*/