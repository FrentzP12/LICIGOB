from django.urls import path
from .views import search_items

urlpatterns = [
    # Esta URL se usará para recibir la petición AJAX desde el formulario
    path('search/', search_items, name='search_items'),
]
