from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Friendship

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for basic user information in friendship contexts."""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class FriendshipSerializer(serializers.ModelSerializer):
    """Serializer for managing friendship relationships between users."""
    sender_details = UserSerializer(source='sender', read_only=True)
    receiver_details = UserSerializer(source='receiver', read_only=True)

    class Meta:
        model = Friendship
        fields = ['id', 'sender', 'receiver', 'sender_details', 'receiver_details', 
                 'status', 'relationship_type', 'created_at', 'updated_at']
        read_only_fields = ['sender', 'status', 'created_at', 'updated_at']

class AddFriendByUsernameSerializer(serializers.Serializer):
    """Serializer for adding friends using their username."""
    username = serializers.CharField()
    relationship_type = serializers.ChoiceField(
        choices=Friendship.RELATIONSHIP_TYPE,
        default='FRIEND'
    )
