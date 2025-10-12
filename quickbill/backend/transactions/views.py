from datetime import datetime, timezone, timedelta
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Sum
from .models import UserBalance
from accounts.models import User
from .serializers import UserBalanceSerializer
from expenses.models import ExpenseShare, Expense

class UserBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserBalanceSerializer

    def get_queryset(self):
        username = self.request.query_params.get('username', None)
        if username is None:
            return UserBalance.objects.none()
        
        return UserBalance.objects.filter(
            Q(user__username=username) |
            Q(owed_to__username=username)
        )

    @action(detail=False, methods=['get'])
    def summary(self, request):
        username = request.query_params.get('username', None)
        if username is None:
            return Response(
                {"error": "Username parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # What the user owes to others
        owes = UserBalance.objects.filter(
            user__username=username
        ).values('owed_to__username', 'amount')

        # What others owe to the user
        owed = UserBalance.objects.filter(
            owed_to__username=username
        ).values('user__username', 'amount')

        return Response({
            'owes': [{'username': item['owed_to__username'], 'amount': item['amount']} for item in owes],
            'owed_by': [{'username': item['user__username'], 'amount': item['amount']} for item in owed]
        })

    @action(detail=False, methods=['get'], url_path='total-balance/(?P<username>[^/.]+)')
    def total_balance(self, request, username=None):
        if not username:
            return Response(
                {"error": "Username parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate total amount user owes to others from unsettled expenses
        total_owes = ExpenseShare.objects.filter(
            user__username=username,
            expense__is_settled=False,
            is_paid=False
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Calculate total amount others owe to user from unsettled expenses
        total_owed = ExpenseShare.objects.filter(
            expense__created_by__username=username,
            expense__is_settled=False,
            is_paid=False
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        def get_spent_last(duration):
            duration_time = {
                'week': timedelta(days=7),
                'month': timedelta(days=30)
            }[duration]

            total = ExpenseShare.objects.filter(
                user__username=username,
                expense__created_at__gte=datetime.now() - duration_time,
            ).aggregate(total=Sum('amount'))['total'] or 0

            total += ExpenseShare.objects.filter(
                expense__created_by__username=username,
                expense__created_at__gte=datetime.now() - duration_time,
            ).aggregate(total=Sum('amount'))['total'] or 0
            
            return total

        return Response({
            'total_owes': total_owes,
            'total_owed': total_owed,
            'spent_last_week': get_spent_last('week'),
            'spent_last_month': get_spent_last('month')
        })
