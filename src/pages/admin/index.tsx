import { useEffect, useState } from "react";
import {
  useForm,
  type UseFormReturn,
  type UseFormRegister,
} from "react-hook-form";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import { Copy, Check, Eye, EyeOff, LogOut, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import QrCropper from "@/components/admin/QrCropper";
import {
  MAX_TIMELINE_PHOTOS,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
} from "@/constants";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Toast, { type ToastState } from "@/components/ui/Toast";
import {
  adminLogin,
  adminLogout,
  apiErrorMessage,
  checkAdminSession,
  createGuest,
  deleteGuest,
  deleteImage,
  deleteRsvp,
  deleteWish,
  fetchGuests,
  fetchRsvps,
  fetchUploads,
  fetchWeddingConfig,
  geocodeMapUrl,
  setWishHidden,
  updateGuest,
  updateWeddingConfig,
  uploadAudio,
  uploadImage,
} from "@/services/api";
import type {
  Guest,
  Rsvp,
  TimelineItem,
  UploadedImage,
  WeddingConfig,
  WeddingSide,
  Wish,
} from "@/types";

const SIDE_LABEL: Record<WeddingSide, string> = {
  groom: "Nhà trai",
  bride: "Nhà gái",
};
import { createId } from "@/utils/id";

type GeoStatus = "loading" | "done" | "error";

type Tab =
  | "info"
  | "gallery"
  | "uploads"
  | "timeline"
  | "schedule"
  | "guests"
  | "rsvp"
  | "wishes";

function AdminHome() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("info");
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [uploads, setUploads] = useState<UploadedImage[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestNote, setNewGuestNote] = useState("");
  const [newGuestSide, setNewGuestSide] = useState<WeddingSide>("groom");
  const [addingGuest, setAddingGuest] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCropSrc, setQrCropSrc] = useState<string | null>(null);
  const [qrCropSide, setQrCropSide] = useState<"groom" | "bride">("groom");
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [geoStatus, setGeoStatus] = useState<{
    groom?: GeoStatus;
    bride?: GeoStatus;
  }>({});

  const form = useForm<WeddingConfig>();
  const { register, handleSubmit, reset, setValue, watch, getValues } = form;

  const handleGeocode = async (side: "groom" | "bride", url: string) => {
    if (!url.trim()) {
      setGeoStatus((s) => ({ ...s, [side]: undefined }));
      return;
    }
    setGeoStatus((s) => ({ ...s, [side]: "loading" }));
    try {
      const { lat, lng } = await geocodeMapUrl(url);
      setValue(`venues.${side}.lat`, lat, { shouldDirty: true });
      setValue(`venues.${side}.lng`, lng, { shouldDirty: true });
      setGeoStatus((s) => ({ ...s, [side]: "done" }));
    } catch {
      setGeoStatus((s) => ({ ...s, [side]: "error" }));
    }
  };

  useEffect(() => {
    checkAdminSession().then(setAuthenticated);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    loadData();
  }, [authenticated]);

  const loadData = async () => {
    const [wedding, rsvpList, uploadList] = await Promise.all([
      fetchWeddingConfig(),
      fetchRsvps(),
      fetchUploads(),
    ]);
    setConfig(wedding);
    reset(wedding);
    setRsvps(rsvpList);
    setUploads(uploadList);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      await adminLogin(password);
      setAuthenticated(true);
    } catch {
      setLoginError("Mật khẩu không đúng");
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setAuthenticated(false);
    setConfig(null);
  };

  const showToast = (text: string, variant: ToastState["variant"]) =>
    setToast({ id: Date.now(), text, variant });

  const onSave = async (data: WeddingConfig) => {
    setSaving(true);
    try {
      const updated = await updateWeddingConfig(data);
      setConfig(updated);
      showToast("Đã lưu thành công!", "success");
    } catch {
      showToast("Lưu thất bại. Vui lòng thử lại.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * `config` chỉ là ảnh chụp lúc tải/lưu, còn thứ đang gõ dở nằm trong form.
   * Mọi thao tác thêm/xoá/upload phải dựng từ getValues() rồi mới reset, chứ
   * dựng từ `config` thì reset sẽ ghi đè và nuốt sạch phần chưa lưu.
   */
  const applyConfig = (change: (current: WeddingConfig) => WeddingConfig) => {
    const updated = change(getValues());
    setConfig(updated);
    reset(updated, { keepDirty: true });
  };

  /**
   * Mọi upload ảnh đi qua đây: chặn sớm file quá cỡ và luôn hiện lý do khi hỏng.
   * Trước đây lỗi bị ném thẳng ra ngoài — dev thấy overlay đỏ, còn người dùng
   * thật thì bấm upload xong không thấy gì xảy ra.
   */
  const tryUploadImage = async (file: File): Promise<string | null> => {
    if (file.size > MAX_UPLOAD_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      showToast(
        `Ảnh ${mb}MB, vượt giới hạn ${MAX_UPLOAD_MB}MB. Chọn ảnh nhẹ hơn nhé.`,
        "error"
      );
      return null;
    }
    try {
      const url = await uploadImage(file);
      // Nạp lại để tab quản lý ảnh thấy ngay file vừa lên.
      fetchUploads().then(setUploads).catch(() => {});
      return url;
    } catch (error) {
      showToast(apiErrorMessage(error, "Upload ảnh thất bại."), "error");
      return null;
    }
  };

  const handlePersonPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    person: "bride" | "groom"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    const url = await tryUploadImage(file);
    e.target.value = "";
    if (!url) return;
    applyConfig((current) => ({
      ...current,
      [person]: { ...current[person], photo: url },
    }));
  };
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof WeddingConfig | "gallery"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    const url = await tryUploadImage(file);
    e.target.value = "";
    if (!url) return;

    applyConfig((current) =>
      field === "gallery"
        ? { ...current, gallery: [...current.gallery, url] }
        : { ...current, [field]: url }
    );
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    setAudioError("");
    setAudioUploading(true);
    try {
      const url = await uploadAudio(file, config.music);
      applyConfig((current) => ({ ...current, music: url }));
    } catch {
      setAudioError("Upload thất bại. Chỉ chấp nhận file mp3.");
    } finally {
      setAudioUploading(false);
      e.target.value = "";
    }
  };

  const handleQrSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "groom" | "bride"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrCropSide(side);
    const reader = new FileReader();
    reader.onload = () => setQrCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleQrCropped = async (file: File) => {
    if (!config) return;
    const url = await tryUploadImage(file);
    if (!url) return;
    applyConfig((current) => ({
      ...current,
      gift: {
        ...current.gift,
        [qrCropSide]: { ...current.gift[qrCropSide], qrImage: url },
      },
    }));
    setQrCropSrc(null);
  };

  const removeGalleryImage = (index: number) => {
    if (!config) return;
    applyConfig((current) => ({
      ...current,
      gallery: current.gallery.filter((_, i) => i !== index),
    }));
  };

  const addTimelineItem = () => {
    if (!config) return;
    // Không set images: mốc mới mặc định không ảnh, muốn thì thêm sau.
    const item: TimelineItem = {
      id: createId(),
      date: "",
      title: "",
      description: "",
      chapter: "",
    };
    applyConfig((current) => ({
      ...current,
      timeline: [...current.timeline, item],
    }));
  };

  const removeTimelineItem = (id: string) => {
    if (!config) return;
    applyConfig((current) => ({
      ...current,
      timeline: current.timeline.filter((t) => t.id !== id),
    }));
  };

  // Ảnh của mốc là tuỳ chọn: danh sách rỗng = mốc chỉ có chữ.
  const photosOf = (index: number) => watch(`timeline.${index}.images`) ?? [];

  const setPhotos = (index: number, photos: string[]) =>
    setValue(`timeline.${index}.images`, photos, { shouldDirty: true });

  const addTimelinePhoto = (index: number) => {
    const photos = photosOf(index);
    if (photos.length >= MAX_TIMELINE_PHOTOS) return;
    setPhotos(index, [...photos, ""]);
  };

  const handleTimelinePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const photos = photosOf(index);
    if (photos.length >= MAX_TIMELINE_PHOTOS) return;
    const url = await tryUploadImage(file);
    e.target.value = "";
    if (!url) return;
    setPhotos(index, [...photos, url]);
  };

  const removeTimelinePhoto = (index: number, at: number) =>
    setPhotos(
      index,
      photosOf(index).filter((_, i) => i !== at)
    );

  const addScheduleItem = () => {
    if (!config) return;
    applyConfig((current) => ({
      ...current,
      schedule: [...(current.schedule ?? []), { time: "", activity: "" }],
    }));
  };

  const removeScheduleItem = (index: number) => {
    if (!config) return;
    applyConfig((current) => ({
      ...current,
      schedule: (current.schedule ?? []).filter((_, i) => i !== index),
    }));
  };

  const handleDeleteRsvp = async (id: string) => {
    await deleteRsvp(id);
    setRsvps((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteWish = async (id: string) => {
    await deleteWish(id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleWish = async (wish: Wish) => {
    const hidden = !wish.hidden;
    setWishes((prev) =>
      prev.map((w) => (w.id === wish.id ? { ...w, hidden } : w))
    );
    try {
      await setWishHidden(wish.id, hidden);
    } catch {
      // hoàn tác nếu lỗi
      setWishes((prev) =>
        prev.map((w) => (w.id === wish.id ? { ...w, hidden: !hidden } : w))
      );
    }
  };

  const guestLink = (slug: string) =>
    typeof window !== "undefined"
      ? `${window.location.origin}/?to=${slug}`
      : `/?to=${slug}`;

  const handleAddGuest = async () => {
    const name = newGuestName.trim();
    if (!name) return;
    setAddingGuest(true);
    try {
      const guest = await createGuest({
        name,
        note: newGuestNote.trim(),
        side: newGuestSide,
      });
      setGuests((prev) => [guest, ...prev]);
      setNewGuestName("");
      setNewGuestNote("");
      setNewGuestSide("groom");
      showToast("Đã thêm khách mời!", "success");
    } catch {
      showToast("Thêm khách mời thất bại. Vui lòng thử lại.", "error");
    } finally {
      setAddingGuest(false);
    }
  };

  const handleGuestSide = async (guest: Guest, side: WeddingSide) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, side } : g))
    );
    try {
      await updateGuest(guest.id, { side });
    } catch {
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, side: guest.side } : g))
      );
    }
  };

  /**
   * Ảnh đang được gắn ở những đâu. Đọc từ getValues() chứ không từ `config` để
   * tính cả những chỗ vừa gắn mà chưa bấm Lưu — nếu không sẽ báo "chưa dùng" rồi
   * xoá mất ảnh người ta vừa chọn.
   */
  const usageOf = (url: string): string[] => {
    const current = getValues();
    const where: string[] = [];
    if (current.gallery?.includes(url)) where.push("Gallery");
    if (current.timeline?.some((t) => t.images?.includes(url))) {
      where.push("Câu chuyện tình yêu");
    }
    if (current.bride?.photo === url) where.push("Ảnh cô dâu");
    if (current.groom?.photo === url) where.push("Ảnh chú rể");
    if (current.gift?.groom?.qrImage === url) where.push("QR nhà trai");
    if (current.gift?.bride?.qrImage === url) where.push("QR nhà gái");
    return where;
  };

  const handleDeleteUpload = async (item: UploadedImage) => {
    const used = usageOf(item.url);
    const warning = used.length
      ? `CẢNH BÁO: ảnh đang hiển thị ở ${used.join(", ")}. Xoá là chỗ đó vỡ ảnh.\n\n`
      : "";
    if (!window.confirm(`${warning}Xoá ${item.filename}? Không khôi phục được.`)) {
      return;
    }
    try {
      await deleteImage(item.filename);
      setUploads((prev) => prev.filter((u) => u.filename !== item.filename));
      showToast("Đã xoá ảnh.", "success");
    } catch (error) {
      showToast(apiErrorMessage(error, "Xoá ảnh thất bại."), "error");
    }
  };

  const handleDeleteGuest = async (id: string) => {
    await deleteGuest(id);
    setGuests((prev) => prev.filter((g) => g.id !== id));
  };

  const handleCopyLink = async (guest: Guest) => {
    try {
      await navigator.clipboard.writeText(guestLink(guest.slug));
      setCopiedId(guest.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* ignore clipboard errors */
    }
  };

  if (authenticated === null) {
    return (
      <AdminLayout>
        <p className="text-ink/60">Đang tải...</p>
      </AdminLayout>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>Admin Login · Wedding Invitation</title>
          <meta name="robots" content="noindex" />
        </Head>
        <AdminLayout title="Đăng nhập">
          <form onSubmit={handleLogin} className="mx-auto max-w-sm space-y-4">
            <Input
              label="Mật khẩu admin"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {loginError && (
              <p className="text-sm text-blush-500">{loginError}</p>
            )}
            <Button type="submit" className="w-full">
              Đăng nhập
            </Button>
          </form>
        </AdminLayout>
      </>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "info", label: "Thông tin" },
    { id: "gallery", label: "Gallery" },
    { id: "uploads", label: "Ảnh đã upload" },
    { id: "timeline", label: "Timeline" },
    { id: "schedule", label: "Lịch trình" },
    { id: "guests", label: "Khách mời" },
    { id: "rsvp", label: "RSVP" },
    { id: "wishes", label: "Lời chúc" },
  ];

  return (
    <>
      <Head>
        <title>Admin · Wedding Invitation</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AdminLayout title="Dashboard">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  if (t.id === "wishes") {
                    import("@/services/api").then(({ fetchWishes }) =>
                      fetchWishes().then(setWishes)
                    );
                  }
                  if (t.id === "guests") {
                    fetchGuests().then(setGuests);
                  }
                }}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  tab === t.id
                    ? "bg-blush-400 text-white"
                    : "bg-sage-100 text-ink/70 hover:bg-sage-300/50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut size={16} />
            Đăng xuất
          </Button>
        </div>

        <Toast toast={toast} onDismiss={() => setToast(null)} />

        {config && (
          <form onSubmit={handleSubmit(onSave)} className="space-y-6">
            {tab === "info" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Tên cô dâu" {...register("brideName")} />
                <Input label="Tên chú rể" {...register("groomName")} />
                <Input
                  label="Ngày cưới (ISO)"
                  {...register("weddingDate")}
                  className="sm:col-span-2"
                />
                <div>
                  <Input label="Ảnh bìa (URL)" {...register("coverImage")} />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                    <Upload size={14} /> Upload ảnh bìa
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "coverImage")}
                    />
                  </label>
                </div>
                <div>
                  <Input label="Nhạc nền (URL)" {...register("music")} />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                    <Upload size={14} />
                    {audioUploading ? "Đang tải nhạc..." : "Upload nhạc (mp3)"}
                    <input
                      type="file"
                      accept="audio/mpeg,.mp3"
                      className="hidden"
                      disabled={audioUploading}
                      onChange={handleAudioUpload}
                    />
                  </label>
                  {audioError && (
                    <p className="mt-1 text-xs text-red-500">{audioError}</p>
                  )}
                </div>
                <Input label="Tên cô dâu (chi tiết)" {...register("bride.name")} />
                <Input label="Tên chú rể (chi tiết)" {...register("groom.name")} />
                <Input label="Giới thiệu cô dâu" {...register("bride.intro")} />
                <Input label="Giới thiệu chú rể" {...register("groom.intro")} />
                <Input
                  label="Vai vế cô dâu (vd Út Nữ)"
                  {...register("bride.role")}
                />
                <Input
                  label="Vai vế chú rể (vd Út Nam)"
                  {...register("groom.role")}
                />
                <Input
                  label="SĐT cô dâu (hiện ở footer)"
                  {...register("bride.phone")}
                />
                <Input
                  label="SĐT chú rể (hiện ở footer)"
                  {...register("groom.phone")}
                />
                <Input
                  label="Facebook cô dâu (link)"
                  {...register("bride.facebook")}
                />
                <Input
                  label="Facebook chú rể (link)"
                  {...register("groom.facebook")}
                />
                <div className="space-y-3 rounded-xl border border-sage-100 p-4 sm:col-span-2">
                  <p className="text-sm font-medium">Ba mẹ hai bên</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input
                      label="Bố chú rể"
                      {...register("parents.groom.father")}
                    />
                    <Input
                      label="Mẹ chú rể"
                      {...register("parents.groom.mother")}
                    />
                    <Input
                      label="Bố cô dâu"
                      {...register("parents.bride.father")}
                    />
                    <Input
                      label="Mẹ cô dâu"
                      {...register("parents.bride.mother")}
                    />
                    <Input
                      label="Địa chỉ nhà trai"
                      {...register("parents.groom.address")}
                      className="sm:col-span-2"
                    />
                    <Input
                      label="Địa chỉ nhà gái"
                      {...register("parents.bride.address")}
                      className="sm:col-span-2"
                    />
                  </div>
                </div>
                <div>
                  <Input label="Ảnh cô dâu" {...register("bride.photo")} />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePersonPhotoUpload(e, "bride")}
                    />
                  </label>
                </div>
                <div>
                  <Input label="Ảnh chú rể" {...register("groom.photo")} />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                    <Upload size={14} /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handlePersonPhotoUpload(e, "groom")}
                    />
                  </label>
                </div>
                <div className="space-y-3 rounded-xl border border-sage-100 p-4 sm:col-span-2">
                  <p className="text-sm font-medium">Tài khoản mừng cưới</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <GiftAccountFields
                      side="groom"
                      label="Nhà trai"
                      register={register}
                      qrImage={config.gift?.groom?.qrImage}
                      onQrSelect={handleQrSelect}
                    />
                    <GiftAccountFields
                      side="bride"
                      label="Nhà gái"
                      register={register}
                      qrImage={config.gift?.bride?.qrImage}
                      onQrSelect={handleQrSelect}
                    />
                  </div>
                </div>
                <VenueFields
                  side="groom"
                  label="Nhà Trai"
                  form={form}
                  status={geoStatus.groom}
                  onGeocode={handleGeocode}
                />
                <VenueFields
                  side="bride"
                  label="Nhà Gái"
                  form={form}
                  status={geoStatus.bride}
                  onGeocode={handleGeocode}
                />
                {config.events.map((event, index) => (
                  <div
                    key={event.title}
                    className="space-y-3 rounded-xl border border-sage-100 p-4 sm:col-span-2"
                  >
                    <p className="text-sm font-medium">Sự kiện {index + 1}</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Tên sự kiện"
                        {...register(`events.${index}.title`)}
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-ink">
                          Thuộc nhà
                        </label>
                        <select
                          {...register(`events.${index}.side`)}
                          className="rounded-xl border border-sage-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-100"
                        >
                          <option value="">Cả hai nhà</option>
                          <option value="groom">Nhà trai</option>
                          <option value="bride">Nhà gái</option>
                        </select>
                      </div>
                      <Input
                        label="Ngày"
                        {...register(`events.${index}.date`)}
                      />
                      <Input
                        label="Giờ làm lễ"
                        {...register(`events.${index}.time`)}
                      />
                      <Input
                        label="Giờ dự tiệc"
                        placeholder="Trống = giống giờ làm lễ"
                        {...register(`events.${index}.partyTime`)}
                      />
                      <Input
                        label="Địa điểm làm lễ"
                        {...register(`events.${index}.address`)}
                        className="sm:col-span-2"
                      />
                      <Input
                        label="Địa điểm dự tiệc"
                        placeholder="Trống = giống địa điểm làm lễ"
                        {...register(`events.${index}.partyAddress`)}
                        className="sm:col-span-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "gallery" && (
              <div className="space-y-4">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-blush-300 px-4 py-2 text-sm text-blush-500">
                  <Upload size={14} /> Thêm ảnh gallery
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, "gallery")}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {config.gallery.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-xl bg-sage-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(i)}
                        className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-blush-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "uploads" && (
              <div className="space-y-4">
                <p className="text-sm text-ink/60">
                  {uploads.length} ảnh trong thư mục upload. Ảnh đang được gắn ở
                  đâu đó sẽ có nhãn — xoá là chỗ đó vỡ ảnh.
                </p>

                {uploads.length === 0 ? (
                  <p className="text-sm text-ink/40">
                    Chưa có ảnh nào được upload.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {uploads.map((item) => {
                      const used = usageOf(item.url);
                      return (
                        <div
                          key={item.filename}
                          className="overflow-hidden rounded-xl border border-sage-100"
                        >
                          <div className="relative aspect-square bg-sage-100">
                            <Image
                              src={item.url}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 45vw, 200px"
                            />
                            <button
                              type="button"
                              onClick={() => handleDeleteUpload(item)}
                              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-blush-500 shadow transition hover:bg-white"
                              aria-label={`Xoá ${item.filename}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="space-y-1 p-2.5 text-xs">
                            <p className="truncate font-mono text-ink/50">
                              {item.filename}
                            </p>
                            <p className="text-ink/40">
                              {(item.size / 1024).toFixed(0)} KB
                            </p>
                            {used.length > 0 ? (
                              <p className="text-sage-700">
                                Đang dùng: {used.join(", ")}
                              </p>
                            ) : (
                              <p className="text-ink/40">Chưa dùng ở đâu</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === "timeline" && (
              <div className="space-y-4">
                {config.timeline.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-sage-100 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium">Mốc {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTimelineItem(item.id)}
                        className="text-blush-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label="Giai đoạn/chương (để trống nếu cùng chương mốc trên)"
                        {...register(`timeline.${index}.chapter`)}
                        className="sm:col-span-2"
                      />
                      <Input label="Năm/Ngày" {...register(`timeline.${index}.date`)} />
                      <Input label="Tiêu đề" {...register(`timeline.${index}.title`)} />
                      <Input
                        label="Mô tả"
                        {...register(`timeline.${index}.description`)}
                        className="sm:col-span-2"
                      />
                      <div className="space-y-2 sm:col-span-2">
                        <p className="text-sm font-medium text-ink">
                          Ảnh của mốc ({photosOf(index).length}/
                          {MAX_TIMELINE_PHOTOS}) — để trống nếu mốc chỉ có chữ
                        </p>
                        {photosOf(index).map((photo, photoIndex) => (
                          <div key={photoIndex} className="flex items-center gap-2">
                            <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-sage-100 bg-sage-100">
                              {photo && (
                                <Image
                                  src={photo}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="44px"
                                />
                              )}
                            </span>
                            <Input
                              placeholder="Dán link ảnh, hoặc bấm Upload ảnh bên dưới"
                              className="flex-1"
                              {...register(
                                `timeline.${index}.images.${photoIndex}`
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => removeTimelinePhoto(index, photoIndex)}
                              className="shrink-0 text-blush-500"
                              aria-label={`Xoá ảnh ${photoIndex + 1}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                        {photosOf(index).length < MAX_TIMELINE_PHOTOS && (
                          <div className="flex flex-wrap items-center gap-4">
                            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                              <Upload size={14} /> Upload ảnh
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleTimelinePhotoUpload(e, index)
                                }
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => addTimelinePhoto(index)}
                              className="text-sm text-ink/50 transition hover:text-ink"
                            >
                              hoặc dán link có sẵn
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addTimelineItem}>
                  Thêm mốc timeline
                </Button>
              </div>
            )}

            {tab === "schedule" && (
              <div className="space-y-4">
                <p className="text-sm text-ink/50">
                  Lịch trình ngày cưới (đón khách, khai tiệc...). Bấm Lưu thay đổi
                  để cập nhật.
                </p>
                {(config.schedule ?? []).map((item, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-3 rounded-xl border border-sage-100 p-4"
                  >
                    <Input
                      label="Giờ"
                      placeholder="17:30"
                      {...register(`schedule.${index}.time`)}
                      className="w-28"
                    />
                    <Input
                      label="Hoạt động"
                      placeholder="Đón khách"
                      {...register(`schedule.${index}.activity`)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeScheduleItem(index)}
                      className="mb-2.5 shrink-0 text-blush-500"
                      aria-label="Xóa mốc"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(config.schedule ?? []).length === 0 && (
                  <p className="text-sm text-ink/50">Chưa có mốc nào.</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addScheduleItem}
                >
                  Thêm mốc lịch trình
                </Button>
              </div>
            )}

            {tab === "guests" && (
              <div className="space-y-6">
                <div className="rounded-xl border border-sage-100 p-4">
                  <p className="mb-3 text-sm font-medium">Thêm khách mời</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input
                      label="Tên khách (hiển thị trên thiệp)"
                      placeholder="Gia đình Anh Nam"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                    />
                    <Input
                      label="Chú thích (nội bộ)"
                      placeholder="bạn đại học chú rể"
                      value={newGuestNote}
                      onChange={(e) => setNewGuestNote(e.target.value)}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm font-medium text-ink">
                        Mời dự tiệc
                      </label>
                      <select
                        value={newGuestSide}
                        onChange={(e) =>
                          setNewGuestSide(e.target.value as WeddingSide)
                        }
                        className="rounded-xl border border-sage-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-100"
                      >
                        <option value="groom">Nhà trai</option>
                        <option value="bride">Nhà gái</option>
                      </select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    className="mt-3"
                    onClick={handleAddGuest}
                    disabled={addingGuest || !newGuestName.trim()}
                  >
                    {addingGuest ? "Đang thêm..." : "Thêm khách mời"}
                  </Button>
                </div>

                {guests.length === 0 ? (
                  <p className="text-sm text-ink/50">Chưa có khách mời nào.</p>
                ) : (
                  <div className="space-y-3">
                    {guests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-sage-100 p-4"
                      >
                        <div className="min-w-0 text-sm">
                          <p className="flex flex-wrap items-center gap-2 font-medium">
                            {guest.name}
                            <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs font-normal text-ink/60">
                              {SIDE_LABEL[guest.side ?? "groom"]}
                            </span>
                          </p>
                          {guest.note && (
                            <p className="text-ink/50">{guest.note}</p>
                          )}
                          <p className="mt-1 break-all font-mono text-xs text-ink/40">
                            {guestLink(guest.slug)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <select
                            // Khách cũ chưa gán nhà vốn đã được hiểu là nhà trai
                            // (resolveSide), nên hiện đúng như vậy.
                            value={guest.side ?? "groom"}
                            onChange={(e) =>
                              handleGuestSide(guest, e.target.value as WeddingSide)
                            }
                            className="rounded-lg border border-sage-300 bg-white px-2 py-1 text-xs outline-none"
                            aria-label="Mời dự tiệc nhà"
                          >
                            <option value="groom">Nhà trai</option>
                            <option value="bride">Nhà gái</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(guest)}
                            >
                              {copiedId === guest.id ? (
                                <>
                                  <Check size={14} /> Đã copy
                                </>
                              ) : (
                                <>
                                  <Copy size={14} /> Copy link
                                </>
                              )}
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGuest(guest.id)}
                              className="text-blush-500"
                              aria-label="Xóa khách"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "rsvp" && (
              <div className="space-y-3">
                {rsvps.length > 0 && (
                  <p className="text-sm text-ink/60">
                    {rsvps.filter((r) => r.attendance === "yes").length} khách sẽ
                    tham dự ·{" "}
                    {rsvps
                      .filter((r) => r.attendance === "yes")
                      .reduce((sum, r) => sum + (r.guests || 0), 0)}{" "}
                    người ·{" "}
                    {rsvps.filter((r) => r.attendance === "no").length} không thể
                    đến
                  </p>
                )}
                {rsvps.length === 0 && (
                  <p className="text-sm text-ink/50">Chưa có xác nhận nào.</p>
                )}
                {rsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-start justify-between gap-3 rounded-xl border border-sage-100 p-4"
                  >
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="flex flex-wrap items-center gap-2 font-medium">
                        {rsvp.guestName}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-normal ${
                            rsvp.attendance === "yes"
                              ? "bg-sage-100 text-sage-700"
                              : "bg-blush-100 text-blush-500"
                          }`}
                        >
                          {rsvp.attendance === "yes"
                            ? `Tham dự · ${rsvp.guests} người`
                            : "Không thể đến"}
                        </span>
                      </p>
                      {rsvp.message && (
                        <p className="mt-1 break-words [overflow-wrap:anywhere] text-ink/60">
                          {rsvp.message}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRsvp(rsvp.id)}
                      className="shrink-0 text-blush-500"
                      aria-label="Xóa xác nhận"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "wishes" && (
              <div className="space-y-3">
                <p className="text-sm text-ink/50">
                  Nhấn biểu tượng con mắt để ẩn/hiện lời chúc trên trang mời.
                  Lời chúc bị ẩn sẽ mờ đi.
                </p>
                {wishes.length === 0 && (
                  <p className="text-sm text-ink/50">Chưa có lời chúc nào.</p>
                )}
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className={`flex items-start justify-between gap-3 rounded-xl border p-4 transition ${
                      wish.hidden
                        ? "border-dashed border-sage-300 bg-sage-100/30 opacity-60"
                        : "border-sage-100"
                    }`}
                  >
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="flex items-center gap-2 font-medium">
                        {wish.name}
                        {wish.hidden && (
                          <span className="rounded-full bg-sage-100 px-2 py-0.5 text-xs font-normal text-ink/50">
                            Đang ẩn
                          </span>
                        )}
                      </p>
                      <p className="break-words [overflow-wrap:anywhere] text-ink/60">
                        {wish.message}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleWish(wish)}
                        className="rounded-full p-2 text-ink/50 transition hover:bg-sage-100 hover:text-ink"
                        title={wish.hidden ? "Hiện lời chúc" : "Ẩn lời chúc"}
                        aria-label={wish.hidden ? "Hiện lời chúc" : "Ẩn lời chúc"}
                      >
                        {wish.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteWish(wish.id)}
                        className="rounded-full p-2 text-blush-500 transition hover:bg-blush-50"
                        title="Xóa lời chúc"
                        aria-label="Xóa lời chúc"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab !== "rsvp" && tab !== "wishes" && tab !== "guests" && (
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            )}
          </form>
        )}

        <QrCropper
          open={qrCropSrc !== null}
          imageSrc={qrCropSrc ?? ""}
          onCancel={() => setQrCropSrc(null)}
          onConfirm={handleQrCropped}
        />
      </AdminLayout>
    </>
  );
}

function GiftAccountFields({
  side,
  label,
  register,
  qrImage,
  onQrSelect,
}: {
  side: "groom" | "bride";
  label: string;
  register: UseFormRegister<WeddingConfig>;
  qrImage?: string;
  onQrSelect: (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "groom" | "bride"
  ) => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-sage-100 p-3">
      <p className="text-sm font-medium">{label}</p>
      <div>
        <Input label="QR (URL)" {...register(`gift.${side}.qrImage`)} />
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
          <Upload size={14} /> Upload &amp; cắt ảnh QR
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onQrSelect(e, side)}
          />
        </label>
        {qrImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrImage}
            alt={`QR ${label}`}
            className="mt-2 h-28 w-28 rounded-lg border border-sage-100 object-contain"
          />
        )}
      </div>
      <Input label="Ngân hàng" {...register(`gift.${side}.bankName`)} />
      <Input label="Chủ TK" {...register(`gift.${side}.accountName`)} />
      <Input label="Số TK" {...register(`gift.${side}.accountNumber`)} />
    </div>
  );
}

function VenueFields({
  side,
  label,
  form,
  status,
  onGeocode,
}: {
  side: "groom" | "bride";
  label: string;
  form: UseFormReturn<WeddingConfig>;
  status?: GeoStatus;
  onGeocode: (side: "groom" | "bride", url: string) => void;
}) {
  const { register } = form;
  const mapUrl = register(`venues.${side}.mapUrl`);

  return (
    <div className="space-y-3 rounded-xl border border-sage-100 p-4 sm:col-span-2">
      <p className="text-sm font-medium">Địa điểm · {label}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Tên địa điểm" {...register(`venues.${side}.name`)} />
        <Input label="Địa chỉ" {...register(`venues.${side}.address`)} />
        <div className="sm:col-span-2">
          <Input
            label="Link Google Maps (dán URL chia sẻ)"
            placeholder="https://maps.app.goo.gl/..."
            {...mapUrl}
            onBlur={(e) => {
              mapUrl.onBlur(e);
              onGeocode(side, e.currentTarget.value);
            }}
          />
          {status === "loading" && (
            <p className="mt-1.5 text-xs text-ink/50">Đang lấy toạ độ từ link...</p>
          )}
          {status === "done" && (
            <p className="mt-1.5 text-xs text-sage-700">
              Đã tự động điền toạ độ ✓
            </p>
          )}
          {status === "error" && (
            <p className="mt-1.5 text-xs text-blush-500">
              Không lấy được toạ độ. Vui lòng kiểm tra lại link.
            </p>
          )}
        </div>
        <Input
          label="Vĩ độ (tự động)"
          type="number"
          step="any"
          readOnly
          className="bg-sage-100/40 text-ink/60"
          {...register(`venues.${side}.lat`, { valueAsNumber: true })}
        />
        <Input
          label="Kinh độ (tự động)"
          type="number"
          step="any"
          readOnly
          className="bg-sage-100/40 text-ink/60"
          {...register(`venues.${side}.lng`, { valueAsNumber: true })}
        />
      </div>
    </div>
  );
}

// Admin is auth-gated and needs no SSR; render client-only to avoid a
// hydration mismatch that could leave a direct page load stuck on "Đang tải...".
export default dynamic(() => Promise.resolve(AdminHome), { ssr: false });
