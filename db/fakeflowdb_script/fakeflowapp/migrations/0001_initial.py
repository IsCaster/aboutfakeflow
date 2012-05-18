# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'MissionInfo'
        db.create_table('fakeflowapp_missioninfo', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('shopkeeper', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('message', self.gf('django.db.models.fields.CharField')(max_length=2000)),
            ('url', self.gf('django.db.models.fields.CharField')(max_length=2000)),
            ('site', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('valid', self.gf('django.db.models.fields.BooleanField')(default=True)),
            ('updateTime', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('fakeflowapp', ['MissionInfo'])

        # Adding model 'VerificationCode'
        db.create_table('fakeflowapp_verificationcode', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('code', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('codeImg', self.gf('django.db.models.fields.CharField')(max_length=2000)),
        ))
        db.send_create_signal('fakeflowapp', ['VerificationCode'])

    def backwards(self, orm):
        # Deleting model 'MissionInfo'
        db.delete_table('fakeflowapp_missioninfo')

        # Deleting model 'VerificationCode'
        db.delete_table('fakeflowapp_verificationcode')

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
            'code': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'codeImg': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['fakeflowapp']