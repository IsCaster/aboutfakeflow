# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'VerificationCode.checked'
        db.add_column('fakeflowapp_verificationcode', 'checked',
                      self.gf('django.db.models.fields.BooleanField')(default=False),
                      keep_default=False)

    def backwards(self, orm):
        # Deleting field 'VerificationCode.checked'
        db.delete_column('fakeflowapp_verificationcode', 'checked')

    models = {
        'fakeflowapp.missioninfo': {
            'Meta': {'object_name': 'MissionInfo'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'message': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'shopkeeper': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'site': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'valid': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        'fakeflowapp.verificationcode': {
            'Meta': {'object_name': 'VerificationCode'},
            'checked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'codeImg': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['fakeflowapp']