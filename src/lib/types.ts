export const preferenceOptions = [
  "美食",
  "摄影",
  "自然风光",
  "历史文化",
  "亲子",
  "购物",
  "休闲"
] as const;

export type Preference = (typeof preferenceOptions)[number];

export type PlannerInput = {
  origin: string;
  destination: string;
  viaCities?: string[];
  departDate: string;
  returnDate: string;
  totalBudget: number;
  travelers: number;
  preferences: Preference[];
};

export type Coordinates = {
  lng: number;
  lat: number;
};

export type WeatherForecast = {
  city: string;
  date: string;
  condition: string;
  temperatureMin: number;
  temperatureMax: number;
  rainChance: number;
  tips: string;
  source?: string;
};

export type TransportOption = {
  from: string;
  to: string;
  mode: "飞机" | "高铁" | "火车" | "自驾" | "巴士";
  duration: string;
  price: number;
  provider: string;
  departure: string;
  arrival: string;
  reason: string;
  source?: string;
};

export type Attraction = {
  city: string;
  name: string;
  rating: number;
  ticketPrice: number;
  openHours: string;
  durationHours: number;
  tags: string[];
  coordinates: Coordinates;
  source?: string;
};

export type Hotel = {
  city: string;
  name: string;
  rating: number;
  pricePerNight: number;
  distanceToCenterKm: number;
  address: string;
  source?: string;
};

export type FoodSpot = {
  city: string;
  name: string;
  cuisine: string;
  signatureDish: string;
  averageCost: number;
  rating: number;
  source?: string;
};

export type WebSearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export type DayPlan = {
  day: number;
  date: string;
  city: string;
  title: string;
  weather?: WeatherForecast;
  morning: string;
  afternoon: string;
  evening: string;
  attractions: Attraction[];
  food: FoodSpot[];
  cityTransport: string;
  estimatedBudget: number;
  notes: string[];
};

export type BudgetSummary = {
  transport: number;
  hotels: number;
  attractions: number;
  food: number;
  localTransport: number;
  buffer: number;
  total: number;
  perPerson: number;
  withinBudget: boolean;
};

export type RouteStop = {
  city: string;
  coordinates: Coordinates;
};

export type TravelPlan = {
  id?: string;
  input: PlannerInput;
  route: RouteStop[];
  transports: TransportOption[];
  hotels: Hotel[];
  attractions: Attraction[];
  food: FoodSpot[];
  weather: WeatherForecast[];
  days: DayPlan[];
  budget: BudgetSummary;
  notices: string[];
  generatedAt: string;
};

export type AgentContext = {
  input: PlannerInput;
  cities: string[];
  route: RouteStop[];
  transports?: TransportOption[];
  weather?: WeatherForecast[];
  attractions?: Attraction[];
  hotels?: Hotel[];
  food?: FoodSpot[];
  days?: DayPlan[];
  budget?: BudgetSummary;
  notices?: string[];
  searchResults?: Record<string, WebSearchResult[]>;
};
