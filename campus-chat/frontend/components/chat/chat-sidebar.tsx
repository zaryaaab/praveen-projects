"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Settings, LogOut, Users, BellOff, Bell, MoreVertical } from "lucide-react"
import CreateGroupDialog from "./create-group-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { createConversation, addParticipantsToGroup, getConversations, getUsers } from "@/lib/api"

interface ChatSidebarProps {
  user: any
  conversations: any[]
  activeConversation: any
  onConversationSelect: (conversation: any) => void
  onShowProfile: () => void
  onLogout: () => void
  onMuteConversation: (conversationId: string) => void
  onLeaveGroup: (conversationId: string) => void
}

export default function ChatSidebar({
  user,
  conversations,
  activeConversation,
  onConversationSelect,
  onShowProfile,
  onLogout,
  onMuteConversation,
  onLeaveGroup,
}: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showAddParticipants, setShowAddParticipants] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)
  const [allConversations, setAllConversations] = useState<any[]>([])
  const [showStartChat, setShowStartChat] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    getConversations().then(setAllConversations)
  }, [])

  const handleCreateGroup = async (groupData: any) => {
    const newGroup = await createConversation(groupData)
    if (newGroup) {
      setAllConversations((prev) => [newGroup, ...prev])
      setShowCreateGroup(false)
    }
  }

  const handleAddParticipants = async (groupId: string, participants: any[]) => {
    await addParticipantsToGroup(groupId, participants)
    // Optionally, refresh conversations
    const updated = await getConversations()
    setAllConversations(updated)
    setShowAddParticipants(false)
  }

  const filteredConversations = allConversations.filter((conv) => {
    if (!searchQuery) return true; // Show all if no search
    if (conv.type === 'group') {
      return (
        conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participants?.some((p: any) => p.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    // For direct messages, check the other participant's name or email
    if (conv.type === 'direct') {
      const other = conv.participants?.find((p: any) => {
        if (typeof p.user === 'object') {
          return p.user._id !== user._id;
        }
        return p.user !== user._id;
      });
      if (other) {
        const name = typeof other.user === 'object' ? other.user.name : other.name;
        const email = typeof other.user === 'object' ? other.user.email : other.email;
        return (
          (name && name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (email && email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }
      return false;
    }
    return false;
  });


  const getConversationName = (conversation: any) => {
    if (conversation.type === "group") {
      return conversation.name;
    }
    // For direct messages, show the other participant's name
    const otherParticipant = conversation.participants?.find((p: any) => {
      if (typeof p.user === 'object') {
        return p.user._id !== user._id;
      }
      return p.user !== user._id;
    });
    if (otherParticipant) {
      if (typeof otherParticipant.user === 'object') {
        return otherParticipant.user.name;
      }
      return otherParticipant.name || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getConversationAvatar = (conversation: any) => {
    if (conversation.type === "group") {
      return conversation.name?.charAt(0).toUpperCase() || "G"
    }
    const otherParticipant = conversation.participants?.find((p: any) => p.user_id !== user.user_id)
    return otherParticipant?.name?.charAt(0).toUpperCase() || "U"
  }

  const handleConversationAction = (action: string, conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    switch (action) {
      case "mute":
        onMuteConversation(conversationId)
        break
      case "unmute":
        onMuteConversation(conversationId)
        break
      case "leave":
        if (confirm("Are you sure you want to leave this group?")) {
          onLeaveGroup(conversationId)
        }
        break
    }
  }

  const openStartChat = async () => {
    setShowStartChat(true)
    setIsLoadingUsers(true)
    const allUsers = await getUsers()
    setUsers(allUsers)
    setIsLoadingUsers(false)
  }

  const handleStartChat = async (userId: string) => {
    // Check if a direct conversation with this user already exists
    const existing = allConversations.find((conv) => {
      if (conv.type !== 'direct') return false;
      const participantIds = conv.participants.map((p: any) =>
        typeof p.user === 'object' ? p.user._id : p.user
      );
      return participantIds.includes(userId) && participantIds.includes(user._id) && conv.participants.length === 2;
    });
    if (existing) {
      setShowStartChat(false);
      onConversationSelect(existing);
      return;
    }
    const conversation = await createConversation({
      type: 'direct',
      participants: [userId],
    });
    if (conversation) {
      setAllConversations((prev) => [conversation, ...prev]);
      setShowStartChat(false);
      onConversationSelect(conversation);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white">{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">{user.name}</h2>
              <p className="text-sm text-gray-500">Online</p>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onShowProfile}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowLogoutDialog(true)}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-200 flex flex-col gap-2">
        <Button onClick={openStartChat} className="w-full justify-start" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Start Chat
        </Button>
        <Button onClick={() => setShowCreateGroup(true)} className="w-full justify-start" variant="secondary">
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation._id}
            onClick={() => onConversationSelect(conversation)}
            className={`group p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${activeConversation?.conversation_id === conversation.conversation_id ? "bg-blue-50 border-blue-200" : ""
              }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarFallback
                    className={conversation.type === "group" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}
                  >
                    {getConversationAvatar(conversation)}
                  </AvatarFallback>
                </Avatar>
                {conversation.type === "group" && (
                  <Users className="absolute -bottom-1 -right-1 h-4 w-4 bg-white rounded-full p-0.5 text-green-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">{getConversationName(conversation)}</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {conversation.type === "group"
                    ? `${conversation.participants?.length || 0} members`
                    : "Direct message"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateGroup && (
        <CreateGroupDialog
          currentUser={user}
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {showAddParticipants && (
        <CreateGroupDialog
          currentUser={user}
          onClose={() => setShowAddParticipants(false)}
          onCreate={(data) => handleAddParticipants(selectedGroup.conversation_id, data.participants)}
        />
      )}

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to log out?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowLogoutDialog(false);
                onLogout();
              }}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Chat Dialog */}
      <Dialog open={showStartChat} onOpenChange={setShowStartChat}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start a New Chat</DialogTitle>
            <DialogDescription>Select a user to start a direct conversation.</DialogDescription>
          </DialogHeader>
          {isLoadingUsers ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3">
              {users.filter((u) => u._id !== user._id).map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {u.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartChat(u._id)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Start Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
