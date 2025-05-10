'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic";
import { SummaryData, ApiResponse } from '@/lib/utils/types';

// Dinamik olarak bileşenleri yükle (client-side rendering)
const VideoSummaryForm = dynamic(() => import('@/components/VideoSummaryForm'), {
  ssr: false,
  loading: () => <p>Form yükleniyor...</p>
});

const VideoSummary = dynamic(() => import('@/components/VideoSummary'), {
  ssr: false,
  loading: () => <p>Özet yükleniyor...</p>
});

export default function VideoPage() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  
  const handleSummaryCreated = (data: ApiResponse) => {
    console.log('VideoPage tarafında alınan veri:', data);
    
    if (data && data.success) {
      if (data.summary) {
        console.log('Özet verisi alındı:', data.summary);
        setSummaryData(data.summary);
      } else if (data.data) {
        console.log('Data içinde veri alındı:', data.data);
        setSummaryData(data.data);
      }
    } else {
      console.error('Geçersiz veri formatı:', data);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Video Özeti</h1>
      
      <div className="mb-6">
        <VideoSummaryForm onSummaryCreated={handleSummaryCreated} />
      </div>
      
      {summaryData && (
        <div className="mb-10">
          <VideoSummary data={summaryData} />
        </div>
      )}
      
      <div className="mt-10 text-center">
        <Link href="/">
          <Button variant="outline">Ana Sayfaya Dön</Button>
        </Link>
      </div>
    </div>
  )
} 