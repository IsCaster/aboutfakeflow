from django.db import models

# Create your models here.
class MissionInfo(models.Model):
    shopkeeper = models.CharField(max_length=100);
    message = models.CharField(max_length=2000);#don't need to support multi line
    url = models.CharField(max_length=2000);
    site = models.CharField(max_length=100);
    valid = models.BooleanField(default=True);
    updateTime = models.DateTimeField(auto_now_add=True);
	
class VerificationCode(models.Model):
    code = models.CharField(max_length=10);
    codeImg = models.CharField(max_length=2000); #canvas.toDataURL
    checked = models.BooleanField(default=False);
    
