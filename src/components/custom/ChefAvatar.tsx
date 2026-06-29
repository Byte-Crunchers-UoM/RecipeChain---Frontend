import React from 'react';

interface ChefAvatarProps {
  imageUrl: string;
  isVerified: boolean;
  size?: number;
}

const ChefAvatar: React.FC<ChefAvatarProps> = ({ imageUrl, isVerified, size = 64 }) => {
  return (
    <div className="relative inline-block" style={{ width: size, height: size }}>
      {/* Blue Border / Ring */}
      <div className={`rounded-full p-[2px] ${isVerified ? 'bg-blue-500' : 'bg-gray-200'}`}>
        <div className="rounded-full border-2 border-white overflow-hidden bg-white">
          <img 
            src={imageUrl || '/default-avatar.png'} 
            alt="Chef" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Small Blue Tick on the bottom-right corner */}
      {isVerified && (
        <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full border-2 border-white p-[1px]">
          <svg 
            className="text-white fill-current" 
            style={{ width: size * 0.25, height: size * 0.25 }} 
            viewBox="0 0 20 20"
          >
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default ChefAvatar;