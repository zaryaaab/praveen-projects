from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FriendshipViewSet, AddFriendByUsernameView

router = DefaultRouter()
router.register(r'friendships', FriendshipViewSet, basename='friendship')

urlpatterns = [
    path('', include(router.urls)),
    path('add-friend-by-username/', AddFriendByUsernameView.as_view(), name='add-friend-by-username'),
]