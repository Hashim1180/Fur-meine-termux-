import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  LayoutDashboard,
  ShoppingBag,
  Video,
  Calendar,
  MessageSquare,
  Settings,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  LogOut,
  ArrowLeft,
  Loader2,
} from "lucide-react";

type Tab = "dashboard" | "products" | "videos" | "appointments" | "chat" | "settings";

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth({
    redirectOnUnauthenticated: true,
  });

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
        <XCircle className="w-16 h-16 text-red-400" />
        <h1 className="text-2xl font-orbitron text-white">Access Denied</h1>
        <p className="text-white/50 font-rajdhani">Admin privileges required</p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-yellow-500 text-black font-orbitron font-bold rounded-full"
        >
          Go Home
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: ShoppingBag },
    { id: "videos", label: "Videos", icon: Video },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "chat", label: "Chat Logs", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen bg-black/50 border-r border-white/5 fixed left-0 top-0">
          <div className="p-6">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/60 hover:text-yellow-400 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-rajdhani">Back to Site</span>
            </button>

            <div className="mb-8">
              <h2 className="font-orbitron font-bold text-lg text-yellow-400">AW GYMS</h2>
              <p className="text-xs text-white/40 font-rajdhani">Admin Panel</p>
            </div>

            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-rajdhani font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-8">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <span className="text-xs text-yellow-400 font-orbitron">
                    {user?.name?.[0] || "A"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{user?.name || "Admin"}</p>
                  <p className="text-xs text-white/40">{user?.role}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-white/40 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ml-64 flex-1 p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "videos" && <VideosTab />}
            {activeTab === "appointments" && <AppointmentsTab />}
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function DashboardTab() {
  const { data: products } = trpc.product.list.useQuery();
  const { data: appointments } = trpc.appointment.list.useQuery();
  const { data: chatMessages } = trpc.chat.list.useQuery();
  const { data: videos } = trpc.video.list.useQuery();

  const stats = [
    { label: "Products", value: products?.length || 0, icon: ShoppingBag, color: "yellow" },
    { label: "Appointments", value: appointments?.length || 0, icon: Calendar, color: "green" },
    { label: "Chat Messages", value: chatMessages?.length || 0, icon: MessageSquare, color: "blue" },
    { label: "Videos", value: videos?.length || 0, icon: Video, color: "purple" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold text-white mb-8">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              <span className="text-2xl font-orbitron font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm text-white/40 font-rajdhani">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-orbitron font-bold text-white mb-4">Recent Appointments</h3>
          {appointments && appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-sm text-white font-rajdhani">{apt.name}</p>
                    <p className="text-xs text-white/40">{apt.phone}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === "confirmed"
                      ? "bg-green-500/10 text-green-400"
                      : apt.status === "cancelled"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-yellow-500/10 text-yellow-400"
                  }`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 font-rajdhani">No appointments yet</p>
          )}
        </div>

        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="font-orbitron font-bold text-white mb-4">Recent Chat Messages</h3>
          {chatMessages && chatMessages.length > 0 ? (
            <div className="space-y-3">
              {chatMessages.slice(0, 5).map((msg) => (
                <div key={msg.id} className="p-3 rounded-xl bg-white/5">
                  <p className="text-sm text-white/70 font-rajdhani line-clamp-1">{msg.message}</p>
                  <p className="text-xs text-white/30 mt-1">{msg.name || "Anonymous"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 font-rajdhani">No chat messages yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const { data: products, refetch } = trpc.product.list.useQuery();
  const createProduct = trpc.product.create.useMutation({ onSuccess: () => refetch() });
  const updateProduct = trpc.product.update.useMutation({ onSuccess: () => refetch() });
  const deleteProduct = trpc.product.delete.useMutation({ onSuccess: () => refetch() });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    category: "",
  });
  const [showForm, setShowForm] = useState(false);

  const handleCreate = () => {
    if (!formData.name || !formData.price) return;
    createProduct.mutate({ ...formData, inStock: true, featured: false });
    setFormData({ name: "", description: "", price: "", image: "", category: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <input
              placeholder="Product Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
            <input
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
            <input
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
            <input
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30 mb-4 resize-none"
          />
          <button
            onClick={handleCreate}
            disabled={createProduct.isPending}
            className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {createProduct.isPending ? "Creating..." : "Create Product"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {products?.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="flex items-center gap-4">
              {product.image && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 rounded-lg object-cover bg-black"
                />
              )}
              <div>
                <p className="text-white font-rajdhani font-medium">{product.name}</p>
                <p className="text-sm text-white/40">${product.price} &bull; {product.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateProduct.mutate({
                    id: product.id,
                    featured: !product.featured,
                  })
                }
                className={`p-2 rounded-lg transition-colors ${
                  product.featured
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-white/5 text-white/40 hover:text-yellow-400"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteProduct.mutate({ id: product.id })}
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideosTab() {
  const { data: videos, refetch } = trpc.video.list.useQuery();
  const createVideo = trpc.video.create.useMutation({ onSuccess: () => refetch() });
  const deleteVideo = trpc.video.delete.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", url: "", section: "" });

  const handleCreate = () => {
    if (!formData.title || !formData.url) return;
    createVideo.mutate(formData);
    setFormData({ title: "", url: "", section: "" });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-orbitron font-bold text-white">Videos</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <input
              placeholder="Video Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
            <input
              placeholder="Video URL"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
            <input
              placeholder="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={createVideo.isPending}
            className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
          >
            {createVideo.isPending ? "Creating..." : "Add Video"}
          </button>
        </div>
      )}

      <div className="space-y-3">
        {videos?.map((video) => (
          <div
            key={video.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="flex items-center gap-4">
              <Video className="w-5 h-5 text-yellow-500/60" />
              <div>
                <p className="text-white font-rajdhani font-medium">{video.title}</p>
                <p className="text-sm text-white/40">{video.section || "general"}</p>
              </div>
            </div>
            <button
              onClick={() => deleteVideo.mutate({ id: video.id })}
              className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentsTab() {
  const { data: appointments, refetch } = trpc.appointment.list.useQuery();
  const updateStatus = trpc.appointment.updateStatus.useMutation({ onSuccess: () => refetch() });
  const deleteAppointment = trpc.appointment.delete.useMutation({ onSuccess: () => refetch() });

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold text-white mb-8">Appointments</h1>
      <div className="space-y-3">
        {appointments?.map((apt) => (
          <div
            key={apt.id}
            className="p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-rajdhani font-medium">{apt.name}</p>
                <p className="text-sm text-white/40">{apt.email} &bull; {apt.phone}</p>
                <p className="text-sm text-white/30 mt-1">{apt.message}</p>
                {apt.date && <p className="text-xs text-yellow-500/60 mt-1">Requested: {apt.date}</p>}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={apt.status ?? "pending"}
                  onChange={(e) =>
                    updateStatus.mutate({
                      id: apt.id,
                      status: e.target.value as "pending" | "confirmed" | "cancelled",
                    })
                  }
                  className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-rajdhani focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  onClick={() => deleteAppointment.mutate({ id: apt.id })}
                  className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatTab() {
  const { data: messages } = trpc.chat.list.useQuery();
  const deleteMessage = trpc.chat.delete.useMutation();

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold text-white mb-8">Chat Logs</h1>
      <div className="space-y-3">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className="p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-white/40 font-rajdhani mb-1">
                  {msg.name || "Anonymous"} &bull; {msg.createdAt?.toLocaleString?.() || new Date(msg.createdAt).toLocaleString()}
                </p>
                <p className="text-white font-rajdhani mb-2">{msg.message}</p>
                <p className="text-sm text-yellow-400/60 font-rajdhani bg-yellow-500/5 p-3 rounded-xl">
                  AI: {msg.response}
                </p>
              </div>
              <button
                onClick={() => deleteMessage.mutate({ id: msg.id })}
                className="p-2 rounded-lg bg-white/5 text-white/40 hover:text-red-400 transition-colors ml-4"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const { data: settings } = trpc.settings.list.useQuery();
  const updateSetting = trpc.settings.update.useMutation();

  const [formData, setFormData] = useState({
    key: "",
    value: "",
  });

  const handleUpdate = () => {
    if (!formData.key || !formData.value) return;
    updateSetting.mutate(formData);
    setFormData({ key: "", value: "" });
  };

  return (
    <div>
      <h1 className="text-3xl font-orbitron font-bold text-white mb-8">Site Settings</h1>

      <div className="glass rounded-2xl p-6 border border-white/5 mb-6">
        <h3 className="font-orbitron font-bold text-white mb-4">Update Setting</h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input
            placeholder="Setting Key"
            value={formData.key}
            onChange={(e) => setFormData({ ...formData, key: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
          />
          <input
            placeholder="Setting Value"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 font-rajdhani focus:outline-none focus:border-yellow-500/30"
          />
        </div>
        <button
          onClick={handleUpdate}
          disabled={updateSetting.isPending}
          className="px-6 py-2 bg-yellow-500 text-black font-medium rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          {updateSetting.isPending ? "Updating..." : "Update Setting"}
        </button>
      </div>

      <div className="space-y-3">
        {settings?.map((setting) => (
          <div
            key={setting.id}
            className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5"
          >
            <div>
              <p className="text-white font-rajdhani font-medium">{setting.key}</p>
              <p className="text-sm text-white/40">{setting.value}</p>
            </div>
            <Edit2 className="w-4 h-4 text-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
