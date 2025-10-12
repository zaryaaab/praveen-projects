"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getUsers } from "@/lib/api"

interface CreateGroupDialogProps {
  currentUser: any
  onClose: () => void
  onCreate: (groupData: any) => void
}

export default function CreateGroupDialog({ currentUser, onClose, onCreate }: CreateGroupDialogProps) {
  const [groupName, setGroupName] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    getUsers().then(setUsers)
  }, [])

  const availableUsers = users

  const handleUserToggle = (userId: number) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const handleCreate = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      const groupData = {
        name: groupName.trim(),
        type: "group",
        participants: selectedUsers,
      }
      onCreate(groupData)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
          <DialogDescription>Create a new group conversation with multiple participants.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div className="space-y-2">
            <Label>Select Participants</Label>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {availableUsers.map((user) => (
                <div key={user._id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`user-${user._id}`}
                    checked={selectedUsers.includes(user._id)}
                    onCheckedChange={() => handleUserToggle(user._id)}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gray-600 text-white text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedUsers.length > 0 && (
            <p className="text-sm text-gray-600">
              {selectedUsers.length} participant{selectedUsers.length !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!groupName.trim() || selectedUsers.length === 0}>
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
