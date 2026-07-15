export interface Person {
  name: string;
  intro: string;
  photo: string;
  /** Vai vế trong gia đình, vd "Út Nam", "Út Nữ", "Trưởng Nam". */
  role?: string;
  /** Số điện thoại liên hệ hiện ở footer. Để trống thì không hiện. */
  phone?: string;
  /** Link Facebook cá nhân hiện ở footer. Để trống thì không hiện. */
  facebook?: string;
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
  /** Ảnh minh hoạ, tối đa MAX_TIMELINE_PHOTOS. Rỗng thì mốc chỉ hiện chữ. */
  images?: string[];
  /** @deprecated Dữ liệu cũ một ảnh; readWeddingConfig tự gộp vào images. */
  image?: string;
  /** Tên giai đoạn/chương (vd "Từ những người bạn"). Để trống nếu cùng chương
   *  với mốc phía trên. Khi đổi giá trị sẽ hiện một nhãn chương mới. */
  chapter?: string;
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

/** File ảnh nằm trong public/uploads, dùng cho trang quản lý ảnh của admin. */
export interface UploadedImage {
  filename: string;
  url: string;
  /** Bytes. */
  size: number;
  uploadedAt: string;
}

export interface Rsvp {
  id: string;
  /** Khoá theo khách mời — mỗi guest slug chỉ có tối đa 1 record. Không có =
   *  khách vào bằng thiệp chung và tự điền tên, nên không gộp được record. */
  guestSlug?: string;
  /** Tên khách: lấy từ danh sách mời, hoặc do khách tự điền. */
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
  /** Mời dự tiệc nhà nào. Không có = mặc định nhà trai. */
  side?: WeddingSide;
  createdAt: string;
}
