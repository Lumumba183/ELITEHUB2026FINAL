import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, User, MapPin, FileText, Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";

export default function Profile() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => alert("Profile updated!"),
  });

  const handleSave = () => {
    updateProfile.mutate({
      name: name || undefined,
      bio: bio || undefined,
      location: location || undefined,
      age: age ? Number(age) : undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <div className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-[#9CA3AF] hover:text-[#F5E6D3]">
              <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
            </Button>
          </Link>
          <h1 className="text-lg font-bold text-[#F5E6D3]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Profile Settings
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
            { id: "security", label: "Security", icon: <FileText className="w-4 h-4" /> },
            { id: "notifications", label: "Notifications", icon: <FileText className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/20"
                  : "text-[#9CA3AF] hover:text-[#F5E6D3] hover:bg-white/5"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="glass glass-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Profile Photo</h3>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={user?.avatar ?? "/assets/companion-avatar-1.jpg"}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#E11D48]/30"
                  />
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-crimson flex items-center justify-center">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm text-[#F5E6D3] mb-1">Upload a new photo</p>
                  <p className="text-xs text-[#9CA3AF] mb-3">JPG, PNG. Max 5MB</p>
                  <Button size="sm" variant="outline" className="border-white/10 text-[#9CA3AF] hover:text-[#F5E6D3]">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="glass glass-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Basic Information</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Display Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your display name"
                    className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-11"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#9CA3AF] mb-2">Age</label>
                  <Input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Your age"
                    className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-11"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#9CA3AF] mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="pl-10 bg-[#14141E] border-white/10 text-[#F5E6D3] h-11"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-[#9CA3AF] mb-2">Bio</label>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about yourself..."
                    className="bg-[#14141E] border-white/10 text-[#F5E6D3] min-h-[100px] resize-none"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={updateProfile.isPending}
              className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full px-8 h-12"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}

        {activeTab === "security" && (
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Current Password</label>
                <Input type="password" placeholder="Enter current password" className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-11" />
              </div>
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">New Password</label>
                <Input type="password" placeholder="Enter new password" className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-11" />
              </div>
              <div>
                <label className="block text-sm text-[#9CA3AF] mb-2">Confirm New Password</label>
                <Input type="password" placeholder="Confirm new password" className="bg-[#14141E] border-white/10 text-[#F5E6D3] h-11" />
              </div>
              <Button className="gradient-crimson text-white border-0 hover:opacity-90 rounded-full">
                Update Password
              </Button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="glass glass-border rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#F5E6D3] mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { label: "Email notifications", desc: "Receive updates via email" },
                { label: "New message alerts", desc: "Get notified of new messages" },
                { label: "Payment notifications", desc: "Alerts for deposits and withdrawals" },
                { label: "Marketing emails", desc: "Promotional content and offers" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-[#F5E6D3]">{item.label}</p>
                    <p className="text-xs text-[#9CA3AF]">{item.desc}</p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-[#E11D48] relative transition-colors">
                    <div className="w-5 h-5 rounded-full bg-white absolute right-0.5 top-0.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
