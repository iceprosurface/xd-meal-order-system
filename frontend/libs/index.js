// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
function ApiGet(url, data) {
  return new Promise(function (resole, reject) {
    chrome.runtime.sendMessage({
      type: 'http',
      method: 'get',
      url: url,
      data: data
    }, function (response) {
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(respone.response);
      }
    });
  });
}

function GetRestoreVar() {
  return new Promise(function (resolve) {
    chrome.storage.sync.get(["YOUR_NAME", "DEPARTMENT"], function (value) {
      resolve(value);
    });
  });
}

var YOUR_NAME, DEPARTMENT;
GetRestoreVar().then(function (result) {
  YOUR_NAME = result.YOUR_NAME;
  DEPARTMENT = result.DEPARTMENT;
  var timer = setInterval(function () {
    if (checkIfLoaded()) {
      clearInterval(timer);
      startInject();
    }
  }, 100);
});

function checkIfLoaded() {
  return document.querySelector(".question-list .question");
}

function findNameAndChoose(questions) {
  // find 名字
  questions.some(function (question) {
    var regex = new RegExp(YOUR_NAME);
    var dep = new RegExp(DEPARTMENT);
    return question.list.some(function (item) {
      var name = item.textContent;

      if (regex.test(name) && dep.test(name)) {
        item.click();
      }
    });
  });
}

function collectQuestion(dom) {
  var title = dom.querySelector(".question-title").textContent;
  var answer = dom.querySelector(".question-body"); // 判断是否是 select

  var selectBox = answer.querySelectorAll(".selectbox ul li");

  if (selectBox.length > 0) {
    // 说明是 select 输出 type
    var list = [];
    selectBox.forEach(function (item, index) {
      list.push(item);
    });
    return {
      title: title,
      type: "select",
      list: list
    };
  }

  var checkOptions = answer.querySelectorAll(".checkbox-option");

  if (checkOptions.length > 0) {
    var checkOpts = [];
    checkOptions.forEach(function (item) {
      checkOpts.push(item);
    });
    return {
      title: title,
      type: "checkbox",
      list: checkOpts
    };
  }
}

var supplierReg = new RegExp("（供应商(.*?)）");

function findAllSupplier(questions) {
  var data = {};
  questions.map(function (question) {
    question.list.forEach(function (option) {
      var text = option.textContent;

      if (supplierReg.test(text)) {
        var datas = text.match(supplierReg);
        var name = datas[1];
        var output = {
          origin: question,
          option: option
        };

        if (data[name]) {
          data[name].push(output);
        } else {
          data[name] = [output];
        }
      }
    });
  });
  return data;
}

function startInject() {
  var doms = Array.from(document.querySelectorAll(".question-list .question"));
  var questions = [];
  doms.forEach(function (dom) {
    questions.push(collectQuestion(dom));
  });
  findNameAndChoose(questions);
  var suppliers = findAllSupplier(questions);
  var contorl = document.createElement("div");
  var str = "";

  for (var name in suppliers) {
    str += "<div class=\"supplier\" data-value=\"".concat(name, "\">").concat(name, "</div>");
  }

  str += "<div class=\"supplier\" data-value=\"random\">\u968F\u673A\u5927\u6CD5</div>";
  str += "<div class=\"supplier\" data-value=\"buffet\">\u5168\u90E8\u81EA\u52A9\u9910</div>";
  contorl.innerHTML = str;
  contorl.style = "position: fixed;top: 10px;left: 10px;background: #fff; cursor: pointer;";
  contorl.addEventListener("click", function () {
    var target = event.target;
    var value = target.dataset.value;

    if (value === 'buffet') {
      questions.slice(1).forEach(function (question) {
        // 直接选择第二个就是自助餐
        var index = 1;
        question.list[index].querySelector("input").click();
      });
      return;
    }

    if (value === 'random') {
      questions.slice(1).forEach(function (question) {
        // 移除不吃饭选项
        var list = question.list.slice(1);
        var index = parseInt(list.length * Math.random());
        list[index].querySelector("input").click();
      });
      return;
    }

    if (value && suppliers[value]) {
      suppliers[value].forEach(function (supplier) {
        supplier.option.querySelector("input").click();
      });
    }
  });
  document.body.appendChild(contorl);
}
},{}],"../node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54760" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/index.js.map