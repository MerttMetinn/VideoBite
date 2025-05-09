#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
VideoBite Veri İşleme Pipeline'ı
Bu modül, YouTube transkriptlerini işlemek için bir pipeline sağlar.
"""

import re
import nltk
import json
from typing import Dict, List, Any, Optional, Tuple
from collections import Counter
from dataclasses import dataclass
import logging

# NLTK verilerini yükle (ilk çalıştırmada gerekli)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')

try:
    from nltk.corpus import stopwords
    STOP_WORDS = set(stopwords.words('english') + stopwords.words('turkish'))
except:
    STOP_WORDS = set()


@dataclass
class TranscriptSegment:
    """Transkript segment sınıfı"""
    text: str
    start: float
    duration: float


@dataclass
class ProcessedTranscript:
    """İşlenmiş transkript veri sınıfı"""
    full_text: str
    segments: List[TranscriptSegment]
    sentences: List[str]
    language: str
    word_count: int
    duration: float
    important_terms: List[Tuple[str, int]]
    paragraphs: List[str]


class TranscriptProcessor:
    """Transkript işleme pipeline'ı"""
    
    def __init__(self, min_segment_char_length: int = 100):
        self.min_segment_char_length = min_segment_char_length
        self.logger = logging.getLogger(__name__)
    
    def clean_text(self, text: str) -> str:
        """Metni temizler
        
        Args:
            text: Temizlenecek metin
            
        Returns:
            Temizlenmiş metin
        """
        # Fazla boşlukları kaldır
        text = re.sub(r'\s+', ' ', text)
        
        # Özel karakterleri düzelt
        text = re.sub(r'&amp;', '&', text)
        text = re.sub(r'&lt;', '<', text)
        text = re.sub(r'&gt;', '>', text)
        text = re.sub(r'&quot;', '"', text)
        text = re.sub(r'&#39;', "'", text)
        
        # Gereksiz tekrar eden noktalama işaretlerini kaldır
        text = re.sub(r'[.!?]{2,}', '.', text)
        
        # URL'leri kaldır
        text = re.sub(r'https?://\S+', '', text)
        
        # Diğer düzenlemeler
        text = text.strip()
        
        return text
    
    def detect_language(self, text: str) -> str:
        """Metinlerin dilini tespit eder (basit yöntem)
        
        Args:
            text: Dili tespit edilecek metin
            
        Returns:
            Dil kodu (örn. 'tr', 'en')
        """
        # Bu basit bir dil tespiti. Daha gelişmiş bir yöntem için
        # langdetect veya langid gibi kütüphaneler kullanılabilir
        turkish_chars = re.findall(r'[ğĞüÜşŞıİöÖçÇ]', text)
        
        # Türkçe karakter oranı
        if len(turkish_chars) > len(text) * 0.01:
            return 'tr'
        return 'en'
    
    def extract_paragraphs(self, segments: List[TranscriptSegment], 
                            min_segment_chars: int = 200) -> List[str]:
        """Transkript segmentlerinden paragraflara ayırır
        
        Args:
            segments: Transkript segmentleri listesi
            min_segment_chars: Minimum paragraf karakter sayısı
            
        Returns:
            Paragraflar listesi
        """
        paragraphs = []
        current_paragraph = ""
        
        for segment in segments:
            current_paragraph += segment.text + " "
            
            # Yeterli uzunluktaysa veya nokta varsa paragrafı tamamla
            if len(current_paragraph) >= min_segment_chars and current_paragraph.strip().endswith(('.', '!', '?')):
                paragraphs.append(current_paragraph.strip())
                current_paragraph = ""
        
        # Kalan kısmı paragraf olarak ekle
        if current_paragraph.strip():
            paragraphs.append(current_paragraph.strip())
            
        return paragraphs
    
    def extract_important_terms(self, text: str, top_n: int = 20) -> List[Tuple[str, int]]:
        """Metin içindeki önemli terimleri çıkarır
        
        Args:
            text: İşlenecek metin
            top_n: Çıkarılacak terim sayısı
            
        Returns:
            (terim, sıklık) tuple'larından oluşan liste
        """
        # Metni küçük harfe çevir ve kelimelere ayır
        words = re.findall(r'\b[a-zA-ZğĞüÜşŞıİöÖçÇ]{3,}\b', text.lower())
        
        # Dur kelimeleri çıkar
        filtered_words = [word for word in words if word not in STOP_WORDS]
        
        # En sık geçen terimleri bul
        word_counts = Counter(filtered_words)
        return word_counts.most_common(top_n)
    
    def segment_to_sentences(self, text: str) -> List[str]:
        """Metni cümlelere ayırır
        
        Args:
            text: Ayrılacak metin
            
        Returns:
            Cümleler listesi
        """
        return nltk.sent_tokenize(text)
    
    def process(self, transcript: List[Dict[str, Any]]) -> ProcessedTranscript:
        """Ana işleme fonksiyonu
        
        Args:
            transcript: YouTube Transcript API'den gelen transkript
            
        Returns:
            İşlenmiş transkript
        """
        self.logger.info("Transkript işleniyor...")
        
        # Segmentleri oluştur
        segments = []
        full_text = ""
        total_duration = 0
        
        for item in transcript:
            text = self.clean_text(item.get('text', ''))
            start = item.get('start', 0)
            duration = item.get('duration', 0)
            
            if text:
                segments.append(TranscriptSegment(text=text, start=start, duration=duration))
                full_text += text + " "
                total_duration += duration
        
        # Temiz tam metni oluştur
        full_text = self.clean_text(full_text)
        
        # Dili tespit et
        language = self.detect_language(full_text)
        
        # Cümlelere ayır
        sentences = self.segment_to_sentences(full_text)
        
        # Paragrafları oluştur
        paragraphs = self.extract_paragraphs(segments, self.min_segment_char_length)
        
        # Önemli terimleri çıkar
        important_terms = self.extract_important_terms(full_text)
        
        # Kelime sayısı
        word_count = len(full_text.split())
        
        self.logger.info(f"Transkript işlendi: {word_count} kelime, {len(sentences)} cümle, {len(paragraphs)} paragraf")
        
        return ProcessedTranscript(
            full_text=full_text,
            segments=segments,
            sentences=sentences,
            language=language,
            word_count=word_count,
            duration=total_duration,
            important_terms=important_terms,
            paragraphs=paragraphs
        )


def format_transcript_for_openai(processed_transcript: ProcessedTranscript, video_title: str = "") -> Dict[str, Any]:
    """İşlenmiş transkripti OpenAI için formatlar
    
    Args:
        processed_transcript: İşlenmiş transkript
        video_title: Video başlığı
        
    Returns:
        OpenAI'ya gönderilecek veriler
    """
    # İstatistikler
    stats = {
        "word_count": processed_transcript.word_count,
        "duration_seconds": processed_transcript.duration,
        "duration_minutes": round(processed_transcript.duration / 60, 2),
        "sentence_count": len(processed_transcript.sentences),
        "paragraph_count": len(processed_transcript.paragraphs),
        "language": processed_transcript.language
    }
    
    # Önemli terimler
    important_terms = {}
    for term, count in processed_transcript.important_terms[:10]:
        important_terms[term] = count
    
    # Tam metin
    full_text = processed_transcript.full_text
    
    # Paragraflar (daha organize bir yapı için)
    paragraphs = processed_transcript.paragraphs
    
    return {
        "title": video_title,
        "statistics": stats,
        "important_terms": important_terms,
        "full_text": full_text,
        "paragraphs": paragraphs
    }


# Test etmek için
if __name__ == "__main__":
    import sys
    
    # Test transkript
    test_transcript = [
        {"text": "Merhaba arkadaşlar, bugün size yapay zeka konusunda bilgiler vereceğim.", "start": 0.0, "duration": 5.0},
        {"text": "Yapay zeka, insan zekasını taklit eden sistemlerdir.", "start": 5.0, "duration": 4.0},
        {"text": "Makine öğrenmesi, yapay zekanın bir alt dalıdır.", "start": 9.0, "duration": 3.5}
    ]
    
    # İşle
    processor = TranscriptProcessor()
    processed = processor.process(test_transcript)
    
    # Formatla
    formatted = format_transcript_for_openai(processed, "Yapay Zeka Eğitimi")
    
    # Çıktı
    print(json.dumps(formatted, ensure_ascii=False, indent=2)) 