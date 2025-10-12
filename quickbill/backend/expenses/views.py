from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Sum, Count
from django.db.models.functions import TruncMonth, TruncWeek
from datetime import datetime, timedelta
from .models import Expense, ExpenseShare
from .serializers import ExpenseSerializer, ExpenseShareSerializer

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Expense.objects.filter(
            Q(created_by=user) | 
            Q(shares__user=user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_settled(self, request, pk=None):
        expense = self.get_object()
        if expense.created_by != request.user:
            return Response(
                {"error": "Only the expense creator can mark it as settled"},
                status=status.HTTP_403_FORBIDDEN
            )
        expense.is_settled = True
        expense.save()
        return Response({"status": "expense marked as settled"})

    @action(detail=True, methods=['post'])
    def mark_share_as_paid(self, request, pk=None):
        expense = self.get_object()
        share = ExpenseShare.objects.get(expense=expense, user=request.user)
        share.is_paid = True
        share.paid_at = timezone.now()
        share.save()
        return Response({"status": "share marked as paid"})

    @action(detail=False, methods=['get'])
    def analytics(self, request):
        """Get expense analytics including category breakdown and spending trends"""
        user = request.user
        
        # Get expenses where user is involved (created or shared)
        user_expenses = Expense.objects.filter(
            Q(created_by=user) | Q(shares__user=user)
        ).distinct()
        
        # Category breakdown
        category_breakdown = user_expenses.values('category').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        ).order_by('-total_amount')
        
        # Monthly spending trend (last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        monthly_spending = user_expenses.filter(
            created_at__gte=six_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        ).order_by('month')
        
        # Weekly spending trend (last 8 weeks)
        eight_weeks_ago = timezone.now() - timedelta(weeks=8)
        weekly_spending = user_expenses.filter(
            created_at__gte=eight_weeks_ago
        ).annotate(
            week=TruncWeek('created_at')
        ).values('week').annotate(
            total_amount=Sum('amount'),
            count=Count('id')
        ).order_by('week')
        
        # Total statistics
        total_expenses = user_expenses.count()
        total_amount = user_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
        
        # Recent expenses (last 10)
        recent_expenses = ExpenseSerializer(
            user_expenses.order_by('-created_at')[:10], 
            many=True
        ).data
        
        return Response({
            'category_breakdown': category_breakdown,
            'monthly_spending': monthly_spending,
            'weekly_spending': weekly_spending,
            'total_expenses': total_expenses,
            'total_amount': total_amount,
            'recent_expenses': recent_expenses
        })

    @action(detail=False, methods=['get'])
    def budget_suggestions(self, request):
        """Generate personalized budgeting suggestions based on spending patterns"""
        user = request.user
        
        # Calculate average monthly spending
        three_months_ago = timezone.now() - timedelta(days=90)
        monthly_avg = Expense.objects.filter(
            Q(created_by=user) | Q(shares__user=user),
            created_at__gte=three_months_ago
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        monthly_avg = monthly_avg / 3
        
        # Get category spending patterns
        category_spending = Expense.objects.filter(
            Q(created_by=user) | Q(shares__user=user),
            created_at__gte=three_months_ago
        ).values('category').annotate(
            avg_amount=Sum('amount')
        ).order_by('-avg_amount')
        
        suggestions = []
        
        # Generate suggestions based on spending patterns
        if monthly_avg > 1000:
            suggestions.append({
                'type': 'warning',
                'message': f'Your monthly spending is ${monthly_avg:.2f}. Consider setting a budget limit.',
                'category': 'general'
            })
        
        for category in category_spending:
            if category['avg_amount'] > monthly_avg * 0.3:  # If category is >30% of total spending
                suggestions.append({
                    'type': 'tip',
                    'message': f'Consider reducing {category["category"]} expenses. It\'s {(category["avg_amount"]/monthly_avg*100):.1f}% of your spending.',
                    'category': category['category']
                })
        
        if len(suggestions) == 0:
            suggestions.append({
                'type': 'positive',
                'message': 'Great job! Your spending looks well-balanced.',
                'category': 'general'
            })
        
        return Response({
            'monthly_average': monthly_avg,
            'suggestions': suggestions,
            'category_breakdown': category_spending
        })
