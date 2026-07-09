import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import dynamic from "next/dynamic";
import Head from "next/head";
import { LogOut, Trash2, Upload } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  deleteRsvp,
  deleteWish,
  fetchRsvps,
  fetchWeddingConfig,
  geocodeMapUrl,
  updateWeddingConfig,
  uploadImage,
} from "@/services/api";
import type { Rsvp, TimelineItem, WeddingConfig, Wish } from "@/types";
import { createId } from "@/utils/id";

type GeoStatus = "loading" | "done" | "error";

type Tab = "info" | "gallery" | "timeline" | "rsvp" | "wishes";

function AdminHome() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState<Tab>("info");
  const [config, setConfig] = useState<WeddingConfig | null>(null);
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [wishes, setWishes] = useState<Wish[]>([]);
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

  const handleDeleteRsvp = async (id: string) => {
    await deleteRsvp(id);
    setRsvps((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDeleteWish = async (id: string) => {
    await deleteWish(id);
    setWishes((prev) => prev.filter((w) => w.id !== id));
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
                </div>
                <Input label="Tên cô dâu (chi tiết)" {...register("bride.name")} />
                <Input label="Tên chú rể (chi tiết)" {...register("groom.name")} />
                <Input label="Giới thiệu cô dâu" {...register("bride.intro")} />
                <Input label="Giới thiệu chú rể" {...register("groom.intro")} />
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
                <Input label="QR mừng cưới" {...register("gift.qrImage")} />
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

            {tab === "rsvp" && (
              <div className="space-y-3">
                {rsvps.length === 0 && (
                  <p className="text-sm text-ink/50">Chưa có RSVP nào.</p>
                )}
                {rsvps.map((rsvp) => (
                  <div
                    key={rsvp.id}
                    className="flex items-start justify-between rounded-xl border border-sage-100 p-4"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{rsvp.name}</p>
                      <p className="text-ink/60">{rsvp.phone}</p>
                      <p className="text-ink/60">
                        {rsvp.attendance === "yes" ? "Tham dự" : "Không tham dự"} ·{" "}
                        {rsvp.guests} khách
                      </p>
                      {rsvp.message && (
                        <p className="mt-1 text-ink/50">{rsvp.message}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRsvp(rsvp.id)}
                      className="text-blush-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab === "wishes" && (
              <div className="space-y-3">
                {wishes.length === 0 && (
                  <p className="text-sm text-ink/50">Chưa có lời chúc nào.</p>
                )}
                {wishes.map((wish) => (
                  <div
                    key={wish.id}
                    className="flex items-start justify-between rounded-xl border border-sage-100 p-4"
                  >
                    <div className="text-sm">
                      <p className="font-medium">{wish.name}</p>
                      <p className="text-ink/60">{wish.message}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteWish(wish.id)}
                      className="text-blush-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {tab !== "rsvp" && tab !== "wishes" && (
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            )}
          </form>
        )}
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
