export interface Person {
  name: string;
  intro: string;
  photo: string;
  /** Vai vế trong gia đình, vd "Út Nam", "Út Nữ", "Trưởng Nam". */
  role?: string;
}

export interface ParentInfo {
  father: string;
  mother: string;
  address: string;
}

export interface Parents {
  groom: ParentInfo;
  bride: ParentInfo;
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
  image: string;
}

export type WeddingSide = "groom" | "bride";

export interface EventInfo {
  title: string;
  date: string;
  time: string;
  address: string;
  /** Sự kiện thuộc nhà trai/nhà gái. Không có = hiển thị cho cả hai. */
  side?: WeddingSide;
}

export interface ScheduleItem {
  time: string;
  activity: string;
}

export interface Venue {
  name: string;
  address: string;
  mapUrl: string;
  lat: number;
  lng: number;
}

export interface Venues {
  groom: Venue;
  bride: Venue;
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
  venues: Venues;
  gift: GiftInfo;
  music: string;
  parents?: Parents;
  schedule?: ScheduleItem[];
}

export type Attendance = "yes" | "no";

export interface Rsvp {
  id: string;
  /** Khoá theo khách mời — mỗi guest slug chỉ có tối đa 1 record. */
  guestSlug: string;
  /** Tên khách (denormalize để admin xem nhanh). */
  guestName: string;
  attendance: Attendance;
  /** Số người tham dự (0 khi không đi). */
  guests: number;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Wish {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  /** Admin ẩn lời chúc khỏi trang public. Không có = đang hiển thị. */
  hidden?: boolean;
}

export interface Guest {
  id: string;
  /** Định danh dùng trong link cá nhân hóa, vd "anh-nam-x7k2p". */
  slug: string;
  /** Tên hiển thị trên thiệp, vd "Gia đình Anh Nam". */
  name: string;
  /** Chú thích nội bộ cho admin, vd "bạn đại học chú rể". */
  note: string;
  /** Mời dự tiệc nhà nào. Không có = hiển thị cả hai nhà. */
  side?: WeddingSide;
  createdAt: string;
}
