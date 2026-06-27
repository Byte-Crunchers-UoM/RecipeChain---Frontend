"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "./NotificationContext";
import { followChef, getChefProfile } from "@/services/api";
import { FaFacebook, FaYoutube, FaTiktok, FaInstagram } from 'react-icons/fa';

const ChefProfileCard = ({ chefId: chefIdProp }: { chefId?: string } = {}) => {
    const [isFollowing, setIsFollowing] = useState(false);
    const [followerCount, setFollowerCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [sellerData, setSellerData] = useState<any>(null);
    const [socialLinks, setSocialLinks] = useState<any>(null);
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const chefId = chefIdProp ?? user?.user_id ?? null;
    const currentBuyerId = user?.user_id ?? null;

    useEffect(() => {
        const fetchSellerData = async () => {
            if (!chefId) {
                setSellerData(null);
                setSocialLinks(null);
                setFollowerCount(0);
                setIsVerified(false);
                return;
            }

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
                    setFollowerCount(profile.seller.followers_count ?? 0);
                    if (profile.seller.verify_badge_status === "verified") {
                        setIsVerified(true);
                    } else {
                        setIsVerified(false);
                    }
                }

                if (profile.socials) {
                    setSocialLinks(profile.socials);
                }
            } catch (error) {
                console.error("Error fetching chef data:", error);
            }
        };

        fetchSellerData();
    }, [chefId]);

    const handleFollowToggle = async () => {
        if (isLoading || !chefId || !currentBuyerId) return;

        if (!isFollowing) {
            setIsFollowing(true);
            setFollowerCount((prev) => prev + 1);
            setIsLoading(true);

            try {
                await followChef(chefId, currentBuyerId);

                // Simultaneous notifications on success
                addNotification("You are started to following new chef.", "success");
                addNotification("New buyer started following you.", "info");
            } catch (error) {
                // Revert on failure
                setIsFollowing(false);
                setFollowerCount((prev) => prev - 1);
                addNotification("Failed to follow chef. " + (error instanceof Error ? error.message : ""), "info");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Basic unfollow logic 
            setIsFollowing(false);
            setFollowerCount((prev) => prev - 1);
        }
    };

    const formatCount = (num: number) => {
        return num >= 1000 ? (num / 1000).toFixed(1) + "K" : num;
    };


    return (
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-6">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-[var(--secondary)]">
                    {/* Chef Image Placeholder */}
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
                {isVerified && (
                    <div className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--primary)]">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                )}
            </div>

            <h1 className="heading mb-1 text-[var(--text)]">{sellerData?.display_name || sellerData?.full_name || "Unknown Chef"}</h1>
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
                    disabled={!chefId || !currentBuyerId || isLoading}
                    className={`w-full py-3.5 rounded-2xl font-bold sub-heading transition-all shadow-lg ${isFollowing
                        ? "bg-[var(--secondary)] text-[var(--primary)] shadow-none"
                        : "bg-[var(--primary)] text-white hover:brightness-110 shadow-teal-100"
                        } ${(!chefId || !currentBuyerId || isLoading) ? "opacity-60 cursor-not-allowed hover:brightness-100" : ""}`}
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
                        {socialLinks?.Facebook && (
                            <a
                                href={socialLinks.Facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#1877F2] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="Facebook"
                            >
                                <FaFacebook size={18} />
                            </a>
                        )}
                        {socialLinks?.YouTube && (
                            <a
                                href={socialLinks.YouTube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#FF0000] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="YouTube"
                            >
                                <FaYoutube size={18} />
                            </a>
                        )}
                        {socialLinks?.TikTok && (
                            <a
                                href={socialLinks.TikTok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[var(--muted)] hover:bg-[#000000] hover:text-white transition-all cursor-pointer border border-gray-100"
                                title="TikTok"
                            >
                                <FaTiktok size={18} />
                            </a>
                        )}
                        {socialLinks?.Instagram && (
                            <a
                                href={socialLinks.Instagram}
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
