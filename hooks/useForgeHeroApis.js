// hooks/useForgeHeroApis.js

import { useState } from 'react';
import { useStory } from '../context/StoryContext';

export default function useForgeHeroApis(heroDetails, setSharedResponse) {
    const { apiKeys } = useStory();
    const [isImageLoading_local, setIsImageLoading_local] = useState(false);
    const [isNameLoading, setIsNameLoading] = useState(false);
    const [isHeroSurpriseLoading, setIsHeroSurpriseLoading] = useState(false);

    const [heroImageUrl, setHeroImageUrl] = useState('');
    const [generatedName, setGeneratedName] = useState('');
    const [suggestedNames, setSuggestedNames] = useState([]);
    const [surpriseHeroDetails, setSurpriseHeroDetails] = useState(null);

    const generateRealImage = async (prompt) => {
        setIsImageLoading_local(true);
        setSharedResponse("The forge hums with power... a new image is being crafted!");

        try {
            const response = await fetch('/api/generateImage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-api-key': apiKeys.openai
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Image generation failed on the server.');
            }

            const data = await response.json();
            setHeroImageUrl(data.imageUrl);
            setSharedResponse("Behold, the hero’s face shines with living light! ✨🖼️");
        } catch (error) {
            console.error("Image generation failed:", error);
            setSharedResponse("The forge has grown cold. An error occurred.");
            setHeroImageUrl(null);
        } finally {
            setIsImageLoading_local(false);
        }
    };

    const generateAIName = async (type) => {
        setIsNameLoading(true);
        setSharedResponse("By the power of starlight, a name is born!");

        try {
            const response = await fetch('/api/generateName', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-api-key': apiKeys.openai
                },
                body: JSON.stringify({ type, gender: heroDetails.gender }),
            });

            if (!response.ok) {
                throw new Error('Name generation failed.');
            }

            const data = await response.json();
            setGeneratedName(data.name);
            setSharedResponse(`Behold! The hero's name is ${data.name}! Do you approve?`);
        } catch (error) {
            console.error("Name generation failed:", error);
            setSharedResponse("The magical winds are silent. An error occurred.");
            setGeneratedName('');
        } finally {
            setIsNameLoading(false);
        }
    };

    const generateSuggestedNames = async () => {
        setIsNameLoading(true);
        setSharedResponse("The winds of inspiration whisper... what names shall they carry?");

        try {
            const response = await fetch('/api/suggestNames', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-api-key': apiKeys.openai
                },
                body: JSON.stringify({ gender: heroDetails.gender }),
            });

            if (!response.ok) {
                throw new Error('Name suggestions failed.');
            }

            const data = await response.json();
            setSuggestedNames(data.names);
        } catch (error) {
            console.error("Name suggestions failed:", error);
            setSharedResponse("The magical winds are silent. An error occurred.");
            setSuggestedNames([]);
        } finally {
            setIsNameLoading(false);
        }
    };

    const generateSurpriseHero = async (heroType) => {
        setIsHeroSurpriseLoading(true);
        setSharedResponse("A hero, conjured from the void!");

        try {
            const response = await fetch('/api/surpriseHeroDetails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-openai-api-key': apiKeys.openai
                },
                body: JSON.stringify({ heroType }),
            });

            if (!response.ok) {
                throw new Error('Surprise hero generation failed.');
            }

            const data = await response.json();
            setSurpriseHeroDetails(data.heroDetails);
        } catch (error) {
            console.error("Surprise hero generation failed:", error);
            setSharedResponse("The forge has grown cold. An error occurred.");
            setSurpriseHeroDetails(null);
        } finally {
            setIsHeroSurpriseLoading(false);
        }
    };

    return {
        isImageLoading_local,
        isNameLoading,
        isHeroSurpriseLoading,
        heroImageUrl,
        setHeroImageUrl,
        generatedName,
        setGeneratedName,
        suggestedNames,
        setSuggestedNames,
        surpriseHeroDetails,
        setSurpriseHeroDetails,
        generateRealImage,
        generateAIName,
        generateSuggestedNames,
        generateSurpriseHero,
    };
}