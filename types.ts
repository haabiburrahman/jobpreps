export type Category = 'BCS' | 'BANK' | 'PRIMARY' | 'OTHER';

export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  category: Category;
  subCategory: string;
  year: string;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
  bookmarks: string[]; // IDs of bookmarked questions
  activity: {
    type: 'QUIZ' | 'STUDY';
    label: string;
    timestamp: number;
    score?: number;
    total?: number;
  }[];
}

export type AppView = 'HOME' | 'QUIZ' | 'ADMIN' | 'AUTH' | 'STATS' | 'YEAR_LIST' | 'SUB_CATEGORY_LIST' | 'BOOKMARKS';