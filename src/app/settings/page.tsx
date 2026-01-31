"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface User {
  username: string;
  createdAt: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPasswordChange, setNewPasswordChange] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const isAdmin = session?.user?.name === "admin";

  // Fetch users on mount (admin only)
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "User created successfully" });
        setNewUsername("");
        setNewPassword("");
        fetchUsers();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to create user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to create user" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`Delete user "${username}"?`)) return;

    try {
      const response = await fetch(`/api/users?username=${username}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "User deleted" });
        fetchUsers();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.error || "Failed to delete user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Failed to delete user" });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPasswordChange !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPasswordChange.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters" });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword: newPasswordChange,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordMessage({ type: "success", text: "Password changed successfully" });
        setCurrentPassword("");
        setNewPasswordChange("");
        setConfirmPassword("");
      } else {
        setPasswordMessage({ type: "error", text: data.error || "Failed to change password" });
      }
    } catch (error) {
      setPasswordMessage({ type: "error", text: "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Password Change Card - Available for all users */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Change Password</CardTitle>
              <CardDescription className="text-slate-400">
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-white">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-white">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPasswordChange}
                      onChange={(e) => setNewPasswordChange(e.target.value)}
                      placeholder="Enter new password"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>
                {passwordMessage && (
                  <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-400" : "text-red-400"}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPasswordChange || !confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {passwordLoading ? "Changing..." : "Change Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Admin-only sections */}
          {isAdmin && (
            <>
              {/* Add User Card */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Add New User</CardTitle>
                  <CardDescription className="text-slate-400">
                    Create a new user account for the Firecrawl web interface
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                          id="username"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          placeholder="Enter username"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter password"
                          className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                          required
                        />
                      </div>
                    </div>
                    {message && (
                      <p className={`text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
                        {message.text}
                      </p>
                    )}
                    <Button
                      type="submit"
                      disabled={loading || !newUsername || !newPassword}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? "Creating..." : "Add User"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Users List Card */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Existing Users</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage user accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {users.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No users found</p>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.username}
                          className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                        >
                          <div>
                            <p className="text-white font-medium">{user.username}</p>
                            <p className="text-slate-400 text-sm">
                              Created: {user.createdAt === "Environment Variable" ? user.createdAt : new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {user.username !== "admin" && user.createdAt !== "Environment Variable" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.username)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Environment Variables</CardTitle>
                  <CardDescription className="text-slate-400">
                    Current configuration (set in Vercel Dashboard)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-slate-300">
                    <span className="text-slate-500">DEMO_USERS:</span> Configure initial users in Vercel Environment Variables
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500">FIRECRAWL_API_KEY:</span> ••••••••
                  </p>
                  <p className="text-sm text-slate-400 mt-4">
                    Note: Users added here are stored in memory and will reset on deployment.
                    For permanent users, update the DEMO_USERS environment variable in Vercel.
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
