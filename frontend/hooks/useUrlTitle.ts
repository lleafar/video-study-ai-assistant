import { useState } from "react";

export function useUrlTitle() {
    const [isLoading, setIsLoading] = useState(false);

    const getTitle = async (url: string): Promise<string> => {
        setIsLoading(true);
        try{
            const response = await fetch(
                `http://localhost:8000/api/get-title?url=${encodeURIComponent(url)}`
            );

            if (!response.ok) {
                throw new Error(`Error fetching title: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return data.title || url; // Return the title or the URL if title is not available
        }catch (error) {
            console.log("Error fetching title:", error);
            return url; // Return the URL if there's an error
        } finally {
            setIsLoading(false);
        }

    }

    return { getTitle, isLoading };
}