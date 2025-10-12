"use client"

import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  SmileIcon as Surprise,
} from "lucide-react"

interface MessageItemProps {
  message: any
  currentUser: any
  onReaction: (messageId: string, reactionType: string) => void
  canReact?: boolean
}

const reactionEmojis = {
  like: { icon: ThumbsUp, emoji: "👍" },
  love: { icon: Heart, emoji: "❤️" },
  laugh: { icon: Laugh, emoji: "😂" },
  angry: { icon: Angry, emoji: "😠" },
  sad: { icon: Frown, emoji: "😢" },
  wow: { icon: Surprise, emoji: "😮" },
}

export default function MessageItem({ message, currentUser, onReaction, canReact = true }: MessageItemProps) {
  const [showReactions, setShowReactions] = useState(false)
  // Use _id for user comparison
  const isOwnMessage = (typeof message.sender_id === 'object' ? message.sender_id._id : message.sender_id) === currentUser._id;

  // Get sender info
  const senderName = isOwnMessage
    ? 'You'
    : typeof message.sender_id === 'object'
      ? message.sender_id.name
      : `User ${message.sender_id}`;

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getReactionCounts = () => {
    const counts: { [key: string]: number } = {}
    message.reactions?.forEach((reaction: any) => {
      counts[reaction.reaction_type] = (counts[reaction.reaction_type] || 0) + 1
    })
    return counts
  }

  const hasUserReacted = (reactionType: string) => {
    return message.reactions?.some((r: any) => {
      const uid = typeof r.user_id === 'object' ? r.user_id._id : r.user_id;
      return uid === currentUser._id && r.reaction_type === reactionType;
    });
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} group`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse" : "flex-row"} space-x-2`}>
        {!isOwnMessage && (
          <Avatar className="h-8 w-8 mt-1">
            <AvatarFallback className="bg-gray-600 text-white text-xs">{senderName.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
          {!isOwnMessage && <span className="text-xs text-gray-500 mb-1 px-2">{senderName}</span>}

          <div
            className={`relative px-4 py-2 rounded-lg ${
              isOwnMessage ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
            }`}
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {message.message_type === "text" && <p className="text-sm">{message.content}</p>}

            {message.message_type === "image" && (
              <div className="space-y-2">
                {message.file_data && (
                  <img
                    src={message.file_data || "/placeholder.svg"}
                    alt="Shared image"
                    className="max-w-full h-auto rounded"
                  />
                )}
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            )}

            <div className="flex items-center justify-between mt-1">
              <span className={`text-xs ${isOwnMessage ? "text-blue-100" : "text-gray-400"}`}>
                {formatTime(message.created_at)}
              </span>

              {message.is_edited && (
                <span className={`text-xs ${isOwnMessage ? "text-blue-100" : "text-gray-400"}`}>edited</span>
              )}
            </div>

            {/* Quick Reactions */}
            {showReactions && canReact && (
              <div
                className={`absolute -top-8 ${isOwnMessage ? "right-0" : "left-0"} bg-white border border-gray-200 rounded-full px-2 py-1 shadow-lg flex space-x-1`}
              >
                {Object.entries(reactionEmojis).map(([type, { emoji }]) => (
                  <button
                    key={type}
                    onClick={() => onReaction(message._id, type)}
                    className="hover:scale-110 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}

          
          </div>

          {/* Reaction Display */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 px-2">
              {Object.entries(getReactionCounts()).map(([type, count]) => (
                <Badge
                  key={type}
                  variant={hasUserReacted(type) ? "default" : "secondary"}
                  className={`text-xs cursor-pointer${canReact ? '' : ' opacity-50 pointer-events-none'}`}
                  onClick={canReact ? () => onReaction(message._id, type) : undefined}
                >
                  {reactionEmojis[type as keyof typeof reactionEmojis]?.emoji} {count}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
