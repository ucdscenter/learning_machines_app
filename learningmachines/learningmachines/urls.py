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

from django.conf import settings
from django.conf.urls.static import static
from . import users

urlpatterns = [
    path('admin/', admin.site.urls),
    #account endpoints
    path('accounts/create_user/', users.create_user, name='create_user'),
    path('accounts/login/', users.login_user, name='login_user'),
    path('accounts/logout/', users.logout_user, name='logout_user'),
    path('accounts/change_pw/', users.change_password, name='change_password'),
    path('accounts/user/', users.show_user, name='show_user'),

   	path('searcher/', include('searcher.urls')),
    path('', RedirectView.as_view(url='searcher', permanent=True)),

]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
