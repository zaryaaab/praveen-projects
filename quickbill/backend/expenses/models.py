from django.db import models
from django.conf import settings
from transactions.models import UserBalance

class Expense(models.Model):
    """Model for managing expenses between users with equal or custom splits."""
    SPLIT_CHOICES = [
        ('EQUAL', 'Split Equally'),
        ('CUSTOM', 'Custom Split'),
    ]
    
    CATEGORY_CHOICES = [
        ('FOOD', 'Food & Dining'),
        ('TRANSPORT', 'Transportation'),
        ('ENTERTAINMENT', 'Entertainment'),
        ('SHOPPING', 'Shopping'),
        ('UTILITIES', 'Utilities'),
        ('HEALTHCARE', 'Healthcare'),
        ('TRAVEL', 'Travel'),
        ('EDUCATION', 'Education'),
        ('OTHER', 'Other'),
    ]

    title = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_expenses')
    created_at = models.DateTimeField(auto_now_add=True)
    split_type = models.CharField(max_length=6, choices=SPLIT_CHOICES, default='EQUAL')
    category = models.CharField(max_length=15, choices=CATEGORY_CHOICES, default='OTHER')
    description = models.TextField(blank=True)
    notes = models.TextField(blank=True, help_text="Additional notes about this expense")
    receipt = models.ImageField(upload_to='receipts/', null=True, blank=True)
    is_settled = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.title} - {self.amount}"

class ExpenseShare(models.Model):
    """Model for tracking individual shares of an expense and their payment status."""
    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name='shares')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['expense', 'user']

    def __str__(self):
        return f"{self.expense.title} - {self.user.username} - {self.amount}"
    
    def save(self, *args, **kwargs):
        """Override save to update user balances when a new expense share is created."""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Update the balance when a new expense share is created
            UserBalance.update_balance(
                from_user=self.user,
                to_user=self.expense.created_by,
                amount=self.amount
            )
