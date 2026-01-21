/**
 * SMS Marketing Templates Types
 * Pre-built and AI-generated SMS templates for auto shop marketing
 */

export type SMSCategory = 'reminder' | 'promotion' | 'follow-up' | 'appointment' | 'thank-you' | 'seasonal';

export interface SMSTemplate {
  id: string;
  name: string;
  category: SMSCategory;
  template: string;
  variables: string[]; // e.g., ['name', 'service', 'date']
  characterCount: number;
  segmentCount: number; // SMS segments (160 chars each)
}

export interface GenerateSMSInput {
  category: SMSCategory;
  context: string;
  customerName?: string;
  serviceName?: string;
  offerDetails?: string;
  appointmentDate?: string;
  tone?: 'friendly' | 'professional' | 'urgent';
  includeLink?: boolean;
}

export interface SMSResult {
  message: string;
  characterCount: number;
  segmentCount: number;
  variables: Record<string, string>;
}

// Pre-built templates
export const SMS_TEMPLATES: SMSTemplate[] = [
  // Reminders
  {
    id: 'reminder-appointment',
    name: 'Appointment Reminder',
    category: 'reminder',
    template: 'Hi {name}! Just a reminder about your appointment at {shop} on {date} at {time}. Reply YES to confirm or call us to reschedule.',
    variables: ['name', 'shop', 'date', 'time'],
    characterCount: 140,
    segmentCount: 1,
  },
  {
    id: 'reminder-maintenance',
    name: 'Maintenance Due',
    category: 'reminder',
    template: '{name}, your {vehicle} is due for {service}! Schedule now to keep your car running smoothly. Call or text us to book: {phone}',
    variables: ['name', 'vehicle', 'service', 'phone'],
    characterCount: 145,
    segmentCount: 1,
  },
  {
    id: 'reminder-pickup',
    name: 'Vehicle Ready',
    category: 'reminder',
    template: 'Great news {name}! Your {vehicle} is ready for pickup at {shop}. Were open until {time} today. See you soon!',
    variables: ['name', 'vehicle', 'shop', 'time'],
    characterCount: 130,
    segmentCount: 1,
  },

  // Promotions
  {
    id: 'promo-oil-change',
    name: 'Oil Change Special',
    category: 'promotion',
    template: '{name}! Get {discount}% off your next oil change at {shop}. Offer valid through {expiry}. Book now: {link}',
    variables: ['name', 'discount', 'shop', 'expiry', 'link'],
    characterCount: 120,
    segmentCount: 1,
  },
  {
    id: 'promo-seasonal',
    name: 'Seasonal Special',
    category: 'promotion',
    template: '{season} Special at {shop}! {offer}. Limited time - schedule today. Reply BOOK or call {phone}',
    variables: ['season', 'shop', 'offer', 'phone'],
    characterCount: 130,
    segmentCount: 1,
  },
  {
    id: 'promo-referral',
    name: 'Referral Reward',
    category: 'promotion',
    template: 'Thanks for being a loyal customer {name}! Refer a friend and you BOTH get {reward}. Share this code: {code}',
    variables: ['name', 'reward', 'code'],
    characterCount: 125,
    segmentCount: 1,
  },

  // Follow-ups
  {
    id: 'followup-service',
    name: 'Post-Service Check',
    category: 'follow-up',
    template: 'Hi {name}, hows your {vehicle} running after the {service}? Wed love your feedback! Reply or leave us a review: {link}',
    variables: ['name', 'vehicle', 'service', 'link'],
    characterCount: 145,
    segmentCount: 1,
  },
  {
    id: 'followup-estimate',
    name: 'Estimate Follow-up',
    category: 'follow-up',
    template: 'Hi {name}, following up on your estimate for {service}. Ready to schedule? Were here to help - just reply or call {phone}',
    variables: ['name', 'service', 'phone'],
    characterCount: 140,
    segmentCount: 1,
  },

  // Appointments
  {
    id: 'appt-confirmation',
    name: 'Booking Confirmed',
    category: 'appointment',
    template: 'Confirmed! {name}, your {service} is scheduled for {date} at {time} at {shop}. Well see you then!',
    variables: ['name', 'service', 'date', 'time', 'shop'],
    characterCount: 115,
    segmentCount: 1,
  },
  {
    id: 'appt-reschedule',
    name: 'Reschedule Request',
    category: 'appointment',
    template: 'Hi {name}, we need to reschedule your {service} appointment. Please call {phone} or reply with a good time for you.',
    variables: ['name', 'service', 'phone'],
    characterCount: 130,
    segmentCount: 1,
  },

  // Thank You
  {
    id: 'thanks-visit',
    name: 'Thank You Visit',
    category: 'thank-you',
    template: 'Thank you for choosing {shop}, {name}! We appreciate your business. Questions about your {service}? Just reply to this text.',
    variables: ['shop', 'name', 'service'],
    characterCount: 140,
    segmentCount: 1,
  },
  {
    id: 'thanks-review',
    name: 'Review Request',
    category: 'thank-you',
    template: 'Thanks {name}! If you loved your experience at {shop}, wed be grateful for a review: {link}. It helps us a lot!',
    variables: ['name', 'shop', 'link'],
    characterCount: 130,
    segmentCount: 1,
  },

  // Seasonal
  {
    id: 'seasonal-winter',
    name: 'Winter Prep',
    category: 'seasonal',
    template: 'Winter is coming! {name}, is your {vehicle} ready? Book a winter check at {shop} - includes battery, tires & more. {phone}',
    variables: ['name', 'vehicle', 'shop', 'phone'],
    characterCount: 145,
    segmentCount: 1,
  },
  {
    id: 'seasonal-summer',
    name: 'Summer Road Trip',
    category: 'seasonal',
    template: 'Road trip ready? {name}, get your {vehicle} summer-checked at {shop}! AC, tires, fluids & more. Book: {phone}',
    variables: ['name', 'vehicle', 'shop', 'phone'],
    characterCount: 135,
    segmentCount: 1,
  },
];

// Calculate SMS segments (160 chars per segment)
export function calculateSegments(text: string): number {
  return Math.ceil(text.length / 160);
}

// Fill template with variables
export function fillTemplate(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
}
