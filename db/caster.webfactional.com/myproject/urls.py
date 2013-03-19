from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'myproject.views.home', name='home'),
    # url(r'^myproject/', include('myproject.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^$', 'fakeflowapp.views.home'),
    url(r'home^$', 'fakeflowapp.views.home'),
    url(r'^missioninfo$', 'fakeflowapp.views.missionInfo'),
    url(r'^queryurl$', 'fakeflowapp.views.queryUrl'),
    url(r'^getmission$', 'fakeflowapp.views.getMission'),
	url(r'^getmissionlist$', 'fakeflowapp.views.getMissionList'),
    url(r'^submiturl$', 'fakeflowapp.views.submitUrl'),
    # url(r'^waitforresult$', 'fakeflowapp.views.waitForResult'),
    url(r'^submitresultsuccess$', 'fakeflowapp.views.submitResultSuccess'),
	url(r'^submitresultfail$', 'fakeflowapp.views.submitResultFail'),
    url(r'^invalidmission$', 'fakeflowapp.views.invalidMission'),
    url(r'^invalidmissionc$', 'fakeflowapp.views.invalidMissionC'),
    url(r'^cleardonebuffer$', 'fakeflowapp.views.clearDoneBuffer'),
    url(r'^submitcode$', 'fakeflowapp.views.submitCode'),
    url(r'^close$', 'fakeflowapp.views.close'),
    url(r'^deletemissioninfo$', 'fakeflowapp.views.deleteMissionInfo'),
    url(r'^showcode$', 'fakeflowapp.views.showCode'),
    url(r'^querycode$', 'fakeflowapp.views.queryCode'),
	# url(r'^item.htm', 'fakeflowapp.views.fuckmudooo'),
	url(r'^fakevisit$', 'fakeflowapp.views.fakeVisit'),
    url(r'^submitshopkeeper', 'fakeflowapp.views.submitShopkeeper'),
    url(r'^accounts/login/$', 'django.contrib.auth.views.login', {'redirect_field_name': 'home'}),
    url(r'^accounts/logout/$', 'django.contrib.auth.views.logout_then_login'),
    url(r'^deletemissionc$', 'fakeflowapp.views.deleteMissionC'),
    url(r'^addwhitelist$', 'fakeflowapp.views.addWhiteList'),
    url(r'^deletewhitelist$', 'fakeflowapp.views.deleteWhiteList'),    
    url(r'^heartbeat$', 'fakeflowapp.views.heartBeat'),
    url(r'^removeclient$', 'fakeflowapp.views.removeClient'),
    url(r'^resetclientvisittime$', 'fakeflowapp.views.resetClientVisitTime'),
    url(r'^utf8togbk$', 'fakeflowapp.views.utf8ToGbk'),
    url(r'^missiondailystatistics$', 'fakeflowapp.views.missionDailyStatistics'),
    url(r'^missiontodaystatistics$', 'fakeflowapp.views.missionTodayStatistics'),
    url(r'^performancemonthlydata$', 'fakeflowapp.views.performanceMonthlyData'),
    url(r'^checkout$', 'fakeflowapp.views.checkout'),
)
