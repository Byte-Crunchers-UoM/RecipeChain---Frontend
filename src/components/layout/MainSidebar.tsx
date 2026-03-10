'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Home,
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  ChefHat,
  User,
  type LucideIcon
} from 'lucide-react'
import { MarketplaceFilters } from './marcketplace/MarcketplaceFilters' 
import { useRecipeFilterContext } from '@/lib/context/RecipeFilterContext'

type MenuItem = {
  label: string
  path: string
  icon: LucideIcon 
}

const menuItems: MenuItem[] = [
  { label: 'Home', path: '/', icon: Home },
  { label: 'Market Place', path: '/recipes', icon: LayoutDashboard },
  { label: 'Trending Recipes', path: '/trending', icon: TrendingUp },
  { label: 'My Cookbook', path: '/cookbook', icon: BookOpen },
  { label: 'Chefs', path: '/chefs', icon: ChefHat },
  { label: 'Profile', path: '/profile', icon: User }
]



export default function Sidebar() {
  const pathname = usePathname()
  const { hasFilter, toggleFilter, clearFilters, applyFilters, isFiltering } = useRecipeFilterContext();
  const isMarketplace = pathname === '/recipes'
  return (
    <aside className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 left-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
      
      {/* Navigation Section */}
      <nav className="flex flex-col gap-1 p-4 pb-6">
        {menuItems.map(item => {
          const isActive = pathname === item.path
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              href={item.path}
              
              className={`w-full h-13 flex items-center rounded-xl transition-all duration-200 group border-l-[5px]
                ${isActive 
                  ? 'bg-[#E0F2F1] text-[#00897B] font-bold border-[#00897B]' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium border-transparent'}
              `}            >
              
              <div className="flex items-center gap-3 pl-4 pr-4 h-full w-full">
                <Icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? 'text-[#00897B]' : 'text-gray-400 group-hover:text-gray-600'} 
                />
                <span className="text-[15px] tracking-wide">{item.label}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Conditionally render the filters only on the Marketplace route */}
      {isMarketplace && (
        <>
          <div className="mx-4 border-t border-gray-100 my-2"></div>
          <div className="px-4 py-4 animate-in fade-in duration-300">
            
            <MarketplaceFilters 
              hasFilter={hasFilter}
              toggleFilter={toggleFilter}
              clearFilters={clearFilters}
              applyFilters={applyFilters}
              isFiltering={isFiltering}
            />
          </div>
        </>
      )}

    </aside>
  )
}