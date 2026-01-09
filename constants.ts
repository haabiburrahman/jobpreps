
import { Question, Category } from './types';

export const CATEGORIES = [
  { id: 'BCS', label: 'বিসিএস (BCS)', color: 'bg-purple-600', icon: '🏛️' },
  { id: 'BANK', label: 'ব্যাংক জব (Bank)', color: 'bg-emerald-600', icon: '🏦' },
  { id: 'PRIMARY', label: 'প্রাথমিক শিক্ষক (Primary)', color: 'bg-blue-600', icon: '🎓' },
  { id: 'OTHER', label: 'অন্যান্য (Other)', color: 'bg-orange-600', icon: '📄' },
];

export const SUB_CATEGORIES: Record<Category, string[]> = {
  BCS: ['বাংলা', 'ইংরেজি', 'গণিত', 'সাধারণ জ্ঞান', 'বিজ্ঞান'],
  BANK: ['English', 'Mathematics', 'General Knowledge', 'Computing', 'Bengali'],
  PRIMARY: ['বাংলা', 'ইংরেজি', 'গণিত', 'সাধারণ জ্ঞান'],
  OTHER: ['জেনারেল প্রশ্ন', 'মডেল টেস্ট'],
};

export const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    questionText: 'বাংলাদেশের সংবিধান কত তারিখে প্রবর্তিত হয়?',
    options: ['৪ নভেম্বর ১৯৭২', '১৬ ডিসেম্বর ১৯৭২', '১০ জানুয়ারি ১৯৭২', '২৬ মার্চ ১৯৭২'],
    correctAnswerIndex: 1,
    explanation: '১৬ ডিসেম্বর ১৯৭২ থেকে বাংলাদেশের সংবিধান কার্যকর বা প্রবর্তিত হয়।',
    category: 'BCS',
    subCategory: 'সাধারণ জ্ঞান',
    year: '2023',
    createdAt: Date.now()
  },
  {
    id: '2',
    questionText: 'Which one is the correct spelling?',
    options: ['Lietenant', 'Lieutanent', 'Lieutenant', 'Lieutenent'],
    correctAnswerIndex: 2,
    explanation: 'The correct spelling is Lieutenant. It means a deputy or substitute.',
    category: 'BCS',
    subCategory: 'ইংরেজি',
    year: '2022',
    createdAt: Date.now()
  },
  {
    id: '3',
    questionText: 'The headquarter of ADB is located in-',
    options: ['Bangkok', 'Tokyo', 'Manila', 'Jakarta'],
    correctAnswerIndex: 2,
    explanation: 'Asian Development Bank (ADB) is headquartered in Manila, Philippines.',
    category: 'BANK',
    subCategory: 'General Knowledge',
    year: '2021',
    createdAt: Date.now()
  }
];
