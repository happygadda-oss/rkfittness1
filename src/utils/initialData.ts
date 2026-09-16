import type { Member, Enquiry, PaymentRecord, Expense, StaffMember, ActivityItem, GymProfile, GymPlan } from '../types';

export const defaultGymPlans: GymPlan[] = [
  {
    id: 'plan_cardio',
    name: 'Cardio Fitness',
    monthlyPrice: 1500,
    description: 'Access to cardio deck, treadmills, ellipticals & cross-trainers',
    pricesByDuration: {
      1: 1500,
      3: 4200,
      6: 7800,
      12: 14000
    }
  },
  {
    id: 'plan_weights',
    name: 'Weight Training & Strength',
    monthlyPrice: 1800,
    description: 'Free weights, power racks, machine section & strength arena',
    pricesByDuration: {
      1: 1800,
      3: 5000,
      6: 9200,
      12: 16500
    }
  },
  {
    id: 'plan_allaccess',
    name: 'Unlimited All Access Pass',
    monthlyPrice: 2500,
    description: 'Full gym access, cardio, strength, steam room & locker facilities',
    pricesByDuration: {
      1: 2500,
      3: 6800,
      6: 12500,
      12: 22000
    }
  },
  {
    id: 'plan_pt',
    name: 'Personal Training Package',
    monthlyPrice: 5000,
    description: 'Dedicated 1-on-1 personal trainer, custom workout plan & diet chart',
    pricesByDuration: {
      1: 5000,
      3: 14000,
      6: 26000,
      12: 48000
    }
  }
];

export const initialGymProfile: GymProfile = {
  name: 'Rk Fitness World',
  code: 'FLYMB001W2',
  ownerName: 'RK Admin',
  email: 'owner@rkfitnessworld.com',
  phone: '+919876543210',
  currency: '₹',
  whatsappReminderTemplate: 'Hello {NAME}, your membership for {PLAN} at Rk Fitness World is expiring on {EXPIRY}. Please renew to continue your workout regime!',
  plans: defaultGymPlans
};

// Pure empty datasets
export const initialMembers: Member[] = [];
export const initialEnquiries: Enquiry[] = [];
export const initialPayments: PaymentRecord[] = [];
export const initialExpenses: Expense[] = [];
export const initialStaff: StaffMember[] = [];
export const initialActivities: ActivityItem[] = [];
