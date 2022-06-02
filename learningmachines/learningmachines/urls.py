"""learningmachines URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.contrib.messages.api import success
from django.urls import path, re_path
from django.urls import include
from django.views.generic import RedirectView

from django.conf import settings
from django.conf.urls.static import static
from . import users

from django.shortcuts import redirect
from django.contrib.auth.views import PasswordResetView, PasswordResetDoneView, PasswordResetConfirmView, PasswordResetCompleteView

def redirect_all_view(request, path=None):
    print(path)
    response = redirect('/searcher/')
    return response

def redirect_vis_view(request):
    qry_str = {k: v[0] for k, v in dict(request.GET).items()}
    print(qry_str)
    params_str = "?"
    for x in qry_str:
        params_str = params_str + x + "=" + qry_str[x] + "&"
    response = redirect('/searcher/vis' + params_str)
    return response

def redirect_proj_view(request):
    qry_str = {k: v[0] for k, v in dict(request.GET).items()}
    params_str = "?"
    params_str = '?name=' + request.path.split("/")[2]
    print("HI THERE!!!!")
    for x in qry_str:
        if len(qry_str[x]) == 0:
            params_str = params_str +'&' + x
        else:
            params_str = params_str +'&' + x + "=" + qry_str[x] + "&"
    print(params_str[:-1])

    print(params_str)
    response = redirect('/searcher/projects' + params_str)
    return response



urlpatterns = [
    re_path(r'^health_check/', include('health_check.urls')),
    path('admin/', admin.site.urls),
    #account endpoints
    path('accounts/create_user/', users.create_user, name='create_user'),
    path('accounts/login/', users.login_user, name='login_user'),
    path('accounts/logout/', users.logout_user, name='logout_user'),
    path('accounts/change_pw/', users.change_password, name='change_password'),
    path('accounts/user/', users.show_user, name='show_user'),
    path('accounts/password_reset/', PasswordResetView.as_view(
        extra_email_context={ 'site_name': 'Learning Machines App' }
    ), name='password_reset'),
    path('accounts/password_reset/done', PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('accounts/reset/<uidb64>/<token>', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('accounts/reset/done', PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('searcher/', include('searcher.urls')),
    path('lda/vis', redirect_vis_view),

    path('projects/debates/', redirect_proj_view),
    path('projects/blm/', redirect_proj_view),
    path('projects/dapl/', redirect_proj_view),
    path('projects/library_docs/', redirect_proj_view), 
    path('projects/insta_art/', redirect_proj_view),
    path('projects/climate_maps/', redirect_proj_view),
    path('projects/vent_notes/', redirect_proj_view),
    #path('search/', redirect('searcher')),#RedirectView.as_view(url='searcher', permanent=True)),
    #url(, home)
    re_path(r'^(?P<path>.*)/$', redirect_all_view),
    path('', RedirectView.as_view(url='searcher', permanent=True)),


  

]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
