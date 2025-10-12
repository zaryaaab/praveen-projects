from django.db import models
from django.conf import settings
from django.db.models import Sum

class UserBalance(models.Model):
    """Model for tracking financial balances between users.
    
    Manages the amount of money one user owes to another, with automatic
    balance updates when new expenses are created.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='balances')
    owed_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owed_by_balances')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'owed_to']

    def __str__(self):
        return f"{self.user.username} owes {self.owed_to.username}: {self.amount}"

    @classmethod
    def update_balance(cls, from_user, to_user, amount):
        """Updates or creates a balance record between two users.
        
        Args:
            from_user: The user who owes money
            to_user: The user who is owed money
            amount: The amount to add to the balance
        """
        balance, created = cls.objects.get_or_create(
            user=from_user,
            owed_to=to_user,
            defaults={'amount': 0}
        )
        balance.amount += amount
        balance.save()
