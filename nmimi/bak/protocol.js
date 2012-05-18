/*
  created by Jan Wrobel, 2006
 */


/*
  @channel - channel to trace
  Tracing channel delegates all calls to traced one but it has 
  a possibility to intercept and inspect data transfered to channel.
 */
function TracingChannel(channel)
{
	this.httpChannel = 
		channel.QueryInterface(Components.interfaces.nsIHttpChannel);
	this.httpChannelInternal = 
		channel.QueryInterface(Components.interfaces.nsIHttpChannelInternal);
	this.cachingChannel = 
		channel.QueryInterface(Components.interfaces.nsICachingChannel);
	this.encodedChannel = 
		channel.QueryInterface(Components.interfaces.nsIEncodedChannel);
	this.supportsPriority = 
		channel.QueryInterface(Components.interfaces.nsISupportsPriority);
	this.writablePropertyBag2 = 
		channel.QueryInterface(Components.interfaces.nsIWritablePropertyBag2);	
	this.writablePropertyBag = 
		channel.QueryInterface(Components.interfaces.nsIWritablePropertyBag);	
}


/*
  Tracing channel has to implement every method that traced channel implements.
  Implementation of every method with an exception of asyncOpen is just a single line 
  that pass the call to traced channel.
 */
TracingChannel.prototype = {
	/*nsISupports*/
	QueryInterface: function(iid){
		if ( iid.equals(Components.interfaces.nsIChannel) ||
		     iid.equals(Components.interfaces.nsISupportsWeakReference) ||
		     iid.equals(Components.interfaces.nsIRequest) ||
		     iid.equals(Components.interfaces.nsISupports) ||
		     iid.equals(Components.interfaces.nsIHttpChannel)  ||
		     iid.equals(Components.interfaces.nsISupportsPriority) ||
		     iid.equals(Components.interfaces.nsIPropertyBag) ||
		     iid.equals(Components.interfaces.nsIPropertyBag2) ||
		     iid.equals(Components.interfaces.nsIWritablePropertyBag) ||
		     iid.equals(Components.interfaces.nsIWritablePropertyBag2) ||
		     iid.equals(Components.interfaces.nsIHttpChannelInternal) ||
		     iid.equals(Components.interfaces.nsIEncodedChannel) ||
		     iid.equals(Components.interfaces.nsICachingChannel)
		     )
		return this;
		dump("Unimplemented interface " + iid + "\n");
		throw Components.results.NS_NOINTERFACE;
	},
	
	/*nsIRequest*/
	/*constants*/
	get LOAD_NORMAL() {return this.httpChannel.LOAD_NORMAL},
	get LOAD_BACKGROUND() {return this.httpChannel.LOAD_BACKGROUND},
	get INHIBIT_CACHING() {return this.httpChannel.INHIBIT_CACHING},
	get INHIBIT_PERSISTENT_CACHING() {return this.httpChannel.INHIBIT_PERSISTENT_CACHING},
	get LOAD_BYPASS_CACHE() {return this.httpChannel.LOAD_BYPASS_CACHE},
	get LOAD_FROM_CACHE() {return this.httpChannel.LOAD_FROM_CACHE},
	get VALIDATE_ALWAYS() {return this.httpChannel.VALIDATE_ALWAYS},
	get VALIDATE_NEVER() {return this.httpChannel.VALIDATE_NEVER},
	get VALIDATE_ONCE_PER_SESSION() {return this.httpChannel.VALIDATE_ONCE_PER_SESSION},
	
	/*properties*/
	get loadFlags() {return this.httpChannel.loadFlags},
	set loadFlags(val) {this.httpChannel.loadFlags = val},
	get loadGroup() {return this.httpChannel.loadGroup},
	set loadGroup(val) {this.httpChannel.loadGroup = val},
	get name() {return this.httpChannel.name},
	get status() {return this.httpChannel.status},
	/*methods*/
	cancel: function(status){
		this.httpChannel.cancel(status);
	},
	isPending: function(){
		return this.httpChannel.isPending();
	},
	resume: function(){
		this.httpChannel.resume();
	},
	suspend: function(){
		this.httpChannel.suspend();
	},
	
	/*nsIChannel*/
	/*constants*/
	get LOAD_DOCUMENT_URI() {return this.httpChannel.LOAD_DOCUMENT_URI},
	get LOAD_RETARGETED_DOCUMENT_URI() {return this.httpChannel.LOAD_RETARGETED_DOCUMENT_URI},
	get LOAD_REPLACE() {return this.httpChannel.LOAD_REPLACE},
	get LOAD_INITIAL_DOCUMENT_URI() {return this.httpChannel.LOAD_INITIAL_DOCUMENT_URI},
	get LOAD_TARGETED() {return this.httpChannel.LOAD_TARGETED},

	/*properties*/
	get contentCharset() {return this.httpChannel.contentCharset},
	set contentCharset(val) {this.httpChannel.contentCharset = val},
	get contentLength() {return this.httpChannel.contentLength},
	set contentLength(val) {this.httpChannel.contentLength = val},
	get contentType() {return this.httpChannel.contentType},
	set contentType(val) {this.httpChannel.contentType = val},
	get notificationCallbacks() {return this.httpChannel.notificationCallbacks},
	set notificationCallbacks(val) {this.httpChannel.notificationCallbacks = val},
	get originalURI() {return this.httpChannel.originalURI},
	set originalURI(val) {this.httpChannel.originalURI = val},
	get owner() {return this.httpChannel.owner},
	set owner(val) {this.httpChannel.owner = val},	
	get securityInfo() {return this.httpChannel.securityInfo},
	get URI() {return this.httpChannel.URI},

	/*methods*/

	/*
	  This is the only important code here.
	  It changes listener provided by a caller and inserts tracingListener
	  which is able to intercept incoming traffic, examine it and
	  pass it to the oryginal listener.
	*/
	asyncOpen: function(listener, context){
		dump("asyncOpen intercepted\n");
		this.tracingListener = new TracingListener(listener);
		this.httpChannel.asyncOpen(this.tracingListener, context);
	},	
	
	open: function(){
		dump("open - not tracing this\n");
		return this.httpChannel.open();
	},

	/*nsIHttpChannel*/
	/*properties*/
	get allowPipelining() {return this.httpChannel.allowPipelining},
	set allowPipelining(val) {this.httpChannel.allowPipelining = val},
	get redirectionLimit() {return this.httpChannel.redirectionLimit},
	set redirectionLimit(val) {this.httpChannel.redirectionLimit = val},
	get referrer() {return this.httpChannel.referrer},
	set referrer(val) {this.httpChannel.referrer = val},
	get requestMethod() {return this.httpChannel.requestMethod},
	set requestMethod(val) {this.httpChannel.requestMethod = val},
	/*readonly*/
	get requestSucceeded() {return this.httpChannel.requestSucceeded},
	get responseStatus() {return this.httpChannel.responseStatus},
	get responseStatusText() {return this.httpChannel.responseStatusText},

	/*methods*/
	getRequestHeader: function(header){
		return this.httpChannel.getRequestHeader(header);
	},
	getResponseHeader: function(header){
		return this.httpChannel.getResponseHeader(header);
	},	
	isNoCacheResponse: function(){
		return this.httpChannel.isNoCacheResponse;
	},
	isNoStoreResponse: function(){
		return this.httpChannel.isNoStoreResponse;
	},	
	setRequestHeader: function(header , value , merge ){
		dump("Set request header " + header + " to " + value + "\n");
		this.httpChannel.setRequestHeader(header, value, merge);
	},
	setResponseHeader: function(header , value, merge ){
		dump("Set response header " + header + " to " + value + "\n");
		this.httpChannel.setResponseHeader(header, value, merge);
	},
	visitRequestHeaders: function(visitor){
		this.httpChannel.visitRequestHeaders(visitor);
	},
	visitResponseHeaders: function(visitor){
		this.httpChannel.visitResponseHeaders(visitor);
	},

	
	/*
	  Unfortunately, code is not portable. It has to implement
	  also unfrozen interfaces that might change in a future :/
	*/
	
	/*UNFROZEN*/
	/*nsIHttpChannelInternal*/
	get documentURI() {return this.httpChannelInternal.documentURI},
	set documentURI(val) {this.httpChannelInternal.documentURI = val},
	get proxyInfo() {return this.httpChannelInternal.proxyInfo},
	getRequestVersion: function(major,  minor){
		this.httpChannelInternal.getRequestVersion(major, minor);
	},
	getResponseVersion: function(major, minor){
		this.httpChannelInternal.getResponseVersion(major, minor);
	},
	setCookie: function(cookieHeader) {
		this.httpChannelInternal.setCookie(cookieHeader);
	},

	/*nsISupportsPriority*/
	get PRIORITY_HIGHEST() {return this.supportsPriority.PRIORITY_HIGHEST},
	get PRIORITY_HIGH() {return this.supportsPriority.PRIORITY_HIGH},
	get PRIORITY_NORMAL() {return this.supportsPriority.PRIORITY_NORMAL},
	get PRIORITY_LOW() {return this.supportsPriority.PRIORITY_LOW},
	get PRIORITY_LOWEST() {return this.supportsPriority.PRIORITY_LOWEST},
	get priority() {return this.supportsPriority.priority},
	set priority(val) {this.supportsPriority.priority = val},
	adjustPriority: function(delta){
		this.supportsPriority.adjustPriority(delta);
	},
	
	/*nsIPropertyBag*/
	get enumerator() {return this.writablePropertyBag2.enumerator},
	getProperty: function(name){
		return this.writablePropertyBag2.getProperty(name);
	},
	
	/*nsIWritablePropertyBag*/
	deleteProperty: function(name) {
		return this.writablePropertyBag.deleteProperty(name);
	},
	setProperty: function(name, value) {
		return this.writablePropertyBag.setProperty(name, value);
	},
	
	/*nsIPropertyBag2*/
	getPropertyAsACString: function(prop){
		return this.writablePropertyBag2.getPropertyAsACString(prop);
	},
	getPropertyAsAString: function(prop) {
		return this.writablePropertyBag2.getPropertyAsAString(prop);
	},
	getPropertyAsAUTF8String: function(prop) {
		return this.writablePropertyBag2.getPropertyAsAUTF8String(prop);
	},
	getPropertyAsBool: function(prop) {
		return this.writablePropertyBag2.getPropertyAsBool(prop);
	},
	getPropertyAsDouble: function(prop) {
		return this.writablePropertyBag2.getPropertyAsDouble(prop);
	},
	getPropertyAsInt32 : function(prop) {
		return this.writablePropertyBag2.getPropertyAsInt32 (prop);
	},
	getPropertyAsInt64: function(prop) {
		return this.writablePropertyBag2.getPropertyAsInt64(prop);
	},
	getPropertyAsInterface: function(prop, iid, result) {
		return this.writablePropertyBag2.getPropertyAsInterface(prop, iid, result);
	},
	getPropertyAsUint32: function(prop) {
		return this.writablePropertyBag2.getPropertyAsUint32(prop);
	},
	getPropertyAsUint64 : function(prop) {
		return this.writablePropertyBag2.getPropertyAsUint64(prop);
	},	

	/*nsIWritablePropertyBag2*/
	setPropertyAsACString: function(prop, value){
		return this.writablePropertyBag2.setPropertyAsACString(prop, value);
	},
	setPropertyAsAString: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsAString(prop, value);
	},
	setPropertyAsAUTF8String: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsAUTF8String(prop, value);
	},
	setPropertyAsBool: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsBool(prop, value);
	},
	setPropertyAsDouble: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsDouble(prop, value);
	},
	setPropertyAsInt32 : function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsInt32 (prop, value);
	},
	setPropertyAsInt64: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsInt64(prop, value);
	},
	setPropertyAsInterface: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsInterface(prop, value);
	},
	setPropertyAsUint32: function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsUint32(prop, value);
	},
	setPropertyAsUint64 : function(prop, value) {
		return this.writablePropertyBag2.setPropertyAsUint64(prop, value);
	},
	
	/*nsIEncodedChannel*/
	get applyConversion() {return this.encodedChannel.applyConversion},
	set applyConversion(val) {this.encodedChannel.applyConversion = val},
	get contentEncodings() {return this.encodedChannel.contentEncodings},

	/*nsICachingChannel*/
	get LOAD_BYPASS_LOCAL_CACHE() {return this.cachingChannel.LOAD_BYPASS_LOCAL_CACHE},
	get LOAD_BYPASS_LOCAL_CACHE_IF_BUSY(){
		return this.cachingChannel.LOAD_BYPASS_LOCAL_CACHE_IF_BUSY
	},
	get LOAD_ONLY_FROM_CACHE() {return this.cachingChannel.LOAD_ONLY_FROM_CACHE},
	get LOAD_ONLY_IF_MODIFIED() {return this.cachingChannel.LOAD_ONLY_IF_MODIFIED},
	get cacheAsFile() {return this.cachingChannel.cacheAsFile},
	set cacheAsFile(val) {this.cachingChannel.cacheAsFile = val},
	get cacheFile() {return this.cachingChannel.cacheFile},
	get cacheKey() {return this.cachingChannel.cacheKey},
	set cacheKey(val) {this.cachingChannel.cacheKey = val},
	get cacheToken() {return this.cachingChannel.cacheToken},
	set cacheToken(val) {this.cachingChannel.cacheToken = val},
	isFromCache: function() {
		return this.cachingChannel.isFromCache();
	}
}


function TracingListener(listener){	
	this.listener = listener;
	
        this.examineData = function(data){
		dump("intercepted data length " + data.length + "\n");
		dump(data); //Such dumping works only for ascii data
		dump("\n");

		//some other processing
		//...
	}
		
	/*
	  This method does all the work.  It reads a data from
	  inputStream, examines it and writes to outputStream which is
	  passed to oryginal listener.
	 */
	this.onDataAvailable = function(request, context, inputStream, offset, count){
		dump("onDataAvailable intercepted: count=" + count + " offset=" + offset + "\n");
		var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"].
		                     createInstance(Components.interfaces.nsIBinaryInputStream);
		var storageStream = Components.classes["@mozilla.org/storagestream;1"].
                                     createInstance(Components.interfaces.nsIStorageStream);
		var memoryService = Components.classes["@mozilla.org/xpcom/memory-service;1"].
		                     createInstance(Components.interfaces.nsIMemory);
		var binaryOutputStream = Components.classes["@mozilla.org/binaryoutputstream;1"].
		                     createInstance(Components.interfaces.nsIBinaryOutputStream);

		binaryInputStream.setInputStream(inputStream);
		storageStream.init(8192, count, memoryService);
		binaryOutputStream.setOutputStream(storageStream.getOutputStream(0));
		
		
		var data = binaryInputStream.readBytes(count);
		this.examineData(data);
		binaryOutputStream.writeBytes(data, count);
		
		this.listener.onDataAvailable(request, context, storageStream.newInputStream(0), 
					      offset, count);
	}
	
	this.onStartRequest = function(request , context){
		dump("Request started \n");
		listener.onStartRequest(request, context);
	}
				
	this.onStopRequest = function(request, context, statusCode){
		dump("Request stopped status\n");
		listener.onStopRequest(request, context, statusCode);
	}

	this.QueryInterface = function(iid){
		if ( iid.equals(Components.interfaces.nsIStreamListener) ||
		     iid.equals(Components.interfaces.nsISupportsWeakReference)
		     || iid.equals(Components.interfaces.nsISupports)
		     )
		    return this;
		throw Components.results.NS_NOINTERFACE;
	}	
}



var TracingHttpProtocol = {
	/*nsISupports*/
	QueryInterface: function(iid) {
		    if (iid.equals(Components.interfaces.nsISupports) || 
			iid.equals(Components.interfaces.nsISupportsWeakReference) ||
			iid.equals(Components.interfaces.nsIProtocolHandler) ||
			iid.equals(Components.interfaces.nsIProxiedProtocolHandler) ||
			iid.equals(Components.interfaces.nsIHttpProtocolHandler) ||
			iid.equals(Components.interfaces.nsIObserver)
		    )
 		return this;
		
		dump("Unimplemented HTTP channel interface " + iid + "\n");
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},	

	/*nsIObserver*/
	observe: function(subject, topic, data){
		dump("Observer called\n");
		this.savedObserver.observe(subject, topic, data);
	},

	/*nsIHttpProtocolHandler*/
	get appName() {return this.savedHttpHandler.appName},
	get appVersion() {return this.savedHttpHandler.appVersion},
	get language() {return this.savedHttpHandler.language},
	set language(val) {this.savedHttpHandler.language = val},
	get misc() {return this.savedHttpHandler.misc},
	set misc(val) {this.savedHttpHandler.misc = val},
	get oscpu() {return this.savedHttpHandler.oscpu},
	get platform() {return this.savedHttpHandler.platform},
	get product() {return this.savedHttpHandler.product},
	set product(val) {this.savedHttpHandler.product = val},
	get productComment() {return this.savedHttpHandler.productComment},
	set productComment(val) {this.savedHttpHandler.productComment = val},
	get productSub() {return this.savedHttpHandler.productSub},
	set productSub(val) {this.savedHttpHandler.productSub = val},
	get userAgent() {return this.savedHttpHandler.userAgent},
	get vendor() {return this.savedHttpHandler.vendor},
	set vendor(val) {this.savedHttpHandler.vendor = val},
	get vendorComment() {return this.savedHttpHandler.vendorComment},
	set vendorComment(val) {this.savedHttpHandler.vendorComment = val},
	get vendorSub() {return this.savedHttpHandler.vendorSub},
	set vendorSub(val) {this.savedHttpHandler.vendorSub = val},
	
	/*nsIProxiedProtocolHandler*/
	newProxiedChannel: function(uri , proxyInfo) {
		dump("newProxiedChannel called - not tracing this\n");
		return this.savedHttpHandler.newProxiedChannel(uri , proxyInfo);
	},
	
	/*nsIProtocolHandler*/
	get URI_STD() {return this.savedHttpHandler.URI_STD},
	get URI_NORELATIVE() {return this.savedHttpHandler.URI_NORELATIVE},
	get URI_NOAUTH() {return this.savedHttpHandler.URI_NOAUTH},
	get ALLOWS_PROXY() {return this.savedHttpHandler.ALLOWS_PROXY},
	get ALLOWS_PROXY_HTTP() {return this.savedHttpHandler.ALLOWS_PROXY_HTTP},
	get defaultPort() {return this.savedHttpHandler.defaultPort},
	get protocolFlags() {return this.savedHttpHandler.protocolFlags},
	get scheme() {return this.savedHttpHandler.scheme},

	ProtocolName: "http tracer",
	get ContractID(){ 
		return "@mozilla.org/network/protocol;1?name=" + this.scheme; 
	},
	cid: Components.ID("789409b9-2e3b-4682-a5d1-71ca80a76456"),
	/*protocolFlags: Components.interfaces.nsIProtocolHandler.URI_NORELATIVE | 
	  Components.interfaces.nsIProtocolHandler.URI_NOAUTH,*/
  
	allowPort: function(port, scheme){ 
		return false; 
	},

	newURI: function(spec, charset, baseURI) {
		dump("newURI called " + spec + "\n");
		return this.savedHttpHandler.newURI(spec, charset, baseURI);		
	},


	/*Get new channel from oryginal HTTP handler and create
	  channel to trace this channel.
	*/
	newChannel: function(locationURI) {
		dump("newChannel called for URI " + locationURI.spec +"\n")
		var newchannel = this.savedHttpHandler.newChannel(locationURI);
		
		tracedChannel = new TracingChannel(newchannel);
		return tracedChannel;
	},
	
	load: function() {
		/*Save oryginal handler for use in a future*/
		this.savedHttpHandler = 
		       Components.classes["@mozilla.org/network/protocol;1?name=http"].
                        getService(Components.interfaces.nsIHttpProtocolHandler);
		
		this.savedObserver = 
		       Components.classes["@mozilla.org/network/protocol;1?name=http"].
                        getService(Components.interfaces.nsIObserver);
		//Register new http protocol handler
		Components.manager.QueryInterface(Components.interfaces.nsIComponentRegistrar)
		    .registerFactory(this.cid, this.ProtocolName, this.ContractID, httpFactory);
		
		dump("New HTTP protocol handler loaded\n");
	}
}

var httpFactory = {
	/*nsIFactory*/
	createInstance: function(outer, iid) {
		if (outer != null){
			dump("Exception outer != null\n");
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		}
		if (iid.equals(Components.interfaces.nsIProtocolHandler) ||
		    iid.equals(Components.interfaces.nsISupports))
		  return TracingHttpProtocol;
		dump("Exception no interface\n");
		throw Components.results.NS_ERROR_NO_INTERFACE;
	},
			 
	/*nsISupports*/
	QueryInterface: function(iid) {
		if (iid.equals(Components.interfaces.nsISupports) ||
		    iid.equals(Components.interfaces.nsISupportsWeakReference) ||
		    iid.equals(Components.interfaces.nsIFactory))
			return this;
			
		dump("Unimplemented factory interface " + iid + "\n");
		throw Components.results.NS_ERROR_NO_INTERFACE;
	}
}

//Load new HTTP protocol handler
TracingHttpProtocol.load();
