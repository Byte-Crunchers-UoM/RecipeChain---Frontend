import React, { useState } from 'react';
import { Star, MessageSquareOff, User } from 'lucide-react';

// Added interface for the new feedback images
export interface FeedbackImage {
  image_id: string;
  image_url: string;
  sort_order: number;
}

export interface RecipeFeedback {
  feedback_id: string;
  recipe_id: string;
  buyer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  feedback_images?: FeedbackImage[]; // <-- Added field
}

interface RecipeReviewsProps {
  feedbacks?: RecipeFeedback[];
}

export default function RecipeReviews({ feedbacks = [] }: RecipeReviewsProps) {
  // Optional: State to handle simple image expansion when clicked
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
        const date = new Date(review.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        // Ensure images are sorted by their sort_order if they exist
        const sortedImages = review.feedback_images?.sort((a, b) => a.sort_order - b.sort_order) || [];

        return (
          <div 
            key={review.feedback_id} 
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 border border-teal-100 shrink-0">
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
            
            <div className="pl-13">
              {/* Review Text */}
              {review.comment ? (
                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                  &quot;{review.comment}&quot;
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic mb-3">
                  No comment provided.
                </p>
              )}

              {/* Review Images Grid */}
              {sortedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {sortedImages.map((img) => (
                    <div 
                      key={img.image_id} 
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity"
                      onClick={() => setExpandedImage(img.image_url)}
                    >
                      {/* Using standard img tag to prevent Next.js remote hostname config errors */}
                      <img 
                        src={img.image_url} 
                        alt="Review attachment" 
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Fullscreen Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded review" 
            className="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}