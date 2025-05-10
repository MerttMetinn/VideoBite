#!/usr/bin/env python
# -*- coding: utf-8 -*-

import json
import argparse
import sys
import re
import os
import requests
from typing import Dict, List, Any
from dotenv import load_dotenv
import time
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.formatters import TextFormatter

# .env dosyasından API anahtarını yükle
load_dotenv()
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

def extract_video_id(url):
    """YouTube URL'sinden video ID'sini çıkarır."""
    pattern = r'(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, url)
    return match.group(1) if match else None

def get_channel_videos(channel_id=None, max_results=10):
    """
    Belirtilen kanal ID'si için en son videoları çeker.
    Channel ID verilmezse, URL'den ID çıkarma işlemi yapılır.
    """
    if not YOUTUBE_API_KEY:
        print("Hata: YOUTUBE_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.", file=sys.stderr)
        sys.exit(1)
    
    if not channel_id:
        print("Kanal ID'si belirtilmedi. Sadece tek video için işlem yapılıyor.")
        return []
    
    url = 'https://www.googleapis.com/youtube/v3/search'
    video_records = []
    page_token = None
    
    try:
        # Sayfalama ile videoları çekelim
        while len(video_records) < max_results:
            params = {
                "key": YOUTUBE_API_KEY,
                "channelId": channel_id,
                "part": ["snippet", "id"],
                "order": "date",
                "maxResults": min(50, max_results - len(video_records)),
                "pageToken": page_token
            }
            
            response = requests.get(url, params=params)
            response_data = response.json()
            
            if 'items' not in response_data:
                break
                
            for item in response_data['items']:
                if item['id']['kind'] != "youtube#video":
                    continue
                    
                video_record = {
                    'video_id': item['id']['videoId'],
                    'title': item['snippet']['title'],
                    'published_at': item['snippet']['publishedAt'],
                    'channel_title': item['snippet']['channelTitle']
                }
                video_records.append(video_record)
            
            # Bir sonraki sayfa için token varsa devam et
            if 'nextPageToken' in response_data and len(video_records) < max_results:
                page_token = response_data['nextPageToken']
            else:
                break
                
            # API limitlerini aşmamak için kısa bir bekleme
            time.sleep(0.1)
                
        return video_records
        
    except Exception as e:
        print(f"Kanal videoları alınırken hata: {str(e)}", file=sys.stderr)
        return []

def get_video_details(video_id):
    """YouTube Data API v3 kullanarak video detaylarını alır."""
    if not YOUTUBE_API_KEY:
        print("Hata: YOUTUBE_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.", file=sys.stderr)
        sys.exit(1)
        
    url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id={video_id}&key={YOUTUBE_API_KEY}"
    
    try:
        response = requests.get(url)
        data = response.json()
        
        if not data.get('items'):
            print(f"Hata: Video bulunamadı (ID: {video_id})", file=sys.stderr)
            sys.exit(1)
            
        video_data = data['items'][0]
        snippet = video_data['snippet']
        
        return {
            'title': snippet['title'],
            'channel_title': snippet['channelTitle'],
            'description': snippet['description'],
            'published_at': snippet['publishedAt'],
            'tags': snippet.get('tags', []),
            'category_id': snippet.get('categoryId', ''),
            'duration': video_data['contentDetails'].get('duration', ''),
            'view_count': video_data['statistics'].get('viewCount', '0'),
            'like_count': video_data['statistics'].get('likeCount', '0')
        }
    except Exception as e:
        print(f"Hata: Video detayları alınırken bir sorun oluştu: {str(e)}", file=sys.stderr)
        sys.exit(1)

def get_video_transcript(video_id, language='tr'):
    """Video transkriptini çeker."""
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        # Belirtilen dilde transkript var mı kontrol et
        try:
            transcript = transcript_list.find_transcript([language])
        except:
            # Belirtilen dilde transkript yoksa, mevcut transkriptlerden birini al ve çevir
            try:
                transcript = transcript_list.find_transcript(['en'])
                transcript = transcript.translate(language)
            except Exception as e:
                print(f"Transkript çevirisi yapılamadı: {str(e)}", file=sys.stderr)
                # Çeviri yapılamazsa mevcut dilde devam et
                available_transcripts = list(transcript_list._transcripts.keys())
                if available_transcripts:
                    transcript = transcript_list.find_transcript([available_transcripts[0]])
                else:
                    raise Exception("Hiç transkript bulunamadı")
        
        formatter = TextFormatter()
        transcript_json = transcript.fetch()
        transcript_text = formatter.format_transcript(transcript_json)
        
        return {
            "text": transcript_text,
            "segments": transcript_json
        }
    except Exception as e:
        print(f"Transkript alınırken hata: {str(e)}", file=sys.stderr)
        return {"text": "", "segments": []}

def generate_summary(video_details, transcript):
    """Video detayları ve transkripte göre özet oluşturur."""
    title = video_details['title']
    channel = video_details['channel_title']
    description = video_details['description']
    tags = video_details.get('tags', [])
    transcript_text = transcript.get('text', '')
    
    # Transkript yoksa açıklamadan özet oluştur
    if not transcript_text:
        desc_sentences = description.split('.')
        short_desc = '.'.join(desc_sentences[:min(3, len(desc_sentences))]) + '.'
        
        if len(short_desc) < 50:
            summary = f"Bu video, {channel} kanalında yayınlanan '{title}' başlıklı bir içeriktir. Detaylı transkript bilgisi bulunmamaktadır."
        else:
            summary = short_desc
    else:
        # Transkriptten özet oluştur - şimdilik ilk birkaç cümleyi al
        transcript_sentences = transcript_text.split('.')
        summary = '.'.join(transcript_sentences[:min(5, len(transcript_sentences))]) + '.'
        
        # Özet çok kısaysa genel bir bilgi ekle
        if len(summary) < 100:
            summary += f" Bu video, {channel} tarafından oluşturulan {title} başlıklı içeriğin bir parçasıdır."
    
    # Anahtar noktalar oluştur
    key_points = []
    
    # Etiketlerden anahtar noktalar çıkar
    if tags and len(tags) > 0:
        for tag in tags[:min(3, len(tags))]:
            key_points.append(f"{tag} konusu videoda ele alınıyor.")
    
    # Açıklamadan anahtar noktalar çıkar
    desc_paragraphs = description.split('\n\n')
    for para in desc_paragraphs[:min(2, len(desc_paragraphs))]:
        if len(para) > 30:
            key_points.append(para.strip())
    
    # Transkriptten anahtar noktalar çıkar
    if transcript_text:
        transcript_parts = transcript_text.split('.')
        for i in range(0, len(transcript_parts), len(transcript_parts) // 5):
            if i < len(transcript_parts) and transcript_parts[i] and len(transcript_parts[i]) > 30:
                key_points.append(transcript_parts[i].strip() + '.')
    
    # İzlenme ve beğeni sayılarını ekle
    if int(video_details['view_count']) > 1000:
        key_points.append(f"Video şu ana kadar {int(video_details['view_count']):,} kez izlenmiş.")
    
    if int(video_details['like_count']) > 100:
        key_points.append(f"İzleyiciler videoyu {int(video_details['like_count']):,} kez beğenmiş.")
    
    # Eksik anahtar noktaları tamamla
    fallback_points = [
        f"{channel} kanalı içeriği profesyonel bir şekilde sunuyor.",
        "Video, konuyla ilgili önemli bilgiler içeriyor.",
        "İçerik, izleyicilere kapsamlı ve detaylı bilgiler sunmaktadır.",
        "Video, konu hakkında çeşitli örnekler ve açıklamalar içeriyor.",
        "İçerik, konuyu anlaşılır bir şekilde ele alıyor."
    ]
    
    while len(key_points) < 5:
        for point in fallback_points:
            if point not in key_points:
                key_points.append(point)
                break
        if len(key_points) >= 5:
            break
    
    # En iyi 5 anahtar noktayı seç
    key_points = key_points[:5]
    
    # Önemli terimleri belirle
    important_terms = {}
    
    # Kanalı ekle
    important_terms[channel] = "Video içeriğini oluşturan YouTube kanalı"
    
    # Başlıktan ve açıklamadan önemli terimleri ekle
    title_words = title.split()
    for word in title_words:
        if len(word) > 5 and word.lower() not in [term.lower() for term in important_terms.keys()]:
            important_terms[word] = "Video başlığında geçen önemli bir terim"
            if len(important_terms) >= 3:
                break
    
    # Etiketlerden önemli terimleri ekle
    if tags and len(tags) > 0:
        for i, tag in enumerate(tags[:min(3, len(tags))]):
            if tag.lower() not in [term.lower() for term in important_terms.keys()]:
                important_terms[tag] = f"Videoda bahsedilen önemli bir konu veya anahtar kelime"
                if len(important_terms) >= 5:
                    break
    
    return {
        "summary": summary,
        "keyPoints": key_points,
        "importantTerms": important_terms,
        "transcript": transcript_text[:500] + "..." if len(transcript_text) > 500 else transcript_text
    }

def main():
    # Argüman parser ayarları
    parser = argparse.ArgumentParser(description='YouTube Video Özeti Oluşturma Aracı')
    parser.add_argument('--url', type=str, help='YouTube video URL\'si')
    parser.add_argument('--video_id', type=str, help='YouTube video ID\'si')
    parser.add_argument('--channel_id', type=str, help='YouTube kanal ID\'si')
    parser.add_argument('--max_videos', type=int, default=10, help='Kanaldan alınacak maksimum video sayısı')
    parser.add_argument('--language', type=str, default='tr', help='Transkript dili (varsayılan: tr)')
    parser.add_argument('--title', type=str, default='', help='Video başlığı (opsiyonel)')
    
    args = parser.parse_args()
    
    # URL veya video_id veya channel_id olmalı
    if not args.url and not args.video_id and not args.channel_id:
        print("Hata: URL, video_id veya channel_id parametrelerinden biri gereklidir.", file=sys.stderr)
        sys.exit(1)
    
    results = []
    
    # Kanal ID'si verilmişse, kanalın videolarını işle
    if args.channel_id:
        videos = get_channel_videos(args.channel_id, args.max_videos)
        for video in videos:
            video_id = video['video_id']
            try:
                # Video detaylarını al
                video_details = get_video_details(video_id)
                # Transkript al
                transcript = get_video_transcript(video_id, args.language)
                # Özet oluştur
                summary_result = generate_summary(video_details, transcript)
                
                # Video bilgilerini ekle
                result = {
                    "video_id": video_id,
                    "title": video_details['title'],
                    "channel_title": video_details['channel_title'],
                    "summary": summary_result["summary"],
                    "keyPoints": summary_result["keyPoints"],
                    "importantTerms": summary_result["importantTerms"],
                    "transcript_excerpt": summary_result["transcript"]
                }
                results.append(result)
                
                # API limitlerini aşmamak için kısa bir bekleme
                time.sleep(0.5)
                
            except Exception as e:
                print(f"Video işlenirken hata ({video_id}): {str(e)}", file=sys.stderr)
                continue
    else:
        # Video ID'sini belirle
        video_id = args.video_id if args.video_id else extract_video_id(args.url)
        if not video_id:
            print("Hata: Geçerli bir YouTube video ID'si alınamadı.", file=sys.stderr)
            sys.exit(1)
        
        try:
            # YouTube API ile video detaylarını al
            video_details = get_video_details(video_id)
            
            # Transkript al
            transcript = get_video_transcript(video_id, args.language)
            
            # Video detaylarına göre özet oluştur
            summary_result = generate_summary(video_details, transcript)
            
            # Tek video için sonucu hazırla
            result = {
                "videoId": video_id,
                "title": video_details['title'],
                "channelTitle": video_details['channel_title'],
                "summary": summary_result["summary"],
                "keyPoints": summary_result["keyPoints"],
                "importantTerms": summary_result["importantTerms"],
                "transcriptExcerpt": summary_result["transcript"]
            }
            
            # JSON olarak çıktı ver
            print(json.dumps(result, ensure_ascii=False))
            sys.exit(0)
            
        except Exception as e:
            print(f"Hata oluştu: {str(e)}", file=sys.stderr)
            sys.exit(1)
    
    # Kanal için birden fazla video sonucu varsa
    if results:
        print(json.dumps({"videos": results}, ensure_ascii=False))
        sys.exit(0)

if __name__ == "__main__":
    main() 