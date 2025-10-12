import { Search, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { acceptOrDeclineFriendRequest, addNewFriend, getFriends } from "../services/friends";
import { useSessionStore } from "../store/sessionStore";

export function FriendsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddFriend, setShowAddFriend] = useState(false);
    const [newFriendUsername, setNewFriendUsername] = useState('');
    const [friends, setFriends] = useState([]);
    const userData = useSessionStore.getState().getUserData();

    useEffect(() => {
      getFriends().then((friendList) => {
        setFriends(friendList);
      })
    }, [])

    const handleAddFriend = (e) => {
      e.preventDefault();
      console.log('Sending friend request to:', newFriendUsername);
      addNewFriend(newFriendUsername).then(() => {
        getFriends().then((friendList) => {
          setFriends(friendList);
        })
      })
      setNewFriendUsername('');
      setShowAddFriend(false);
    };
  
    const handleFriendRequest = (senderId, action) => {
      console.log(`Friend request ${senderId} ${action}`);
      acceptOrDeclineFriendRequest(senderId, action).then(() => {
        getFriends().then((friendList) => {
          setFriends(friendList);
        })
      })
    };

    const filteredFriends = friends.filter(friend =>
      friend.status === 'ACCEPTED' &&
      (friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  
    return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Friends</h2>
          <button
            onClick={() => setShowAddFriend(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <UserPlus className="h-5 w-5" />
            Add Friend
          </button>
        </div>
  
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Search friends by name or email"
          />
        </div>
  
        {/* Friend Requests */}
        {friends.filter(friend => friend.status === 'PENDING').length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Requests</h3>
            <div className="space-y-4">
              {friends.filter(friend => friend.status === 'PENDING').map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.image}
                      alt={request.name}
                      className="h-10 w-10 rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-500">{request.email}</p>
                    </div>
                  </div>
                  {request.receiver === userData?.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleFriendRequest(request.sender, 'accept')}
                        className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFriendRequest(request.sender, 'decline')}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      >
                        Decline
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Request Sent</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Friends List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="space-y-4">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{friend.name}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  {friend.totalOwed > 0 && (
                    <p className="text-sm font-medium text-green-600">
                      owes you ${friend.totalOwed.toFixed(2)}
                    </p>
                  )}
                  {friend.totalOwes > 0 && (
                    <p className="text-sm font-medium text-red-600">
                      you owe ${friend.totalOwes.toFixed(2)}
                    </p>
                  )}
                  {friend.totalOwed === 0 && friend.totalOwes === 0 && (
                    <p className="text-sm text-gray-500">all settled up</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Friend</h3>
                <button
                  onClick={() => setShowAddFriend(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleAddFriend}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Friend's Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={newFriendUsername}
                      onChange={(e) => setNewFriendUsername(e.target.value)}
                      className="pl-10 block w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddFriend(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }