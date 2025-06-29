import React, { useEffect, useState } from "react";

interface TypewriterEffectProps {
  words: string[];
  className?: string;
  typingSpeed?: number; // ms per char
  pauseTime?: number; // ms between words
}

/**
 * Lightweight Typewriter effect that loops through an array of words.
 */
export const TypewriterEffect: React.FC<TypewriterEffectProps> = ({
  words,
  className,
  typingSpeed = 80,
  pauseTime = 1500,
}) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fullText = words[currentWord];

    if (!isDeleting) {
      // typing
      if (displayText.length < fullText.length) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), pauseTime);
      }
    } else {
      // deleting
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(fullText.substring(0, displayText.length - 1));
        }, typingSpeed / 2);
      } else {
        setIsDeleting(false);
        setCurrentWord((prev) => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, words, currentWord, typingSpeed, pauseTime]);

  return (
    <span className={className}>
      {displayText}
      <span className="inline-block w-px bg-white animate-pulse ml-0.5" />
    </span>
  );
}; 