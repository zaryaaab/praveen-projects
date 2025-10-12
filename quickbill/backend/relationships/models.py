from django.db import models
from django.conf import settings

class Friendship(models.Model):
    """Model for managing friend and roommate relationships between users.
    
    Handles friend requests with different statuses (pending, accepted, declined)
    and relationship types (friend, roommate).
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted'),
        ('DECLINED', 'Declined')
    ]
    
    RELATIONSHIP_TYPE = [
        ('FRIEND', 'Friend'),
        ('ROOMMATE', 'Roommate')
    ]

    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_friendships')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_friendships')
    status = models.CharField(max_length=8, choices=STATUS_CHOICES, default='PENDING')
    relationship_type = models.CharField(max_length=8, choices=RELATIONSHIP_TYPE, default='FRIEND')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['sender', 'receiver']

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username} ({self.status})"
