(function(global) {
    var choc = global.choc = global.choc || {};

    function resetFields(object) {
        for (var key in object) {
            var value = object[key];
            if (Object.isObject(value) || Object.isArray(value)) {
                object[key] = Object.clone(value, true);
            }
        }
    }

    var klassMethods = {
        extend: function(properties) {
            var klass = createKlass();

            this.__prototyping__ = true;
            klass.prototype = new this();
            delete this.__prototyping__;

            return include(klass, properties);
        },

        include: function(properties) {
            return include(this, properties);
        }
    };

    function createKlass() {
        var klass = function() {
            resetFields(this);
            if (klass.__prototyping__) return;
            if (this.initialize) return this.initialize.apply(this, arguments);
        };
        Object.merge(klass, klassMethods);
        return klass;
    }

    function include(klass, module) {
        if (!module) return klass;

        if (Object.isArray(module)) {
            module.flatten().forEach(function(moduleToInclude) { include(klass, moduleToInclude); });
        }

        var properties = Object.isFunction(module) ? module.prototype : module;

        processMacros(klass, macroProperties(properties));
        Object.merge(klass.prototype, nonMacroProperties(properties));

        return klass;
    }

    function processMacros(klass, macros) {
        Object.each(macros, function(key, value) {
            macrosProcessers[key](klass, value);
        });
    }

    function nonMacroProperties(properties) {
        var result = {};
        for (var key in properties) {
            if (!macrosProcessers[key]) result[key] = properties[key];
        }
        return result;
    }

    function macroProperties(properties) {
        var result = {};
        for (var key in properties) {
            if (macrosProcessers[key]) result[key] = properties[key];
        }
        return result;
    }

    var macrosProcessers = {
        Include: include
    };

    choc.klass = function(properties) {
        return include(createKlass(), properties);
    };
})(this);

(function() {
    choc.Eventable = choc.klass({
        _events: {},

        on: function(type, fn) {
            if (Object.isObject(type)) {
                var self = this;
                Object.each(type, function(key, value) { self.on(key, value); });
                return this;
            }

            this._events[type] = this._events[type] || [];
            this._events[type].push(fn);

            return this;
        },

        trigger: function(type, args, delay) {
            var fns = this._events[type];
            if (!fns) return this;

            args = Array.create(args).compact();
            if (delay > 0) {
                setTimeout(function() {
                    fns.forEach(function(fn) { fn.apply(this, args); }, this);
                }.bind(this), delay);
            } else {
                fns.forEach(function(fn) { fn.apply(this, args); }, this);
            }

            return this;
        },

        off: function(type, fn) {
            if (arguments.length < 2) {
                delete this._events[type];
                return this;
            }

            this._events[type] && this._events[type].remove(function(existingFn) { return existingFn === fn; });

            return this;
        }
    });
})();

