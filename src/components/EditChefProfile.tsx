'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';

type NavItem = {
  label: string;
  active?: boolean;
};

type SocialLinks = {
  instagram: string;
  youtube: string;
  website: string;
};

type ChefProfile = {
  displayName: string;
  bio: string;
  cuisine: string;
  specialties: string[];
  socialLinks: SocialLinks;
};

const PROFILE_STORAGE_KEY = 'chef-profile';

const navItems: NavItem[] = [
  { label: 'Dashboard' },
  { label: 'My Recipes' },
  { label: 'Profile', active: true },
  { label: 'Settings' },
];

const cuisineOptions = ['Italian', 'Mediterranean', 'Asian', 'French', 'Mexican', 'Fusion'];

const specialtyOptions = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Healthy',
  'Comfort Food',
  'Fusion',
  'Traditional',
  'Modern',
  'Quick & Easy',
];

const defaultProfile: ChefProfile = {
  displayName: 'Chef Maria Rodriguez',
  bio: 'Passionate about Italian and Mediterranean cuisine with 15 years of professional experience. I love creating recipes that bring families together around the dinner table.',
  cuisine: 'Italian',
  specialties: ['Healthy', 'Fusion'],
  socialLinks: {
    instagram: 'chefmaria',
    youtube: 'chefmariacooks',
    website: 'mariarodriguez.com',
  },
};

const defaultAvatar =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80';

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shadow-sm shadow-teal-100/70">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M7 4v7a5 5 0 0 0 10 0V4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 8H5a2 2 0 0 0 0 4h2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 8h2a2 2 0 0 1 0 4h-2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16v4" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17H5.5a1.5 1.5 0 0 1-1.2-2.4L6 12.5V9a6 6 0 1 1 12 0v3.5l1.7 2.1a1.5 1.5 0 0 1-1.2 2.4H15" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 17.5 3.5 20V6A2 2 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v8a2.5 2.5 0 0 1-2.5 2.5H7Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 9h8M8 13h5" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 5h5v5H5zM14 5h5v5h-5zM5 14h5v5H5zM14 14h5v5h-5z" strokeLinejoin="round" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 5.5A2.5 2.5 0 0 1 8.5 3H19v15H8.5A2.5 2.5 0 0 0 6 20.5V5.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 5.5V20.5A2.5 2.5 0 0 1 8.5 18H19" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.6Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 16V6" strokeLinecap="round" />
      <path d="m8.5 9.5 3.5-3.5 3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-1.7A1 1 0 0 1 10 4h4a1 1 0 0 1 .8.3L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3s5 2 7 3v6c0 4.6-2.9 7.7-7 9-4.1-1.3-7-4.4-7-9V6c2-1 7-3 7-3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9.5 12.5 1.7 1.7 3.8-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M20 13 11 22l-8-8V4h10l7 7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14.5 14.5 0 0 1 0 18M12 3a14.5 14.5 0 0 0 0 18" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getNavIcon(label: string) {
  switch (label) {
    case 'Dashboard':
      return <GridIcon />;
    case 'My Recipes':
      return <BookIcon />;
    case 'Profile':
      return <UserIcon />;
    default:
      return <SettingsIcon />;
  }
}

export default function EditChefProfile() {
  const [profile, setProfile] = useState<ChefProfile>(defaultProfile);
  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    const storedAvatar = localStorage.getItem(`${PROFILE_STORAGE_KEY}-avatar`);

    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile) as ChefProfile;
        setProfile({
          ...defaultProfile,
          ...parsed,
          socialLinks: {
            ...defaultProfile.socialLinks,
            ...parsed.socialLinks,
          },
          specialties: Array.isArray(parsed.specialties) ? parsed.specialties : defaultProfile.specialties,
        });
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }

    if (storedAvatar) {
      setAvatarPreview(storedAvatar);
    }
  }, []);

  const selectedSpecialtiesLabel = useMemo(
    () => `${profile.specialties.length} selected`,
    [profile.specialties.length]
  );

  const updateProfileField = (field: keyof ChefProfile, value: string | string[] | SocialLinks) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateSocialField = (field: keyof SocialLinks, value: string) => {
    setProfile((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [field]: value,
      },
    }));
  };

  const toggleSpecialty = (value: string) => {
    setProfile((current) => ({
      ...current,
      specialties: current.specialties.includes(value)
        ? current.specialties.filter((item) => item !== value)
        : [...current.specialties, value],
    }));
  };

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : defaultAvatar;
      setAvatarPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setProfile(defaultProfile);
    setAvatarPreview(defaultAvatar);
    setSaveMessage('Changes discarded.');
  };

  const handleSave = () => {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(`${PROFILE_STORAGE_KEY}-avatar`, avatarPreview);
    setSaveMessage('Profile saved successfully.');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f7] text-slate-800">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-white lg:min-h-screen lg:w-[250px] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
            <BrandMark />
            <div>
              <p className="text-sm font-semibold text-slate-900">RecipeChain</p>
              <p className="text-[11px] text-slate-400">Chef portal</p>
            </div>
          </div>

          <nav className="px-3 py-5">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      item.active
                        ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-100/70'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                  >
                    <span className={item.active ? 'text-teal-700' : 'text-slate-400'}>{getNavIcon(item.label)}</span>
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto px-5 pb-8 pt-10 lg:pt-24">
            <button
              type="button"
              className="flex items-center gap-3 text-sm font-medium text-rose-500 transition hover:text-rose-600"
            >
              <span className="text-base">↪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full max-w-xl">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  placeholder="Search your recipes"
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:bg-white focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="flex items-center justify-end gap-4">
                <button
                  type="button"
                  className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <BellIcon />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-500" />
                </button>
                <button
                  type="button"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <MessageIcon />
                </button>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                  <img src={avatarPreview} alt="Chef avatar" className="h-9 w-9 rounded-full object-cover" />
                  <div className="hidden pr-2 sm:block">
                    <p className="text-sm font-semibold text-slate-900">Maria</p>
                    <p className="text-xs text-slate-400">Verified chef</p>
                  </div>
                  <span className="text-slate-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Profile</h1>
                <p className="mt-2 text-sm text-slate-500">Manage your public chef information</p>
              </div>

              {saveMessage && (
                <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-700">
                  {saveMessage}
                </div>
              )}

              <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="space-y-6">
                  <section className="rounded-3xl bg-white p-6 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-100">
                    <h2 className="text-base font-semibold text-slate-900">Profile Photo</h2>

                    <div className="mt-6 flex flex-col items-center text-center">
                      <div className="relative">
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-lg shadow-teal-100/70"
                        />
                        <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-teal-500 text-white shadow-lg shadow-teal-200 transition hover:bg-teal-600">
                          <CameraIcon />
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                      </div>

                      <label className="mt-6 flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition hover:border-teal-300 hover:bg-teal-50/40 hover:text-teal-700">
                        <span className="flex items-center gap-2 text-slate-600">
                          <UploadIcon />
                          Upload New Photo
                        </span>
                        <span className="text-xs text-slate-400">PNG or JPG up to 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>

                      <p className="mt-4 text-xs leading-5 text-slate-400">
                        This image will appear on your public chef profile and next to your recipes.
                      </p>
                    </div>
                  </section>
                </div>

                <div className="space-y-6">
                  <section className="rounded-3xl bg-white p-6 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 sm:p-8">
                    <h2 className="text-base font-semibold text-slate-900">Profile Information</h2>

                    <div className="mt-6 grid gap-6">
                      <div>
                        <label htmlFor="displayName" className="mb-2 block text-sm font-medium text-slate-700">
                          Chef Display Name
                        </label>
                        <input
                          id="displayName"
                          type="text"
                          value={profile.displayName}
                          onChange={(event) => updateProfileField('displayName', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                        />
                        <p className="mt-2 text-xs text-slate-400">This is how you&apos;ll appear to customers.</p>
                      </div>

                      <div>
                        <label htmlFor="bio" className="mb-2 block text-sm font-medium text-slate-700">
                          Chef Bio
                        </label>
                        <textarea
                          id="bio"
                          rows={5}
                          value={profile.bio}
                          onChange={(event) => updateProfileField('bio', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="cuisine" className="mb-2 block text-sm font-medium text-slate-700">
                          Primary Cuisine Specialization
                        </label>
                        <div className="relative">
                          <select
                            id="cuisine"
                            value={profile.cuisine}
                            onChange={(event) => updateProfileField('cuisine', event.target.value)}
                            className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                          >
                            {cuisineOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <ChevronDownIcon />
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <TagIcon />
                          <span>Additional Specialties &amp; Styles</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {specialtyOptions.map((item) => {
                            const active = profile.specialties.includes(item);

                            return (
                              <button
                                key={item}
                                type="button"
                                onClick={() => toggleSpecialty(item)}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                                  active
                                    ? 'bg-teal-500 text-white shadow-sm shadow-teal-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                }`}
                              >
                                {item}
                              </button>
                            );
                          })}
                        </div>
                        <p className="mt-3 text-xs text-slate-400">Select all that apply to your cooking style · {selectedSpecialtiesLabel}</p>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-3xl bg-white p-6 shadow-[0_16px_60px_-40px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 sm:p-8">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-slate-900">Social Links</h2>
                      <span className="text-xs font-medium text-slate-400">Optional</span>
                    </div>

                    <div className="mt-6 grid gap-5">
                      <div>
                        <label htmlFor="instagram" className="mb-2 block text-sm font-medium text-slate-700">
                          Instagram
                        </label>
                        <input
                          id="instagram"
                          type="text"
                          value={profile.socialLinks.instagram}
                          onChange={(event) => updateSocialField('instagram', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="youtube" className="mb-2 block text-sm font-medium text-slate-700">
                          YouTube
                        </label>
                        <input
                          id="youtube"
                          type="text"
                          value={profile.socialLinks.youtube}
                          onChange={(event) => updateSocialField('youtube', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>

                      <div>
                        <label htmlFor="website" className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                          <GlobeIcon />
                          <span>Website</span>
                        </label>
                        <input
                          id="website"
                          type="text"
                          value={profile.socialLinks.website}
                          onChange={(event) => updateSocialField('website', event.target.value)}
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
                        />
                      </div>
                    </div>
                  </section>

                  <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="rounded-2xl px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-600"
                    >
                      <UploadIcon />
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
