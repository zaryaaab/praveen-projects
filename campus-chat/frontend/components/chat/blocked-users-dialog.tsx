"use client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserPlus, UserX } from "lucide-react"
import { mockUsers } from "@/lib/mock-data"

interface BlockedUsersDialogProps {
  open: boolean
  onClose: () => void
  blockedUsers: string[]
  currentUser: any
  onUnblockUser: (userId: string) => void
}

export default function BlockedUsersDialog({
  open,
  onClose,
  blockedUsers,
  currentUser,
  onUnblockUser,
}: BlockedUsersDialogProps) {
  const getBlockedUserDetails = () => {
    return mockUsers.filter((user) => blockedUsers.includes(user.user_id.toString()) && user.user_id !== currentUser.user_id)
  }

  const blockedUserDetails = getBlockedUserDetails()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Blocked Users</DialogTitle>
          <DialogDescription>
            Manage users you have blocked. You won't receive messages from blocked users.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {blockedUserDetails.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No blocked users</p>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-3">
              {blockedUserDetails.map((user) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-600 text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnblockUser(user.user_id.toString())}
                    className="text-green-600 hover:text-green-700"
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Unblock
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
