import mongoose, { Schema, Document } from 'mongoose';

export interface IVideoSummary extends Document {
  userId: mongoose.Types.ObjectId;
  videoUrl: string;
  videoId: string;
  title: string;
  transcript: string;
  summary: string;
  keyPoints: string[];
  language: string;
  duration: number;
  createdAt: Date;
}

const VideoSummarySchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL zorunludur'],
    trim: true
  },
  videoId: {
    type: String,
    required: [true, 'Video ID zorunludur'],
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Video başlığı zorunludur']
  },
  transcript: {
    type: String,
    required: [true, 'Transkript zorunludur']
  },
  summary: {
    type: String,
    required: [true, 'Özet zorunludur']
  },
  keyPoints: [{
    type: String
  }],
  language: {
    type: String,
    default: 'tr'
  },
  duration: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IVideoSummary>('VideoSummary', VideoSummarySchema); 