export type UserRole = 'donor' | 'ngo' | 'volunteer' | 'farmer' | 'admin';

export type FoodStatus = 'available' | 'claimed' | 'picked_up' | 'delivered' | 'expired';
export type RequestStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  location?: { lat: number; lng: number };
  createdAt: string;
}

export interface FoodDonation {
  id: string;
  donorId: string;
  donorName: string;
  foodName: string;
  description: string;
  quantity: string;
  unit: string;
  expiryTime: string;
  category: string;
  imageUrl?: string;
  location: { lat: number; lng: number; address: string };
  status: FoodStatus;
  claimedBy?: string;
  volunteerId?: string;
  createdAt: string;
}

export interface PickupRequest {
  id: string;
  donationId: string;
  ngoId: string;
  ngoName: string;
  volunteerId?: string;
  volunteerName?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FarmerProduct {
  id: string;
  farmerId: string;
  farmerName: string;
  productName: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category: string;
  imageUrl?: string;
  location: { lat: number; lng: number; address: string };
  isOrganic: boolean;
  createdAt: string;
}

export interface AnalyticsData {
  totalDonations: number;
  totalFoodSaved: number;
  totalPeopleServed: number;
  totalFarmersConnected: number;
  totalActiveVolunteers: number;
  donationsByMonth: { month: string; count: number }[];
  foodByCategory: { category: string; count: number }[];
  topDonors: { name: string; donations: number }[];
  recentActivity: { action: string; user: string; time: string }[];
}

export type PageRoute = 
  | 'home'
  | 'about'
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'donate-food'
  | 'available-food'
  | 'marketplace'
  | 'volunteer'
  | 'admin'
  | 'contact';
