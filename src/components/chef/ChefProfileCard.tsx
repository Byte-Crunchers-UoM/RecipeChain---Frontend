"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useNotifications } from "@/context/NotificationContext";
import { followChef, getChefProfile } from "@/lib/api/chefs";
import { FaFacebook, FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';
import { useFollowedChefs } from "@/context/FollowedChefsContext";

const ChefProfileCard = () => {
    const { followChefLocally, unfollowChefLocally, isFollowingLocally } = useFollowedChefs();
    const [followerCount, setFollowerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [sellerData, setSellerData] = useState<any>(null);
    const [socialLinks, setSocialLinks] = useState<any>(null);
    const { addNotification } = useNotifications();

    const searchParams = useSearchParams();
    const chefId = searchParams.get("id");
    const currentBuyerId = 1;

    useEffect(() => {
        const fetchSellerData = async () => {
            if (!chefId) return;
            try {
                const profile = await getChefProfile(chefId);
                console.log("Chef Profile Received from API:", profile);

                if (profile && profile.seller) {
                    console.log("%c✅ SUCCESS: CHEF DATA LOADED", "color: green; font-weight: bold; font-size: 14px;");
                    console.log("Name:", profile.seller.display_name || profile.seller.full_name);
                    console.log("Location:", profile.seller.address);
                    console.log("Bio:", profile.seller.bio);
                    console.log("Socials:", profile.socials);

                    setSellerData(profile.seller);
                    setFollowerCount(profile.seller.followers_count || 0);
                    if (profile.seller.verify_badge_status === "verified") {
                        setIsVerified(true);
                    } else {
                        setIsVerified(false);
                    }
                }

                let parsedSocials = null;
                if (profile.seller && profile.seller.social_links) {
                    parsedSocials = profile.seller.social_links;
                    if (typeof parsedSocials === 'string') {
                        try {
                            parsedSocials = JSON.parse(parsedSocials);
                        } catch (e) {
                            console.error("Error parsing social_links:", e);
                        }
                    }
                }

                if (parsedSocials) {
                    setSocialLinks(parsedSocials);
                } else if (profile.socials) {
                    setSocialLinks(profile.socials);
                }
            } catch (error) {
                console.error("Error fetching chef profile:", error);
            }
        };

        fetchSellerData();
    }, [chefId]);

    const isFollowing = chefId ? isFollowingLocally(chefId) : false;

    const handleFollowToggle = async () => {
        if (!chefId || isLoading) return;

        if (!isFollowing) {
            setIsLoading(true);

            try {
                const response = await followChef(chefId, currentBuyerId);

                // Get the real count from the backend response instead of hardcoding prev + 1
                if (response && response.data && typeof response.data.followers_count === 'number') {
                    setFollowerCount(response.data.followers_count);
                } else {
                    // Fallback to optimistic increment if the response doesn't contain the count
                    setFollowerCount((prev) => prev + 1);
                }

                // Simultaneous notifications on success
                addNotification("You started following this chef.", "success");
                addNotification("New buyer started following you.", "info");

                if (sellerData) {
                    await followChefLocally({
                        user_id: chefId,
                        display_name: sellerData.display_name,
                        full_name: sellerData.full_name,
                        profile_photo: sellerData.profile_photo,
                        verify_badge_status: sellerData.verify_badge_status,
                        followers_count: followerCount + 1,
                    });
                }
            } catch (error) {
                // Revert on failure
                addNotification("Failed to follow chef. " + (error instanceof Error ? error.message : ""), "info");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Basic unfollow logic 
            unfollowChefLocally(chefId);
            setFollowerCount((prev) => prev - 1);
        }
    };

    const formatCount = (num: number) => {
        return num >= 1000 ? (num / 1000).toFixed(1) + "K" : num;
    };

    const formatSocialLink = (link: string, platform: string) => {
        if (!link) return "#";

        if (platform === 'tiktok' && !link.includes('tiktok.com') && !link.includes('http')) {
            const username = link.startsWith('@') ? link : `@${link}`;
            return `https://www.tiktok.com/${username}`;
        }

        if (!link.startsWith('http://') && !link.startsWith('https://')) {
            return `https://${link}`;
        }

        return link;
    };


    return (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-6 inline-block">
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-[4px] border-[#008080] bg-gray-100">
                    {sellerData?.profile_photo ? (
                        <Image
                            src={sellerData.profile_photo}
                            alt={sellerData.display_name || sellerData.full_name || "Chef Profile"}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8]">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </div>
                    )}
                </div>
                {isVerified && (
                    <div className="absolute bottom-1 right-1 translate-x-2 translate-y-1 bg-[#008080] rounded-full border-[4px] border-white w-12 h-12 flex items-center justify-center shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M9 12l2 2 4-4" stroke="#008080" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                )}
            </div>

            <h1 className="heading mb-1 text-[var(--text)]">
                {sellerData?.display_name || sellerData?.full_name || "Unknown Chef"}
            </h1>
            <div className="flex items-center space-x-1 text-[var(--muted)] description mb-8">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{sellerData?.address || "fetching location"}</span>
            </div>

            <div className="w-full space-y-4 mb-8">
                <button
                    onClick={handleFollowToggle}
                    className={`w-full py-3.5 rounded-2xl font-bold sub-heading transition-all shadow-lg ${isFollowing
                        ? "bg-[var(--secondary)] text-[var(--primary)] shadow-none"
                        : "bg-[var(--primary)] text-white hover:brightness-110 shadow-teal-100"
                        }`}
                >
                    {isFollowing ? "Following" : "Follow"}
                </button>

            </div>

            <div className="w-full space-y-6 px-4">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 text-[var(--muted)]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="sub-heading">Followers</span>
                    </div>
                    <span className="font-bold text-[var(--text)] sub-heading">{formatCount(followerCount)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 text-[var(--muted)]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.45.77-1.5 1-2.15a3.5 3.5 0 0 0-3-4.5 3.5 3.5 0 0 0-4-3 3.5 3.5 0 0 0-4 3 3.5 3.5 0 0 0-3 4.5c.23.65 1 1.7 1 2.15V20a1 1 0 0 0 1 1Z" />
                            <path d="M6 17h12" />
                        </svg>
                        <span className="sub-heading">Recipes</span>
                    </div>
                    <span className="font-bold text-[var(--text)] sub-heading">{sellerData?.total_recipes || 0}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-3 text-[var(--muted)]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <span className="sub-heading">Rating</span>
                    </div>
                    <span className="font-bold text-[var(--text)] sub-heading">{sellerData?.rating || "Not Available"}</span>
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col items-start">
                    <div className="flex items-center space-x-3 text-[var(--muted)] mb-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                            <line x1="16" x2="16" y1="2" y2="6" />
                            <line x1="8" x2="8" y1="2" y2="6" />
                            <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span className="description">Member since</span>
                    </div>
                    <p className="font-bold text-[var(--text)] sub-heading ml-7">
                        {sellerData?.verification_submitted_at ? new Date(sellerData.verification_submitted_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Fetching date"}
                    </p>
                </div>

                <div className="pt-4 w-full text-left">
                    <span className="description text-[var(--muted)] font-medium mb-4 block">Connect</span>
                    <div className="flex space-x-4">
                        {(socialLinks?.facebook || socialLinks?.Facebook) && (
                            <a
                                href={formatSocialLink(socialLinks.facebook || socialLinks.Facebook, 'facebook')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#1877F2] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="Facebook"
                            >
                                <FaFacebook size={18} />
                            </a>
                        )}
                        {(socialLinks?.youtube || socialLinks?.YouTube) && (
                            <a
                                href={formatSocialLink(socialLinks.youtube || socialLinks.YouTube, 'youtube')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#FF0000] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="YouTube"
                            >
                                <FaYoutube size={18} />
                            </a>
                        )}
                        {(socialLinks?.tiktok || socialLinks?.TikTok) && (
                            <a
                                href={formatSocialLink(socialLinks.tiktok || socialLinks.TikTok, 'tiktok')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#000000] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="TikTok"
                            >
                                <FaTiktok size={18} />
                            </a>
                        )}
                        {(socialLinks?.instagram || socialLinks?.Instagram) && (
                            <a
                                href={formatSocialLink(socialLinks.instagram || socialLinks.Instagram, 'instagram')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#E4405F] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="Instagram"
                            >
                                <FaInstagram size={18} />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChefProfileCard;
