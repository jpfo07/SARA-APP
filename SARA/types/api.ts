export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  createdAt: string;
}

export interface FloodAlert {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  waterLevel: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyCheckin {
  id: number;
  userId: number;
  status: 'safe' | 'help_needed' | 'evacuating';
  message?: string;
  location: string;
  createdAt: string;
}

export interface SafeRoute {
  id: number;
  name: string;
  description: string;
  startPoint: string;
  endPoint: string;
  shelterPoints: string[];
  isActive: boolean;
  difficulty: 'easy' | 'moderate' | 'difficult';
}