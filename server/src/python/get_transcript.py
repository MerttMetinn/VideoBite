#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def get_transcript(video_id, language='tr'):
    """
    YouTube videosu için transkripti al ve JSON formatında döndür
    
    Args:
        video_id (str): YouTube video ID
        language (str): Transkript dili (varsayılan: 'tr')
    
    Returns:
        dict: Transkript bilgileri içeren sözlük
    """
    try:
        # Transkript al
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id, languages=[language])
        
        if not transcript_list:
            raise Exception("Belirtilen dilde transkript bulunamadı")
        
        # Tam transkripti birleştir
        full_transcript = ' '.join([item['text'] for item in transcript_list])
        
        # Formatlanmış segmentleri oluştur
        segments = [
            {
                'text': item['text'],
                'duration': item['duration'],
                'offset': item['start']
            }
            for item in transcript_list
        ]
        
        return {
            'fullTranscript': full_transcript,
            'segments': segments
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'fullTranscript': '',
            'segments': []
        }

if __name__ == "__main__":
    # Komut satırı argümanlarını al
    if len(sys.argv) < 2:
        sys.stderr.write("Kullanım: python get_transcript.py <video_id> [language]\n")
        sys.exit(1)
    
    video_id = sys.argv[1]
    language = sys.argv[2] if len(sys.argv) > 2 else 'tr'
    
    # Transkripti al
    result = get_transcript(video_id, language)
    
    # JSON formatında çıktı ver
    print(json.dumps(result, ensure_ascii=False)) 