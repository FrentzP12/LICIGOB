# core/middleware.py
from django.http import JsonResponse

class JsonErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        return JsonResponse({
            "error": "Error interno",
            "detalle": str(exception)
        }, status=500)