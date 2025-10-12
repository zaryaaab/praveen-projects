from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserBalanceViewSet

router = DefaultRouter()
router.register(r'balances', UserBalanceViewSet, basename='balance')

urlpatterns = [
    path('', include(router.urls)),
]