// ============================================================
// Batur Tani — Core TypeScript Types
// B2B Agritech Marketplace Platform
// ============================================================

// ------------------------------------------------------------
// User & Authentication
// ------------------------------------------------------------

/** Platform user roles — farmers sell, buyers purchase */
export type UserRole = 'farmer' | 'buyer';

/** User profile stored in the 'profiles' table (extends Supabase auth.users) */
export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  business_name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  bank_account: string | null;
  avatar_url: string | null;
  created_at: string;
}

// ------------------------------------------------------------
// Commodities
// ------------------------------------------------------------

/** Supported commodity categories on the platform */
export type CommodityCategory = 'hortikultura' | 'susu';

/** A commodity listing created by a farmer */
export interface Commodity {
  id: string;
  farmer_id: string;
  /** Populated via join — the farmer who listed this commodity */
  farmer?: Profile;
  name: string;
  category: CommodityCategory;
  description: string;
  price_per_unit: number;
  unit: string;
  stock_projection: number;
  /** ISO date string for the projected harvest date */
  harvest_date: string;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

// ------------------------------------------------------------
// Orders
// ------------------------------------------------------------

/** All possible states an order can be in */
export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'on_hold'
  | 'in_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled';

/** An order placed by a buyer for a specific commodity */
export interface Order {
  id: string;
  buyer_id: string;
  /** Populated via join */
  buyer?: Profile;
  farmer_id: string;
  /** Populated via join */
  farmer?: Profile;
  commodity_id: string;
  /** Populated via join */
  commodity?: Commodity;
  quantity: number;
  /** Price locked at order time to prevent price fluctuation disputes */
  locked_price: number;
  total_amount: number;
  status: OrderStatus;
  /** ISO date string — buyer-requested delivery deadline */
  delivery_deadline: string | null;
  notes: string | null;
  created_at: string;
}

// ------------------------------------------------------------
// Escrow (Payment via Midtrans)
// ------------------------------------------------------------

/** Escrow lifecycle states */
export type EscrowStatus =
  | 'pending'
  | 'captured'
  | 'on_hold'
  | 'released'
  | 'refunded';

/** An escrow transaction tied to an order, managed via Midtrans */
export interface EscrowTransaction {
  id: string;
  order_id: string;
  /** Populated via join */
  order?: Order;
  /** Midtrans-specific order identifier */
  midtrans_order_id: string;
  /** Snap token for Midtrans payment popup */
  snap_token: string | null;
  amount: number;
  status: EscrowStatus;
  payment_type: string | null;
  /** ISO date string */
  paid_at: string | null;
  /** ISO date string — when funds were released to the farmer */
  released_at: string | null;
  created_at: string;
}

// ------------------------------------------------------------
// E-QC (Electronic Quality Control)
// ------------------------------------------------------------

/** Quality condition assessment upon delivery */
export type EQCCondition = 'fresh' | 'acceptable' | 'rejected';

/** Quality control log submitted by the buyer upon receiving goods */
export interface EQCLog {
  id: string;
  order_id: string;
  buyer_id: string;
  /** Temperature in Celsius at time of inspection */
  temperature: number | null;
  condition: EQCCondition;
  /** URL to the inspection photo stored in Supabase Storage */
  photo_url: string | null;
  notes: string | null;
  /** Whether the farmer approved the QC result */
  is_approved: boolean;
  /** ISO date string */
  verified_at: string;
}

// ------------------------------------------------------------
// Weather Intelligence
// ------------------------------------------------------------

/** Types of weather-based alerts the system can generate */
export type AlertType = 'early_harvest' | 'frost' | 'heavy_rain' | 'drought';

/** Alert severity levels */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/** A weather alert generated for a specific farmer */
export interface WeatherAlert {
  id: string;
  farmer_id: string;
  alert_type: AlertType;
  severity: Severity;
  message: string;
  /** Raw weather data that triggered the alert */
  weather_data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

/** Current weather conditions (from Open-Meteo API) */
export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  soilMoisture: number;
  evapotranspiration: number;
  solarRadiation?: number;
  lightIntensity?: number;
  description: string;
}

// ------------------------------------------------------------
// Dashboard Statistics
// ------------------------------------------------------------

/** Aggregated stats shown on the farmer dashboard */
export interface FarmerStats {
  totalCommodities: number;
  activeOrders: number;
  totalRevenue: number;
  pendingEscrow: number;
}

/** Aggregated stats shown on the buyer dashboard */
export interface BuyerStats {
  totalOrders: number;
  activeOrders: number;
  totalSpent: number;
  pendingDeliveries: number;
}

// ------------------------------------------------------------
// Generic / Utility Types
// ------------------------------------------------------------

/** API response wrapper for consistent error handling */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Pagination metadata returned by list endpoints */
export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

/** Paginated response for list views */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
