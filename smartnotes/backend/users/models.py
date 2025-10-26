from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    """Custom user model extending Django's AbstractUser with additional fields."""
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    def __str__(self):
        return self.email
