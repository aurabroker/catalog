export type Plan = 'basic' | 'premium' | 'premium_plus';
export type SalonStatus = 'draft' | 'published' | 'suspended';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface CatalogSalon {
	id: string;
	name: string;
	slug: string;
	plan: Plan;
	short_description: string | null;
	description: string | null;
	city: string | null;
	address_line: string | null;
	postal_code: string | null;
	country_code: string;
	latitude: number | null;
	longitude: number | null;
	cover_image_url: string | null;
	logo_url: string | null;
	published_at: string | null;
	primary_host: string | null;
	primary_host_type: string | null;
	phone: string | null;
	email: string | null;
	website_url: string | null;
	facebook_url: string | null;
	instagram_url: string | null;
	tiktok_url: string | null;
	booking_enabled: boolean;
	// enriched by queries
	avg_rating?: number | null;
	review_count?: number;
	services?: CatalogService[];
}

export interface CatalogService {
	id: string;
	salon_id: string;
	salon_name: string;
	salon_slug: string;
	salon_city: string | null;
	category_name: string | null;
	category_slug: string | null;
	name: string;
	slug: string;
	short_description: string | null;
	duration_min: number | null;
	price_from: number | null;
	price_to: number | null;
	currency_code: string;
	is_featured: boolean;
}

export interface SalonReview {
	id: string;
	salon_id: string;
	author_name: string;
	rating: number;
	content: string | null;
	source: string;
	is_featured: boolean;
	published_at: string | null;
}

export interface Staff {
	id: string;
	salon_id: string;
	name: string;
	role_label: string | null;
	bio: string | null;
	photo_url: string | null;
	calendar_color: string;
	is_active: boolean;
	sort_order: number;
}

export interface WorkingHours {
	id: string;
	salon_id: string;
	staff_id: string | null;
	day_of_week: number;
	is_open: boolean;
	open_time: string | null;
	close_time: string | null;
}

export interface Promotion {
	id: string;
	salon_id: string;
	title: string;
	description: string | null;
	image_url: string | null;
	discount_type: string | null;
	discount_value: number | null;
	valid_from: string | null;
	valid_until: string | null;
	is_active: boolean;
}

export interface TimeSlot {
	slot_start: string;
	slot_end: string;
}

export const DAY_NAMES = ['', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
export const DAY_NAMES_FULL = ['', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];
