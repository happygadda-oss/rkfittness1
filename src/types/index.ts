export type MemberType = 'Paid' | 'Trial';
export type MemberStatus = 'Active' | 'Expired' | 'Pending';
export type PaymentMethod = 'Cash' | 'Online' | 'UPI' | 'Card' | '-';

export interface Member {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: MemberType;
  plan: string;
  joinDate: string;
  expiryDate: string;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  status: MemberStatus;
  appNumber?: string;
  notes?: string;
  gender?: 'Male' | 'Female' | 'Other';
}

export type EnquiryStatus = 'New' | 'Contacted' | 'Converted' | 'Lost';

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  planInterest: string;
  source: 'Walk-in' | 'Instagram' | 'Google' | 'Referral' | 'Phone';
  status: EnquiryStatus;
  createdAt: string;
  followUpDate?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  plan: string;
  paymentMethod: PaymentMethod;
  date: string;
  formattedTime?: string;
}

export type ExpenseCategory = 'Rent' | 'Salaries' | 'Utilities' | 'Equipment' | 'Maintenance' | 'Marketing' | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Gym Owner' | 'Head Trainer' | 'Cardio Trainer' | 'Receptionist' | 'Nutritionist';
  phone: string;
  email: string;
  salary: number;
  status: 'Active' | 'On Leave';
  joinDate: string;
}

export interface ActivityItem {
  id: string;
  type: 'joined' | 'paid' | 'enquiry' | 'renewed' | 'expense';
  memberName: string;
  detail: string; // e.g. "joined — cardio", "paid ₹4,500 — cardio"
  timeAgo: string;
  timestamp: number;
  iconType?: 'join' | 'payment' | 'enquiry' | 'expense';
}

export interface GymPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  description?: string;
  pricesByDuration?: {
    [key: number]: number; // 1: 1500, 3: 4200, 6: 7800, 12: 14000
  };
}

export interface GymProfile {
  name: string;
  code: string;
  ownerName: string;
  email: string;
  phone: string;
  currency: string;
  whatsappReminderTemplate: string;
  plans?: GymPlan[];
}

export type UserRole = 'owner' | 'staff' | 'receptionist' | 'trainer' | 'accountant';

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash?: string;
  createdAt?: string;
}
