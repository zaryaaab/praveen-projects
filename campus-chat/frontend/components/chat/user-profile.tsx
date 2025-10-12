"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Camera, Save, Lock, UserX } from "lucide-react"
import BlockedUsersDialog from "./blocked-users-dialog"
import api, { getUsers } from '@/lib/api'

interface UserProfileProps {
  user: any
  onClose: () => void
  onUpdate: (updatedUser: any) => void
  blockedUsers?: string[]
  onUnblockUser?: (userId: string) => void
}

export default function UserProfile({
  user,
  onClose,
  onUpdate,
  blockedUsers = [],
  onUnblockUser = () => {},
}: UserProfileProps) {
  const [name, setName] = useState(user.name || "")
  const [email, setEmail] = useState(user.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showBlockedUsers, setShowBlockedUsers] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [isPasswordLoading, setIsPasswordLoading] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])

  useEffect(() => {
    getUsers().then(setAllUsers)
  }, [])

  // Map blocked user IDs to user objects
  const blockedUserObjects = blockedUsers.map((id) =>
    allUsers.find((u) => u._id === id) || { _id: id, name: 'Unknown User' }
  )

  const handleUpdateProfile = async () => {
    setProfileMessage(null)
    setIsProfileLoading(true)
    try {
      const res = await api.put('/users/profile', { name: name.trim() })
      setProfileMessage('Profile updated successfully!')
      onUpdate({ ...user, name: res.data.name })
    } catch (err: any) {
      setProfileMessage(err.response?.data?.message || 'Failed to update profile')
    }
    setIsProfileLoading(false)
  }

  const handleChangePassword = async () => {
    setPasswordMessage(null)
    if (newPassword !== confirmPassword) {
      setPasswordMessage('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage('Password must be at least 6 characters')
      return
    }
    setIsPasswordLoading(true)
    try {
      await api.put('/users/change-password', {
        oldPassword: currentPassword,
        newPassword: newPassword,
      })
      setPasswordMessage('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordMessage(err.response?.data?.message || 'Failed to change password')
    }
    setIsPasswordLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className="bg-gray-100 cursor-not-allowed"
                    placeholder="Enter your email"
                  />
                </div>

                <Button onClick={handleUpdateProfile} className="w-full" disabled={isProfileLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isProfileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                {profileMessage && (
                  <div className={`text-sm mt-2 ${profileMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{profileMessage}</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  className="w-full"
                  disabled={!currentPassword || !newPassword || !confirmPassword || isPasswordLoading}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {isPasswordLoading ? 'Changing...' : 'Change Password'}
                </Button>
                {passwordMessage && (
                  <div className={`text-sm mt-2 ${passwordMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage}</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Blocked Users</h3>
                    <p className="text-sm text-gray-500">
                      {blockedUsers.length} user{blockedUsers.length !== 1 ? "s" : ""} blocked
                    </p>
                  </div>
                </div>
                {/* Blocked users list */}
                {blockedUserObjects.length > 0 ? (
                  <div className="space-y-2">
                    {blockedUserObjects.map((u: any) => (
                      <div key={u._id} className="flex items-center justify-between border rounded p-2">
                        <div>
                          <div className="font-medium">{u.name || 'Unknown User'}</div>
                          {u.email && <div className="text-xs text-gray-500">{u.email}</div>}
                        </div>
                        <Button size="sm" variant="outline" onClick={() => onUnblockUser(u._id)}>
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No blocked users</div>
                )}
                <div className="p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-2">Privacy Settings</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Blocked users cannot send you messages</p>
                    <p>• You won't see messages from blocked users</p>
                    <p>• Blocking is mutual - they won't see your messages either</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {showBlockedUsers && (
        <BlockedUsersDialog
          open={showBlockedUsers}
          onClose={() => setShowBlockedUsers(false)}
          blockedUsers={blockedUsers}
          currentUser={user}
          onUnblockUser={onUnblockUser}
        />
      )}
    </div>
  )
}
