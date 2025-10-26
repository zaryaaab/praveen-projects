from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data.
    
    This serializer handles user profile information and is used for
    retrieving and updating user details. It excludes sensitive information
    like passwords and includes basic user profile fields.
    
    Attributes:
        id: The unique identifier for the user (read-only)
        username: The user's unique username
        email: The user's email address
        first_name: User's first name
        last_name: User's last name
        phone_number: User's contact number
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number')
        read_only_fields = ('id',)

class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for handling user registration.
    
    This serializer manages new user registration with password validation.
    It includes password confirmation and ensures password requirements are met
    using Django's password validation.
    
    Attributes:
        password: The user's password (write-only)
        password2: Password confirmation field (write-only)
        
    Note:
        The password field is validated using Django's password validation
        to ensure it meets security requirements.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')

    def validate(self, attrs):
        """Validate the registration data.
        
        Ensures that the password and password confirmation match.
        
        Args:
            attrs: Dictionary of field values to validate
            
        Returns:
            The validated data if passwords match
            
        Raises:
            ValidationError: If passwords don't match
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """Create a new user instance.
        
        Creates a new user with the validated data, removing the password
        confirmation field and properly setting the password.
        
        Args:
            validated_data: Dictionary of validated user data
            
        Returns:
            The newly created user instance
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user