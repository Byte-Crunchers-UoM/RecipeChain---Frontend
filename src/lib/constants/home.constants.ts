//src/lib/constants/home.constants.ts
import { ChefHat, Bot, TrendingUp, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: string;
}

export interface HowItWorkStep {
  step: string;
  title: string;
  description: string;
}

export interface FooterColumn {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
}

export interface SocialLink {
  label: string;
  href: string;
}

// Hero Section
export const HERO_TAGLINE = 'CRYPTO-POWERED RECIPE MARKETPLACE';
export const HERO_TITLE = 'Buy & Sell Chef Recipes with Crypto';
export const HERO_DESCRIPTION = 'Discover thousands of authentic recipes from world-class chefs. Powered by blockchain, backed by AI, and priced in crypto. Cook like a pro, earn like a chef.';
export const CHEFS_TRUST_COUNT = '2,500+';

// Features Section
export const FEATURES_TITLE = 'Why Choose RecipeChain?';
export const FEATURES_SUBTITLE = "The world's first blockchain-based recipe marketplace combining culinary excellence with cutting-edge crypto technology.";

export const FEATURES: Feature[] = [
  {
    icon: ChefHat,
    title: 'Pro Chef Recipes',
    description: 'Authentic recipes from world-class chefs at affordable crypto prices',
  },
  {
    icon: Bot,
    title: 'AI Chatbot',
    description: 'Get personalized recipe recommendations based on your preferences',
  },
  {
    icon: TrendingUp,
    title: 'Earn as Chef',
    description: 'Monetize your culinary expertise and build your cooking empire',
  },
  {
    icon: Zap,
    title: 'Instant Access',
    description: 'Get recipes in seconds on blockchain with transparent transactions',
  },
];

// Stats Section
export const STATS: Stat[] = [
  { label: 'Active Recipes', value: '2,500+' },
  { label: 'Chef Community', value: '1,200+' },
  { label: 'Crypto Transactions', value: '$50K+' },
  { label: 'User Satisfaction', value: '4.8/5' },
];

// How It Works Section
export const HOW_IT_WORKS_TITLE = 'How It Works';
export const HOW_IT_WORKS_SUBTITLE = 'Get started in three simple steps';

export const HOW_IT_WORKS_STEPS: HowItWorkStep[] = [
  {
    step: '01',
    title: 'Browse Recipes',
    description: 'Explore thousands of recipes from renowned chefs. Filter by cuisine, difficulty, and dietary preferences.',
  },
  {
    step: '02',
    title: 'Purchase with Crypto',
    description: 'Buy recipes instantly with USDC or XRP. Transparent pricing, no hidden fees, instant access.',
  },
  {
    step: '03',
    title: 'Cook & Enjoy',
    description: 'Get step-by-step instructions with AI assistance. Save favorites, rate recipes, and share with friends.',
  },
];

// CTA Section
export const CTA_TITLE = 'Ready to Transform Your Cooking?';
export const CTA_DESCRIPTION = 'Join thousands of food enthusiasts and professional chefs. Start exploring premium recipes or share your culinary creations today.';
export const CTA_BECOME_CHEF_TEXT = 'Become a Chef';

// Footer
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Browse Recipes', href: '/recipes' },
      { label: 'AI Assistant', href: '/ai-assistant' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'For Chefs',
    links: [
      { label: 'Sell Recipes', href: '/sell' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Earnings', href: '/earnings' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
      { label: 'Security', href: '/security' },
    ],
  },
];

export const FOOTER_SOCIAL_LINKS: SocialLink[] = [
  { label: 'Twitter', href: 'https://twitter.com' },
  { label: 'Discord', href: 'https://discord.com' },
  { label: 'GitHub', href: 'https://github.com' },
];

export const FOOTER_COPYRIGHT = '© 2024 RecipeChain. All rights reserved.';
