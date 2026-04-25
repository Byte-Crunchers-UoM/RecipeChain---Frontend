"use client";

import React from "react";
import Image from "next/image";
import logo from "../../Recipe Chain logo.png";

const Header = () => {
    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
            <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center space-x-2">
                    {/* Logo */}
                    <div className="flex items-center justify-center">
                        <Image src={logo} alt="RecipeChain Logo" width={150} height={150} className="h-16 w-auto object-contain" priority quality={100} />
                    </div>
                    <span className="font-bold text-xl text-[var(--text)]">RecipeChain</span>
                </div>

                <div className="max-w-md w-full ml-12 relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for chef"
                        className="w-full bg-[var(--background)] border-transparent focus:bg-white focus:border-[var(--primary)] rounded-full py-2.5 pl-12 pr-4 text-[var(--text)] description focus:outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center space-x-6">
                <button className="relative p-2 text-[var(--muted)] hover:bg-gray-50 rounded-full transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full border-2 border-white"></span>
                </button>

                <button className="relative p-2 text-[var(--muted)] hover:bg-gray-50 rounded-full transition-all">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <div className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                        2
                    </div>
                </button>

                <div className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-50 rounded-full transition-all">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                        JD
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
