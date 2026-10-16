"use client";

import React, { useState, useEffect } from "react";

interface DecryptTextProps {
  text: string;
  className?: string;
  speed?: number;
  characters?: string;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_#@*&%:;<>~/+!";

export function DecryptText({
  text,
  className = "",
  speed = 30,
  characters = GLYPHS
}: DecryptTextProps) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "/" || char === ":" || char === "-") return char;
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, characters]);

  return <span className={className}>{displayText}</span>;
}
