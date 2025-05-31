# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django.urls import path, re_path
from apps.home import views

urlpatterns = [
    path('', views.landing, name='landing'),
    # The home page
    path('index1/', views.index1, name='index1'),
    # Rutas existentes (landing, pages, etc.)
    path('home/', views.index, name='home'),
    # Matches any html file
    re_path(r'^.*\.*', views.pages, name='pages'),

]
