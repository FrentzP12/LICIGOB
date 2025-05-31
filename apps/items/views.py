from django.http import JsonResponse
from django.db import connections
from datetime import datetime

def search_items(request):
    if request.method == 'POST':
        # Recoge los parámetros del formulario
        comprador    = request.POST.get('comprador') or None
        descripcion  = request.POST.get('descripcion') or None
        nomenclatura = request.POST.get('nomenclatura') or None
        departamento = request.POST.get('departamento') or None
        fecha_inicio = request.POST.get('fecha_inicio') or None
        fecha_fin    = request.POST.get('fecha_fin') or None

        # Si se envían fechas, podemos concatenar la hora para incluir todo el día
        if fecha_inicio:
            fecha_inicio = fecha_inicio + " 00:00:00"
        if fecha_fin:
            fecha_fin = fecha_fin + " 23:59:59"

        # Usamos la conexión a la base de datos 'postgres' definida en settings
        with connections['postgres'].cursor() as cursor:
            query = """
                SELECT * FROM buscar_items_multi_criterio(%s, %s, %s, %s, %s, %s);
            """
            cursor.execute(query, [descripcion, departamento, comprador, nomenclatura, fecha_inicio, fecha_fin])
            # Obtenemos el nombre de las columnas
            columns = [col[0] for col in cursor.description]
            # Formateamos el resultado como una lista de diccionarios
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        return JsonResponse({'data': results})
    else:
        return JsonResponse({'error': 'Método no permitido'}, status=405)
