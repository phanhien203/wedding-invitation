export interface Person {
  name: string;
  intro: string;
  photo: string;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
}

export interface EventInfo {
  title: string;
  date: string;
  time: string;
  address: string;
}

export interface VenueLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface GiftInfo {
  qrImage: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface WeddingConfig {
  brideName: string;
  groomName: string;
  weddingDate: string;
  coverImage: string;
  bride: Person;
  groom: Person;
  timeline: TimelineItem[];
  gallery: string[];
  events: EventInfo[];
  venue: VenueLocation;
  gift: GiftInfo;
  music: string;
}

export type Attendance = "yes" | "no";

export interface Rsvp {
  id: string;
  name: string;
  phone: string;
  guests: number;
  attendance: Attendance;
  message: string;
  createdAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}
