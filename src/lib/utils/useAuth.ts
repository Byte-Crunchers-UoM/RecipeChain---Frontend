import { useState, useEffect } from "react";

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(true);
    // Simulate the fraction of a second it takes a real app to check login status
    useEffect(()=>{
        const timer = setTimeout(()=> setIsLoading(false),500);
        return ()=> clearTimeout(timer)
    },[]);
    return{
        userId: "07c35d27-b6fc-4a1d-8534-e0cdf4db6138", 
        token: "fake-jwt-token-for-testing",
        isAuthenticated: false, // Change this to 'false' if you want to test the logged-out UI!
        isLoading
    };
};