from rest_framework import serializers
from .models import Expense, ExpenseShare
from accounts.models import User
# from django.core.mail import send_mail

class ExpenseShareSerializer(serializers.ModelSerializer):
    """Serializer for handling expense shares between users.
    
    This serializer manages the individual shares of an expense, including the amount
    each user owes and their payment status.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = ExpenseShare
        fields = ['id', 'user', 'username', 'amount', 'is_paid', 'paid_at']

class ExpenseSerializer(serializers.ModelSerializer):
    """Serializer for handling expense creation and management.
    
    This serializer handles both equal and custom split expenses between multiple users.
    It manages the creation of expense shares and validates the split amounts.
    
    Attributes:
        shares: Nested serializer for expense shares
        created_by_username: Username of the expense creator
        participant_ids: List of user IDs participating in the expense
        custom_splits: List of custom split amounts (required for CUSTOM split type)
    """
    shares = ExpenseShareSerializer(many=True, read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    participant_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True)
    custom_splits = serializers.ListField(
        child=serializers.DecimalField(max_digits=10, decimal_places=2),
        write_only=True, 
        required=False
    )

    class Meta:
        model = Expense
        fields = ['id', 'title', 'amount', 'created_by', 'created_by_username', 'created_at',
                 'split_type', 'category', 'description', 'notes', 'receipt', 'is_settled', 'shares',
                 'participant_ids', 'custom_splits']
        read_only_fields = ['created_by', 'is_settled']

    def create(self, validated_data):
        """Create an expense and its associated shares.
        
        This method handles the creation of an expense and automatically creates
        the appropriate expense shares based on the split type (EQUAL or CUSTOM).
        
        Args:
            validated_data: Dictionary containing validated expense data
            
        Returns:
            Expense: The created expense instance
            
        Raises:
            ValidationError: If custom splits are invalid or missing
        """
        # Extract and remove participant data from validated_data
        participant_ids = validated_data.pop('participant_ids')
        custom_splits = validated_data.pop('custom_splits', None)
        
        # Create the main expense record
        expense = Expense.objects.create(**validated_data)
        amount_per_person = expense.amount / (len(participant_ids) + 1)

        participant_emails = []
        for user_id in participant_ids:
            participant_emails.append(User.objects.get(id=user_id).email)

        # send_mail(
        #     subject="Expense Created",
        #     message=f"An expense is created on QuickBill with you as a participant. Your share: {amount_per_person}$",
        #     from_email="hello@demomailtrap.co",
        #     recipient_list=participant_emails
        # )

        if expense.split_type == 'EQUAL':
            # Create expense shares for each participant
            for user_id in participant_ids:
                ExpenseShare.objects.create(
                    expense=expense,
                    user_id=user_id,
                    amount=amount_per_person
                )
        else:  # CUSTOM split
            # Validate custom splits
            if not custom_splits or len(custom_splits) != len(participant_ids):
                raise serializers.ValidationError("Custom splits must be provided for all participants")
            
            # Create expense shares with custom amounts
            for user_id, amount in zip(participant_ids, custom_splits):
                ExpenseShare.objects.create(
                    expense=expense,
                    user_id=user_id,
                    amount=amount
                )
        
        return expense