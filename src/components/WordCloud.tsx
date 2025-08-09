'use client';

import { useMemo } from 'react';
import { brand } from '@/lib/brand';

interface WordFrequency {
  word: string;
  count: number;
}

interface WordCloudProps {
  responses: string[];
  className?: string;
}

export default function WordCloud({ responses, className = '' }: WordCloudProps) {
  const wordFrequencies = useMemo(() => {
    const words: { [key: string]: number } = {};
    
    // Common stop words to filter out
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'among', 'this', 'that', 'these', 'those', 'i',
      'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
      'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
      'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'having', 'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could',
      'can', 'may', 'might', 'must', 'shall'
    ]);
    
    responses.forEach(response => {
      if (!response) return;
      
      // Clean and split the text
      const cleanText = response
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      const wordsInResponse = cleanText.split(' ');
      
      wordsInResponse.forEach(word => {
        if (word.length > 2 && !stopWords.has(word)) {
          words[word] = (words[word] || 0) + 1;
        }
      });
    });
    
    // Convert to array and sort by frequency
    return Object.entries(words)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 words
  }, [responses]);

  const maxCount = wordFrequencies[0]?.count || 1;

  if (wordFrequencies.length === 0) {
    return (
      <div className={`${className} p-8 text-center text-gray-500`}>
        No text responses to analyze yet.
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: brand.text }}>
        Common Words in Responses
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {wordFrequencies.map(({ word, count }) => {
          const size = Math.max(0.8, (count / maxCount) * 2); // Scale from 0.8em to 2em
          const opacity = Math.max(0.4, count / maxCount);
          
          return (
            <span
              key={word}
              className="inline-block px-2 py-1 rounded-md cursor-default transition-all hover:scale-110"
              style={{
                fontSize: `${size}em`,
                backgroundColor: brand.primary + Math.floor(opacity * 255).toString(16).padStart(2, '0'),
                color: brand.bg,
                opacity,
              }}
              title={`${word}: ${count} times`}
            >
              {word}
            </span>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Showing top {wordFrequencies.length} words from {responses.length} responses
      </div>
    </div>
  );
}
