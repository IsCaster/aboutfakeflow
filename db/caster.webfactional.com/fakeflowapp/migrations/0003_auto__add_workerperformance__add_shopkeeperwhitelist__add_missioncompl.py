# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'WorkerPerformance'
        db.create_table('fakeflowapp_workerperformance', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('date', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('money', self.gf('django.db.models.fields.FloatField')()),
            ('checkoutTime', self.gf('django.db.models.fields.DateTimeField')()),
            ('updateTime', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal('fakeflowapp', ['WorkerPerformance'])

        # Adding model 'ShopkeeperWhiteList'
        db.create_table('fakeflowapp_shopkeeperwhitelist', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('shopkeeper', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('updateTime', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('fakeflowapp', ['ShopkeeperWhiteList'])

        # Adding model 'MissionCompleteList'
        db.create_table('fakeflowapp_missioncompletelist', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('site', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('client', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('price', self.gf('django.db.models.fields.FloatField')()),
            ('updateTime', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
        ))
        db.send_create_signal('fakeflowapp', ['MissionCompleteList'])

        # Adding field 'VerificationCode.updateTime'
        db.add_column('fakeflowapp_verificationcode', 'updateTime',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=datetime.datetime(2013, 4, 2, 0, 0), blank=True),
                      keep_default=False)

        # Adding field 'MissionInfo.firstVisitUrl'
        db.add_column('fakeflowapp_missioninfo', 'firstVisitUrl',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=2000),
                      keep_default=False)

        # Adding field 'MissionInfo.keyword'
        db.add_column('fakeflowapp_missioninfo', 'keyword',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=2000),
                      keep_default=False)

        # Adding field 'MissionInfo.inshopUrl'
        db.add_column('fakeflowapp_missioninfo', 'inshopUrl',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=2000),
                      keep_default=False)

        # Adding field 'MissionInfo.searchTips'
        db.add_column('fakeflowapp_missioninfo', 'searchTips',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=2000),
                      keep_default=False)

        # Adding field 'MissionInfo.idInSite'
        db.add_column('fakeflowapp_missioninfo', 'idInSite',
                      self.gf('django.db.models.fields.CharField')(default='', max_length=100),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting model 'WorkerPerformance'
        db.delete_table('fakeflowapp_workerperformance')

        # Deleting model 'ShopkeeperWhiteList'
        db.delete_table('fakeflowapp_shopkeeperwhitelist')

        # Deleting model 'MissionCompleteList'
        db.delete_table('fakeflowapp_missioncompletelist')

        # Deleting field 'VerificationCode.updateTime'
        db.delete_column('fakeflowapp_verificationcode', 'updateTime')

        # Deleting field 'MissionInfo.firstVisitUrl'
        db.delete_column('fakeflowapp_missioninfo', 'firstVisitUrl')

        # Deleting field 'MissionInfo.keyword'
        db.delete_column('fakeflowapp_missioninfo', 'keyword')

        # Deleting field 'MissionInfo.inshopUrl'
        db.delete_column('fakeflowapp_missioninfo', 'inshopUrl')

        # Deleting field 'MissionInfo.searchTips'
        db.delete_column('fakeflowapp_missioninfo', 'searchTips')

        # Deleting field 'MissionInfo.idInSite'
        db.delete_column('fakeflowapp_missioninfo', 'idInSite')


    models = {
        'fakeflowapp.missioncompletelist': {
            'Meta': {'object_name': 'MissionCompleteList'},
            'client': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'price': ('django.db.models.fields.FloatField', [], {}),
            'site': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'fakeflowapp.missioninfo': {
            'Meta': {'object_name': 'MissionInfo'},
            'firstVisitUrl': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'idInSite': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '100'}),
            'inshopUrl': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2000'}),
            'keyword': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2000'}),
            'message': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'searchTips': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '2000'}),
            'shopkeeper': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'site': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'valid': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        },
        'fakeflowapp.shopkeeperwhitelist': {
            'Meta': {'object_name': 'ShopkeeperWhiteList'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'shopkeeper': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'fakeflowapp.verificationcode': {
            'Meta': {'object_name': 'VerificationCode'},
            'checked': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'code': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'codeImg': ('django.db.models.fields.CharField', [], {'max_length': '2000'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'})
        },
        'fakeflowapp.workerperformance': {
            'Meta': {'object_name': 'WorkerPerformance'},
            'checkoutTime': ('django.db.models.fields.DateTimeField', [], {}),
            'date': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'money': ('django.db.models.fields.FloatField', [], {}),
            'updateTime': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        }
    }

    complete_apps = ['fakeflowapp']