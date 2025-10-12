"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info, Bell, BellOff, LogOut, UserX, UserPlus } from "lucide-react"
import MessageItem from "./message-item"
import EmojiPicker from "./emoji-picker"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getUsers, addParticipantsToGroup } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"

interface ChatAreaProps {
  conversation: any
  messages: any[]
  currentUser: any
  onSendMessage: (content: string, type?: "text" | "image", fileData?: string) => void
  onReaction: (messageId: string, reactionType: string) => void
  onBlockUser: (userId: string) => void
  onUnblockUser: (userId: string) => void
  onMuteConversation: (conversationId: string) => void
  onLeaveGroup: (conversationId: string) => void
  blockedUsers: string[]
  disableInput?: boolean
  onParticipantsChanged?: () => void
}

export default function ChatArea({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onReaction,
  onBlockUser,
  onUnblockUser,
  onMuteConversation,
  onLeaveGroup,
  blockedUsers,
  disableInput,
  onParticipantsChanged,
}: ChatAreaProps) {
  const [messageText, setMessageText] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [selectedToAdd, setSelectedToAdd] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText.trim())
      setMessageText("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onSendMessage(file.name, "image", result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Helper to get the other participant's name for direct messages
  const getOtherParticipant = () => {
    if (conversation.type === 'direct') {
      return conversation.participants?.find((p: any) => {
        if (typeof p.user === 'object') {
          return p.user._id !== currentUser._id;
        }
        return p.user !== currentUser._id;
      });
    }
    return null;
  };

  const getConversationName = () => {
    if (conversation.type === 'group') {
      return conversation.name;
    }
    const other = getOtherParticipant();
    if (other) {
      if (typeof other.user === 'object') {
        return other.user.name;
      }
      return other.name || 'Unknown User';
    }
    return 'Unknown User';
  };

  const getConversationInfo = () => {
    if (conversation.type === "group") {
      return `${conversation.participants?.length || 0} members`
    }
    return "Online" // In a real app, you'd check actual online status
  }

  const handleBlockUser = (userId: string) => {
    if (confirm("Are you sure you want to block this user?")) {
      onBlockUser(userId)
    }
  }

  const handleUnblockUser = (userId: string) => {
    if (confirm("Are you sure you want to unblock this user?")) {
      onUnblockUser(userId)
    }
  }

  const handleMuteConversation = () => {
    onMuteConversation(conversation.conversation_id)
  }

  const handleLeaveGroup = () => {
    if (confirm("Are you sure you want to leave this group?")) {
      onLeaveGroup(conversation._id)
    }
  }

  const isUserBlocked = (userId: string) => {
    return blockedUsers.includes(userId)
  }

  // Sort messages by created_at ascending (oldest at top, newest at bottom)
  const sortedMessages = [...messages].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  // Check if current user is still a participant in the group
  const isParticipant = conversation.participants?.some((p: any) => {
    if (typeof p.user === 'object') {
      return p.user._id === currentUser._id && !p.left_at;
    }
    return p.user === currentUser._id && !p.left_at;
  });

  const openAddMembers = async () => {
    setShowAddMembers(true)
    setIsLoadingUsers(true)
    const users = await getUsers()
    setAllUsers(users)
    setIsLoadingUsers(false)
    setSelectedToAdd([])
  }

  const handleUserToggle = (userId: string) => {
    setSelectedToAdd((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])
  }

  const handleAddMembers = async () => {
    if (!selectedToAdd.length) return
    setIsAdding(true)
    await addParticipantsToGroup(conversation._id, selectedToAdd)
    setIsAdding(false)
    setShowAddMembers(false)
    if (onParticipantsChanged) onParticipantsChanged()
    // Optionally, refresh conversation participants/messages here
  }

  // Get IDs of current participants
  const currentParticipantIds = conversation.participants?.map((p: any) => (typeof p.user === 'object' ? p.user._id : p.user)) || []

  // Filter users: not already in group, not current user
  const availableToAdd = allUsers.filter((u) => u._id !== currentUser._id && !currentParticipantIds.includes(u._id))

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback
                className={conversation.type === "group" ? "bg-green-600 text-white" : "bg-gray-600 text-white"}
              >
                {getConversationName().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-gray-900">{getConversationName()}</h2>
              <p className="text-sm text-gray-500">{getConversationInfo()}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">

            {isParticipant && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* Group Options */}
                  {conversation.type === "group" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={openAddMembers}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Members
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLeaveGroup} className="text-red-600">
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave Group
                      </DropdownMenuItem>
                    </>
                  )}

                  {/* Direct Message Options */}
                  {conversation.type === 'direct' && getOtherParticipant() && (
                    <>
                      <DropdownMenuSeparator />
                      {blockedUsers.includes(
                        typeof getOtherParticipant().user === 'object'
                          ? getOtherParticipant().user._id
                          : getOtherParticipant().user
                      ) ? (
                        <DropdownMenuItem
                          onClick={() =>
                            onUnblockUser(
                              typeof getOtherParticipant().user === 'object'
                                ? getOtherParticipant().user._id
                                : getOtherParticipant().user
                            )
                          }
                          className="text-green-600"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Unblock User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            onBlockUser(
                              typeof getOtherParticipant().user === 'object'
                                ? getOtherParticipant().user._id
                                : getOtherParticipant().user
                            )
                          }
                          className="text-red-600"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                      )}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {sortedMessages.map((message) => (
          <MessageItem key={message._id} message={message} currentUser={currentUser} onReaction={onReaction} canReact={isParticipant} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        {!isParticipant ? (
          <div className="text-center text-gray-400 py-4">
            You have left this group and cannot send messages.
          </div>
        ) : disableInput ? (
          <div className="text-center text-gray-400 py-4">
            You cannot send messages to this user because they are blocked.
          </div>
        ) : (
          <div className="flex items-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="h-4 w-4" />
            </Button>

            <div className="flex-1 relative">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="pr-10"
                multiline
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleSendMessage} disabled={!messageText.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showEmojiPicker && !disableInput && isParticipant && (
          <div className="absolute bottom-16 right-4">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                setMessageText((prev) => prev + emoji)
                setShowEmojiPicker(false)
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />

      {/* Add Members Dialog */}
      <Dialog open={showAddMembers} onOpenChange={setShowAddMembers}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Members to Group</DialogTitle>
          </DialogHeader>
          {isLoadingUsers ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableToAdd.length === 0 ? (
                <div className="text-gray-500 text-center">No users available to add.</div>
              ) : (
                availableToAdd.map((user) => (
                  <div key={user._id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`add-user-${user._id}`}
                      checked={selectedToAdd.includes(user._id)}
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
                ))
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMembers(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAddMembers} disabled={!selectedToAdd.length || isAdding}>
              {isAdding ? "Adding..." : "Add Members"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
