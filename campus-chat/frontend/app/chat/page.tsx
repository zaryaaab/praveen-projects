"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatSidebar from "@/components/chat/chat-sidebar"
import ChatArea from "@/components/chat/chat-area"
import UserProfile from "@/components/chat/user-profile"
import { getConversations, getMessages, sendMessage, createConversation, getBlockedUsers, blockUser, unblockUser, muteConversation, unmuteConversation, leaveGroup, reactToMessage } from "@/lib/api"

// Types matching backend schema
export interface UserType {
  _id: string;
  name: string;
  email: string;
}

export interface ConversationParticipant {
  user: UserType | string; // Populated or just ID
  role: 'admin' | 'member';
  is_muted?: boolean;
  joined_at?: string;
  left_at?: string | null;
}

export interface ConversationType {
  _id: string;
  type: 'direct' | 'group';
  name?: string;
  created_by: UserType | string;
  participants: ConversationParticipant[];
  created_at?: string;
  updated_at?: string;
  is_muted?: boolean;
  unread_count?: number;
}

export interface MessageReaction {
  user_id: string | UserType;
  reaction_type: 'like' | 'love' | 'laugh' | 'angry' | 'sad' | 'wow';
  created_at?: string;
}

export interface MessageType {
  _id: string;
  conversation_id: string | ConversationType;
  sender_id: string | UserType;
  content?: string;
  message_type: 'text' | 'image' | 'file';
  file_data?: string;
  is_edited?: boolean;
  edited_at?: string;
  reply_to_message_id?: string | MessageType;
  created_at?: string;
  updated_at?: string;
  reactions?: MessageReaction[];
  read_by?: { user_id: string | UserType; read_at?: string }[];
}

export default function ChatPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [activeConversation, setActiveConversation] = useState<ConversationType | null>(null)
  const [conversations, setConversations] = useState<ConversationType[]>([])
  const [messages, setMessages] = useState<MessageType[]>([])
  const [showProfile, setShowProfile] = useState(false)
  const router = useRouter()

  // Add these new state variables after the existing useState declarations
  const [blockedUsers, setBlockedUsers] = useState<string[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser")
    if (!savedUser) {
      router.push("/")
      return
    }
    setUser(JSON.parse(savedUser))
    getConversations().then(setConversations)
    getBlockedUsers().then((users) => setBlockedUsers(users.map((u: any) => u._id)))
  }, [router])

  useEffect(() => {
    if (activeConversation) {
      getMessages(activeConversation._id).then(setMessages)
    }
  }, [activeConversation])

  const handleSendMessage = async (content: string, type: "text" | "image" = "text", fileData?: string) => {
    if (!activeConversation || !user) return
    const data = {
      conversation_id: activeConversation._id,
      content: type === "text" ? content : null,
      message_type: type,
      file_data: fileData || null,
    }
    const newMessage = await sendMessage(data)
    if (newMessage) setMessages((prev) => [...prev, newMessage])
  }

  const handleReaction = async (messageId: string, reactionType: string) => {
    if (!user) return
    await reactToMessage(messageId, reactionType)
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg._id === messageId) {
          const existingReaction = msg.reactions?.find((r: any) => r.user_id === user._id)
          if (existingReaction) {
            if (existingReaction.reaction_type === reactionType) {
              return {
                ...msg,
                reactions: msg.reactions?.filter((r: any) => r.user_id !== user._id) || [],
              }
            } else {
              return {
                ...msg,
                reactions:
                  msg.reactions?.map((r: any) => (r.user_id === user._id ? { ...r, reaction_type: reactionType } : r)) ||
                  [],
              }
            }
          } else {
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                {
                  reaction_id: Date.now().toString(),
                  message_id: messageId,
                  user_id: user._id,
                  reaction_type: reactionType,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          }
        }
        return msg
      }),
    )
  }

  const handleMuteConversation = async (conversationId: string) => {
    const conv = conversations.find((c) => c._id === conversationId)
    if (conv?.is_muted) {
      await unmuteConversation(conversationId)
    } else {
      await muteConversation(conversationId)
    }
    setConversations((prev) =>
      prev.map((conv) => (conv._id === conversationId ? { ...conv, is_muted: !conv.is_muted } : conv)),
    )
  }

  const handleLeaveGroup = async (conversationId: string) => {
    if (!user) return
    await leaveGroup(conversationId)
    setConversations((prev) =>
      prev
        .map((conv) => {
          if (conv.type === "group") {
            return {
              ...conv,
              participants: conv.participants?.filter((p: any) => String(p.user) !== String(user._id)) || [],
            }
          }
          return conv
        })
        .filter((conv) => {
          if (conv._id === conversationId) {
            if (conv.type === "group") {
              return conv.participants && conv.participants.length > 0
            }
            return false
          }
          return true
        }),
    )
    if (activeConversation?._id === conversationId) {
      setActiveConversation(null)
    }
  }

  const handleBlockUser = async (userId: string) => {
    await blockUser(userId)
    setBlockedUsers((prev) => [...prev, userId])
    setConversations((prev) =>
      prev.filter((conv) => {
        if (conv.type === "direct") {
          return !conv.participants?.some((p: any) => String(p.user) === String(userId))
        }
        return true
      }),
    )
    if (
      activeConversation?.type === "direct" &&
      activeConversation.participants?.some((p: any) => String(p.user) === String(userId))
    ) {
      setActiveConversation(null)
    }
  }

  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId)
    setBlockedUsers((prev) => prev.filter((id) => id !== userId))
  }

  // Helper to filter messages for left group
  function filterMessagesForGroup(messages: MessageType[], conversation: ConversationType, user: UserType) {
    if (conversation.type !== 'group') return messages;
    const participant = conversation.participants.find((p) => {
      if (typeof p.user === 'object') return p.user._id === user._id;
      return p.user === user._id;
    });
    if (participant && participant.left_at) {
      return messages.filter((m) => !m.created_at || new Date(m.created_at) <= new Date(participant.left_at!));
    }
    return messages;
  }

  if (!user) {
    return <div>Loading...</div>
  }


  return (
    <div className="h-screen flex bg-gray-50">
      <ChatSidebar
        user={user}
        conversations={conversations}
        activeConversation={activeConversation}
        onConversationSelect={setActiveConversation}
        onShowProfile={() => setShowProfile(true)}
        onLogout={() => {
          localStorage.removeItem("currentUser")
          router.push("/")
        }}
        onMuteConversation={handleMuteConversation}
        onLeaveGroup={handleLeaveGroup}
      />

      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <ChatArea
            conversation={activeConversation}
            messages={Array.isArray(messages) && activeConversation ? filterMessagesForGroup(messages.filter((m) => m.conversation_id === activeConversation._id), activeConversation, user) : []}
            currentUser={user}
            onSendMessage={handleSendMessage}
            onReaction={handleReaction}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onMuteConversation={handleMuteConversation}
            onLeaveGroup={handleLeaveGroup}
            blockedUsers={blockedUsers}
            disableInput={activeConversation?.type === 'direct' && (() => {
              const other = activeConversation.participants?.find((p: any) => {
                if (typeof p.user === 'object') {
                  return p.user._id !== user._id;
                }
                return p.user !== user._id;
              });
              const otherId = typeof other?.user === 'object' ? other.user._id : other?.user;
              return !!otherId && blockedUsers.includes(otherId);
            })()}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">Welcome to Chat</h2>
              <p className="text-gray-500">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {showProfile && (
        <UserProfile
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdate={(updatedUser) => {
            setUser(updatedUser)
            localStorage.setItem("currentUser", JSON.stringify(updatedUser))
          }}
          blockedUsers={blockedUsers}
          onUnblockUser={handleUnblockUser}
        />
      )}
    </div>
  )
}
