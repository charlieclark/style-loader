/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var path = require('path');

var loaderUtils = require("loader-utils");
var validateOptions = require('schema-utils');

module.exports = function () {};

module.exports.pitch = function (request) {
	if (this.cacheable) this.cacheable();

	var options = loaderUtils.getOptions(this) || {};

	validateOptions(require('./options.json'), options, 'Style Loader (Useable)');

	return [
		"var refs = 0;",
		"var dispose;",
		"var content = require(" + loaderUtils.stringifyRequest(this, "!!" + request) + ");",
		"if(typeof content === 'string') content = [[module.id, content, '']];",
		"if(content.locals) exports.locals = content.locals;",
		"exports.use = exports.ref = function(_options) {",
		"	if(!(refs++)) {",
		"  var options = " + JSON.stringify(options) + ";",
		"  if(_options) {",
		"    for(key in _options) {",
		"      options[key] = _options[key];",
		"    }",
		"  }",
		"  dispose = require(" + loaderUtils.stringifyRequest(this, "!" + path.join(__dirname, "lib", "addStyles.js")) + ")(content, options);",
		"	}",
		"	return exports;",
		"};",
		"exports.unuse = exports.unref = function() {",
		"       if(refs > 0 && !(--refs)) {",
		"		dispose();",
		"		dispose = null;",
		"	}",
		"};",
		"if(module.hot) {",
		"	var lastRefs = module.hot.data && module.hot.data.refs || 0;",
		"	if(lastRefs) {",
		"		exports.ref();",
		"		if(!content.locals) {",
		"			refs = lastRefs;",
		"		}",
		"	}",
		"	if(!content.locals) {",
		"		module.hot.accept();",
		"	}",
		"	module.hot.dispose(function(data) {",
		"		data.refs = content.locals ? 0 : refs;",
		"		if(dispose) {",
		"			dispose();",
		"		}",
		"	});",
		"}"
	].join("\n");
};
