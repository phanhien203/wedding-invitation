import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import dynamic from "next/dynamic";
import Head from "next/head";
import { Copy, Check, Eye, EyeOff, LogOut, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import QrCropper from "@/components/admin/QrCropper";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  createGuest,
  deleteGuest,
  deleteRsvp,
  deleteWish,
  fetchGuests,
  fetchRsvps,
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
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestNote, setNewGuestNote] = useState("");
  const [newGuestSide, setNewGuestSide] = useState<WeddingSide | "">("");
  const [addingGuest, setAddingGuest] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrCropSrc, setQrCropSrc] = useState<string | null>(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [geoStatus, setGeoStatus] = useState<{
    groom?: GeoStatus;
    bride?: GeoStatus;
  }>({});

  const form = useForm<WeddingConfig>();
  const { register, handleSubmit, reset, setValue } = form;

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
    const [wedding, rsvpList] = await Promise.all([
      fetchWeddingConfig(),
      fetchRsvps(),
    ]);
    setConfig(wedding);
    reset(wedding);
    setRsvps(rsvpList);
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

  const onSave = async (data: WeddingConfig) => {
    setSaving(true);
    setMessage("");
    try {
      const updated = await updateWeddingConfig(data);
      setConfig(updated);
      setMessage("Đã lưu thành công!");
    } catch {
      setMessage("Lưu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handlePersonPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    person: "bride" | "groom"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    const url = await uploadImage(file);
    const updated = {
      ...config,
      [person]: { ...config[person], photo: url },
    };
    setConfig(updated);
    reset(updated);
    e.target.value = "";
  };
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof WeddingConfig | "gallery"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;

    const url = await uploadImage(file);

    if (field === "gallery") {
      const gallery = [...config.gallery, url];
      const updated = { ...config, gallery };
      setConfig(updated);
      reset(updated);
    } else {
      const updated = { ...config, [field]: url };
      setConfig(updated);
      reset(updated);
    }
    e.target.value = "";
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    setAudioError("");
    setAudioUploading(true);
    try {
      const url = await uploadAudio(file, config.music);
      const updated = { ...config, music: url };
      setConfig(updated);
      reset(updated);
    } catch {
      setAudioError("Upload thất bại. Chỉ chấp nhận file mp3.");
    } finally {
      setAudioUploading(false);
      e.target.value = "";
    }
  };

  const handleQrSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setQrCropSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleQrCropped = async (file: File) => {
    if (!config) return;
    const url = await uploadImage(file);
    const updated = { ...config, gift: { ...config.gift, qrImage: url } };
    setConfig(updated);
    reset(updated);
    setQrCropSrc(null);
  };

  const removeGalleryImage = (index: number) => {
    if (!config) return;
    const gallery = config.gallery.filter((_, i) => i !== index);
    const updated = { ...config, gallery };
    setConfig(updated);
    reset(updated);
  };

  const addTimelineItem = () => {
    if (!config) return;
    const item: TimelineItem = {
      id: createId(),
      date: "",
      title: "",
      description: "",
      image: "",
      chapter: "",
    };
    const updated = { ...config, timeline: [...config.timeline, item] };
    setConfig(updated);
    reset(updated);
  };

  const removeTimelineItem = (id: string) => {
    if (!config) return;
    const updated = {
      ...config,
      timeline: config.timeline.filter((t) => t.id !== id),
    };
    setConfig(updated);
    reset(updated);
  };

  const addScheduleItem = () => {
    if (!config) return;
    const updated = {
      ...config,
      schedule: [...(config.schedule ?? []), { time: "", activity: "" }],
    };
    setConfig(updated);
    reset(updated);
  };

  const removeScheduleItem = (index: number) => {
    if (!config) return;
    const updated = {
      ...config,
      schedule: (config.schedule ?? []).filter((_, i) => i !== index),
    };
    setConfig(updated);
    reset(updated);
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
      ? `${window.location.origin}/client?to=${slug}`
      : `/client?to=${slug}`;

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
      setNewGuestSide("");
      setMessage("Đã thêm khách mời!");
    } catch {
      setMessage("Thêm khách mời thất bại. Vui lòng thử lại.");
    } finally {
      setAddingGuest(false);
    }
  };

  const handleGuestSide = async (guest: Guest, side: WeddingSide | "") => {
    const nextSide = side === "" ? undefined : side;
    setGuests((prev) =>
      prev.map((g) => (g.id === guest.id ? { ...g, side: nextSide } : g))
    );
    try {
      await updateGuest(guest.id, { side });
    } catch {
      setGuests((prev) =>
        prev.map((g) => (g.id === guest.id ? { ...g, side: guest.side } : g))
      );
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

        {message && (
          <p className="mb-4 text-sm text-sage-700">{message}</p>
        )}

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
                <div>
                  <Input
                    label="QR mừng cưới (URL)"
                    {...register("gift.qrImage")}
                  />
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-blush-500">
                    <Upload size={14} /> Upload &amp; cắt ảnh QR
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleQrSelect}
                    />
                  </label>
                  {config.gift?.qrImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={config.gift.qrImage}
                      alt="QR mừng cưới"
                      className="mt-2 h-28 w-28 rounded-lg border border-sage-100 object-contain"
                    />
                  )}
                </div>
                <Input label="Ngân hàng" {...register("gift.bankName")} />
                <Input label="Chủ TK" {...register("gift.accountName")} />
                <Input label="Số TK" {...register("gift.accountNumber")} />
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
                        label="Giờ"
                        {...register(`events.${index}.time`)}
                      />
                      <Input
                        label="Địa chỉ"
                        {...register(`events.${index}.address`)}
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
                      <Input label="Ảnh (URL)" {...register(`timeline.${index}.image`)} />
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
                          setNewGuestSide(e.target.value as WeddingSide | "")
                        }
                        className="rounded-xl border border-sage-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-blush-300 focus:ring-2 focus:ring-blush-100"
                      >
                        <option value="">Cả hai nhà</option>
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
                              {guest.side ? SIDE_LABEL[guest.side] : "Cả hai nhà"}
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
                            value={guest.side ?? ""}
                            onChange={(e) =>
                              handleGuestSide(
                                guest,
                                e.target.value as WeddingSide | ""
                              )
                            }
                            className="rounded-lg border border-sage-300 bg-white px-2 py-1 text-xs outline-none"
                            aria-label="Mời dự tiệc nhà"
                          >
                            <option value="">Cả hai nhà</option>
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
