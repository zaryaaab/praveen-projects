from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Friendship
from accounts.models import User
from .serializers import FriendshipSerializer, UserSerializer, AddFriendByUsernameSerializer
from rest_framework.generics import CreateAPIView

class FriendshipViewSet(viewsets.ModelViewSet):
    """ViewSet for managing friendship relationships between users.
    
    This viewset provides endpoints for creating, accepting, declining, and listing
    friendship relationships. It also includes special endpoints for managing
    roommate relationships.
    """
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get all friendship relationships for the current user.
        
        Returns friendships where the user is either the sender or receiver.
        """
        return Friendship.objects.filter(
            Q(sender=self.request.user) | Q(receiver=self.request.user)
        )

    def perform_create(self, serializer):
        """Create a new friendship request.
        
        Sets the sender as the current user and status as 'PENDING'.
        """
        serializer.save(sender=self.request.user, status='PENDING')

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a friendship request.
        
        Only the receiver of the friendship request can accept it.
        
        Args:
            request: The HTTP request
            pk: The ID of the sender user
            
        Returns:
            Response with success message or error if not authorized
        """
        friendship = Friendship.objects.get(sender__id=pk, receiver=request.user)
        if friendship.receiver != request.user:
            return Response(
                {"error": "Only the receiver can accept the request"},
                status=status.HTTP_403_FORBIDDEN
            )
        friendship.status = 'ACCEPTED'
        friendship.save()
        return Response({"status": "friendship accepted"})

    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a friendship request.
        
        Only the receiver of the friendship request can decline it.
        
        Args:
            request: The HTTP request
            pk: The ID of the friendship request
            
        Returns:
            Response with success message or error if not authorized
        """
        friendship = self.get_object()
        if friendship.receiver != request.user:
            return Response(
                {"error": "Only the receiver can decline the request"},
                status=status.HTTP_403_FORBIDDEN
            )
        friendship.status = 'DECLINED'
        friendship.save()
        return Response({"status": "friendship declined"})

    @action(detail=False, methods=['get'])
    def friends(self, request):
        """List all accepted friendships for the current user.
        
        Returns a list of friendships where the status is 'ACCEPTED' and the
        current user is either the sender or receiver.
        """
        friends = Friendship.objects.filter(
            (Q(sender=request.user) | Q(receiver=request.user)) &
            Q(status='ACCEPTED')
        )
        serializer = self.get_serializer(friends, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def roommates(self, request):
        """List all accepted roommate relationships for the current user.
        
        Returns a list of friendships where the status is 'ACCEPTED', the
        relationship_type is 'ROOMMATE', and the current user is either
        the sender or receiver.
        """
        roommates = Friendship.objects.filter(
            (Q(sender=request.user) | Q(receiver=request.user)) &
            Q(status='ACCEPTED') &
            Q(relationship_type='ROOMMATE')
        )
        serializer = self.get_serializer(roommates, many=True)
        return Response(serializer.data)


class AddFriendByUsernameView(CreateAPIView):
    """API view for adding friends by username.
    
    This view allows users to send friendship requests by providing the username
    of the person they want to add as a friend. It includes validation to prevent
    duplicate friendships and self-friending.
    """
    serializer_class = AddFriendByUsernameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """Create a new friendship request using username.
        
        Validates the username exists and creates a new pending friendship request.
        Includes checks to prevent self-friending and duplicate friendships.
        
        Args:
            request: The HTTP request containing username and relationship type
            
        Returns:
            Response with the created friendship or appropriate error message
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Find the user by username
            friend = User.objects.get(username=serializer.validated_data['username'])
            
            # Prevent self-friending
            if friend == request.user:
                return Response(
                    {"error": "Cannot add yourself as a friend"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check for existing friendship
            if Friendship.objects.filter(
                (Q(sender=request.user, receiver=friend) |
                Q(sender=friend, receiver=request.user))
            ).exists():
                return Response(
                    {"error": "Already friends with this user"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create new friendship request
            friendship = Friendship.objects.create(
                sender=request.user,
                receiver=friend,
                status='PENDING',
                relationship_type=serializer.validated_data['relationship_type']
            )
            
            return Response(
                FriendshipSerializer(friendship).data,
                status=status.HTTP_201_CREATED
            )

        except User.DoesNotExist:
            return Response(
                {"error": "No user found with this username"},
                status=status.HTTP_404_NOT_FOUND
            )
