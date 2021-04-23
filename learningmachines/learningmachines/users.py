from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.core.mail import BadHeaderError, send_mail
from django.http import HttpResponse
from django.shortcuts import render, redirect
from learningmachines.settings import EMAIL_HOST_USER
from searcher.models import Profile,Access#, VisRequest
from django.contrib.messages import info
#from cfg.dev_config import SKPN_ADDRESS
import json
import re



def login_user(request):
    html = 'searcher/login_template.html'
    if request.method == 'GET':
        return render(request, html, {})
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is None:
            info(request, 'User does not exist or incorrect password')
            return render(request, html, {})
        login(request, user)
        return redirect('/searcher/home/')


def logout_user(request):
    if not request.user.is_authenticated:
        return HttpResponse('No existing user', status=400)
    logout(request)
    info(request, "successfully logged out")
    return redirect("/searcher/home/")


def create_user(request):
    ##TODO check arguments
    if request.method == 'GET':
        html = 'searcher/register_template.html'
        return render(request, html, {})
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        re_password = request.POST.get('re_password')
        institute = request.POST.get('institute')
        department = request.POST.get('department')
        if not is_qualified_password(password, re_password):
            error = {'error': 'Unqualified password'}
            return HttpResponse(json.dumps(error), status=400)
        user = User.objects.filter(username=email)
        if len(user):
            error = {'error': 'Email already exists'}
            return HttpResponse(json.dumps(error), status=400)
        user = User.objects.create_user(username=email, email=email, password=password)
        user.save()
        profile = Profile(user=user, institute=institute, department=department)
        profile.save()
        login(request, user)
        ## Default access is pubmed
        try:
            access = Access.objects.get(endpoint='all')
        except:
            access = Access(endpoint='all')
            access.save()
        access.user.add(user)
        access.save()
        html = 'searcher/index.html'
       
        return render(request, html, {})
       

def change_password(request):
    if request.user.is_anonymous:
        return HttpResponse('User not exist', status=403)
    if request.method == 'GET':
        html = 'searcher/change_password.html'
        return render(request, html, {})
    if request.method == 'POST':
        current_pwd = request.POST.get('password')
        new_pwd = request.POST.get('new_password')
        re_new_pwd = request.POST.get('re_new_password')
        email = request.user.email
        user = authenticate(request, username=email, password=current_pwd)
        if not is_qualified_password(new_pwd, re_new_pwd):
            return HttpResponse('Inconsistent new password', status=404)
        user.set_password(new_pwd)
        user.save()
        info(request, "password successfully changed")
        return redirect('/searcher/home/')

def password_reset(request):
    if request.method == 'GET':
        html = 'searcher/password_reset.html'
        return render(request, html, {})
    if request.method == 'POST':
        email = request.POST.get('email')
        subject = 'Reset your password'
        message = 'This is so'
        recepient = email
        send_mail(subject, 
            message, EMAIL_HOST_USER, [recepient], fail_silently = False)
        html = 'searcher/password_reset_sent.html'
        return render(request, html, {})




def show_user(request):
    if request.user.is_anonymous:
        return redirect('/searcher/accounts/login/')
    user = request.user
    profiles = Profile.objects.filter(user=user).all()
    institute = profiles[0].institute if len(profiles) else ''
    department = profiles[0].department if len(profiles) else ''
    profile = {
        'email': user.email,
        'institute': institute,
        'department': department
    }
    if request.method == 'GET':
        html = 'searcher/show_user.html'
        return render(request, html, {'profile': profile})
    if request.method == 'POST':
        if user.is_superuser:
            return redirect('/searcher/accounts/user/')
        p = Profile.objects.get(user=user)
        email = request.POST.get('email')
        edited = False
        if email != "":
            user.username = email
            user.email = email
            edited = True
            user.save()
        institute = request.POST.get('institute')
        if institute != "":
            p.institute = institute
            edited = True
        department = request.POST.get('department')
        if department != "":
            p.department = department
            edited = True
        p.save()
        if edited:
            info(request, "user info updated")
        return redirect("/searcher/home/")


def show_history(request):
    if request.user.is_anonymous:
        return redirect('/searcher/accounts/login/')
    user = request.user

    def compose_record(r):
        param_result = re.findall(r'(\w+)=(\w+)', r.url)
        param_str = ''
        for param in param_result:
            if param[0] == 'qry' or param[0] == 'database' or param[0] == 'endpoint':
                continue
            if (param[0] == 'start' or param[0] == 'end') and param[1] == 'year':
                continue
            if len(param_str) > 0:
                param_str += ', '
            param_str += '{}: {}'.format(param[0], param[1])
        search_url = re.sub('/query', '', r.url) + '&query_id={}'.format(r.id)

        search_url = re.sub('/get_articles/', '/search/', search_url)

        vis_requests = VisRequest.objects.filter(query=r, is_finished=True).all()
        if len(vis_requests):
            vis_data = []
            i = 0
            for request in vis_requests:
                if len(request.url.split('?')) > 0:
                    name = request.url.split('?')[1]
                    formatted_name = 'Vis:' + name.replace('%2C', ',').replace('+', ' ').replace('&', ' ')
                    vis_data.append({
                        'url': '{}&search={}'.format(request.url, r.pk),
                        'name': formatted_name
                    })
                else:
                     vis_data.append({
                        'url': {},
                        'name': {}
                    })

        else:
            vis_data = []
        return {
            'query_id': r.id,
            'time': r.created_time,
            'endpoint': r.endpoint,
            'keywords': r.keywords,
            'database': r.database,
            'parameters': param_str,
            'search_url': search_url,
            'vis_requests': vis_data
        }

    query_requests = QueryRequest.objects.filter(user=user).all()
    request_records = [compose_record(r) for r in query_requests]
    request_records.sort(key=lambda r: r['time'], reverse=True)
    request_records = request_records[0: 50]
    html = 'history.html'
    return render(request, html, {'requests': request_records})


def is_qualified_password(password, re_password):
    if password != re_password:
        return False
    if len(password) < 6:
        return False
    return True