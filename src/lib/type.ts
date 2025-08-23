export type EventItem = {
  id: string;
  title: string;
  description: string | null;
  event_year: number | null;
  group_event: string | null;
  continent: string | null;
  country: string | null;
  location: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  published: boolean;
  coordinates: unknown | null;
};

export type EventsResponse = {
  items: EventItem[];
  limit: number;
  offset: number;
  total?: number | null;
};
