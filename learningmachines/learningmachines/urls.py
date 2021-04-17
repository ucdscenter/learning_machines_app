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
from django.urls import path
from django.urls import include
from django.views.generic import RedirectView
from django.conf.urls import url

from django.conf import settings
from django.conf.urls.static import static
from . import users

from django.shortcuts import redirect
from django.contrib.auth import views as auth_views


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
    print(qry_str)
    print(request.path.split("/")[2])
    params_str = "?"
    params_str = '?name=' + request.path.split("/")[2]
    for x in qry_str:
        params_str = params_str + x + "=" + qry_str[x] + "&"
    print(params_str)
    response = redirect('/searcher/projects' + params_str)
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    #account endpoints
    path('accounts/create_user/', users.create_user, name='create_user'),
    path('accounts/login/', users.login_user, name='login_user'),
    path('accounts/logout/', users.logout_user, name='logout_user'),
    path('accounts/change_pw/', users.change_password, name='change_password'),
    path('accounts/user/', users.show_user, name='show_user'),
    
   	path('searcher/', include('searcher.urls')),
    path('lda/vis', redirect_vis_view),

    path('projects/debates/', redirect_proj_view),
    path('projects/blm/', redirect_proj_view),
    path('projects/dapl/', redirect_proj_view),
    path('projects/library_docs/', redirect_proj_view),
    path('projects/insta_art/', redirect_proj_view),
    path('projects/climate_maps/', redirect_proj_view),
    path('projects/vent_notes/', redirect_proj_view),


    path('', RedirectView.as_view(url='searcher', permanent=True)),

    url(r'^reset/$',
        auth_views.PasswordResetView.as_view(
            template_name='password_reset.html',
            email_template_name='password_reset_email.html',
            subject_template_name='password_reset_subject.txt'
        ),
        name='password_reset'),
    url(r'^reset/done/$',
        auth_views.PasswordResetDoneView.as_view(template_name='password_reset_done.html'),
        name='password_reset_done'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        auth_views.PasswordResetConfirmView.as_view(template_name='password_reset_confirm.html'),
        name='password_reset_confirm'),
    url(r'^reset/complete/$',
        auth_views.PasswordResetCompleteView.as_view(template_name='password_reset_complete.html'),
        name='password_reset_complete'),

   

]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
