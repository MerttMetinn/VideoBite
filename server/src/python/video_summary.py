#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import re
import json
import argparse
from typing import Dict, List, Any, Optional, Tuple

import openai
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter
from dotenv import load_dotenv

# .env dosyasından çevre değişkenlerini yükle
load_dotenv()

# OpenAI API anahtarı
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def extract_video_id(url: str) -> Optional[str]:
    """YouTube URL'sinden video ID'sini çıkarır.
    
    Args:
        url: YouTube video URL'si
        
    Returns:
        Video ID veya None
    """
    pattern = r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else None

def get_transcript(video_id: str, language: str = 'tr') -> str:
    """YouTube videosu için transkript alır.
    
    Args:
        video_id: YouTube video ID'si
        language: Transkript dili kodu
        
    Returns:
        Video transkripti (metin)
    """
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Belirtilen dilde transkript var mı kontrol et
        try:
            transcript = transcript_list.find_transcript([language])
        except:
            # Belirtilen dilde transkript yoksa, mevcut transkriptlerden birini al ve çevir
            transcript = transcript_list.find_transcript(['en'])
            transcript = transcript.translate(language)
        
        formatter = TextFormatter()
        formatted_transcript = formatter.format_transcript(transcript.fetch())
        
        return formatted_transcript
    except Exception as e:
        print(f"Transkript alınırken hata oluştu: {str(e)}")
        return ""

def summarize_with_openai(transcript: str, video_title: str = "", language: str = 'tr') -> Dict[str, Any]:
    """OpenAI API kullanarak transkripti özetler.
    
    Args:
        transcript: Video transkripti
        video_title: Video başlığı
        language: Özet dili
        
    Returns:
        Özet bilgilerini içeren sözlük
    """
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API anahtarı bulunamadı. .env dosyasında OPENAI_API_KEY tanımladığınızdan emin olun.")
    
    openai.api_key = OPENAI_API_KEY
    
    # Transkript çok uzunsa kısalt
    max_tokens = 14000  # GPT-3.5 için maksimum giriş token sayısı
    if len(transcript) > max_tokens * 4:  # Kabaca 4 karakter = 1 token
        transcript = transcript[:max_tokens * 4]
    
    # Dile göre istek mesajı
    if language == 'tr':
        system_message = f"""Bir YouTube videosunun transkriptini özetleme görevin var. Aşağıdaki adımları takip et:
1. Transkripti kapsamlı bir şekilde analiz et
2. Ana konuyu belirlediğin 2-3 cümlelik kısa bir özet oluştur
3. Videodan öğrenilen 5-7 anahtar noktayı madde işaretleriyle listele
4. Önemli terimleri ve tanımları belirle

Yanıtını şu JSON formatında döndür:
{{
  "summary": "Ana özet metni burada",
  "keyPoints": ["Anahtar nokta 1", "Anahtar nokta 2", ...],
  "importantTerms": {{"terim1": "açıklama1", "terim2": "açıklama2", ...}}
}}

Video başlığı: {video_title if video_title else 'Belirtilmemiş'}
"""
    else:
        system_message = f"""Your task is to summarize a YouTube video transcript. Follow these steps:
1. Analyze the transcript comprehensively
2. Create a concise 2-3 sentence summary identifying the main topic
3. List 5-7 key points learned from the video using bullet points
4. Identify important terms and definitions

Return your response in this JSON format:
{{
  "summary": "Main summary text here",
  "keyPoints": ["Key point 1", "Key point 2", ...],
  "importantTerms": {{"term1": "description1", "term2": "description2", ...}}
}}

Video title: {video_title if video_title else 'Not specified'}
"""
    
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo-16k",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": transcript}
            ],
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    except Exception as e:
        print(f"OpenAI API ile özet oluşturulurken hata oluştu: {str(e)}")
        # Hata durumunda basit bir özet döndür
        return {
            "summary": "Özet oluşturulamadı.",
            "keyPoints": ["Özet oluşturulamadı"],
            "importantTerms": {}
        }

def main():
    """Ana program fonksiyonu"""
    parser = argparse.ArgumentParser(description='YouTube video transkript özeti')
    parser.add_argument('--url', type=str, help='YouTube video URL')
    parser.add_argument('--video_id', type=str, help='YouTube video ID')
    parser.add_argument('--language', type=str, default='tr', help='Dil kodu (örn. tr, en)')
    parser.add_argument('--title', type=str, default='', help='Video başlığı')
    
    args = parser.parse_args()
    
    video_id = None
    if args.url:
        video_id = extract_video_id(args.url)
    elif args.video_id:
        video_id = args.video_id
    
    if not video_id:
        print("Geçerli bir YouTube URL'si veya video ID'si sağlanmalıdır.")
        sys.exit(1)
    
    transcript = get_transcript(video_id, args.language)
    
    if not transcript:
        print("Transkript alınamadı.")
        sys.exit(1)
    
    summary_data = summarize_with_openai(transcript, args.title, args.language)
    
    # JSON formatında çıktı ver
    print(json.dumps(summary_data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main() 