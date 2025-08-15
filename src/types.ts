export type EventItem = {
  id: number;
  title: string;
  date_from: string;
  coords: { lat: number; lng: number };
  group: string;
  location: { continent: string; country: string; name: string };
};
