from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

from .models import User

class RegisterView(APIView):

 def post(self, request):
    username = request.data.get("username")
    password = request.data.get("password")
    role = request.data.get("role")

    if not username or not password or not role:
        return Response(
            {"error": "Username, password and role are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if role not in User.Role.values:
        return Response(
            {"error": "Invalid role."},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = User.objects.create_user(
        username=username,
        password=password,
        role=role
    )

    return Response(
        {
            "message": "User registered successfully.",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        },
        status=status.HTTP_201_CREATED
    )

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid username or password."}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role,
                },
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {"id": user.id, "username": user.username, "role": user.role},
            status=status.HTTP_200_OK,
        )