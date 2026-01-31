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

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Only admin can access settings
  if (session?.user?.name !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="bg-slate-800 border-slate-700 max-w-md">
          <CardHeader>
            <CardTitle className="text-white">Access Denied</CardTitle>
            <CardDescription className="text-slate-400">
              Only administrators can access settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                          Created: {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {user.username !== "admin" && (
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
        </div>
      </main>
    </div>
  );
}
