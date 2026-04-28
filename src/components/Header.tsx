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
            </div>
        </header>
    );
};

export default Header;
