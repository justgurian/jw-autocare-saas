// Automotive-relevant holidays and seasonal events
export interface SeasonalEvent {
  name: string;
  date: string; // Format: "MM-DD" or "variable" for floating holidays
  type: 'holiday' | 'seasonal' | 'automotive' | 'community';
  marketingAngle: string;
}

export const SEASONAL_EVENTS: Record<number, SeasonalEvent[]> = {
  1: [
    { name: "New Year's Day", date: '01-01', type: 'holiday', marketingAngle: 'New year vehicle resolutions, winter checkup specials' },
    { name: 'Winter Driving Safety Month', date: 'variable', type: 'seasonal', marketingAngle: 'Battery checks, winter tire inspections, heating system' },
    { name: 'Martin Luther King Jr. Day', date: 'variable', type: 'holiday', marketingAngle: 'Community service, giving back' },
  ],
  2: [
    { name: "Valentine's Day", date: '02-14', type: 'holiday', marketingAngle: 'Show your car some love, couples date night packages' },
    { name: "Presidents' Day", date: 'variable', type: 'holiday', marketingAngle: 'President Day sales, patriotic themes' },
    { name: 'National Battery Day', date: '02-18', type: 'automotive', marketingAngle: 'Free battery checks, battery replacement specials' },
  ],
  3: [
    { name: 'Spring Forward (Daylight Saving)', date: 'variable', type: 'seasonal', marketingAngle: 'Time to spring forward with vehicle maintenance' },
    { name: "St. Patrick's Day", date: '03-17', type: 'holiday', marketingAngle: 'Lucky deals, green-themed promotions' },
    { name: 'National Spring Cleaning Week', date: 'variable', type: 'seasonal', marketingAngle: 'Spring vehicle detailing, undercarriage cleaning' },
  ],
  4: [
    { name: 'National Car Care Month', date: 'variable', type: 'automotive', marketingAngle: 'Full vehicle inspections, spring maintenance packages' },
    { name: 'Earth Day', date: '04-22', type: 'community', marketingAngle: 'Eco-friendly services, emissions checks, hybrid expertise' },
    { name: 'Easter', date: 'variable', type: 'holiday', marketingAngle: 'Road trip prep, family travel safety' },
    { name: 'Tax Day', date: '04-15', type: 'seasonal', marketingAngle: 'Use your refund for vehicle maintenance' },
  ],
  5: [
    { name: 'National Tire Safety Week', date: 'variable', type: 'automotive', marketingAngle: 'Free tire inspections, alignment checks' },
    { name: "Mother's Day", date: 'variable', type: 'holiday', marketingAngle: 'Treat mom to a full service, safety for the family' },
    { name: 'Memorial Day', date: 'variable', type: 'holiday', marketingAngle: 'Summer road trip prep, honoring service members' },
    { name: 'AC Check Season Begins', date: 'variable', type: 'automotive', marketingAngle: 'AC system inspections before summer heat' },
  ],
  6: [
    { name: "Father's Day", date: 'variable', type: 'holiday', marketingAngle: "Gift cards for dad, guy's day special" },
    { name: 'Summer Road Trip Season', date: 'variable', type: 'seasonal', marketingAngle: 'Road trip inspections, vacation prep packages' },
    { name: 'National Safety Month', date: 'variable', type: 'automotive', marketingAngle: 'Brake inspections, safety system checks' },
  ],
  7: [
    { name: 'Independence Day', date: '07-04', type: 'holiday', marketingAngle: 'July 4th specials, patriotic themes, fireworks safety' },
    { name: 'Summer Heat Wave Prep', date: 'variable', type: 'seasonal', marketingAngle: 'Cooling system flush, AC performance checks' },
    { name: 'National Hot Dog Day', date: '07-17', type: 'community', marketingAngle: 'Fun engagement post, customer appreciation' },
  ],
  8: [
    { name: 'Back to School', date: 'variable', type: 'seasonal', marketingAngle: 'Student driver safety, teen car prep, parent peace of mind' },
    { name: 'National Automotive Service Professionals Week', date: 'variable', type: 'automotive', marketingAngle: 'Meet the team, technician spotlights' },
    { name: 'End of Summer Road Trip Season', date: 'variable', type: 'seasonal', marketingAngle: 'Post-road trip inspections' },
  ],
  9: [
    { name: 'Labor Day', date: 'variable', type: 'holiday', marketingAngle: 'Labor Day weekend travel, end of summer deals' },
    { name: 'Fall Car Care Month Begins', date: 'variable', type: 'automotive', marketingAngle: 'Winterization prep, fall maintenance packages' },
    { name: 'National Preparedness Month', date: 'variable', type: 'seasonal', marketingAngle: 'Emergency kit prep, breakdown prevention' },
  ],
  10: [
    { name: 'Fall Back (Daylight Saving Ends)', date: 'variable', type: 'seasonal', marketingAngle: 'Light checks, visibility inspections' },
    { name: 'Halloween', date: '10-31', type: 'holiday', marketingAngle: 'Spooky deals, scary car problem prevention' },
    { name: 'Car Care Month', date: 'variable', type: 'automotive', marketingAngle: 'Full vehicle winterization packages' },
  ],
  11: [
    { name: "Veteran's Day", date: '11-11', type: 'holiday', marketingAngle: 'Military discounts, honoring veterans' },
    { name: 'Thanksgiving', date: 'variable', type: 'holiday', marketingAngle: 'Travel prep, gratitude posts, Black Friday deals' },
    { name: 'Black Friday/Small Business Saturday', date: 'variable', type: 'seasonal', marketingAngle: 'Special deals, support local business' },
    { name: 'Winter Prep Season', date: 'variable', type: 'seasonal', marketingAngle: 'Battery tests, antifreeze checks, winter tires' },
  ],
  12: [
    { name: 'Christmas', date: '12-25', type: 'holiday', marketingAngle: 'Holiday travel safety, gift cards, year-end gratitude' },
    { name: "New Year's Eve", date: '12-31', type: 'holiday', marketingAngle: 'Year in review, safe celebration driving tips' },
    { name: 'Winter Driving Season', date: 'variable', type: 'seasonal', marketingAngle: 'Cold weather tips, emergency kits, winter maintenance' },
    { name: 'End of Year Specials', date: 'variable', type: 'seasonal', marketingAngle: 'Year-end clearance, use-it-or-lose-it deals' },
  ],
};

// State-specific seasonal considerations
export const STATE_SEASONAL_TIPS: Record<string, string[]> = {
  AZ: ['Extreme summer heat protection', 'Monsoon season prep (July-Sept)', 'Dust storm driving safety'],
  TX: ['Hurricane season prep', 'Extreme heat cooling systems', 'Winter storm readiness (rare but important)'],
  CA: ['Wildfire season air filter changes', 'Earthquake emergency kits', 'Smog check reminders'],
  FL: ['Hurricane season prep', 'Humidity and rust prevention', 'AC systems year-round'],
  CO: ['Mountain driving prep', 'Snow tire requirements', 'Altitude adjustments'],
  NY: ['Salt damage prevention', 'Winter tire changeovers', 'Pothole season repairs'],
  MI: ['Heavy snow prep', 'Road salt rust protection', 'Winter storage tips'],
  WA: ['Rainy season wiper maintenance', 'Hydroplaning prevention', 'Moss and mildew cleaning'],
  NV: ['Desert heat protection', 'Long distance travel prep', 'Dust and sand protection'],
  DEFAULT: ['Seasonal weather prep', 'Regular maintenance reminders', 'Safety inspections'],
};

export function getSeasonalEventsForMonth(month: number): SeasonalEvent[] {
  return SEASONAL_EVENTS[month] || [];
}

export function getStateTips(state: string): string[] {
  return STATE_SEASONAL_TIPS[state.toUpperCase()] || STATE_SEASONAL_TIPS.DEFAULT;
}

export function getSeasonName(month: number): string {
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Fall';
  return 'Winter';
}
