# -*- encoding: utf-8 -*-
"""
Copyright (c) 2019 - present AppSeed.us
"""

from django import template
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.template import loader
from django.urls import reverse

def landing(request):
    """Página de aterrizaje visible sin autenticación"""
    html_template = loader.get_template('home/page-landing.html')
    return HttpResponse(html_template.render({}, request))

#@login_required(login_url="/login/")
#def index(request):
 #   context = {'segment': 'index'}
  #  html_template = loader.get_template('home/page-profile.html')
   # return HttpResponse(html_template.render(context, request))
@login_required(login_url="/login/")
def index(request):
   context = {'segment': 'index'}
   html_template = loader.get_template('home/index1.html')
   return HttpResponse(html_template.render(context, request))

@login_required(login_url="/login/")
def index1(request):
    # Carga 'index1.html'
    context = {'segment': 'index1'}
    html_template = loader.get_template('home/index1.html')
    return HttpResponse(html_template.render(context, request))

@login_required(login_url="/login/")
def pages(request):
    context = {}
    # All resource paths end in .html.
    # Pick out the html file name from the url. And load that template.
    try:

        load_template = request.path.split('/')[-1]

        if load_template == 'admin':
            return HttpResponseRedirect(reverse('admin:index'))
        context['segment'] = load_template

        html_template = loader.get_template('home/' + load_template)
        return HttpResponse(html_template.render(context, request))

    except template.TemplateDoesNotExist:

        html_template = loader.get_template('home/page-404.html')
        return HttpResponse(html_template.render(context, request))

    except:
        html_template = loader.get_template('home/page-500.html')
        return HttpResponse(html_template.render(context, request))
