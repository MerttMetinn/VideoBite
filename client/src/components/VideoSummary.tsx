'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SummaryData } from "@/lib/utils/types";

interface VideoSummaryProps {
  data: SummaryData;
}

export default function VideoSummary({ data }: VideoSummaryProps) {
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  
  if (!data) return null;
  
  // Önemli terimleri render etme
  const renderImportantTerms = () => {
    if (!data.importantTerms || 
        (Array.isArray(data.importantTerms) && data.importantTerms.length === 0) ||
        (!Array.isArray(data.importantTerms) && Object.keys(data.importantTerms).length === 0)) {
      return null;
    }
    
    let terms: string[] = [];
    
    if (Array.isArray(data.importantTerms)) {
      terms = data.importantTerms;
    } else {
      terms = Object.keys(data.importantTerms);
    }
    
    if (terms.length === 0) return null;
    
    return (
      <div>
        <h3 className="text-lg font-semibold mb-2">Önemli Terimler</h3>
        <div className="flex flex-wrap gap-2">
          {terms.map((term, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
            >
              {term}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-start justify-between">
            <span>{data.title}</span>
          </CardTitle>
          {data.channelTitle && (
            <CardDescription>
              {data.channelTitle}
            </CardDescription>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Özet bölümü */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Özet</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{data.summary}</p>
          </div>
          
          {/* Anahtar noktalar */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Anahtar Noktalar</h3>
            <ul className="list-disc pl-5 space-y-1">
              {data.keyPoints.map((point, index) => (
                <li key={index} className="text-gray-700 dark:text-gray-300">
                  {point}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Önemli terimler varsa */}
          {renderImportantTerms()}
          
          {/* Transkript varsa */}
          {data.transcript && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Transkript</h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowFullTranscript(!showFullTranscript)}
                >
                  {showFullTranscript ? 'Kısalt' : 'Tamamını Göster'}
                </Button>
              </div>
              <div className={`text-gray-700 dark:text-gray-300 text-sm whitespace-pre-line ${!showFullTranscript ? 'max-h-32 overflow-hidden' : ''}`}>
                {data.transcript}
              </div>
              {!showFullTranscript && data.transcript.length > 200 && (
                <div className="text-center mt-2">
                  <span className="text-sm text-gray-500">...</span>
                </div>
              )}
            </div>
          )}
          
          {/* YouTube video linki */}
          <div className="pt-4">
            <a
              href={`https://www.youtube.com/watch?v=${data.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              YouTube&apos;da İzle
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 