from django.db import models

# Create your models here.
class MissionInfo(models.Model):
    shopkeeper = models.CharField(max_length=100);
    message = models.CharField(max_length=2000);#don't need to support multi line
    url = models.CharField(max_length=2000);
    site = models.CharField(max_length=100);
    firstVisitUrl = models.CharField(max_length=2000,default="");# go into the taobao item page by a assigned web page
    keyword = models.CharField(max_length=2000,default="");# go into the taobao item page by taobao homepage search, record the search keyword
    inshopUrl = models.CharField(max_length=2000,default="");# go into the taobao shop by this item url ,this url maybe isn't the final taobao item page url
    searchTips = models.CharField(max_length=2000,default="");# the additional conditions of taobao homepage search 
    valid = models.BooleanField(default=True);
    updateTime = models.DateTimeField(auto_now_add=True);
	
class VerificationCode(models.Model):
    code = models.CharField(max_length=10);
    codeImg = models.CharField(max_length=2000); #canvas.toDataURL
    checked = models.BooleanField(default=False);
    
class ShopkeeperWhiteList(models.Model):
    shopkeeper = models.CharField(max_length=100);
    updateTime = models.DateTimeField(auto_now_add=True);
    
class MissionCompleteList(models.Model):
    site = models.CharField(max_length=100);
    client = models.CharField(max_length=100);
    price = models.FloatField();
    updateTime = models.DateTimeField(auto_now_add=True);