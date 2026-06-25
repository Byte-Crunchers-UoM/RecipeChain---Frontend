import React from 'react';
import { Star, MessageSquareOff, User } from 'lucide-react';

export interface RecipeFeedback {
  feedback_id: string;
  recipe_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

interface RecipeReviewsProps {
  feedbacks?: RecipeFeedback[];
}

export default function RecipeReviews({ feedbacks = [] }: RecipeReviewsProps) {
  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-2 text-center animate-in fade-in duration-300">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3">
          <MessageSquareOff className="text-gray-400" size={28} />
        </div>
        <h4 className="text-gray-900 font-semibold mb-1">No reviews yet</h4>
        <p className="text-gray-500 text-sm max-w-[250px]">
          Be the first to try this recipe and share your thoughts with the community!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {feedbacks.map((review) => {
        // Generate a simple formatted date
        const date = new Date(review.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div 
            key={review.feedback_id} 
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border border-teal-100">
                  <User size={18} />
                </div>
                <div>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{date}</span>
                </div>
              </div>
            </div>
            
            {review.comment ? (
              <p className="text-sm text-gray-700 leading-relaxed pl-13">
                "{review.comment}"
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic pl-13">
                No comment provided.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}