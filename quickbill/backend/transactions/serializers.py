from rest_framework import serializers
from .models import UserBalance

class UserBalanceSerializer(serializers.ModelSerializer):
    """Serializer for handling user balance information.
    
    This serializer manages the display of financial balances between users,
    showing how much money one user owes to another.
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    owed_to_username = serializers.CharField(source='owed_to.username', read_only=True)

    class Meta:
        model = UserBalance
        fields = ['id', 'user_username', 'owed_to_username', 'amount', 'last_updated']