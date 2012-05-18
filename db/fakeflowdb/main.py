#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

import cgi
import os
import urllib
import logging
import datetime

from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.ext.webapp import template
from google.appengine.api import memcache

# Set the debug level
_DEBUG = True

class MissionInfo(db.Model):
    shopkeeper = db.StringProperty();
    message = db.StringProperty(required=False);#if it's True then MissionInfo.put() would fail,even if message is valued.
    url = db.StringProperty();
    site = db.StringProperty(required=False);
    valid = db.BooleanProperty(default=True);
    updateTime = db.DateTimeProperty(auto_now_add=True);

class BaseRequestHandler(webapp.RequestHandler):
  """Base request handler extends webapp.Request handler

     It defines the generate method, which renders a Django template
     in response to a web request
  """

  def generate(self, template_name, template_values={}):
    """Generate takes renders and HTML template along with values
       passed to that template

       Args:
         template_name: A string that represents the name of the HTML template
         template_values: A dictionary that associates objects with a string
           assigned to that object to call in the HTML template.  The defualt
           is an empty dictionary.
    """
    # We check if there is a current user and generate a login or logout URL
    user = users.get_current_user()

    if user:
      log_in_out_url = users.create_logout_url('/')
    else:
      log_in_out_url = users.create_login_url(self.request.path)

    # We'll display the user name if available and the URL on all pages
    values = {'user': user, 'log_in_out_url': log_in_out_url}
    values.update(template_values)

    # Construct the path to the template
    directory = os.path.dirname(__file__)
    path = os.path.join(directory, 'templates', template_name)

    # Respond to the request by rendering the template
    self.response.out.write(template.render(path, values, debug=_DEBUG))
    

    
class MainRequestHandler(BaseRequestHandler):
  def get(self):
    '''if users.get_current_user():
      url = users.create_logout_url(self.request.uri)
      url_linktext = 'Logout'
    else:
      url = users.create_login_url(self.request.uri)
      url_linktext = 'Login'
    

    template_values = {
      'url': url,
      'url_linktext': url_linktext,
      }
    '''
    
    #for test
    missionInfo=MissionInfo()
    missionInfo.shopkeeper = "caster"
    missionInfo.message = "fucking message"
    missionInfo.url = "http://sfaasdf.taobao.com/asdf"
    missionInfo.site = "hiwinwin"
    
    missionInfo.put();
    
    template_values={};
    self.generate('default.html', template_values);

class QueryMissionInfoHandler(BaseRequestHandler):
#  def get(self):
#    self.getChats()

  def post(self):
    keyword = self.request.get('content')
    query=db.GqlQuery("SELECT * FROM MissionInfo ");

    missionInfos=query.fetch(20);
    
    template_values={
        'missionInfos' : missionInfos,
    };
    self.generate('missioninfo.html', template_values);
                                      
application = webapp.WSGIApplication(
                                     [('/', MainRequestHandler),
                                      ('/missioninfo', QueryMissionInfoHandler)],
                                     debug=True)

def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()