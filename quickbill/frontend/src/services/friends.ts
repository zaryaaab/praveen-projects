import { useSessionStore } from "../store/sessionStore";
import api from "./api";

/**
 * Fetches and formats the list of friends for the current user.
 * @returns Promise containing formatted list of friends with their details
 */
export const getFriends = async () => {
  const userData = useSessionStore.getState().getUserData();
  return api.get('relationships/friendships/').then((friends) => {
    const friendList = friends.map(friend => {
      const fr = friend.receiver === userData?.id
                  ? friend.sender_details
                  : friend.receiver_details;
      return {
        id: fr.id,
        name: fr.first_name + ' ' + fr.last_name,
        email: fr.email,
        status: friend.status,
        receiver: friend.receiver,
        sender: friend.sender,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
      }
    });
    return friendList;
  })
};

/**
 * Accepts or declines a friend request.
 * @param friendId The ID of the friendship to update
 * @param action The action to take ('accept' or 'decline')
 * @returns Promise containing the updated friendship status
 */
export const acceptOrDeclineFriendRequest = async (
  friendId: number,
  action: string
) => {
  return api.post(`relationships/friendships/${friendId}/${action}/`, { 
    "receiver": useSessionStore.getState().getUserData()?.id,
    "relationship_type": "FRIEND"
   });
};

/**
 * Sends a friend request to a user by their username.
 * @param username The username of the user to send friend request to
 * @returns Promise containing the created friendship request
 */
export const addNewFriend = async (
  username: string
) => {
  return api.post(`relationships/add-friend-by-username/`, { 
    "username": username,
    "relationship_type": "FRIEND"
   });
};
