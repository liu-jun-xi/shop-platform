var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
var init_utils = __esm({
  "node_modules/unenv/dist/runtime/_internal/utils.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(createNotImplementedError, "createNotImplementedError");
    __name(notImplemented, "notImplemented");
    __name(notImplementedClass, "notImplementedClass");
  }
});

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin, _performanceNow, nodeTiming, PerformanceEntry, PerformanceMark, PerformanceMeasure, PerformanceResourceTiming, PerformanceObserverEntryList, Performance, PerformanceObserver, performance;
var init_performance = __esm({
  "node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_utils();
    _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
    _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
    nodeTiming = {
      name: "node",
      entryType: "node",
      startTime: 0,
      duration: 0,
      nodeStart: 0,
      v8Start: 0,
      bootstrapComplete: 0,
      environment: 0,
      loopStart: 0,
      loopExit: 0,
      idleTime: 0,
      uvMetricsInfo: {
        loopCount: 0,
        events: 0,
        eventsWaiting: 0
      },
      detail: void 0,
      toJSON() {
        return this;
      }
    };
    PerformanceEntry = class {
      static {
        __name(this, "PerformanceEntry");
      }
      __unenv__ = true;
      detail;
      entryType = "event";
      name;
      startTime;
      constructor(name, options) {
        this.name = name;
        this.startTime = options?.startTime || _performanceNow();
        this.detail = options?.detail;
      }
      get duration() {
        return _performanceNow() - this.startTime;
      }
      toJSON() {
        return {
          name: this.name,
          entryType: this.entryType,
          startTime: this.startTime,
          duration: this.duration,
          detail: this.detail
        };
      }
    };
    PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
      static {
        __name(this, "PerformanceMark");
      }
      entryType = "mark";
      constructor() {
        super(...arguments);
      }
      get duration() {
        return 0;
      }
    };
    PerformanceMeasure = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceMeasure");
      }
      entryType = "measure";
    };
    PerformanceResourceTiming = class extends PerformanceEntry {
      static {
        __name(this, "PerformanceResourceTiming");
      }
      entryType = "resource";
      serverTiming = [];
      connectEnd = 0;
      connectStart = 0;
      decodedBodySize = 0;
      domainLookupEnd = 0;
      domainLookupStart = 0;
      encodedBodySize = 0;
      fetchStart = 0;
      initiatorType = "";
      name = "";
      nextHopProtocol = "";
      redirectEnd = 0;
      redirectStart = 0;
      requestStart = 0;
      responseEnd = 0;
      responseStart = 0;
      secureConnectionStart = 0;
      startTime = 0;
      transferSize = 0;
      workerStart = 0;
      responseStatus = 0;
    };
    PerformanceObserverEntryList = class {
      static {
        __name(this, "PerformanceObserverEntryList");
      }
      __unenv__ = true;
      getEntries() {
        return [];
      }
      getEntriesByName(_name, _type) {
        return [];
      }
      getEntriesByType(type) {
        return [];
      }
    };
    Performance = class {
      static {
        __name(this, "Performance");
      }
      __unenv__ = true;
      timeOrigin = _timeOrigin;
      eventCounts = /* @__PURE__ */ new Map();
      _entries = [];
      _resourceTimingBufferSize = 0;
      navigation = void 0;
      timing = void 0;
      timerify(_fn, _options) {
        throw createNotImplementedError("Performance.timerify");
      }
      get nodeTiming() {
        return nodeTiming;
      }
      eventLoopUtilization() {
        return {};
      }
      markResourceTiming() {
        return new PerformanceResourceTiming("");
      }
      onresourcetimingbufferfull = null;
      now() {
        if (this.timeOrigin === _timeOrigin) {
          return _performanceNow();
        }
        return Date.now() - this.timeOrigin;
      }
      clearMarks(markName) {
        this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
      }
      clearMeasures(measureName) {
        this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
      }
      clearResourceTimings() {
        this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
      }
      getEntries() {
        return this._entries;
      }
      getEntriesByName(name, type) {
        return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
      }
      getEntriesByType(type) {
        return this._entries.filter((e) => e.entryType === type);
      }
      mark(name, options) {
        const entry = new PerformanceMark(name, options);
        this._entries.push(entry);
        return entry;
      }
      measure(measureName, startOrMeasureOptions, endMark) {
        let start;
        let end;
        if (typeof startOrMeasureOptions === "string") {
          start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
          end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
        } else {
          start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
          end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
        }
        const entry = new PerformanceMeasure(measureName, {
          startTime: start,
          detail: {
            start,
            end
          }
        });
        this._entries.push(entry);
        return entry;
      }
      setResourceTimingBufferSize(maxSize) {
        this._resourceTimingBufferSize = maxSize;
      }
      addEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.addEventListener");
      }
      removeEventListener(type, listener, options) {
        throw createNotImplementedError("Performance.removeEventListener");
      }
      dispatchEvent(event) {
        throw createNotImplementedError("Performance.dispatchEvent");
      }
      toJSON() {
        return this;
      }
    };
    PerformanceObserver = class {
      static {
        __name(this, "PerformanceObserver");
      }
      __unenv__ = true;
      static supportedEntryTypes = [];
      _callback = null;
      constructor(callback) {
        this._callback = callback;
      }
      takeRecords() {
        return [];
      }
      disconnect() {
        throw createNotImplementedError("PerformanceObserver.disconnect");
      }
      observe(options) {
        throw createNotImplementedError("PerformanceObserver.observe");
      }
      bind(fn) {
        return fn;
      }
      runInAsyncScope(fn, thisArg, ...args) {
        return fn.call(thisArg, ...args);
      }
      asyncId() {
        return 0;
      }
      triggerAsyncId() {
        return 0;
      }
      emitDestroy() {
        return this;
      }
    };
    performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();
  }
});

// node_modules/unenv/dist/runtime/node/perf_hooks.mjs
var init_perf_hooks = __esm({
  "node_modules/unenv/dist/runtime/node/perf_hooks.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_performance();
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
var init_performance2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs"() {
    init_perf_hooks();
    if (!("__unenv__" in performance)) {
      const proto = Performance.prototype;
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key !== "constructor" && !(key in performance)) {
          const desc = Object.getOwnPropertyDescriptor(proto, key);
          if (desc) {
            Object.defineProperty(performance, key, desc);
          }
        }
      }
    }
    globalThis.performance = performance;
    globalThis.Performance = Performance;
    globalThis.PerformanceEntry = PerformanceEntry;
    globalThis.PerformanceMark = PerformanceMark;
    globalThis.PerformanceMeasure = PerformanceMeasure;
    globalThis.PerformanceObserver = PerformanceObserver;
    globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
    globalThis.PerformanceResourceTiming = PerformanceResourceTiming;
  }
});

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default;
var init_noop = __esm({
  "node_modules/unenv/dist/runtime/mock/noop.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    noop_default = Object.assign(() => {
    }, { __unenv__: true });
  }
});

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";
var _console, _ignoreErrors, _stderr, _stdout, log, info, trace, debug, table, error, warn, createTask, clear, count, countReset, dir, dirxml, group, groupEnd, groupCollapsed, profile, profileEnd, time, timeEnd, timeLog, timeStamp, Console, _times, _stdoutErrorHandler, _stderrErrorHandler;
var init_console = __esm({
  "node_modules/unenv/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_noop();
    init_utils();
    _console = globalThis.console;
    _ignoreErrors = true;
    _stderr = new Writable();
    _stdout = new Writable();
    log = _console?.log ?? noop_default;
    info = _console?.info ?? log;
    trace = _console?.trace ?? info;
    debug = _console?.debug ?? log;
    table = _console?.table ?? log;
    error = _console?.error ?? log;
    warn = _console?.warn ?? error;
    createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
    clear = _console?.clear ?? noop_default;
    count = _console?.count ?? noop_default;
    countReset = _console?.countReset ?? noop_default;
    dir = _console?.dir ?? noop_default;
    dirxml = _console?.dirxml ?? noop_default;
    group = _console?.group ?? noop_default;
    groupEnd = _console?.groupEnd ?? noop_default;
    groupCollapsed = _console?.groupCollapsed ?? noop_default;
    profile = _console?.profile ?? noop_default;
    profileEnd = _console?.profileEnd ?? noop_default;
    time = _console?.time ?? noop_default;
    timeEnd = _console?.timeEnd ?? noop_default;
    timeLog = _console?.timeLog ?? noop_default;
    timeStamp = _console?.timeStamp ?? noop_default;
    Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
    _times = /* @__PURE__ */ new Map();
    _stdoutErrorHandler = noop_default;
    _stderrErrorHandler = noop_default;
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole, assert, clear2, context, count2, countReset2, createTask2, debug2, dir2, dirxml2, error2, group2, groupCollapsed2, groupEnd2, info2, log2, profile2, profileEnd2, table2, time2, timeEnd2, timeLog2, timeStamp2, trace2, warn2, console_default;
var init_console2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_console();
    workerdConsole = globalThis["console"];
    ({
      assert,
      clear: clear2,
      context: (
        // @ts-expect-error undocumented public API
        context
      ),
      count: count2,
      countReset: countReset2,
      createTask: (
        // @ts-expect-error undocumented public API
        createTask2
      ),
      debug: debug2,
      dir: dir2,
      dirxml: dirxml2,
      error: error2,
      group: group2,
      groupCollapsed: groupCollapsed2,
      groupEnd: groupEnd2,
      info: info2,
      log: log2,
      profile: profile2,
      profileEnd: profileEnd2,
      table: table2,
      time: time2,
      timeEnd: timeEnd2,
      timeLog: timeLog2,
      timeStamp: timeStamp2,
      trace: trace2,
      warn: warn2
    } = workerdConsole);
    Object.assign(workerdConsole, {
      Console,
      _ignoreErrors,
      _stderr,
      _stderrErrorHandler,
      _stdout,
      _stdoutErrorHandler,
      _times
    });
    console_default = workerdConsole;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console"() {
    init_console2();
    globalThis.console = console_default;
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime;
var init_hrtime = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
      const now = Date.now();
      const seconds = Math.trunc(now / 1e3);
      const nanos = now % 1e3 * 1e6;
      if (startTime) {
        let diffSeconds = seconds - startTime[0];
        let diffNanos = nanos - startTime[0];
        if (diffNanos < 0) {
          diffSeconds = diffSeconds - 1;
          diffNanos = 1e9 + diffNanos;
        }
        return [diffSeconds, diffNanos];
      }
      return [seconds, nanos];
    }, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
      return BigInt(Date.now() * 1e6);
    }, "bigint") });
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream;
var init_read_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    ReadStream = class {
      static {
        __name(this, "ReadStream");
      }
      fd;
      isRaw = false;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      setRawMode(mode) {
        this.isRaw = mode;
        return this;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream;
var init_write_stream = __esm({
  "node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    WriteStream = class {
      static {
        __name(this, "WriteStream");
      }
      fd;
      columns = 80;
      rows = 24;
      isTTY = false;
      constructor(fd) {
        this.fd = fd;
      }
      clearLine(dir3, callback) {
        callback && callback();
        return false;
      }
      clearScreenDown(callback) {
        callback && callback();
        return false;
      }
      cursorTo(x, y, callback) {
        callback && typeof callback === "function" && callback();
        return false;
      }
      moveCursor(dx, dy, callback) {
        callback && callback();
        return false;
      }
      getColorDepth(env2) {
        return 1;
      }
      hasColors(count3, env2) {
        return false;
      }
      getWindowSize() {
        return [this.columns, this.rows];
      }
      write(str, encoding, cb) {
        if (str instanceof Uint8Array) {
          str = new TextDecoder().decode(str);
        }
        try {
          console.log(str);
        } catch {
        }
        cb && typeof cb === "function" && cb();
        return false;
      }
    };
  }
});

// node_modules/unenv/dist/runtime/node/tty.mjs
var init_tty = __esm({
  "node_modules/unenv/dist/runtime/node/tty.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_read_stream();
    init_write_stream();
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION;
var init_node_version = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    NODE_VERSION = "22.14.0";
  }
});

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";
var Process;
var init_process = __esm({
  "node_modules/unenv/dist/runtime/node/internal/process/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_tty();
    init_utils();
    init_node_version();
    Process = class _Process extends EventEmitter {
      static {
        __name(this, "Process");
      }
      env;
      hrtime;
      nextTick;
      constructor(impl) {
        super();
        this.env = impl.env;
        this.hrtime = impl.hrtime;
        this.nextTick = impl.nextTick;
        for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
          const value = this[prop];
          if (typeof value === "function") {
            this[prop] = value.bind(this);
          }
        }
      }
      // --- event emitter ---
      emitWarning(warning, type, code) {
        console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
      }
      emit(...args) {
        return super.emit(...args);
      }
      listeners(eventName) {
        return super.listeners(eventName);
      }
      // --- stdio (lazy initializers) ---
      #stdin;
      #stdout;
      #stderr;
      get stdin() {
        return this.#stdin ??= new ReadStream(0);
      }
      get stdout() {
        return this.#stdout ??= new WriteStream(1);
      }
      get stderr() {
        return this.#stderr ??= new WriteStream(2);
      }
      // --- cwd ---
      #cwd = "/";
      chdir(cwd2) {
        this.#cwd = cwd2;
      }
      cwd() {
        return this.#cwd;
      }
      // --- dummy props and getters ---
      arch = "";
      platform = "";
      argv = [];
      argv0 = "";
      execArgv = [];
      execPath = "";
      title = "";
      pid = 200;
      ppid = 100;
      get version() {
        return `v${NODE_VERSION}`;
      }
      get versions() {
        return { node: NODE_VERSION };
      }
      get allowedNodeEnvironmentFlags() {
        return /* @__PURE__ */ new Set();
      }
      get sourceMapsEnabled() {
        return false;
      }
      get debugPort() {
        return 0;
      }
      get throwDeprecation() {
        return false;
      }
      get traceDeprecation() {
        return false;
      }
      get features() {
        return {};
      }
      get release() {
        return {};
      }
      get connected() {
        return false;
      }
      get config() {
        return {};
      }
      get moduleLoadList() {
        return [];
      }
      constrainedMemory() {
        return 0;
      }
      availableMemory() {
        return 0;
      }
      uptime() {
        return 0;
      }
      resourceUsage() {
        return {};
      }
      // --- noop methods ---
      ref() {
      }
      unref() {
      }
      // --- unimplemented methods ---
      umask() {
        throw createNotImplementedError("process.umask");
      }
      getBuiltinModule() {
        return void 0;
      }
      getActiveResourcesInfo() {
        throw createNotImplementedError("process.getActiveResourcesInfo");
      }
      exit() {
        throw createNotImplementedError("process.exit");
      }
      reallyExit() {
        throw createNotImplementedError("process.reallyExit");
      }
      kill() {
        throw createNotImplementedError("process.kill");
      }
      abort() {
        throw createNotImplementedError("process.abort");
      }
      dlopen() {
        throw createNotImplementedError("process.dlopen");
      }
      setSourceMapsEnabled() {
        throw createNotImplementedError("process.setSourceMapsEnabled");
      }
      loadEnvFile() {
        throw createNotImplementedError("process.loadEnvFile");
      }
      disconnect() {
        throw createNotImplementedError("process.disconnect");
      }
      cpuUsage() {
        throw createNotImplementedError("process.cpuUsage");
      }
      setUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
      }
      hasUncaughtExceptionCaptureCallback() {
        throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
      }
      initgroups() {
        throw createNotImplementedError("process.initgroups");
      }
      openStdin() {
        throw createNotImplementedError("process.openStdin");
      }
      assert() {
        throw createNotImplementedError("process.assert");
      }
      binding() {
        throw createNotImplementedError("process.binding");
      }
      // --- attached interfaces ---
      permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
      report = {
        directory: "",
        filename: "",
        signal: "SIGUSR2",
        compact: false,
        reportOnFatalError: false,
        reportOnSignal: false,
        reportOnUncaughtException: false,
        getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
        writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
      };
      finalization = {
        register: /* @__PURE__ */ notImplemented("process.finalization.register"),
        unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
        registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
      };
      memoryUsage = Object.assign(() => ({
        arrayBuffers: 0,
        rss: 0,
        external: 0,
        heapTotal: 0,
        heapUsed: 0
      }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
      // --- undefined props ---
      mainModule = void 0;
      domain = void 0;
      // optional
      send = void 0;
      exitCode = void 0;
      channel = void 0;
      getegid = void 0;
      geteuid = void 0;
      getgid = void 0;
      getgroups = void 0;
      getuid = void 0;
      setegid = void 0;
      seteuid = void 0;
      setgid = void 0;
      setgroups = void 0;
      setuid = void 0;
      // internals
      _events = void 0;
      _eventsCount = void 0;
      _exiting = void 0;
      _maxListeners = void 0;
      _debugEnd = void 0;
      _debugProcess = void 0;
      _fatalException = void 0;
      _getActiveHandles = void 0;
      _getActiveRequests = void 0;
      _kill = void 0;
      _preload_modules = void 0;
      _rawDebug = void 0;
      _startProfilerIdleNotifier = void 0;
      _stopProfilerIdleNotifier = void 0;
      _tickCallback = void 0;
      _disconnect = void 0;
      _handleQueue = void 0;
      _pendingMessage = void 0;
      _channel = void 0;
      _send = void 0;
      _linkedBinding = void 0;
    };
  }
});

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess, getBuiltinModule, workerdProcess, unenvProcess, exit, features, platform, _channel, _debugEnd, _debugProcess, _disconnect, _events, _eventsCount, _exiting, _fatalException, _getActiveHandles, _getActiveRequests, _handleQueue, _kill, _linkedBinding, _maxListeners, _pendingMessage, _preload_modules, _rawDebug, _send, _startProfilerIdleNotifier, _stopProfilerIdleNotifier, _tickCallback, abort, addListener, allowedNodeEnvironmentFlags, arch, argv, argv0, assert2, availableMemory, binding, channel, chdir, config, connected, constrainedMemory, cpuUsage, cwd, debugPort, disconnect, dlopen, domain, emit, emitWarning, env, eventNames, execArgv, execPath, exitCode, finalization, getActiveResourcesInfo, getegid, geteuid, getgid, getgroups, getMaxListeners, getuid, hasUncaughtExceptionCaptureCallback, hrtime3, initgroups, kill, listenerCount, listeners, loadEnvFile, mainModule, memoryUsage, moduleLoadList, nextTick, off, on, once, openStdin, permission, pid, ppid, prependListener, prependOnceListener, rawListeners, reallyExit, ref, release, removeAllListeners, removeListener, report, resourceUsage, send, setegid, seteuid, setgid, setgroups, setMaxListeners, setSourceMapsEnabled, setuid, setUncaughtExceptionCaptureCallback, sourceMapsEnabled, stderr, stdin, stdout, throwDeprecation, title, traceDeprecation, umask, unref, uptime, version, versions, _process, process_default;
var init_process2 = __esm({
  "node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_hrtime();
    init_process();
    globalProcess = globalThis["process"];
    getBuiltinModule = globalProcess.getBuiltinModule;
    workerdProcess = getBuiltinModule("node:process");
    unenvProcess = new Process({
      env: globalProcess.env,
      hrtime,
      // `nextTick` is available from workerd process v1
      nextTick: workerdProcess.nextTick
    });
    ({ exit, features, platform } = workerdProcess);
    ({
      _channel,
      _debugEnd,
      _debugProcess,
      _disconnect,
      _events,
      _eventsCount,
      _exiting,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _handleQueue,
      _kill,
      _linkedBinding,
      _maxListeners,
      _pendingMessage,
      _preload_modules,
      _rawDebug,
      _send,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      arch,
      argv,
      argv0,
      assert: assert2,
      availableMemory,
      binding,
      channel,
      chdir,
      config,
      connected,
      constrainedMemory,
      cpuUsage,
      cwd,
      debugPort,
      disconnect,
      dlopen,
      domain,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exitCode,
      finalization,
      getActiveResourcesInfo,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getMaxListeners,
      getuid,
      hasUncaughtExceptionCaptureCallback,
      hrtime: hrtime3,
      initgroups,
      kill,
      listenerCount,
      listeners,
      loadEnvFile,
      mainModule,
      memoryUsage,
      moduleLoadList,
      nextTick,
      off,
      on,
      once,
      openStdin,
      permission,
      pid,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      reallyExit,
      ref,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      send,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setMaxListeners,
      setSourceMapsEnabled,
      setuid,
      setUncaughtExceptionCaptureCallback,
      sourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      throwDeprecation,
      title,
      traceDeprecation,
      umask,
      unref,
      uptime,
      version,
      versions
    } = unenvProcess);
    _process = {
      abort,
      addListener,
      allowedNodeEnvironmentFlags,
      hasUncaughtExceptionCaptureCallback,
      setUncaughtExceptionCaptureCallback,
      loadEnvFile,
      sourceMapsEnabled,
      arch,
      argv,
      argv0,
      chdir,
      config,
      connected,
      constrainedMemory,
      availableMemory,
      cpuUsage,
      cwd,
      debugPort,
      dlopen,
      disconnect,
      emit,
      emitWarning,
      env,
      eventNames,
      execArgv,
      execPath,
      exit,
      finalization,
      features,
      getBuiltinModule,
      getActiveResourcesInfo,
      getMaxListeners,
      hrtime: hrtime3,
      kill,
      listeners,
      listenerCount,
      memoryUsage,
      nextTick,
      on,
      off,
      once,
      pid,
      platform,
      ppid,
      prependListener,
      prependOnceListener,
      rawListeners,
      release,
      removeAllListeners,
      removeListener,
      report,
      resourceUsage,
      setMaxListeners,
      setSourceMapsEnabled,
      stderr,
      stdin,
      stdout,
      title,
      throwDeprecation,
      traceDeprecation,
      umask,
      uptime,
      version,
      versions,
      // @ts-expect-error old API
      domain,
      initgroups,
      moduleLoadList,
      reallyExit,
      openStdin,
      assert: assert2,
      binding,
      send,
      exitCode,
      channel,
      getegid,
      geteuid,
      getgid,
      getgroups,
      getuid,
      setegid,
      seteuid,
      setgid,
      setgroups,
      setuid,
      permission,
      mainModule,
      _events,
      _eventsCount,
      _exiting,
      _maxListeners,
      _debugEnd,
      _debugProcess,
      _fatalException,
      _getActiveHandles,
      _getActiveRequests,
      _kill,
      _preload_modules,
      _rawDebug,
      _startProfilerIdleNotifier,
      _stopProfilerIdleNotifier,
      _tickCallback,
      _disconnect,
      _handleQueue,
      _pendingMessage,
      _channel,
      _send,
      _linkedBinding
    };
    process_default = _process;
  }
});

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
var init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process = __esm({
  "node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process"() {
    init_process2();
    globalThis.process = process_default;
  }
});

// node-built-in-modules:crypto
import libDefault from "crypto";
var require_crypto = __commonJS({
  "node-built-in-modules:crypto"(exports, module) {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    module.exports = libDefault;
  }
});

// worker/node_modules/bcryptjs/dist/bcrypt.js
var require_bcrypt = __commonJS({
  "worker/node_modules/bcryptjs/dist/bcrypt.js"(exports, module) {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    (function(global, factory) {
      if (typeof define === "function" && define["amd"])
        define([], factory);
      else if (typeof __require === "function" && typeof module === "object" && module && module["exports"])
        module["exports"] = factory();
      else
        (global["dcodeIO"] = global["dcodeIO"] || {})["bcrypt"] = factory();
    })(exports, function() {
      "use strict";
      var bcrypt4 = {};
      var randomFallback = null;
      function random(len) {
        if (typeof module !== "undefined" && module && module["exports"])
          try {
            return require_crypto()["randomBytes"](len);
          } catch (e) {
          }
        try {
          var a;
          (self["crypto"] || self["msCrypto"])["getRandomValues"](a = new Uint32Array(len));
          return Array.prototype.slice.call(a);
        } catch (e) {
        }
        if (!randomFallback)
          throw Error("Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative");
        return randomFallback(len);
      }
      __name(random, "random");
      var randomAvailable = false;
      try {
        random(1);
        randomAvailable = true;
      } catch (e) {
      }
      randomFallback = null;
      bcrypt4.setRandomFallback = function(random2) {
        randomFallback = random2;
      };
      bcrypt4.genSaltSync = function(rounds, seed_length) {
        rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof rounds !== "number")
          throw Error("Illegal arguments: " + typeof rounds + ", " + typeof seed_length);
        if (rounds < 4)
          rounds = 4;
        else if (rounds > 31)
          rounds = 31;
        var salt = [];
        salt.push("$2a$");
        if (rounds < 10)
          salt.push("0");
        salt.push(rounds.toString());
        salt.push("$");
        salt.push(base64_encode(random(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
        return salt.join("");
      };
      bcrypt4.genSalt = function(rounds, seed_length, callback) {
        if (typeof seed_length === "function")
          callback = seed_length, seed_length = void 0;
        if (typeof rounds === "function")
          callback = rounds, rounds = void 0;
        if (typeof rounds === "undefined")
          rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
        else if (typeof rounds !== "number")
          throw Error("illegal arguments: " + typeof rounds);
        function _async(callback2) {
          nextTick2(function() {
            try {
              callback2(null, bcrypt4.genSaltSync(rounds));
            } catch (err) {
              callback2(err);
            }
          });
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt4.hashSync = function(s, salt) {
        if (typeof salt === "undefined")
          salt = GENSALT_DEFAULT_LOG2_ROUNDS;
        if (typeof salt === "number")
          salt = bcrypt4.genSaltSync(salt);
        if (typeof s !== "string" || typeof salt !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof salt);
        return _hash(s, salt);
      };
      bcrypt4.hash = function(s, salt, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s === "string" && typeof salt === "number")
            bcrypt4.genSalt(salt, function(err, salt2) {
              _hash(s, salt2, callback2, progressCallback);
            });
          else if (typeof s === "string" && typeof salt === "string")
            _hash(s, salt, callback2, progressCallback);
          else
            nextTick2(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof salt)));
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      function safeStringCompare(known, unknown) {
        var right = 0, wrong = 0;
        for (var i = 0, k = known.length; i < k; ++i) {
          if (known.charCodeAt(i) === unknown.charCodeAt(i))
            ++right;
          else
            ++wrong;
        }
        if (right < 0)
          return false;
        return wrong === 0;
      }
      __name(safeStringCompare, "safeStringCompare");
      bcrypt4.compareSync = function(s, hash) {
        if (typeof s !== "string" || typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof s + ", " + typeof hash);
        if (hash.length !== 60)
          return false;
        return safeStringCompare(bcrypt4.hashSync(s, hash.substr(0, hash.length - 31)), hash);
      };
      bcrypt4.compare = function(s, hash, callback, progressCallback) {
        function _async(callback2) {
          if (typeof s !== "string" || typeof hash !== "string") {
            nextTick2(callback2.bind(this, Error("Illegal arguments: " + typeof s + ", " + typeof hash)));
            return;
          }
          if (hash.length !== 60) {
            nextTick2(callback2.bind(this, null, false));
            return;
          }
          bcrypt4.hash(s, hash.substr(0, 29), function(err, comp) {
            if (err)
              callback2(err);
            else
              callback2(null, safeStringCompare(comp, hash));
          }, progressCallback);
        }
        __name(_async, "_async");
        if (callback) {
          if (typeof callback !== "function")
            throw Error("Illegal callback: " + typeof callback);
          _async(callback);
        } else
          return new Promise(function(resolve, reject) {
            _async(function(err, res) {
              if (err) {
                reject(err);
                return;
              }
              resolve(res);
            });
          });
      };
      bcrypt4.getRounds = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        return parseInt(hash.split("$")[2], 10);
      };
      bcrypt4.getSalt = function(hash) {
        if (typeof hash !== "string")
          throw Error("Illegal arguments: " + typeof hash);
        if (hash.length !== 60)
          throw Error("Illegal hash length: " + hash.length + " != 60");
        return hash.substring(0, 29);
      };
      var nextTick2 = typeof process !== "undefined" && process && typeof process.nextTick === "function" ? typeof setImmediate === "function" ? setImmediate : process.nextTick : setTimeout;
      function stringToBytes(str) {
        var out = [], i = 0;
        utfx.encodeUTF16toUTF8(function() {
          if (i >= str.length) return null;
          return str.charCodeAt(i++);
        }, function(b) {
          out.push(b);
        });
        return out;
      }
      __name(stringToBytes, "stringToBytes");
      var BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
      var BASE64_INDEX = [
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        0,
        1,
        54,
        55,
        56,
        57,
        58,
        59,
        60,
        61,
        62,
        63,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15,
        16,
        17,
        18,
        19,
        20,
        21,
        22,
        23,
        24,
        25,
        26,
        27,
        -1,
        -1,
        -1,
        -1,
        -1,
        -1,
        28,
        29,
        30,
        31,
        32,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        41,
        42,
        43,
        44,
        45,
        46,
        47,
        48,
        49,
        50,
        51,
        52,
        53,
        -1,
        -1,
        -1,
        -1,
        -1
      ];
      var stringFromCharCode = String.fromCharCode;
      function base64_encode(b, len) {
        var off2 = 0, rs = [], c1, c2;
        if (len <= 0 || len > b.length)
          throw Error("Illegal len: " + len);
        while (off2 < len) {
          c1 = b[off2++] & 255;
          rs.push(BASE64_CODE[c1 >> 2 & 63]);
          c1 = (c1 & 3) << 4;
          if (off2 >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off2++] & 255;
          c1 |= c2 >> 4 & 15;
          rs.push(BASE64_CODE[c1 & 63]);
          c1 = (c2 & 15) << 2;
          if (off2 >= len) {
            rs.push(BASE64_CODE[c1 & 63]);
            break;
          }
          c2 = b[off2++] & 255;
          c1 |= c2 >> 6 & 3;
          rs.push(BASE64_CODE[c1 & 63]);
          rs.push(BASE64_CODE[c2 & 63]);
        }
        return rs.join("");
      }
      __name(base64_encode, "base64_encode");
      function base64_decode(s, len) {
        var off2 = 0, slen = s.length, olen = 0, rs = [], c1, c2, c3, c4, o, code;
        if (len <= 0)
          throw Error("Illegal len: " + len);
        while (off2 < slen - 1 && olen < len) {
          code = s.charCodeAt(off2++);
          c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          code = s.charCodeAt(off2++);
          c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c1 == -1 || c2 == -1)
            break;
          o = c1 << 2 >>> 0;
          o |= (c2 & 48) >> 4;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off2 >= slen)
            break;
          code = s.charCodeAt(off2++);
          c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          if (c3 == -1)
            break;
          o = (c2 & 15) << 4 >>> 0;
          o |= (c3 & 60) >> 2;
          rs.push(stringFromCharCode(o));
          if (++olen >= len || off2 >= slen)
            break;
          code = s.charCodeAt(off2++);
          c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
          o = (c3 & 3) << 6 >>> 0;
          o |= c4;
          rs.push(stringFromCharCode(o));
          ++olen;
        }
        var res = [];
        for (off2 = 0; off2 < olen; off2++)
          res.push(rs[off2].charCodeAt(0));
        return res;
      }
      __name(base64_decode, "base64_decode");
      var utfx = (function() {
        "use strict";
        var utfx2 = {};
        utfx2.MAX_CODEPOINT = 1114111;
        utfx2.encodeUTF8 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp < 128)
              dst(cp & 127);
            else if (cp < 2048)
              dst(cp >> 6 & 31 | 192), dst(cp & 63 | 128);
            else if (cp < 65536)
              dst(cp >> 12 & 15 | 224), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            else
              dst(cp >> 18 & 7 | 240), dst(cp >> 12 & 63 | 128), dst(cp >> 6 & 63 | 128), dst(cp & 63 | 128);
            cp = null;
          }
        };
        utfx2.decodeUTF8 = function(src, dst) {
          var a, b, c, d, fail = /* @__PURE__ */ __name(function(b2) {
            b2 = b2.slice(0, b2.indexOf(null));
            var err = Error(b2.toString());
            err.name = "TruncatedError";
            err["bytes"] = b2;
            throw err;
          }, "fail");
          while ((a = src()) !== null) {
            if ((a & 128) === 0)
              dst(a);
            else if ((a & 224) === 192)
              (b = src()) === null && fail([a, b]), dst((a & 31) << 6 | b & 63);
            else if ((a & 240) === 224)
              ((b = src()) === null || (c = src()) === null) && fail([a, b, c]), dst((a & 15) << 12 | (b & 63) << 6 | c & 63);
            else if ((a & 248) === 240)
              ((b = src()) === null || (c = src()) === null || (d = src()) === null) && fail([a, b, c, d]), dst((a & 7) << 18 | (b & 63) << 12 | (c & 63) << 6 | d & 63);
            else throw RangeError("Illegal starting byte: " + a);
          }
        };
        utfx2.UTF16toUTF8 = function(src, dst) {
          var c1, c2 = null;
          while (true) {
            if ((c1 = c2 !== null ? c2 : src()) === null)
              break;
            if (c1 >= 55296 && c1 <= 57343) {
              if ((c2 = src()) !== null) {
                if (c2 >= 56320 && c2 <= 57343) {
                  dst((c1 - 55296) * 1024 + c2 - 56320 + 65536);
                  c2 = null;
                  continue;
                }
              }
            }
            dst(c1);
          }
          if (c2 !== null) dst(c2);
        };
        utfx2.UTF8toUTF16 = function(src, dst) {
          var cp = null;
          if (typeof src === "number")
            cp = src, src = /* @__PURE__ */ __name(function() {
              return null;
            }, "src");
          while (cp !== null || (cp = src()) !== null) {
            if (cp <= 65535)
              dst(cp);
            else
              cp -= 65536, dst((cp >> 10) + 55296), dst(cp % 1024 + 56320);
            cp = null;
          }
        };
        utfx2.encodeUTF16toUTF8 = function(src, dst) {
          utfx2.UTF16toUTF8(src, function(cp) {
            utfx2.encodeUTF8(cp, dst);
          });
        };
        utfx2.decodeUTF8toUTF16 = function(src, dst) {
          utfx2.decodeUTF8(src, function(cp) {
            utfx2.UTF8toUTF16(cp, dst);
          });
        };
        utfx2.calculateCodePoint = function(cp) {
          return cp < 128 ? 1 : cp < 2048 ? 2 : cp < 65536 ? 3 : 4;
        };
        utfx2.calculateUTF8 = function(src) {
          var cp, l = 0;
          while ((cp = src()) !== null)
            l += utfx2.calculateCodePoint(cp);
          return l;
        };
        utfx2.calculateUTF16asUTF8 = function(src) {
          var n = 0, l = 0;
          utfx2.UTF16toUTF8(src, function(cp) {
            ++n;
            l += utfx2.calculateCodePoint(cp);
          });
          return [n, l];
        };
        return utfx2;
      })();
      Date.now = Date.now || function() {
        return +/* @__PURE__ */ new Date();
      };
      var BCRYPT_SALT_LEN = 16;
      var GENSALT_DEFAULT_LOG2_ROUNDS = 10;
      var BLOWFISH_NUM_ROUNDS = 16;
      var MAX_EXECUTION_TIME = 100;
      var P_ORIG = [
        608135816,
        2242054355,
        320440878,
        57701188,
        2752067618,
        698298832,
        137296536,
        3964562569,
        1160258022,
        953160567,
        3193202383,
        887688300,
        3232508343,
        3380367581,
        1065670069,
        3041331479,
        2450970073,
        2306472731
      ];
      var S_ORIG = [
        3509652390,
        2564797868,
        805139163,
        3491422135,
        3101798381,
        1780907670,
        3128725573,
        4046225305,
        614570311,
        3012652279,
        134345442,
        2240740374,
        1667834072,
        1901547113,
        2757295779,
        4103290238,
        227898511,
        1921955416,
        1904987480,
        2182433518,
        2069144605,
        3260701109,
        2620446009,
        720527379,
        3318853667,
        677414384,
        3393288472,
        3101374703,
        2390351024,
        1614419982,
        1822297739,
        2954791486,
        3608508353,
        3174124327,
        2024746970,
        1432378464,
        3864339955,
        2857741204,
        1464375394,
        1676153920,
        1439316330,
        715854006,
        3033291828,
        289532110,
        2706671279,
        2087905683,
        3018724369,
        1668267050,
        732546397,
        1947742710,
        3462151702,
        2609353502,
        2950085171,
        1814351708,
        2050118529,
        680887927,
        999245976,
        1800124847,
        3300911131,
        1713906067,
        1641548236,
        4213287313,
        1216130144,
        1575780402,
        4018429277,
        3917837745,
        3693486850,
        3949271944,
        596196993,
        3549867205,
        258830323,
        2213823033,
        772490370,
        2760122372,
        1774776394,
        2652871518,
        566650946,
        4142492826,
        1728879713,
        2882767088,
        1783734482,
        3629395816,
        2517608232,
        2874225571,
        1861159788,
        326777828,
        3124490320,
        2130389656,
        2716951837,
        967770486,
        1724537150,
        2185432712,
        2364442137,
        1164943284,
        2105845187,
        998989502,
        3765401048,
        2244026483,
        1075463327,
        1455516326,
        1322494562,
        910128902,
        469688178,
        1117454909,
        936433444,
        3490320968,
        3675253459,
        1240580251,
        122909385,
        2157517691,
        634681816,
        4142456567,
        3825094682,
        3061402683,
        2540495037,
        79693498,
        3249098678,
        1084186820,
        1583128258,
        426386531,
        1761308591,
        1047286709,
        322548459,
        995290223,
        1845252383,
        2603652396,
        3431023940,
        2942221577,
        3202600964,
        3727903485,
        1712269319,
        422464435,
        3234572375,
        1170764815,
        3523960633,
        3117677531,
        1434042557,
        442511882,
        3600875718,
        1076654713,
        1738483198,
        4213154764,
        2393238008,
        3677496056,
        1014306527,
        4251020053,
        793779912,
        2902807211,
        842905082,
        4246964064,
        1395751752,
        1040244610,
        2656851899,
        3396308128,
        445077038,
        3742853595,
        3577915638,
        679411651,
        2892444358,
        2354009459,
        1767581616,
        3150600392,
        3791627101,
        3102740896,
        284835224,
        4246832056,
        1258075500,
        768725851,
        2589189241,
        3069724005,
        3532540348,
        1274779536,
        3789419226,
        2764799539,
        1660621633,
        3471099624,
        4011903706,
        913787905,
        3497959166,
        737222580,
        2514213453,
        2928710040,
        3937242737,
        1804850592,
        3499020752,
        2949064160,
        2386320175,
        2390070455,
        2415321851,
        4061277028,
        2290661394,
        2416832540,
        1336762016,
        1754252060,
        3520065937,
        3014181293,
        791618072,
        3188594551,
        3933548030,
        2332172193,
        3852520463,
        3043980520,
        413987798,
        3465142937,
        3030929376,
        4245938359,
        2093235073,
        3534596313,
        375366246,
        2157278981,
        2479649556,
        555357303,
        3870105701,
        2008414854,
        3344188149,
        4221384143,
        3956125452,
        2067696032,
        3594591187,
        2921233993,
        2428461,
        544322398,
        577241275,
        1471733935,
        610547355,
        4027169054,
        1432588573,
        1507829418,
        2025931657,
        3646575487,
        545086370,
        48609733,
        2200306550,
        1653985193,
        298326376,
        1316178497,
        3007786442,
        2064951626,
        458293330,
        2589141269,
        3591329599,
        3164325604,
        727753846,
        2179363840,
        146436021,
        1461446943,
        4069977195,
        705550613,
        3059967265,
        3887724982,
        4281599278,
        3313849956,
        1404054877,
        2845806497,
        146425753,
        1854211946,
        1266315497,
        3048417604,
        3681880366,
        3289982499,
        290971e4,
        1235738493,
        2632868024,
        2414719590,
        3970600049,
        1771706367,
        1449415276,
        3266420449,
        422970021,
        1963543593,
        2690192192,
        3826793022,
        1062508698,
        1531092325,
        1804592342,
        2583117782,
        2714934279,
        4024971509,
        1294809318,
        4028980673,
        1289560198,
        2221992742,
        1669523910,
        35572830,
        157838143,
        1052438473,
        1016535060,
        1802137761,
        1753167236,
        1386275462,
        3080475397,
        2857371447,
        1040679964,
        2145300060,
        2390574316,
        1461121720,
        2956646967,
        4031777805,
        4028374788,
        33600511,
        2920084762,
        1018524850,
        629373528,
        3691585981,
        3515945977,
        2091462646,
        2486323059,
        586499841,
        988145025,
        935516892,
        3367335476,
        2599673255,
        2839830854,
        265290510,
        3972581182,
        2759138881,
        3795373465,
        1005194799,
        847297441,
        406762289,
        1314163512,
        1332590856,
        1866599683,
        4127851711,
        750260880,
        613907577,
        1450815602,
        3165620655,
        3734664991,
        3650291728,
        3012275730,
        3704569646,
        1427272223,
        778793252,
        1343938022,
        2676280711,
        2052605720,
        1946737175,
        3164576444,
        3914038668,
        3967478842,
        3682934266,
        1661551462,
        3294938066,
        4011595847,
        840292616,
        3712170807,
        616741398,
        312560963,
        711312465,
        1351876610,
        322626781,
        1910503582,
        271666773,
        2175563734,
        1594956187,
        70604529,
        3617834859,
        1007753275,
        1495573769,
        4069517037,
        2549218298,
        2663038764,
        504708206,
        2263041392,
        3941167025,
        2249088522,
        1514023603,
        1998579484,
        1312622330,
        694541497,
        2582060303,
        2151582166,
        1382467621,
        776784248,
        2618340202,
        3323268794,
        2497899128,
        2784771155,
        503983604,
        4076293799,
        907881277,
        423175695,
        432175456,
        1378068232,
        4145222326,
        3954048622,
        3938656102,
        3820766613,
        2793130115,
        2977904593,
        26017576,
        3274890735,
        3194772133,
        1700274565,
        1756076034,
        4006520079,
        3677328699,
        720338349,
        1533947780,
        354530856,
        688349552,
        3973924725,
        1637815568,
        332179504,
        3949051286,
        53804574,
        2852348879,
        3044236432,
        1282449977,
        3583942155,
        3416972820,
        4006381244,
        1617046695,
        2628476075,
        3002303598,
        1686838959,
        431878346,
        2686675385,
        1700445008,
        1080580658,
        1009431731,
        832498133,
        3223435511,
        2605976345,
        2271191193,
        2516031870,
        1648197032,
        4164389018,
        2548247927,
        300782431,
        375919233,
        238389289,
        3353747414,
        2531188641,
        2019080857,
        1475708069,
        455242339,
        2609103871,
        448939670,
        3451063019,
        1395535956,
        2413381860,
        1841049896,
        1491858159,
        885456874,
        4264095073,
        4001119347,
        1565136089,
        3898914787,
        1108368660,
        540939232,
        1173283510,
        2745871338,
        3681308437,
        4207628240,
        3343053890,
        4016749493,
        1699691293,
        1103962373,
        3625875870,
        2256883143,
        3830138730,
        1031889488,
        3479347698,
        1535977030,
        4236805024,
        3251091107,
        2132092099,
        1774941330,
        1199868427,
        1452454533,
        157007616,
        2904115357,
        342012276,
        595725824,
        1480756522,
        206960106,
        497939518,
        591360097,
        863170706,
        2375253569,
        3596610801,
        1814182875,
        2094937945,
        3421402208,
        1082520231,
        3463918190,
        2785509508,
        435703966,
        3908032597,
        1641649973,
        2842273706,
        3305899714,
        1510255612,
        2148256476,
        2655287854,
        3276092548,
        4258621189,
        236887753,
        3681803219,
        274041037,
        1734335097,
        3815195456,
        3317970021,
        1899903192,
        1026095262,
        4050517792,
        356393447,
        2410691914,
        3873677099,
        3682840055,
        3913112168,
        2491498743,
        4132185628,
        2489919796,
        1091903735,
        1979897079,
        3170134830,
        3567386728,
        3557303409,
        857797738,
        1136121015,
        1342202287,
        507115054,
        2535736646,
        337727348,
        3213592640,
        1301675037,
        2528481711,
        1895095763,
        1721773893,
        3216771564,
        62756741,
        2142006736,
        835421444,
        2531993523,
        1442658625,
        3659876326,
        2882144922,
        676362277,
        1392781812,
        170690266,
        3921047035,
        1759253602,
        3611846912,
        1745797284,
        664899054,
        1329594018,
        3901205900,
        3045908486,
        2062866102,
        2865634940,
        3543621612,
        3464012697,
        1080764994,
        553557557,
        3656615353,
        3996768171,
        991055499,
        499776247,
        1265440854,
        648242737,
        3940784050,
        980351604,
        3713745714,
        1749149687,
        3396870395,
        4211799374,
        3640570775,
        1161844396,
        3125318951,
        1431517754,
        545492359,
        4268468663,
        3499529547,
        1437099964,
        2702547544,
        3433638243,
        2581715763,
        2787789398,
        1060185593,
        1593081372,
        2418618748,
        4260947970,
        69676912,
        2159744348,
        86519011,
        2512459080,
        3838209314,
        1220612927,
        3339683548,
        133810670,
        1090789135,
        1078426020,
        1569222167,
        845107691,
        3583754449,
        4072456591,
        1091646820,
        628848692,
        1613405280,
        3757631651,
        526609435,
        236106946,
        48312990,
        2942717905,
        3402727701,
        1797494240,
        859738849,
        992217954,
        4005476642,
        2243076622,
        3870952857,
        3732016268,
        765654824,
        3490871365,
        2511836413,
        1685915746,
        3888969200,
        1414112111,
        2273134842,
        3281911079,
        4080962846,
        172450625,
        2569994100,
        980381355,
        4109958455,
        2819808352,
        2716589560,
        2568741196,
        3681446669,
        3329971472,
        1835478071,
        660984891,
        3704678404,
        4045999559,
        3422617507,
        3040415634,
        1762651403,
        1719377915,
        3470491036,
        2693910283,
        3642056355,
        3138596744,
        1364962596,
        2073328063,
        1983633131,
        926494387,
        3423689081,
        2150032023,
        4096667949,
        1749200295,
        3328846651,
        309677260,
        2016342300,
        1779581495,
        3079819751,
        111262694,
        1274766160,
        443224088,
        298511866,
        1025883608,
        3806446537,
        1145181785,
        168956806,
        3641502830,
        3584813610,
        1689216846,
        3666258015,
        3200248200,
        1692713982,
        2646376535,
        4042768518,
        1618508792,
        1610833997,
        3523052358,
        4130873264,
        2001055236,
        3610705100,
        2202168115,
        4028541809,
        2961195399,
        1006657119,
        2006996926,
        3186142756,
        1430667929,
        3210227297,
        1314452623,
        4074634658,
        4101304120,
        2273951170,
        1399257539,
        3367210612,
        3027628629,
        1190975929,
        2062231137,
        2333990788,
        2221543033,
        2438960610,
        1181637006,
        548689776,
        2362791313,
        3372408396,
        3104550113,
        3145860560,
        296247880,
        1970579870,
        3078560182,
        3769228297,
        1714227617,
        3291629107,
        3898220290,
        166772364,
        1251581989,
        493813264,
        448347421,
        195405023,
        2709975567,
        677966185,
        3703036547,
        1463355134,
        2715995803,
        1338867538,
        1343315457,
        2802222074,
        2684532164,
        233230375,
        2599980071,
        2000651841,
        3277868038,
        1638401717,
        4028070440,
        3237316320,
        6314154,
        819756386,
        300326615,
        590932579,
        1405279636,
        3267499572,
        3150704214,
        2428286686,
        3959192993,
        3461946742,
        1862657033,
        1266418056,
        963775037,
        2089974820,
        2263052895,
        1917689273,
        448879540,
        3550394620,
        3981727096,
        150775221,
        3627908307,
        1303187396,
        508620638,
        2975983352,
        2726630617,
        1817252668,
        1876281319,
        1457606340,
        908771278,
        3720792119,
        3617206836,
        2455994898,
        1729034894,
        1080033504,
        976866871,
        3556439503,
        2881648439,
        1522871579,
        1555064734,
        1336096578,
        3548522304,
        2579274686,
        3574697629,
        3205460757,
        3593280638,
        3338716283,
        3079412587,
        564236357,
        2993598910,
        1781952180,
        1464380207,
        3163844217,
        3332601554,
        1699332808,
        1393555694,
        1183702653,
        3581086237,
        1288719814,
        691649499,
        2847557200,
        2895455976,
        3193889540,
        2717570544,
        1781354906,
        1676643554,
        2592534050,
        3230253752,
        1126444790,
        2770207658,
        2633158820,
        2210423226,
        2615765581,
        2414155088,
        3127139286,
        673620729,
        2805611233,
        1269405062,
        4015350505,
        3341807571,
        4149409754,
        1057255273,
        2012875353,
        2162469141,
        2276492801,
        2601117357,
        993977747,
        3918593370,
        2654263191,
        753973209,
        36408145,
        2530585658,
        25011837,
        3520020182,
        2088578344,
        530523599,
        2918365339,
        1524020338,
        1518925132,
        3760827505,
        3759777254,
        1202760957,
        3985898139,
        3906192525,
        674977740,
        4174734889,
        2031300136,
        2019492241,
        3983892565,
        4153806404,
        3822280332,
        352677332,
        2297720250,
        60907813,
        90501309,
        3286998549,
        1016092578,
        2535922412,
        2839152426,
        457141659,
        509813237,
        4120667899,
        652014361,
        1966332200,
        2975202805,
        55981186,
        2327461051,
        676427537,
        3255491064,
        2882294119,
        3433927263,
        1307055953,
        942726286,
        933058658,
        2468411793,
        3933900994,
        4215176142,
        1361170020,
        2001714738,
        2830558078,
        3274259782,
        1222529897,
        1679025792,
        2729314320,
        3714953764,
        1770335741,
        151462246,
        3013232138,
        1682292957,
        1483529935,
        471910574,
        1539241949,
        458788160,
        3436315007,
        1807016891,
        3718408830,
        978976581,
        1043663428,
        3165965781,
        1927990952,
        4200891579,
        2372276910,
        3208408903,
        3533431907,
        1412390302,
        2931980059,
        4132332400,
        1947078029,
        3881505623,
        4168226417,
        2941484381,
        1077988104,
        1320477388,
        886195818,
        18198404,
        3786409e3,
        2509781533,
        112762804,
        3463356488,
        1866414978,
        891333506,
        18488651,
        661792760,
        1628790961,
        3885187036,
        3141171499,
        876946877,
        2693282273,
        1372485963,
        791857591,
        2686433993,
        3759982718,
        3167212022,
        3472953795,
        2716379847,
        445679433,
        3561995674,
        3504004811,
        3574258232,
        54117162,
        3331405415,
        2381918588,
        3769707343,
        4154350007,
        1140177722,
        4074052095,
        668550556,
        3214352940,
        367459370,
        261225585,
        2610173221,
        4209349473,
        3468074219,
        3265815641,
        314222801,
        3066103646,
        3808782860,
        282218597,
        3406013506,
        3773591054,
        379116347,
        1285071038,
        846784868,
        2669647154,
        3771962079,
        3550491691,
        2305946142,
        453669953,
        1268987020,
        3317592352,
        3279303384,
        3744833421,
        2610507566,
        3859509063,
        266596637,
        3847019092,
        517658769,
        3462560207,
        3443424879,
        370717030,
        4247526661,
        2224018117,
        4143653529,
        4112773975,
        2788324899,
        2477274417,
        1456262402,
        2901442914,
        1517677493,
        1846949527,
        2295493580,
        3734397586,
        2176403920,
        1280348187,
        1908823572,
        3871786941,
        846861322,
        1172426758,
        3287448474,
        3383383037,
        1655181056,
        3139813346,
        901632758,
        1897031941,
        2986607138,
        3066810236,
        3447102507,
        1393639104,
        373351379,
        950779232,
        625454576,
        3124240540,
        4148612726,
        2007998917,
        544563296,
        2244738638,
        2330496472,
        2058025392,
        1291430526,
        424198748,
        50039436,
        29584100,
        3605783033,
        2429876329,
        2791104160,
        1057563949,
        3255363231,
        3075367218,
        3463963227,
        1469046755,
        985887462
      ];
      var C_ORIG = [
        1332899944,
        1700884034,
        1701343084,
        1684370003,
        1668446532,
        1869963892
      ];
      function _encipher(lr, off2, P, S) {
        var n, l = lr[off2], r = lr[off2 + 1];
        l ^= P[0];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[1];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[2];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[3];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[4];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[5];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[6];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[7];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[8];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[9];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[10];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[11];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[12];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[13];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[14];
        n = S[l >>> 24];
        n += S[256 | l >> 16 & 255];
        n ^= S[512 | l >> 8 & 255];
        n += S[768 | l & 255];
        r ^= n ^ P[15];
        n = S[r >>> 24];
        n += S[256 | r >> 16 & 255];
        n ^= S[512 | r >> 8 & 255];
        n += S[768 | r & 255];
        l ^= n ^ P[16];
        lr[off2] = r ^ P[BLOWFISH_NUM_ROUNDS + 1];
        lr[off2 + 1] = l;
        return lr;
      }
      __name(_encipher, "_encipher");
      function _streamtoword(data, offp) {
        for (var i = 0, word = 0; i < 4; ++i)
          word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
        return { key: word, offp };
      }
      __name(_streamtoword, "_streamtoword");
      function _key(key, P, S) {
        var offset = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offset), offset = sw.offp, P[i] = P[i] ^ sw.key;
        for (i = 0; i < plen; i += 2)
          lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_key, "_key");
      function _ekskey(data, key, P, S) {
        var offp = 0, lr = [0, 0], plen = P.length, slen = S.length, sw;
        for (var i = 0; i < plen; i++)
          sw = _streamtoword(key, offp), offp = sw.offp, P[i] = P[i] ^ sw.key;
        offp = 0;
        for (i = 0; i < plen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), P[i] = lr[0], P[i + 1] = lr[1];
        for (i = 0; i < slen; i += 2)
          sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P, S), S[i] = lr[0], S[i + 1] = lr[1];
      }
      __name(_ekskey, "_ekskey");
      function _crypt(b, salt, rounds, callback, progressCallback) {
        var cdata = C_ORIG.slice(), clen = cdata.length, err;
        if (rounds < 4 || rounds > 31) {
          err = Error("Illegal number of rounds (4-31): " + rounds);
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.length !== BCRYPT_SALT_LEN) {
          err = Error("Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN);
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        rounds = 1 << rounds >>> 0;
        var P, S, i = 0, j;
        if (Int32Array) {
          P = new Int32Array(P_ORIG);
          S = new Int32Array(S_ORIG);
        } else {
          P = P_ORIG.slice();
          S = S_ORIG.slice();
        }
        _ekskey(salt, b, P, S);
        function next() {
          if (progressCallback)
            progressCallback(i / rounds);
          if (i < rounds) {
            var start = Date.now();
            for (; i < rounds; ) {
              i = i + 1;
              _key(b, P, S);
              _key(salt, P, S);
              if (Date.now() - start > MAX_EXECUTION_TIME)
                break;
            }
          } else {
            for (i = 0; i < 64; i++)
              for (j = 0; j < clen >> 1; j++)
                _encipher(cdata, j << 1, P, S);
            var ret = [];
            for (i = 0; i < clen; i++)
              ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
            if (callback) {
              callback(null, ret);
              return;
            } else
              return ret;
          }
          if (callback)
            nextTick2(next);
        }
        __name(next, "next");
        if (typeof callback !== "undefined") {
          next();
        } else {
          var res;
          while (true)
            if (typeof (res = next()) !== "undefined")
              return res || [];
        }
      }
      __name(_crypt, "_crypt");
      function _hash(s, salt, callback, progressCallback) {
        var err;
        if (typeof s !== "string" || typeof salt !== "string") {
          err = Error("Invalid string / salt: Not a string");
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var minor, offset;
        if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
          err = Error("Invalid salt version: " + salt.substring(0, 2));
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        if (salt.charAt(2) === "$")
          minor = String.fromCharCode(0), offset = 3;
        else {
          minor = salt.charAt(2);
          if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
            err = Error("Invalid salt revision: " + salt.substring(2, 4));
            if (callback) {
              nextTick2(callback.bind(this, err));
              return;
            } else
              throw err;
          }
          offset = 4;
        }
        if (salt.charAt(offset + 2) > "$") {
          err = Error("Missing salt rounds");
          if (callback) {
            nextTick2(callback.bind(this, err));
            return;
          } else
            throw err;
        }
        var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r2 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r2, real_salt = salt.substring(offset + 3, offset + 25);
        s += minor >= "a" ? "\0" : "";
        var passwordb = stringToBytes(s), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
        function finish(bytes) {
          var res = [];
          res.push("$2");
          if (minor >= "a")
            res.push(minor);
          res.push("$");
          if (rounds < 10)
            res.push("0");
          res.push(rounds.toString());
          res.push("$");
          res.push(base64_encode(saltb, saltb.length));
          res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
          return res.join("");
        }
        __name(finish, "finish");
        if (typeof callback == "undefined")
          return finish(_crypt(passwordb, saltb, rounds));
        else {
          _crypt(passwordb, saltb, rounds, function(err2, bytes) {
            if (err2)
              callback(err2, null);
            else
              callback(null, finish(bytes));
          }, progressCallback);
        }
      }
      __name(_hash, "_hash");
      bcrypt4.encodeBase64 = base64_encode;
      bcrypt4.decodeBase64 = base64_decode;
      return bcrypt4;
    });
  }
});

// worker/src/db.js
async function one(db, sql, ...params) {
  return db.prepare(sql).bind(...params).first();
}
async function all(db, sql, ...params) {
  const result = await db.prepare(sql).bind(...params).all();
  return result.results || [];
}
async function run(db, sql, ...params) {
  return db.prepare(sql).bind(...params).run();
}
var init_db = __esm({
  "worker/src/db.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    __name(one, "one");
    __name(all, "all");
    __name(run, "run");
  }
});

// worker/src/utils/systemTime.js
var systemTime_exports = {};
__export(systemTime_exports, {
  getSystemTime: () => getSystemTime,
  getSystemTimeISO: () => getSystemTimeISO,
  loadSystemTimeOffset: () => loadSystemTimeOffset,
  resetSystemTimeOffset: () => resetSystemTimeOffset,
  setSystemTimeFromDate: () => setSystemTimeFromDate
});
async function loadSystemTimeOffset(db) {
  const row = await one(db, "SELECT value FROM site_settings WHERE key = 'system_time_offset_ms'");
  offsetMs = row ? parseInt(row.value, 10) || 0 : 0;
}
function getSystemTime() {
  return new Date(Date.now() + offsetMs);
}
function getSystemTimeISO() {
  return getSystemTime().toISOString();
}
async function setSystemTimeFromDate(db, targetDate) {
  const target = targetDate instanceof Date ? targetDate : new Date(targetDate);
  if (isNaN(target.getTime())) throw new Error("\u65E0\u6548\u7684\u7CFB\u7EDF\u65F6\u95F4");
  offsetMs = target.getTime() - Date.now();
  await db.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).bind(String(offsetMs)).run();
  return getSystemTimeISO();
}
async function resetSystemTimeOffset(db) {
  offsetMs = 0;
  await db.prepare(`
    INSERT INTO site_settings (key, value) VALUES ('system_time_offset_ms', '0')
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run();
}
var offsetMs;
var init_systemTime = __esm({
  "worker/src/utils/systemTime.js"() {
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
    init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
    init_performance2();
    init_db();
    offsetMs = 0;
    __name(loadSystemTimeOffset, "loadSystemTimeOffset");
    __name(getSystemTime, "getSystemTime");
    __name(getSystemTimeISO, "getSystemTimeISO");
    __name(setSystemTimeFromDate, "setSystemTimeFromDate");
    __name(resetSystemTimeOffset, "resetSystemTimeOffset");
  }
});

// worker/src/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/hono.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/hono-base.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/compose.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context2, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context2.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context2, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context2.error = err;
            res = await onError(err, context2);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context2.finalized === false && onNotFound) {
          res = await onNotFound(context2);
        }
      }
      if (res && (context2.finalized === false || isError)) {
        context2.res = res;
      }
      return context2;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// worker/node_modules/hono/dist/context.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/request.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/http-exception.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/request/constants.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// worker/node_modules/hono/dist/utils/body.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/utils/buffer.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/utils/crypto.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/utils/buffer.js
var bufferToFormData = /* @__PURE__ */ __name((arrayBuffer, contentType) => {
  const response = new Response(arrayBuffer, {
    headers: {
      // Normalize the media type (case-insensitive) while keeping parameters like the boundary
      "Content-Type": contentType.replace(/^[^;]+/, (mediaType) => mediaType.toLowerCase())
    }
  });
  return response.formData();
}, "bufferToFormData");

// worker/node_modules/hono/dist/utils/body.js
var MAX_NESTING_DEPTH = 32;
var MAX_NESTED_OBJECTS = 1e4;
var isRawRequest = /* @__PURE__ */ __name((request) => "headers" in request, "isRawRequest");
var parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all: all2 = false, dot = false } = options;
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const contentType = headers.get("Content-Type");
  const mediaType = contentType?.split(";")[0].trim().toLowerCase();
  if (mediaType === "multipart/form-data" || mediaType === "application/x-www-form-urlencoded") {
    return parseFormData(request, { all: all2, dot });
  }
  return {};
}, "parseBody");
async function parseFormData(request, options) {
  if (!isRawRequest(request) && request.bodyCache.formData) {
    return convertFormDataToBodyData(
      await request.bodyCache.formData,
      options
    );
  }
  const headers = isRawRequest(request) ? request.headers : request.raw.headers;
  const arrayBuffer = await request.arrayBuffer();
  const formDataPromise = bufferToFormData(arrayBuffer, headers.get("Content-Type") || "");
  if (!isRawRequest(request)) {
    request.bodyCache.formData = formDataPromise;
  }
  const formData = await formDataPromise;
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
__name(parseFormData, "parseFormData");
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  const nestingState = { count: 0 };
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value, nestingState);
        delete form[key];
      }
    });
  }
  return form;
}
__name(convertFormDataToBodyData, "convertFormDataToBodyData");
var handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
}, "handleParsingAllValues");
var handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value, state) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".", MAX_NESTING_DEPTH + 2);
  if (keys.length > MAX_NESTING_DEPTH + 1) {
    throwNestingLimitExceeded();
  }
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        if (state.count++ >= MAX_NESTED_OBJECTS) {
          throwNestingLimitExceeded();
        }
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
}, "handleParsingNestedValues");
var throwNestingLimitExceeded = /* @__PURE__ */ __name(() => {
  throw new Error("Nesting limit exceeded");
}, "throwNestingLimitExceeded");

// worker/node_modules/hono/dist/utils/url.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var splitPath = /* @__PURE__ */ __name((path) => {
  const paths = path.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
}, "splitPath");
var splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
  const { groups, path } = extractGroupsFromPath(routePath);
  const paths = splitPath(path);
  return replaceGroupMarks(paths, groups);
}, "splitRoutingPath");
var extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
  const groups = [];
  path = path.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path };
}, "extractGroupsFromPath");
var replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
}, "replaceGroupMarks");
var patternCache = {};
var getPattern = /* @__PURE__ */ __name((label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
}, "getPattern");
var tryDecode = /* @__PURE__ */ __name((str, decoder2) => {
  try {
    return decoder2(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder2(match2);
      } catch {
        return match2;
      }
    });
  }
}, "tryDecode");
var tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
var getPath = /* @__PURE__ */ __name((request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path = url.slice(start, end);
      return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
}, "getPath");
var getPathNoStrict = /* @__PURE__ */ __name((request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
}, "getPathNoStrict");
var mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
}, "mergePath");
var checkOptionalParameter = /* @__PURE__ */ __name((path) => {
  if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
    return null;
  }
  const segments = path.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (segment.charCodeAt(segment.length - 1) === 63) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.slice(0, -1);
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
}, "checkOptionalParameter");
var tryDecodeURIComponent = /* @__PURE__ */ __name((str) => str.indexOf("%") !== -1 ? tryDecode(str, decodeURIComponent_) : str, "tryDecodeURIComponent");
var _decodeURI = /* @__PURE__ */ __name((value) => {
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return tryDecodeURIComponent(value);
}, "_decodeURI");
var _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
  const hashIndex = url.indexOf("#", 8);
  if (hashIndex !== -1) {
    url = url.slice(0, hashIndex);
  }
  let encoded;
  if (!multiple && key && key.indexOf("%") === -1 && key.indexOf("+") === -1) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = /* @__PURE__ */ Object.create(null);
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
}, "_getQueryParam");
var getQueryParam = _getQueryParam;
var getQueryParams = /* @__PURE__ */ __name((url, key) => {
  return _getQueryParam(url, key, true);
}, "getQueryParams");
var decodeURIComponent_ = decodeURIComponent;

// worker/node_modules/hono/dist/request.js
var HonoRequest = class {
  static {
    __name(this, "HonoRequest");
  }
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path;
    this.#matchResult = matchResult;
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex]?.[1][key];
    const param = this.#getParamValue(paramKey);
    return param && tryDecodeURIComponent(param);
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex]?.[1] ?? {});
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = tryDecodeURIComponent(value);
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = /* @__PURE__ */ Object.create(null);
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = /* @__PURE__ */ __name((key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    for (const anyCachedKey in bodyCache) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        const contentType = anyCachedKey === "formData" ? void 0 : raw2.headers.get("content-type");
        return new Response(body, {
          headers: contentType ? { "Content-Type": contentType } : void 0
        })[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  }, "#cachedBody");
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text) => JSON.parse(text));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    ;
    (this.#validatedData ??= {})[target] = data;
  }
  valid(target) {
    return this.#validatedData?.[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// worker/node_modules/hono/dist/utils/html.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = /* @__PURE__ */ __name((value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
}, "raw");
var resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context2, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context: context2 }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context2, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
}, "resolveCallback");

// worker/node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
}, "setDefaultContentType");
var createResponseInstance = /* @__PURE__ */ __name((body, init) => new Response(body, init), "createResponseInstance");
var Context = class {
  static {
    __name(this, "Context");
  }
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie of cookies) {
            _res.headers.append("set-cookie", cookie);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = /* @__PURE__ */ __name((...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  }, "render");
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = /* @__PURE__ */ __name((layout) => this.#layout = layout, "setLayout");
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = /* @__PURE__ */ __name(() => this.#layout, "getLayout");
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = /* @__PURE__ */ __name((renderer) => {
    this.#renderer = renderer;
  }, "setRenderer");
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   // Append multiple headers using the append option (e.g. Vary)
   *   c.header('Vary', 'Accept-Encoding', { append: true })
   *   c.header('Vary', 'User-Agent', { append: true })
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = /* @__PURE__ */ __name((name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  }, "header");
  status = /* @__PURE__ */ __name((status) => {
    this.#status = status;
  }, "status");
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = /* @__PURE__ */ __name((key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  }, "set");
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = /* @__PURE__ */ __name((key) => {
    return this.#var ? this.#var.get(key) : void 0;
  }, "get");
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    let responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders;
    if (typeof arg === "object" && arg.headers) {
      responseHeaders ??= new Headers();
      for (const [key, value] of new Headers(arg.headers)) {
        if (key === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      if (!responseHeaders) {
        let count3 = 0;
        for (const k in headers) {
          if (++count3 > 1 || typeof headers[k] !== "string") {
            responseHeaders = new Headers();
            break;
          }
        }
      }
      if (responseHeaders) {
        for (const k in headers) {
          const v = headers[k];
          if (typeof v === "string") {
            responseHeaders.set(k, v);
          } else {
            responseHeaders.delete(k);
            for (const v2 of v) {
              responseHeaders.append(k, v2);
            }
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, {
      status,
      headers: responseHeaders ?? headers
    });
  }
  newResponse = /* @__PURE__ */ __name((...args) => this.#newResponse(...args), "newResponse");
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = /* @__PURE__ */ __name((data, arg, headers) => this.#newResponse(data, arg, headers), "body");
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = /* @__PURE__ */ __name((text, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
      text,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  }, "text");
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = /* @__PURE__ */ __name((object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  }, "json");
  html = /* @__PURE__ */ __name((html, arg, headers) => {
    const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  }, "html");
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = /* @__PURE__ */ __name((location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibytes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  }, "redirect");
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name(() => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  }, "notFound");
};

// worker/node_modules/hono/dist/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch", "query"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
  static {
    __name(this, "UnsupportedPathError");
  }
};

// worker/node_modules/hono/dist/utils/constants.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// worker/node_modules/hono/dist/hono-base.js
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = class _Hono {
  static {
    __name(this, "_Hono");
  }
  get;
  post;
  put;
  delete;
  options;
  patch;
  query;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        const methodName = method.toUpperCase();
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(methodName, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(methodName, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          const methodName = m.toUpperCase();
          for (const handler of handlers) {
            this.#addRoute(methodName, this.#path, handler);
          }
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = /* @__PURE__ */ __name((handler) => {
    this.errorHandler = handler;
    return this;
  }, "onError");
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = /* @__PURE__ */ __name((handler) => {
    this.#notFoundHandler = handler;
    return this;
  }, "notFound");
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler, baseRoutePath) {
    path = mergePath(this._basePath, path);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path,
      method,
      handler
    };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context2 = await composed(c);
        if (!context2.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context2.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} env - env Object
   * @param {ExecutionContext} executionCtx - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = /* @__PURE__ */ __name((request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  }, "fetch");
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = /* @__PURE__ */ __name((input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  }, "request");
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = /* @__PURE__ */ __name(() => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  }, "fire");
};

// worker/node_modules/hono/dist/router/reg-exp-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/reg-exp-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/utils.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var createNullObject = /* @__PURE__ */ __name(() => /* @__PURE__ */ Object.create(null), "createNullObject");

// worker/node_modules/hono/dist/router/reg-exp-router/matcher.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name(((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }), "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// worker/node_modules/hono/dist/router/reg-exp-router/node.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return b === TAIL_WILDCARD_REG_EXP_STR ? -1 : 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = class _Node {
  static {
    __name(this, "_Node");
  }
  // handler index of a dynamic path, or -1 for a static path terminal
  #index;
  #varIndex;
  #children = createNullObject();
  insert(tokens, index, paramMap, context2, isStatic) {
    let node = this;
    for (let i = 0, len = tokens.length; i < len; i++) {
      const token = tokens[i];
      const pattern = token.length === 1 ? token === "*" ? i === len - 1 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : null : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      let nextNode;
      if (pattern) {
        const name = pattern[1];
        let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
        if (name && pattern[2]) {
          if (regexpStr === ".*") {
            throw PATH_ERROR;
          }
          regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
          if (/\((?!\?:)/.test(regexpStr)) {
            throw PATH_ERROR;
          }
          if (regexpStr.length === 1 && regExpMetaChars.has(regexpStr)) {
            throw PATH_ERROR;
          }
        }
        nextNode = node.#children[regexpStr];
        if (!nextNode) {
          if (regexpStr !== ONLY_WILDCARD_REG_EXP_STR && regexpStr !== TAIL_WILDCARD_REG_EXP_STR) {
            for (const k in node.#children) {
              if (
                // a single-char pattern coexists with single-char literals as a literal does
                (regexpStr.length > 1 || k.length > 1) && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
              ) {
                throw PATH_ERROR;
              }
            }
          }
          nextNode = node.#children[regexpStr] = new _Node();
        }
        if (name !== "") {
          nextNode.#varIndex ??= context2.varIndex++;
          paramMap.push([name, nextNode.#varIndex]);
        }
      } else {
        nextNode = node.#children[token];
        if (!nextNode) {
          for (const k in node.#children) {
            if (k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR) {
              throw PATH_ERROR;
            }
          }
          nextNode = node.#children[token] = new _Node();
        }
      }
      node = nextNode;
    }
    if (node.#index !== void 0) {
      throw PATH_ERROR;
    }
    node.#index = isStatic ? -1 : index;
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      const childStr = c.buildRegExpStr();
      return childStr === "" ? "" : (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + childStr;
    }).filter(Boolean);
    if (typeof this.#index === "number" && this.#index !== -1) {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// worker/node_modules/hono/dist/router/reg-exp-router/trie.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var Trie = class {
  static {
    __name(this, "Trie");
  }
  #context = { varIndex: 0 };
  #root = new Node();
  #index = 0;
  // dynamic path -> [handler index, param assoc]; static paths are not registered
  paths = createNullObject();
  insert(path, isStatic) {
    if (isStatic) {
      this.#root.insert(path.split(""), 0, [], this.#context, true);
      return;
    }
    const paramAssoc = [];
    const groups = [];
    let markedPath = path;
    for (let i = 0; ; ) {
      let replaced = false;
      markedPath = markedPath.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = markedPath.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, this.#index, paramAssoc, this.#context, false);
    this.paths[path] = [this.#index++, paramAssoc];
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// worker/node_modules/hono/dist/router/reg-exp-router/router.js
var wildcardRegExpCache = createNullObject();
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    `^${path.replace(
      /\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,
      (match2, metaChar) => metaChar ? `\\${metaChar}` : match2 === "/*" ? TAIL_WILDCARD_REG_EXP_STR : match2 === "*" ? ONLY_WILDCARD_REG_EXP_STR : `/:${LABEL_REG_EXP_STR}`
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function findMiddleware(middleware, path) {
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = class {
  static {
    __name(this, "RegExpRouter");
  }
  name = "RegExpRouter";
  #middleware;
  #routes;
  #tries;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: createNullObject() };
    this.#routes = { [METHOD_NAME_ALL]: createNullObject() };
    this.#tries = { [METHOD_NAME_ALL]: new Trie() };
  }
  #insertPath(method, path) {
    try {
      this.#tries[method].insert(path, !/\*|\/:/.test(path));
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      this.#tries[method] = new Trie();
      for (const handlerMap of [middleware, routes]) {
        handlerMap[method] = createNullObject();
        for (const p in handlerMap[METHOD_NAME_ALL]) {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
          this.#insertPath(method, p);
        }
      }
    }
    if (path === "/*") {
      path = "*";
    }
    const methods = method === METHOD_NAME_ALL ? Object.keys(middleware) : [method];
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      for (const m of methods) {
        if (!middleware[m][path]) {
          this.#insertPath(m, path);
          middleware[m][path] = findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        }
      }
      for (const handlerMap of [middleware, routes]) {
        for (const m of methods) {
          for (const p in handlerMap[m]) {
            re.test(p) && handlerMap[m][p].push([handler, path]);
          }
        }
      }
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (const path2 of paths) {
      for (const m of methods) {
        if (!routes[m][path2]) {
          this.#insertPath(m, path2);
          routes[m][path2] = findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        }
        routes[m][path2].push([handler, path2]);
      }
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = createNullObject();
    for (const method of Object.keys(this.#routes)) {
      matchers[method] = this.#buildMatcher(method);
    }
    this.#middleware = this.#routes = this.#tries = void 0;
    wildcardRegExpCache = createNullObject();
    return matchers;
  }
  #buildMatcher(method) {
    const middleware = this.#middleware[method];
    const routes = this.#routes[method];
    const trie = this.#tries[method];
    const staticMap = createNullObject();
    const handlerData = [];
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for (const r of [middleware, routes]) {
      for (const path in r) {
        const handlers = r[path];
        const pathData = trie.paths[path];
        if (!pathData) {
          staticMap[path] = [handlers.map(([h]) => [h, createNullObject()]), emptyParam];
          continue;
        }
        handlerData[pathData[0]] = handlers.map(([h, handlerPath]) => [
          h,
          trie.paths[handlerPath][1].reduceRight((map, [key], i) => {
            map[key] = paramReplacementMap[pathData[1][i][1]];
            return map;
          }, createNullObject())
        ]);
      }
    }
    return [regexp, indexReplacementMap.map((i) => handlerData[i]), staticMap];
  }
};

// worker/node_modules/hono/dist/router/reg-exp-router/prepared-router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/smart-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/smart-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var SmartRouter = class {
  static {
    __name(this, "SmartRouter");
  }
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// worker/node_modules/hono/dist/router/trie-router/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/trie-router/router.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/hono/dist/router/trie-router/node.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var emptyParams = createNullObject();
var order = 0;
var Node2 = class _Node2 {
  static {
    __name(this, "_Node");
  }
  #methods = [];
  #children = createNullObject();
  #patterns = [];
  #pattern;
  #params = emptyParams;
  insert(method, path, handler) {
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = /* @__PURE__ */ new Set();
    let i = 0;
    for (const p of parts) {
      const nextP = parts[++i];
      const pattern = getPattern(p, nextP) || (nextP === void 0 && p && p.indexOf("*") === p.length - 1 ? p : null);
      const isParam = Array.isArray(pattern);
      const key = isParam ? pattern[0] : pattern || p;
      const child = curNode.#children[key] ||= new _Node2();
      if (pattern && !child.#pattern) {
        child.#pattern = pattern;
        curNode.#patterns.push(child);
      }
      curNode = child;
      if (isParam) {
        possibleKeys.add(pattern[1]);
      }
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: [...possibleKeys],
        score: ++order
      }
    });
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      if (handlerSet) {
        handlerSet.params = createNullObject();
        handlerSets.push(handlerSet);
        for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
          const key = handlerSet.possibleKeys[i2];
          handlerSet.params[key] = params?.[key] && !i2 ? params[key] : nodeParams[key] ?? params?.[key];
        }
      }
    }
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (const child of node.#patterns) {
          const pattern = child.#pattern;
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (typeof pattern === "string") {
            if (pattern === "*" || part.startsWith(pattern.slice(0, -1))) {
              this.#pushHandlerSets(handlerSets, child, method, node.#params);
              if (pattern === "*") {
                child.#params = params;
                tempNodes.push(child);
              }
            }
            continue;
          }
          const [, name, matcher] = pattern;
          if (!part && matcher === true) {
            continue;
          }
          if (matcher !== true) {
            if (!partOffsets) {
              partOffsets = [];
              let offset = path[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path.slice(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (m[0].length === restPathString.length && child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  node.#params,
                  params
                );
              }
              for (const _ in child.#children) {
                child.#params = params;
                const componentCount = m[0].match(/\//g)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
                break;
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets[1]) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// worker/node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  static {
    __name(this, "TrieRouter");
  }
  name = "TrieRouter";
  #node = new Node2();
  add(method, path, handler) {
    for (const result of checkOptionalParameter(path) || [path]) {
      this.#node.insert(method, result, handler);
    }
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
};

// worker/node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  static {
    __name(this, "Hono");
  }
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// worker/node_modules/hono/dist/middleware/cors/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var cors = /* @__PURE__ */ __name((options) => {
  const opts = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "QUERY"],
    allowHeaders: [],
    exposeHeaders: [],
    ...options
  };
  const exposeHeadersStr = opts.exposeHeaders?.length ? opts.exposeHeaders.join(",") : void 0;
  const allowHeadersStr = opts.allowHeaders?.length ? opts.allowHeaders.join(",") : void 0;
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return async (origin, c) => (await optsAllowMethods(origin, c)).join(",");
    } else if (Array.isArray(optsAllowMethods)) {
      const methodsStr = optsAllowMethods.join(",");
      return () => methodsStr;
    } else {
      return () => "";
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (exposeHeadersStr) {
      set("Access-Control-Expose-Headers", exposeHeadersStr);
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        c.res.headers.append("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods) {
        set("Access-Control-Allow-Methods", allowMethods);
      }
      let headersStr = allowHeadersStr;
      if (!headersStr) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headersStr = requestHeaders.split(",").map((h) => h.trim()).join(",");
        }
      }
      if (headersStr) {
        set("Access-Control-Allow-Headers", headersStr);
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// worker/src/seed.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var import_bcryptjs = __toESM(require_bcrypt(), 1);
init_db();

// worker/src/utils/productCode.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var MAX_PRODUCT_CODE = 99999;
function formatProductCode(num) {
  return String(num).padStart(5, "0");
}
__name(formatProductCode, "formatProductCode");
async function collectUsedCodes(db) {
  const used = /* @__PURE__ */ new Set();
  const rows = await all(db, `
    SELECT product_code FROM products
    WHERE product_code IS NOT NULL AND product_code != ''
  `);
  for (const row of rows) {
    const n = parseInt(row.product_code, 10);
    if (Number.isFinite(n) && n >= 1 && n <= MAX_PRODUCT_CODE) used.add(n);
  }
  return used;
}
__name(collectUsedCodes, "collectUsedCodes");
async function allocateProductCode(db, usedSet = null) {
  const used = usedSet ?? await collectUsedCodes(db);
  for (let n = 1; n <= MAX_PRODUCT_CODE; n++) {
    if (!used.has(n)) {
      used.add(n);
      return formatProductCode(n);
    }
  }
  throw new Error("\u5546\u54C1\u7F16\u53F7\u5DF2\u7528\u5B8C\uFF0800001-99999\uFF09");
}
__name(allocateProductCode, "allocateProductCode");
function normalizeCustomProductCode(code) {
  if (code === void 0 || code === null) return "";
  const text = String(code).trim();
  if (!text) return "";
  if (!/^[A-Za-z0-9_-]{2,20}$/.test(text)) {
    throw new Error("\u81EA\u5B9A\u4E49\u7F16\u7801\u53EA\u80FD\u5305\u542B\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u6216\u77ED\u6A2A\u7EBF\uFF0C\u957F\u5EA6 2-20 \u4F4D");
  }
  return text.toUpperCase();
}
__name(normalizeCustomProductCode, "normalizeCustomProductCode");

// worker/src/utils/productSort.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var PRODUCT_LIST_ORDER = "sort_order DESC, id DESC";
async function nextProductSortOrder(db) {
  const row = await one(db, "SELECT COALESCE(MAX(sort_order), 0) AS m FROM products");
  return (row?.m ?? 0) + 1;
}
__name(nextProductSortOrder, "nextProductSortOrder");
async function moveProductSort(db, productId, direction) {
  const products2 = await all(db, `SELECT id, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}`);
  const idx = products2.findIndex((p) => p.id === productId);
  if (idx === -1) throw new Error("\u5546\u54C1\u4E0D\u5B58\u5728");
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= products2.length) {
    return { moved: false, message: direction === "up" ? "\u5DF2\u5728\u6700\u524D" : "\u5DF2\u5728\u6700\u540E" };
  }
  const current = products2[idx];
  const neighbor = products2[swapIdx];
  await db.batch([
    db.prepare("UPDATE products SET sort_order = ? WHERE id = ?").bind(neighbor.sort_order, current.id),
    db.prepare("UPDATE products SET sort_order = ? WHERE id = ?").bind(current.sort_order, neighbor.id)
  ]);
  return { moved: true, message: direction === "up" ? "\u5DF2\u4E0A\u79FB" : "\u5DF2\u4E0B\u79FB" };
}
__name(moveProductSort, "moveProductSort");
async function moveZeroStockToBottom(db) {
  const products2 = await all(db, `SELECT id, stock, sort_order FROM products ORDER BY ${PRODUCT_LIST_ORDER}`);
  if (products2.length === 0) return { moved: false, count: 0, message: "\u6682\u65E0\u5546\u54C1" };
  const inStock = products2.filter((p) => (p.stock ?? 0) > 0);
  const zeroStock = products2.filter((p) => (p.stock ?? 0) <= 0);
  if (zeroStock.length === 0) return { moved: false, count: 0, message: "\u6CA1\u6709\u5E93\u5B58\u4E3A 0 \u7684\u5546\u54C1" };
  const alreadyAtBottom = products2.slice(-zeroStock.length).every((p) => (p.stock ?? 0) <= 0) && products2.slice(0, inStock.length).every((p) => (p.stock ?? 0) > 0);
  if (alreadyAtBottom) {
    return { moved: false, count: zeroStock.length, message: "\u5E93\u5B58\u4E3A 0 \u7684\u5546\u54C1\u5DF2\u5728\u5E95\u5C42" };
  }
  const reordered = [...inStock, ...zeroStock];
  const stmts = [];
  let order2 = reordered.length;
  for (const row of reordered) {
    stmts.push(db.prepare("UPDATE products SET sort_order = ? WHERE id = ?").bind(order2, row.id));
    order2--;
  }
  await db.batch(stmts);
  return { moved: true, count: zeroStock.length, message: `\u5DF2\u5C06 ${zeroStock.length} \u4EF6\u5E93\u5B58\u4E3A 0 \u7684\u5546\u54C1\u7F6E\u4E8E\u5E95\u5C42` };
}
__name(moveZeroStockToBottom, "moveZeroStockToBottom");

// worker/src/seed.js
init_systemTime();
var DEFAULT_SETTINGS = [
  ["site_name", "\u6211\u7684\u7F51\u5E97"],
  ["site_icon", ""],
  ["footer_text", "\u8054\u7CFB\u6211\u4EEC\uFF1Aexample@shop.com | \u7248\u6743\u6240\u6709 \xA9 2026 \u6211\u7684\u7F51\u5E97"],
  ["watermark_text", "\u6211\u7684\u7F51\u5E97"],
  ["watermark_opacity", "0.20"],
  ["watermark_spacing", "0.18"],
  ["watermark_size", "0.045"],
  ["watermark_pattern", "grid"],
  ["announcement_enabled", "0"],
  ["announcement_title", ""],
  ["announcement_content", ""],
  ["announcement_image", ""],
  ["announcement_updated_at", ""],
  ["system_time_offset_ms", "0"],
  ["home_title", "\u7CBE\u9009\u5546\u54C1"],
  ["home_subtitle", "\u6D4F\u89C8\u6211\u4EEC\u7684\u5546\u54C1\uFF0C\u6CE8\u518C\u540E\u5373\u53EF\u8D2D\u4E70\u548C\u7559\u8A00"],
  ["product_aspect_ratio", "1:1"]
];
async function ensureSeed(db) {
  const adminCount = await one(db, "SELECT COUNT(*) AS c FROM admins");
  if ((adminCount?.c || 0) === 0) {
    const hash = import_bcryptjs.default.hashSync("123456", 10);
    await run(db, "INSERT INTO admins (username, password_hash) VALUES (?, ?)", "admin", hash);
  }
  const settingsCount = await one(db, "SELECT COUNT(*) AS c FROM site_settings");
  if ((settingsCount?.c || 0) === 0) {
    for (const [k, v] of DEFAULT_SETTINGS) {
      await run(db, "INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)", k, v);
    }
  }
  const productCount = await one(db, "SELECT COUNT(*) AS c FROM products");
  if ((productCount?.c || 0) === 0) {
    const samples = [
      ["\u793A\u4F8B\u5546\u54C1 A", "\u8FD9\u662F\u4E00\u4E2A\u793A\u4F8B\u5546\u54C1\uFF0C\u7BA1\u7406\u5458\u53EF\u5728\u540E\u53F0\u7F16\u8F91\u6216\u5220\u9664\u3002", 99],
      ["\u793A\u4F8B\u5546\u54C1 B", "\u652F\u6301\u4EE3\u5E01\u8D2D\u4E70\uFF0C\u7BA1\u7406\u5458\u53EF\u8BBE\u7F6E\u4E70\u5BB6\u4EE3\u5E01\u4F59\u989D\u3002", 199],
      ["\u793A\u4F8B\u5546\u54C1 C", "\u54CD\u5E94\u5F0F\u8BBE\u8BA1\uFF0C\u624B\u673A\u7535\u8111\u5747\u53EF\u6B63\u5E38\u4F7F\u7528\u3002", 49.9]
    ];
    for (const [name, description, price] of samples) {
      const code = await allocateProductCode(db);
      const sort = await nextProductSortOrder(db);
      await run(
        db,
        `INSERT INTO products (product_code, name, description, price, image, images, status, stock, sort_order)
         VALUES (?, ?, ?, ?, '', '[]', 'active', 99, ?)`,
        code,
        name,
        description,
        price,
        sort
      );
    }
  }
  await loadSystemTimeOffset(db);
}
__name(ensureSeed, "ensureSeed");
async function resetAllData(db) {
  await db.batch([
    db.prepare("DELETE FROM messages"),
    db.prepare("DELETE FROM conversations"),
    db.prepare("DELETE FROM comments"),
    db.prepare("DELETE FROM reviews"),
    db.prepare("DELETE FROM cart_items"),
    db.prepare("DELETE FROM profit_sales"),
    db.prepare("DELETE FROM product_categories"),
    db.prepare("DELETE FROM categories"),
    db.prepare("DELETE FROM orders"),
    db.prepare("DELETE FROM products"),
    db.prepare("DELETE FROM buyers"),
    db.prepare("DELETE FROM site_settings"),
    db.prepare("DELETE FROM admins")
  ]);
  const hash = import_bcryptjs.default.hashSync("123456", 10);
  await run(db, "INSERT INTO admins (username, password_hash) VALUES (?, ?)", "admin", hash);
  for (const [k, v] of DEFAULT_SETTINGS) {
    await run(db, "INSERT INTO site_settings (key, value) VALUES (?, ?)", k, v);
  }
  const samples = [
    ["\u793A\u4F8B\u5546\u54C1 A", "\u8FD9\u662F\u4E00\u4E2A\u793A\u4F8B\u5546\u54C1\uFF0C\u7BA1\u7406\u5458\u53EF\u5728\u540E\u53F0\u7F16\u8F91\u6216\u5220\u9664\u3002", 99],
    ["\u793A\u4F8B\u5546\u54C1 B", "\u652F\u6301\u4EE3\u5E01\u8D2D\u4E70\uFF0C\u7BA1\u7406\u5458\u53EF\u8BBE\u7F6E\u4E70\u5BB6\u4EE3\u5E01\u4F59\u989D\u3002", 199],
    ["\u793A\u4F8B\u5546\u54C1 C", "\u54CD\u5E94\u5F0F\u8BBE\u8BA1\uFF0C\u624B\u673A\u7535\u8111\u5747\u53EF\u6B63\u5E38\u4F7F\u7528\u3002", 49.9]
  ];
  for (const [name, description, price] of samples) {
    const code = await allocateProductCode(db);
    const sort = await nextProductSortOrder(db);
    await run(
      db,
      `INSERT INTO products (product_code, name, description, price, image, images, status, stock, sort_order)
       VALUES (?, ?, ?, ?, '', '[]', 'active', 99, ?)`,
      code,
      name,
      description,
      price,
      sort
    );
  }
  await loadSystemTimeOffset(db);
}
__name(resetAllData, "resetAllData");

// worker/src/utils/orderHelpers.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();

// worker/src/utils/orderCode.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var CODE_CHARS = "0123456789";
async function generateOrderCode(db) {
  for (let attempt = 0; attempt < 100; attempt++) {
    let code = "";
    for (let i = 0; i < 10; i++) {
      code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
    }
    const exists = await one(db, "SELECT id FROM orders WHERE order_code = ?", code);
    if (!exists) return code;
  }
  throw new Error("\u65E0\u6CD5\u751F\u6210\u552F\u4E00\u8BA2\u5355\u8BC6\u522B\u7801\uFF0C\u8BF7\u91CD\u8BD5");
}
__name(generateOrderCode, "generateOrderCode");

// worker/src/utils/orderHelpers.js
init_systemTime();
var TEN_DAYS = 10;
function addDays(isoDate, days) {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
__name(addDays, "addDays");
function shippedTimestamps() {
  const shippedAt = getSystemTimeISO();
  return { shippedAt, autoConfirmAt: addDays(shippedAt, TEN_DAYS) };
}
__name(shippedTimestamps, "shippedTimestamps");
async function refundOrder(db, order2) {
  const qty = order2.quantity || 1;
  await run(db, "UPDATE buyers SET tokens = tokens + ? WHERE id = ?", order2.total_price, order2.buyer_id);
  await run(db, "UPDATE products SET stock = stock + ? WHERE id = ?", qty, order2.product_id);
}
__name(refundOrder, "refundOrder");
function parseReturnImages(order2) {
  if (!order2.return_images) return [];
  try {
    const arr = typeof order2.return_images === "string" ? JSON.parse(order2.return_images) : order2.return_images;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
__name(parseReturnImages, "parseReturnImages");
function formatOrder(order2) {
  if (!order2) return order2;
  return {
    ...order2,
    quantity: order2.quantity || 1,
    return_images: parseReturnImages(order2),
    has_review: !!order2.has_review
  };
}
__name(formatOrder, "formatOrder");
async function runAutoConfirmOrders(db) {
  await loadOffsetIfNeeded(db);
  const now = getSystemTimeISO();
  const result = await run(db, `
    UPDATE orders
    SET status = 'completed', confirmed_at = ?
    WHERE status = 'shipped'
      AND auto_confirm_at IS NOT NULL
      AND auto_confirm_at <= ?
  `, now, now);
  return result.meta?.changes ?? 0;
}
__name(runAutoConfirmOrders, "runAutoConfirmOrders");
async function loadOffsetIfNeeded(db) {
  const { loadSystemTimeOffset: loadSystemTimeOffset2 } = await Promise.resolve().then(() => (init_systemTime(), systemTime_exports));
  await loadSystemTimeOffset2(db);
}
__name(loadOffsetIfNeeded, "loadOffsetIfNeeded");
async function placeOrder(db, { buyerId, productId, quantity, contact }) {
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = await one(db, "SELECT * FROM products WHERE id = ? AND status = ?", productId, "active");
  if (!product) throw new Error("NOT_FOUND");
  if (product.stock < qty) throw new Error("OUT_OF_STOCK");
  const buyer = await one(db, "SELECT tokens FROM buyers WHERE id = ?", buyerId);
  const unitPrice = product.price;
  const totalPrice = unitPrice * qty;
  if (buyer.tokens < totalPrice) throw new Error("INSUFFICIENT_TOKENS");
  const updated = await run(db, `
    UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?
  `, qty, productId, qty);
  if ((updated.meta?.changes ?? 0) === 0) throw new Error("OUT_OF_STOCK");
  await run(db, "UPDATE buyers SET tokens = tokens - ? WHERE id = ?", totalPrice, buyerId);
  const orderCode = await generateOrderCode(db);
  const now = getSystemTimeISO();
  const result = await run(
    db,
    `
    INSERT INTO orders (buyer_id, product_id, quantity, unit_price, contact_email, contact_name, address, phone, total_price, order_code, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
  `,
    buyerId,
    productId,
    qty,
    unitPrice,
    contact.contact_email,
    contact.contact_name,
    contact.address,
    contact.phone,
    totalPrice,
    orderCode,
    now
  );
  return { id: result.meta.last_row_id, order_code: orderCode, total_price: totalPrice };
}
__name(placeOrder, "placeOrder");
var ORDER_LIST_SELECT = `
  SELECT o.*, p.name AS product_name, p.image AS product_image,
    (SELECT 1 FROM reviews r WHERE r.order_id = o.id LIMIT 1) AS has_review
`;
function orderErrorMessage(err) {
  if (err.message === "NOT_FOUND") return { status: 404, error: "\u5546\u54C1\u4E0D\u5B58\u5728\u6216\u5DF2\u4E0B\u67B6" };
  if (err.message === "OUT_OF_STOCK") return { status: 400, error: "\u5546\u54C1\u5E93\u5B58\u4E0D\u8DB3" };
  if (err.message === "INSUFFICIENT_TOKENS") return { status: 400, error: "\u4EE3\u5E01\u4F59\u989D\u4E0D\u8DB3" };
  return null;
}
__name(orderErrorMessage, "orderErrorMessage");

// worker/src/storage.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function randomName(ext = "") {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${id}${ext}`;
}
__name(randomName, "randomName");
function extFromFile(file) {
  const name = file?.name || "";
  const m = name.match(/\.[a-zA-Z0-9]+$/);
  if (m) return m[0].toLowerCase();
  const type = file?.type || "";
  if (type.includes("png")) return ".png";
  if (type.includes("webp")) return ".webp";
  if (type.includes("gif")) return ".gif";
  return ".jpg";
}
__name(extFromFile, "extFromFile");
function urlToKey(urlPath) {
  if (!urlPath || typeof urlPath !== "string") return null;
  const cleaned = urlPath.replace(/^https?:\/\/[^/]+/, "");
  if (cleaned.startsWith("/uploads/")) return cleaned.slice("/uploads/".length);
  if (cleaned.startsWith("uploads/")) return cleaned.slice("uploads/".length);
  return null;
}
__name(urlToKey, "urlToKey");
function pickBucket(env2, key) {
  if (key.startsWith("returns/") || key.startsWith("users/")) {
    return { bucket: env2.USERS_BUCKET, prefix: "" };
  }
  return { bucket: env2.PRODUCTS_BUCKET, prefix: "" };
}
__name(pickBucket, "pickBucket");
async function putUpload(env2, file, { folder = "products" } = {}) {
  const ext = extFromFile(file);
  const key = folder === "returns" ? `returns/${randomName(ext)}` : folder === "site" ? `site/${randomName(ext)}` : `products/${randomName(ext)}`;
  const { bucket } = pickBucket(env2, key);
  const ab = await file.arrayBuffer();
  await bucket.put(key, ab, {
    httpMetadata: { contentType: file.type || "application/octet-stream" }
  });
  return `/uploads/${key}`;
}
__name(putUpload, "putUpload");
async function getUploadObject(env2, key) {
  const { bucket } = pickBucket(env2, key);
  return bucket.get(key);
}
__name(getUploadObject, "getUploadObject");
async function deleteUpload(env2, urlPath) {
  const key = urlToKey(urlPath);
  if (!key) return;
  const { bucket } = pickBucket(env2, key);
  try {
    await bucket.delete(key);
  } catch {
  }
}
__name(deleteUpload, "deleteUpload");
async function deleteManyUploads(env2, urls) {
  for (const u of urls || []) {
    await deleteUpload(env2, u);
  }
}
__name(deleteManyUploads, "deleteManyUploads");
async function putBase64File(env2, urlPath, base64, contentType = "application/octet-stream") {
  const key = urlToKey(urlPath);
  if (!key) return;
  const { bucket } = pickBucket(env2, key);
  const binary = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  await bucket.put(key, binary, { httpMetadata: { contentType } });
}
__name(putBase64File, "putBase64File");
async function exportR2AsBase64(env2, urlPaths) {
  const out = {};
  for (const url of urlPaths || []) {
    const key = urlToKey(url);
    if (!key) continue;
    const obj = await getUploadObject(env2, key);
    if (!obj) continue;
    const buf = await obj.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    out[url] = {
      data: btoa(binary),
      contentType: obj.httpMetadata?.contentType || "application/octet-stream"
    };
  }
  return out;
}
__name(exportR2AsBase64, "exportR2AsBase64");

// worker/src/routes/admin.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var import_bcryptjs2 = __toESM(require_bcrypt(), 1);
init_db();

// worker/src/auth.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/index.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/runtime/base64url.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/lib/buffer_utils.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/runtime/webcrypto.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var webcrypto_default = crypto;
var isCryptoKey = /* @__PURE__ */ __name((key) => key instanceof CryptoKey, "isCryptoKey");

// worker/node_modules/jose/dist/browser/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
__name(concat, "concat");

// worker/node_modules/jose/dist/browser/runtime/base64url.js
var encodeBase64 = /* @__PURE__ */ __name((input) => {
  let unencoded = input;
  if (typeof unencoded === "string") {
    unencoded = encoder.encode(unencoded);
  }
  const CHUNK_SIZE = 32768;
  const arr = [];
  for (let i = 0; i < unencoded.length; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, unencoded.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join(""));
}, "encodeBase64");
var encode = /* @__PURE__ */ __name((input) => {
  return encodeBase64(input).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}, "encode");
var decodeBase64 = /* @__PURE__ */ __name((encoded) => {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}, "decodeBase64");
var decode = /* @__PURE__ */ __name((input) => {
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}, "decode");

// worker/node_modules/jose/dist/browser/util/errors.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var JOSEError = class extends Error {
  static {
    __name(this, "JOSEError");
  }
  constructor(message2, options) {
    super(message2, options);
    this.code = "ERR_JOSE_GENERIC";
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
JOSEError.code = "ERR_JOSE_GENERIC";
var JWTClaimValidationFailed = class extends JOSEError {
  static {
    __name(this, "JWTClaimValidationFailed");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTClaimValidationFailed.code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
var JWTExpired = class extends JOSEError {
  static {
    __name(this, "JWTExpired");
  }
  constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
    super(message2, { cause: { claim, reason, payload } });
    this.code = "ERR_JWT_EXPIRED";
    this.claim = claim;
    this.reason = reason;
    this.payload = payload;
  }
};
JWTExpired.code = "ERR_JWT_EXPIRED";
var JOSEAlgNotAllowed = class extends JOSEError {
  static {
    __name(this, "JOSEAlgNotAllowed");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_ALG_NOT_ALLOWED";
  }
};
JOSEAlgNotAllowed.code = "ERR_JOSE_ALG_NOT_ALLOWED";
var JOSENotSupported = class extends JOSEError {
  static {
    __name(this, "JOSENotSupported");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JOSE_NOT_SUPPORTED";
  }
};
JOSENotSupported.code = "ERR_JOSE_NOT_SUPPORTED";
var JWEDecryptionFailed = class extends JOSEError {
  static {
    __name(this, "JWEDecryptionFailed");
  }
  constructor(message2 = "decryption operation failed", options) {
    super(message2, options);
    this.code = "ERR_JWE_DECRYPTION_FAILED";
  }
};
JWEDecryptionFailed.code = "ERR_JWE_DECRYPTION_FAILED";
var JWEInvalid = class extends JOSEError {
  static {
    __name(this, "JWEInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWE_INVALID";
  }
};
JWEInvalid.code = "ERR_JWE_INVALID";
var JWSInvalid = class extends JOSEError {
  static {
    __name(this, "JWSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWS_INVALID";
  }
};
JWSInvalid.code = "ERR_JWS_INVALID";
var JWTInvalid = class extends JOSEError {
  static {
    __name(this, "JWTInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWT_INVALID";
  }
};
JWTInvalid.code = "ERR_JWT_INVALID";
var JWKInvalid = class extends JOSEError {
  static {
    __name(this, "JWKInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWK_INVALID";
  }
};
JWKInvalid.code = "ERR_JWK_INVALID";
var JWKSInvalid = class extends JOSEError {
  static {
    __name(this, "JWKSInvalid");
  }
  constructor() {
    super(...arguments);
    this.code = "ERR_JWKS_INVALID";
  }
};
JWKSInvalid.code = "ERR_JWKS_INVALID";
var JWKSNoMatchingKey = class extends JOSEError {
  static {
    __name(this, "JWKSNoMatchingKey");
  }
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_NO_MATCHING_KEY";
  }
};
JWKSNoMatchingKey.code = "ERR_JWKS_NO_MATCHING_KEY";
var JWKSMultipleMatchingKeys = class extends JOSEError {
  static {
    __name(this, "JWKSMultipleMatchingKeys");
  }
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
    this.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  }
};
JWKSMultipleMatchingKeys.code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
var JWKSTimeout = class extends JOSEError {
  static {
    __name(this, "JWKSTimeout");
  }
  constructor(message2 = "request timed out", options) {
    super(message2, options);
    this.code = "ERR_JWKS_TIMEOUT";
  }
};
JWKSTimeout.code = "ERR_JWKS_TIMEOUT";
var JWSSignatureVerificationFailed = class extends JOSEError {
  static {
    __name(this, "JWSSignatureVerificationFailed");
  }
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
    this.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  }
};
JWSSignatureVerificationFailed.code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";

// worker/node_modules/jose/dist/browser/lib/crypto_key.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function unusable(name, prop = "algorithm.name") {
  return new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
__name(unusable, "unusable");
function isAlgorithm(algorithm, name) {
  return algorithm.name === name;
}
__name(isAlgorithm, "isAlgorithm");
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
__name(getHashLength, "getHashLength");
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
__name(getNamedCurve, "getNamedCurve");
function checkUsage(key, usages) {
  if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
    let msg = "CryptoKey does not support this operation, its usages must include ";
    if (usages.length > 2) {
      const last = usages.pop();
      msg += `one of ${usages.join(", ")}, or ${last}.`;
    } else if (usages.length === 2) {
      msg += `one of ${usages[0]} or ${usages[1]}.`;
    } else {
      msg += `${usages[0]}.`;
    }
    throw new TypeError(msg);
  }
}
__name(checkUsage, "checkUsage");
function checkSigCryptoKey(key, alg, ...usages) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      const expected = parseInt(alg.slice(2), 10);
      const actual = getHashLength(key.algorithm.hash);
      if (actual !== expected)
        throw unusable(`SHA-${expected}`, "algorithm.hash");
      break;
    }
    case "EdDSA": {
      if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") {
        throw unusable("Ed25519 or Ed448");
      }
      break;
    }
    case "Ed25519": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usages);
}
__name(checkSigCryptoKey, "checkSigCryptoKey");

// worker/node_modules/jose/dist/browser/lib/invalid_key_input.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function message(msg, actual, ...types2) {
  types2 = types2.filter(Boolean);
  if (types2.length > 2) {
    const last = types2.pop();
    msg += `one of type ${types2.join(", ")}, or ${last}.`;
  } else if (types2.length === 2) {
    msg += `one of type ${types2[0]} or ${types2[1]}.`;
  } else {
    msg += `of type ${types2[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
__name(message, "message");
var invalid_key_input_default = /* @__PURE__ */ __name((actual, ...types2) => {
  return message("Key must be ", actual, ...types2);
}, "default");
function withAlg(alg, actual, ...types2) {
  return message(`Key for the ${alg} algorithm must be `, actual, ...types2);
}
__name(withAlg, "withAlg");

// worker/node_modules/jose/dist/browser/runtime/is_key_like.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var is_key_like_default = /* @__PURE__ */ __name((key) => {
  if (isCryptoKey(key)) {
    return true;
  }
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "default");
var types = ["CryptoKey"];

// worker/node_modules/jose/dist/browser/lib/is_disjoint.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var isDisjoint = /* @__PURE__ */ __name((...headers) => {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}, "isDisjoint");
var is_disjoint_default = isDisjoint;

// worker/node_modules/jose/dist/browser/lib/is_object.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function isObjectLike(value) {
  return typeof value === "object" && value !== null;
}
__name(isObjectLike, "isObjectLike");
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
__name(isObject, "isObject");

// worker/node_modules/jose/dist/browser/runtime/check_key_length.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var check_key_length_default = /* @__PURE__ */ __name((alg, key) => {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}, "default");

// worker/node_modules/jose/dist/browser/runtime/normalize_key.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/lib/is_jwk.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function isJWK(key) {
  return isObject(key) && typeof key.kty === "string";
}
__name(isJWK, "isJWK");
function isPrivateJWK(key) {
  return key.kty !== "oct" && typeof key.d === "string";
}
__name(isPrivateJWK, "isPrivateJWK");
function isPublicJWK(key) {
  return key.kty !== "oct" && typeof key.d === "undefined";
}
__name(isPublicJWK, "isPublicJWK");
function isSecretJWK(key) {
  return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
__name(isSecretJWK, "isSecretJWK");

// worker/node_modules/jose/dist/browser/runtime/jwk_to_key.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
          algorithm = { name: "ECDSA", namedCurve: "P-256" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES384":
          algorithm = { name: "ECDSA", namedCurve: "P-384" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ES512":
          algorithm = { name: "ECDSA", namedCurve: "P-521" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "EdDSA":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported('Invalid or unsupported JWK "alg" (Algorithm) Parameter value');
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
__name(subtleMapping, "subtleMapping");
var parse = /* @__PURE__ */ __name(async (jwk) => {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const rest = [
    algorithm,
    jwk.ext ?? false,
    jwk.key_ops ?? keyUsages
  ];
  const keyData = { ...jwk };
  delete keyData.alg;
  delete keyData.use;
  return webcrypto_default.subtle.importKey("jwk", keyData, ...rest);
}, "parse");
var jwk_to_key_default = parse;

// worker/node_modules/jose/dist/browser/runtime/normalize_key.js
var exportKeyValue = /* @__PURE__ */ __name((k) => decode(k), "exportKeyValue");
var privCache;
var pubCache;
var isKeyObject = /* @__PURE__ */ __name((key) => {
  return key?.[Symbol.toStringTag] === "KeyObject";
}, "isKeyObject");
var importAndCache = /* @__PURE__ */ __name(async (cache, key, jwk, alg, freeze = false) => {
  let cached = cache.get(key);
  if (cached?.[alg]) {
    return cached[alg];
  }
  const cryptoKey = await jwk_to_key_default({ ...jwk, alg });
  if (freeze)
    Object.freeze(key);
  if (!cached) {
    cache.set(key, { [alg]: cryptoKey });
  } else {
    cached[alg] = cryptoKey;
  }
  return cryptoKey;
}, "importAndCache");
var normalizePublicKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    delete jwk.d;
    delete jwk.dp;
    delete jwk.dq;
    delete jwk.p;
    delete jwk.q;
    delete jwk.qi;
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(pubCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    pubCache || (pubCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(pubCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePublicKey");
var normalizePrivateKey = /* @__PURE__ */ __name((key, alg) => {
  if (isKeyObject(key)) {
    let jwk = key.export({ format: "jwk" });
    if (jwk.k) {
      return exportKeyValue(jwk.k);
    }
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    return importAndCache(privCache, key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k)
      return decode(key.k);
    privCache || (privCache = /* @__PURE__ */ new WeakMap());
    const cryptoKey = importAndCache(privCache, key, key, alg, true);
    return cryptoKey;
  }
  return key;
}, "normalizePrivateKey");
var normalize_key_default = { normalizePublicKey, normalizePrivateKey };

// worker/node_modules/jose/dist/browser/key/import.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function importJWK(jwk, alg) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  alg || (alg = jwk.alg);
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
    case "EC":
    case "OKP":
      return jwk_to_key_default({ ...jwk, alg });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
__name(importJWK, "importJWK");

// worker/node_modules/jose/dist/browser/lib/check_key_type.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var tag = /* @__PURE__ */ __name((key) => key?.[Symbol.toStringTag], "tag");
var jwkMatchesOp = /* @__PURE__ */ __name((alg, key, usage) => {
  if (key.use !== void 0 && key.use !== "sig") {
    throw new TypeError("Invalid key for this operation, when present its use must be sig");
  }
  if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) {
    throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
  }
  if (key.alg !== void 0 && key.alg !== alg) {
    throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
  }
  return true;
}, "jwkMatchesOp");
var symmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (key instanceof Uint8Array)
    return;
  if (allowJwk && isJWK(key)) {
    if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
      return;
    throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
  }
  if (key.type !== "secret") {
    throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
  }
}, "symmetricTypeCheck");
var asymmetricTypeCheck = /* @__PURE__ */ __name((alg, key, usage, allowJwk) => {
  if (allowJwk && isJWK(key)) {
    switch (usage) {
      case "sign":
        if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a private JWK`);
      case "verify":
        if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for this operation be a public JWK`);
    }
  }
  if (!is_key_like_default(key)) {
    throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
  }
  if (key.type === "secret") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
  }
  if (usage === "sign" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
  }
  if (usage === "decrypt" && key.type === "public") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
  }
  if (key.algorithm && usage === "verify" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
  }
  if (key.algorithm && usage === "encrypt" && key.type === "private") {
    throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
  }
}, "asymmetricTypeCheck");
function checkKeyType(allowJwk, alg, key, usage) {
  const symmetric = alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg);
  if (symmetric) {
    symmetricTypeCheck(alg, key, usage, allowJwk);
  } else {
    asymmetricTypeCheck(alg, key, usage, allowJwk);
  }
}
__name(checkKeyType, "checkKeyType");
var check_key_type_default = checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);

// worker/node_modules/jose/dist/browser/lib/validate_crit.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
__name(validateCrit, "validateCrit");
var validate_crit_default = validateCrit;

// worker/node_modules/jose/dist/browser/lib/validate_algorithms.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var validateAlgorithms = /* @__PURE__ */ __name((option, algorithms) => {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}, "validateAlgorithms");
var validate_algorithms_default = validateAlgorithms;

// worker/node_modules/jose/dist/browser/jws/compact/verify.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/jws/flattened/verify.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/runtime/verify.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/runtime/subtle_dsa.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function subtleDsa(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: alg.slice(-3) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
      return { name: "Ed25519" };
    case "EdDSA":
      return { name: algorithm.name };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
__name(subtleDsa, "subtleDsa");

// worker/node_modules/jose/dist/browser/runtime/get_sign_verify_key.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
async function getCryptoKey(alg, key, usage) {
  if (usage === "sign") {
    key = await normalize_key_default.normalizePrivateKey(key, alg);
  }
  if (usage === "verify") {
    key = await normalize_key_default.normalizePublicKey(key, alg);
  }
  if (isCryptoKey(key)) {
    checkSigCryptoKey(key, alg, usage);
    return key;
  }
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalid_key_input_default(key, ...types));
    }
    return webcrypto_default.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
__name(getCryptoKey, "getCryptoKey");

// worker/node_modules/jose/dist/browser/runtime/verify.js
var verify = /* @__PURE__ */ __name(async (alg, key, signature, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "verify");
  check_key_length_default(alg, cryptoKey);
  const algorithm = subtleDsa(alg, cryptoKey.algorithm);
  try {
    return await webcrypto_default.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}, "verify");
var verify_default = verify;

// worker/node_modules/jose/dist/browser/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!is_disjoint_default(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validate_algorithms_default("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
    checkKeyTypeWithJwk(alg, key, "verify");
    if (isJWK(key)) {
      key = await importJWK(key, alg);
    }
  } else {
    checkKeyTypeWithJwk(alg, key, "verify");
  }
  const data = concat(encoder.encode(jws.protected ?? ""), encoder.encode("."), typeof jws.payload === "string" ? encoder.encode(jws.payload) : jws.payload);
  let signature;
  try {
    signature = decode(jws.signature);
  } catch {
    throw new JWSInvalid("Failed to base64url decode the signature");
  }
  const verified = await verify_default(alg, key, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    try {
      payload = decode(jws.payload);
    } catch {
      throw new JWSInvalid("Failed to base64url decode the payload");
    }
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key };
  }
  return result;
}
__name(flattenedVerify, "flattenedVerify");

// worker/node_modules/jose/dist/browser/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(compactVerify, "compactVerify");

// worker/node_modules/jose/dist/browser/jwt/verify.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/lib/jwt_claims_set.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/lib/epoch.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var epoch_default = /* @__PURE__ */ __name((date) => Math.floor(date.getTime() / 1e3), "default");

// worker/node_modules/jose/dist/browser/lib/secs.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = /* @__PURE__ */ __name((str) => {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}, "default");

// worker/node_modules/jose/dist/browser/lib/jwt_claims_set.js
var normalizeTyp = /* @__PURE__ */ __name((value) => value.toLowerCase().replace(/^application\//, ""), "normalizeTyp");
var checkAudiencePresence = /* @__PURE__ */ __name((audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
}, "checkAudiencePresence");
var jwt_claims_set_default = /* @__PURE__ */ __name((protectedHeader, encodedPayload, options = {}) => {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs_default(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch_default(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs_default(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}, "default");

// worker/node_modules/jose/dist/browser/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = jwt_claims_set_default(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
__name(jwtVerify, "jwtVerify");

// worker/node_modules/jose/dist/browser/jws/compact/sign.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/jws/flattened/sign.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/runtime/sign.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var sign = /* @__PURE__ */ __name(async (alg, key, data) => {
  const cryptoKey = await getCryptoKey(alg, key, "sign");
  check_key_length_default(alg, cryptoKey);
  const signature = await webcrypto_default.subtle.sign(subtleDsa(alg, cryptoKey.algorithm), cryptoKey, data);
  return new Uint8Array(signature);
}, "sign");
var sign_default = sign;

// worker/node_modules/jose/dist/browser/jws/flattened/sign.js
var FlattenedSign = class {
  static {
    __name(this, "FlattenedSign");
  }
  constructor(payload) {
    if (!(payload instanceof Uint8Array)) {
      throw new TypeError("payload must be an instance of Uint8Array");
    }
    this._payload = payload;
  }
  setProtectedHeader(protectedHeader) {
    if (this._protectedHeader) {
      throw new TypeError("setProtectedHeader can only be called once");
    }
    this._protectedHeader = protectedHeader;
    return this;
  }
  setUnprotectedHeader(unprotectedHeader) {
    if (this._unprotectedHeader) {
      throw new TypeError("setUnprotectedHeader can only be called once");
    }
    this._unprotectedHeader = unprotectedHeader;
    return this;
  }
  async sign(key, options) {
    if (!this._protectedHeader && !this._unprotectedHeader) {
      throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
    }
    if (!is_disjoint_default(this._protectedHeader, this._unprotectedHeader)) {
      throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
    }
    const joseHeader = {
      ...this._protectedHeader,
      ...this._unprotectedHeader
    };
    const extensions = validate_crit_default(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
    let b64 = true;
    if (extensions.has("b64")) {
      b64 = this._protectedHeader.b64;
      if (typeof b64 !== "boolean") {
        throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
      }
    }
    const { alg } = joseHeader;
    if (typeof alg !== "string" || !alg) {
      throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    checkKeyTypeWithJwk(alg, key, "sign");
    let payload = this._payload;
    if (b64) {
      payload = encoder.encode(encode(payload));
    }
    let protectedHeader;
    if (this._protectedHeader) {
      protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
    } else {
      protectedHeader = encoder.encode("");
    }
    const data = concat(protectedHeader, encoder.encode("."), payload);
    const signature = await sign_default(alg, key, data);
    const jws = {
      signature: encode(signature),
      payload: ""
    };
    if (b64) {
      jws.payload = decoder.decode(payload);
    }
    if (this._unprotectedHeader) {
      jws.header = this._unprotectedHeader;
    }
    if (this._protectedHeader) {
      jws.protected = decoder.decode(protectedHeader);
    }
    return jws;
  }
};

// worker/node_modules/jose/dist/browser/jws/compact/sign.js
var CompactSign = class {
  static {
    __name(this, "CompactSign");
  }
  constructor(payload) {
    this._flattened = new FlattenedSign(payload);
  }
  setProtectedHeader(protectedHeader) {
    this._flattened.setProtectedHeader(protectedHeader);
    return this;
  }
  async sign(key, options) {
    const jws = await this._flattened.sign(key, options);
    if (jws.payload === void 0) {
      throw new TypeError("use the flattened module for creating JWS with b64: false");
    }
    return `${jws.protected}.${jws.payload}.${jws.signature}`;
  }
};

// worker/node_modules/jose/dist/browser/jwt/sign.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();

// worker/node_modules/jose/dist/browser/jwt/produce.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function validateInput(label, input) {
  if (!Number.isFinite(input)) {
    throw new TypeError(`Invalid ${label} input`);
  }
  return input;
}
__name(validateInput, "validateInput");
var ProduceJWT = class {
  static {
    __name(this, "ProduceJWT");
  }
  constructor(payload = {}) {
    if (!isObject(payload)) {
      throw new TypeError("JWT Claims Set MUST be an object");
    }
    this._payload = payload;
  }
  setIssuer(issuer) {
    this._payload = { ...this._payload, iss: issuer };
    return this;
  }
  setSubject(subject) {
    this._payload = { ...this._payload, sub: subject };
    return this;
  }
  setAudience(audience) {
    this._payload = { ...this._payload, aud: audience };
    return this;
  }
  setJti(jwtId) {
    this._payload = { ...this._payload, jti: jwtId };
    return this;
  }
  setNotBefore(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, nbf: validateInput("setNotBefore", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setExpirationTime(input) {
    if (typeof input === "number") {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", input) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, exp: validateInput("setExpirationTime", epoch_default(input)) };
    } else {
      this._payload = { ...this._payload, exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input) };
    }
    return this;
  }
  setIssuedAt(input) {
    if (typeof input === "undefined") {
      this._payload = { ...this._payload, iat: epoch_default(/* @__PURE__ */ new Date()) };
    } else if (input instanceof Date) {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", epoch_default(input)) };
    } else if (typeof input === "string") {
      this._payload = {
        ...this._payload,
        iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
      };
    } else {
      this._payload = { ...this._payload, iat: validateInput("setIssuedAt", input) };
    }
    return this;
  }
};

// worker/node_modules/jose/dist/browser/jwt/sign.js
var SignJWT = class extends ProduceJWT {
  static {
    __name(this, "SignJWT");
  }
  setProtectedHeader(protectedHeader) {
    this._protectedHeader = protectedHeader;
    return this;
  }
  async sign(key, options) {
    const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
    sig.setProtectedHeader(this._protectedHeader);
    if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) {
      throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
    }
    return sig.sign(key, options);
  }
};

// worker/src/auth.js
init_db();
function getSecret(env2) {
  const secret = env2.JWT_SECRET || "shop-dev-secret-key-change-in-production";
  return new TextEncoder().encode(secret);
}
__name(getSecret, "getSecret");
async function signToken(env2, payload, expiresIn = "7d") {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(expiresIn).sign(getSecret(env2));
}
__name(signToken, "signToken");
async function verifyToken(env2, token) {
  const { payload } = await jwtVerify(token, getSecret(env2));
  return payload;
}
__name(verifyToken, "verifyToken");
function bearer(c) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
}
__name(bearer, "bearer");
async function adminAuth(c, next) {
  const token = bearer(c);
  if (!token) return c.json({ error: "\u8BF7\u5148\u767B\u5F55\u7BA1\u7406\u5458\u8D26\u53F7" }, 401);
  try {
    const decoded = await verifyToken(c.env, token);
    if (decoded.role !== "admin") throw new Error("role");
    c.set("admin", decoded);
    await next();
  } catch {
    return c.json({ error: "\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
  }
}
__name(adminAuth, "adminAuth");
async function buyerAuth(c, next) {
  const token = bearer(c);
  if (!token) return c.json({ error: "\u8BF7\u5148\u767B\u5F55" }, 401);
  try {
    const decoded = await verifyToken(c.env, token);
    if (decoded.role !== "buyer") throw new Error("role");
    const buyer = await one(
      c.env.DB,
      "SELECT id, email, is_muted FROM buyers WHERE id = ? OR email = ?",
      decoded.id,
      decoded.email
    );
    if (!buyer) return c.json({ error: "\u767B\u5F55\u5DF2\u5931\u6548\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
    c.set("buyer", { id: buyer.id, email: buyer.email, role: "buyer", is_muted: !!buyer.is_muted });
    await next();
  } catch {
    return c.json({ error: "\u767B\u5F55\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55" }, 401);
  }
}
__name(buyerAuth, "buyerAuth");

// worker/src/utils/password.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function assertPasswordMatch(newPassword, confirmPassword) {
  if (!newPassword || !confirmPassword) throw new Error("\u8BF7\u586B\u5199\u5B8C\u6574\u5BC6\u7801\u4FE1\u606F");
  if (newPassword !== confirmPassword) throw new Error("\u4E24\u6B21\u8F93\u5165\u7684\u65B0\u5BC6\u7801\u4E0D\u4E00\u81F4");
}
__name(assertPasswordMatch, "assertPasswordMatch");

// worker/src/utils/profit.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
function parseNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
__name(parseNumber, "parseNumber");
async function getProfitSummary(db) {
  const inventoryRow = await one(db, `
    SELECT COALESCE(SUM(COALESCE(cost_price, 0) * COALESCE(stock, 0)), 0) AS inventory_cost
    FROM products
  `);
  const soldCostRow = await one(db, `
    SELECT COALESCE(SUM(COALESCE(cost_price, 0)), 0) AS sold_cost,
           COALESCE(SUM(sale_price), 0) AS total_sales,
           COUNT(*) AS sold_count
    FROM profit_sales
  `);
  const totalCost = Number(inventoryRow?.inventory_cost || 0) + Number(soldCostRow?.sold_cost || 0);
  const totalSales = Number(soldCostRow?.total_sales || 0);
  return {
    total_cost: totalCost,
    total_sales: totalSales,
    total_profit: totalSales - totalCost,
    sold_count: Number(soldCostRow?.sold_count || 0)
  };
}
__name(getProfitSummary, "getProfitSummary");
async function listProfitSales(db, q = "") {
  const query = String(q || "").trim();
  if (query) {
    const pattern = `%${query}%`;
    return all(db, `
      SELECT * FROM profit_sales s
      WHERE s.product_name LIKE ? OR s.product_code LIKE ? OR s.custom_code LIKE ? OR CAST(s.product_id AS TEXT) LIKE ?
      ORDER BY s.id DESC
    `, pattern, pattern, pattern, `%${query}%`);
  }
  return all(db, "SELECT * FROM profit_sales ORDER BY id DESC");
}
__name(listProfitSales, "listProfitSales");
async function sellProfitProduct(db, body) {
  const productId = parseInt(body?.product_id, 10);
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!productId || !Number.isFinite(salePrice) || salePrice < 0) throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6210\u4EA4\u4EF7\u548C\u5546\u54C1");
  const product = await one(db, "SELECT id, product_code, custom_code, search_code, name, image, image_preview, image_thumb, cost_price, stock FROM products WHERE id = ?", productId);
  if (!product) throw new Error("\u5546\u54C1\u4E0D\u5B58\u5728");
  if ((Number(product.stock) || 0) <= 0) throw new Error("\u5E93\u5B58\u4E0D\u8DB3\uFF0C\u65E0\u6CD5\u5356\u51FA");
  const costPrice = Number(product.cost_price) || 0;
  const profit = salePrice - costPrice;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const custom = product.search_code || product.custom_code || "";
  const image = product.image_thumb || product.image_preview || product.image || "";
  await run(db, "UPDATE products SET stock = stock - 1 WHERE id = ?", productId);
  const result = await run(db, `
    INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, productId, product.product_code || "", custom, product.name, image, costPrice, salePrice, profit, now, now);
  const id = result.meta.last_row_id;
  return {
    id,
    message: "\u5356\u51FA\u6210\u529F",
    profit_record: {
      id,
      product_id: productId,
      product_code: product.product_code || "",
      custom_code: custom,
      product_name: product.name,
      product_image: image,
      cost_price: costPrice,
      sale_price: salePrice,
      profit,
      created_at: now,
      updated_at: now
    }
  };
}
__name(sellProfitProduct, "sellProfitProduct");
async function updateProfitSale(db, id, body) {
  const saleId = parseInt(id, 10);
  const fullRecord = await one(db, "SELECT * FROM profit_sales WHERE id = ?", saleId);
  if (!fullRecord) throw new Error("\u5356\u51FA\u8BB0\u5F55\u4E0D\u5B58\u5728");
  const salePrice = parseNumber(body?.sale_price, NaN);
  if (!Number.isFinite(salePrice) || salePrice < 0) throw new Error("\u8BF7\u8F93\u5165\u6709\u6548\u7684\u6210\u4EA4\u4EF7");
  const costPrice = parseNumber(body?.cost_price, fullRecord.cost_price);
  const scope = String(body?.scope || "single");
  const nextProfit = salePrice - costPrice;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (body?.product_id && parseInt(body.product_id, 10) !== fullRecord.product_id) {
    throw new Error("\u4E0D\u53EF\u4FEE\u6539\u5356\u51FA\u5546\u54C1");
  }
  await run(db, `
    UPDATE profit_sales SET cost_price = ?, sale_price = ?, profit = ?, updated_at = ? WHERE id = ?
  `, costPrice, salePrice, nextProfit, now, saleId);
  return {
    message: scope === "all" ? "\u5356\u51FA\u8BB0\u5F55\u5DF2\u66F4\u65B0\uFF08\u5DF2\u540C\u6B65\u5168\u90E8\u5E93\u5B58\u6210\u672C\u4EF7\uFF09" : "\u5356\u51FA\u8BB0\u5F55\u5DF2\u66F4\u65B0\uFF08\u4EC5\u4FEE\u6539\u5F53\u524D\u5355\u4EF6\u6210\u672C\u4EF7\uFF09",
    profit_record: { ...fullRecord, cost_price: costPrice, sale_price: salePrice, profit: nextProfit, updated_at: now }
  };
}
__name(updateProfitSale, "updateProfitSale");
async function revokeProfitSale(db, id) {
  const saleId = parseInt(id, 10);
  const record = await one(db, "SELECT * FROM profit_sales WHERE id = ?", saleId);
  if (!record) throw new Error("\u5356\u51FA\u8BB0\u5F55\u4E0D\u5B58\u5728");
  await run(db, "UPDATE products SET stock = stock + 1 WHERE id = ?", record.product_id);
  await run(db, "DELETE FROM profit_sales WHERE id = ?", saleId);
  return { message: "\u5DF2\u64A4\u56DE\u5356\u51FA\u8BB0\u5F55", revoked: record };
}
__name(revokeProfitSale, "revokeProfitSale");

// worker/src/utils/helpers.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
function parseProductImages(product) {
  if (product.images) {
    try {
      const arr = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
      if (Array.isArray(arr) && arr.length) return arr;
    } catch {
    }
  }
  return product.image ? [product.image] : [];
}
__name(parseProductImages, "parseProductImages");
function formatProduct(product) {
  if (!product) return product;
  const images = parseProductImages(product);
  const stock = typeof product.stock === "number" ? product.stock : parseInt(product.stock, 10) || 0;
  return {
    ...product,
    images,
    image: images[0] || product.image || "",
    image_preview: product.image_preview || images[0] || product.image || "",
    image_thumb: product.image_thumb || product.image_preview || images[0] || product.image || "",
    custom_code: product.search_code || product.custom_code || "",
    search_code: product.search_code || product.custom_code || "",
    stock
  };
}
__name(formatProduct, "formatProduct");

// worker/src/utils/backup.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_systemTime();
var BACKUP_TYPE = "shop-data-backup";
var BACKUP_VERSION = 11;
function collectPaths(products2, orders2, siteSettings) {
  const paths = /* @__PURE__ */ new Set();
  for (const p of products2 || []) {
    for (const f of [p.image, p.image_preview, p.image_thumb]) if (f) paths.add(f);
    try {
      const imgs = typeof p.images === "string" ? JSON.parse(p.images || "[]") : p.images || [];
      for (const i of imgs) if (i) paths.add(i);
    } catch {
    }
  }
  for (const o of orders2 || []) {
    try {
      const imgs = typeof o.return_images === "string" ? JSON.parse(o.return_images || "[]") : o.return_images || [];
      for (const i of imgs) if (i) paths.add(i);
    } catch {
    }
  }
  for (const k of ["site_icon", "announcement_image"]) {
    if (siteSettings?.[k]) paths.add(siteSettings[k]);
  }
  return [...paths];
}
__name(collectPaths, "collectPaths");
async function exportBackup(env2) {
  const db = env2.DB;
  const buyers2 = await all(db, "SELECT email, password_hash, tokens, is_muted, created_at, default_contact_name, default_contact_email, default_address, default_phone FROM buyers ORDER BY id");
  const products2 = await all(db, "SELECT id, product_code, custom_code, search_code, name, description, price, cost_price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at FROM products ORDER BY id");
  const orders2 = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, o.shipping_number, o.contact_name, o.contact_email, o.phone, o.address, o.quantity, o.unit_price, o.total_price, o.status, o.shipped_at, o.confirmed_at, o.auto_confirm_at, o.return_status, o.return_reason, o.return_images, o.return_reject_reason, o.created_at FROM orders o JOIN buyers b ON o.buyer_id = b.id JOIN products p ON o.product_id = p.id ORDER BY o.id`);
  const reviews2 = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, o.order_code, r.content, r.created_at FROM reviews r JOIN orders o ON r.order_id = o.id JOIN buyers b ON r.buyer_id = b.id JOIN products p ON r.product_id = p.id ORDER BY r.id`);
  const cartItems = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, c.quantity, c.created_at FROM cart_items c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id`);
  const comments2 = await all(db, `SELECT b.email AS buyer_email, p.name AS product_name, c.content, c.created_at FROM comments c JOIN buyers b ON c.buyer_id = b.id JOIN products p ON c.product_id = p.id ORDER BY c.id`);
  const messages2 = await all(db, `SELECT b.email AS buyer_email, m.sender_type, m.content, m.read_by_buyer, m.read_by_admin, m.created_at FROM messages m JOIN conversations conv ON m.conversation_id = conv.id JOIN buyers b ON conv.buyer_id = b.id ORDER BY m.id`);
  const settingsRows = await all(db, "SELECT key, value FROM site_settings ORDER BY key");
  const site_settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));
  const categories2 = await all(db, "SELECT name, description, sort_order, created_at FROM categories ORDER BY id");
  const product_categories = await all(db, `SELECT p.name AS product_name, c.name AS category_name FROM product_categories pc JOIN products p ON pc.product_id = p.id JOIN categories c ON pc.category_id = c.id`);
  const profit_sales = await all(db, "SELECT id, product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at FROM profit_sales ORDER BY id");
  const paths = collectPaths(products2, orders2, site_settings);
  const upload_files = await exportR2AsBase64(env2, paths);
  return {
    type: BACKUP_TYPE,
    version: BACKUP_VERSION,
    exported_at: getSystemTimeISO(),
    upload_files,
    upload_files_count: Object.keys(upload_files).length,
    buyers: buyers2,
    products: products2,
    orders: orders2,
    reviews: reviews2,
    cart_items: cartItems,
    comments: comments2,
    messages: messages2,
    site_settings,
    categories: categories2,
    product_categories,
    profit_sales,
    profit_summary: await getProfitSummary(db)
  };
}
__name(exportBackup, "exportBackup");
async function restoreBackup(env2, raw2) {
  if (!raw2 || typeof raw2 !== "object") throw new Error("\u65E0\u6CD5\u8BC6\u522B\u5907\u4EFD\u6587\u4EF6");
  const data = raw2.type === BACKUP_TYPE || raw2.buyers ? raw2 : raw2.data || raw2;
  const buyers2 = data.buyers || [];
  const products2 = data.products || [];
  const orders2 = data.orders || [];
  const reviews2 = data.reviews || [];
  const cartItems = data.cart_items || [];
  const comments2 = data.comments || [];
  const messages2 = data.messages || [];
  const siteSettings = data.site_settings || {};
  const categories2 = data.categories || [];
  const productCategories = data.product_categories || [];
  const profitSales = data.profit_sales || [];
  const uploadFiles = data.upload_files || {};
  const db = env2.DB;
  await db.batch([
    db.prepare("DELETE FROM profit_sales"),
    db.prepare("DELETE FROM messages"),
    db.prepare("DELETE FROM conversations"),
    db.prepare("DELETE FROM reviews"),
    db.prepare("DELETE FROM cart_items"),
    db.prepare("DELETE FROM comments"),
    db.prepare("DELETE FROM orders"),
    db.prepare("DELETE FROM product_categories"),
    db.prepare("DELETE FROM categories"),
    db.prepare("DELETE FROM products"),
    db.prepare("DELETE FROM buyers"),
    db.prepare("DELETE FROM site_settings")
  ]);
  const stats = { buyers: 0, products: 0, orders: 0, reviews: 0, cart_items: 0, comments: 0, messages: 0, categories: 0, product_categories: 0, site_settings: 0, upload_files: 0, profit_sales: 0 };
  const buyerMap = /* @__PURE__ */ new Map();
  const productMap = /* @__PURE__ */ new Map();
  const categoryMap = /* @__PURE__ */ new Map();
  const orderMap = /* @__PURE__ */ new Map();
  for (const b of buyers2) {
    const r = await run(
      db,
      `INSERT INTO buyers (email, password_hash, tokens, is_muted, default_contact_name, default_contact_email, default_address, default_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      b.email,
      b.password_hash,
      b.tokens ?? 0,
      b.is_muted ? 1 : 0,
      b.default_contact_name || "",
      b.default_contact_email || "",
      b.default_address || "",
      b.default_phone || "",
      b.created_at || getSystemTimeISO()
    );
    buyerMap.set(b.email, r.meta.last_row_id);
    stats.buyers++;
  }
  for (const p of products2) {
    let code = p.product_code;
    if (!code) code = await allocateProductCode(db);
    const sort = p.sort_order ?? await nextProductSortOrder(db);
    const r = await run(
      db,
      `INSERT INTO products (product_code, custom_code, search_code, name, description, price, cost_price, image, image_preview, image_thumb, images, status, stock, sort_order, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      code,
      p.custom_code || "",
      p.search_code || p.custom_code || "",
      p.name,
      p.description || "",
      p.price,
      p.cost_price ?? 0,
      p.image || "",
      p.image_preview || "",
      p.image_thumb || "",
      typeof p.images === "string" ? p.images : JSON.stringify(p.images || []),
      p.status || "active",
      p.stock ?? 0,
      sort,
      p.created_at || getSystemTimeISO()
    );
    productMap.set(p.name, r.meta.last_row_id);
    stats.products++;
  }
  for (const c of categories2) {
    const r = await run(
      db,
      "INSERT INTO categories (name, description, sort_order, created_at) VALUES (?, ?, ?, ?)",
      c.name,
      c.description || "",
      c.sort_order ?? 0,
      c.created_at || getSystemTimeISO()
    );
    categoryMap.set(c.name, r.meta.last_row_id);
    stats.categories++;
  }
  for (const pc of productCategories) {
    const pid2 = productMap.get(pc.product_name);
    const cid = categoryMap.get(pc.category_name);
    if (pid2 && cid) {
      await run(db, "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)", pid2, cid);
      stats.product_categories++;
    }
  }
  for (const o of orders2) {
    const buyerId = buyerMap.get(o.buyer_email);
    const productId = productMap.get(o.product_name);
    if (!buyerId || !productId) continue;
    let code = o.order_code;
    if (!code || await one(db, "SELECT id FROM orders WHERE order_code = ?", code)) {
      code = await generateOrderCode(db);
    }
    const r = await run(
      db,
      `INSERT INTO orders (buyer_id, product_id, contact_email, contact_name, address, phone, quantity, unit_price, total_price, order_code, shipping_number, status, shipped_at, confirmed_at, auto_confirm_at, return_status, return_reason, return_images, return_reject_reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      buyerId,
      productId,
      o.contact_email,
      o.contact_name,
      o.address,
      o.phone,
      o.quantity || 1,
      o.unit_price ?? o.total_price,
      o.total_price,
      code,
      o.shipping_number || "",
      o.status || "pending",
      o.shipped_at,
      o.confirmed_at,
      o.auto_confirm_at,
      o.return_status || "",
      o.return_reason || "",
      typeof o.return_images === "string" ? o.return_images : JSON.stringify(o.return_images || []),
      o.return_reject_reason || "",
      o.created_at || getSystemTimeISO()
    );
    if (code) orderMap.set(code, r.meta.last_row_id);
    stats.orders++;
  }
  for (const r of reviews2) {
    const orderId = orderMap.get(r.order_code);
    const buyerId = buyerMap.get(r.buyer_email);
    const productId = productMap.get(r.product_name);
    if (!orderId || !buyerId || !productId) continue;
    await run(
      db,
      "INSERT INTO reviews (order_id, product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?, ?)",
      orderId,
      productId,
      buyerId,
      r.content || "",
      r.created_at || getSystemTimeISO()
    );
    stats.reviews++;
  }
  for (const c of cartItems) {
    const buyerId = buyerMap.get(c.buyer_email);
    const productId = productMap.get(c.product_name);
    if (!buyerId || !productId) continue;
    await run(
      db,
      "INSERT OR IGNORE INTO cart_items (buyer_id, product_id, quantity, created_at) VALUES (?, ?, ?, ?)",
      buyerId,
      productId,
      c.quantity || 1,
      c.created_at || getSystemTimeISO()
    );
    stats.cart_items++;
  }
  for (const c of comments2) {
    const buyerId = buyerMap.get(c.buyer_email);
    const productId = productMap.get(c.product_name);
    if (!buyerId || !productId) continue;
    await run(
      db,
      "INSERT INTO comments (product_id, buyer_id, content, created_at) VALUES (?, ?, ?, ?)",
      productId,
      buyerId,
      c.content,
      c.created_at || getSystemTimeISO()
    );
    stats.comments++;
  }
  const convMap = /* @__PURE__ */ new Map();
  for (const m of messages2) {
    const buyerId = buyerMap.get(m.buyer_email);
    if (!buyerId) continue;
    let convId = convMap.get(buyerId);
    if (!convId) {
      const r = await run(
        db,
        "INSERT INTO conversations (buyer_id, created_at, updated_at) VALUES (?, ?, ?)",
        buyerId,
        getSystemTimeISO(),
        getSystemTimeISO()
      );
      convId = r.meta.last_row_id;
      convMap.set(buyerId, convId);
    }
    await run(
      db,
      `INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer, read_by_admin, created_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?)`,
      convId,
      m.sender_type,
      m.content,
      m.read_by_buyer ? 1 : 0,
      m.read_by_admin ? 1 : 0,
      m.created_at || getSystemTimeISO()
    );
    stats.messages++;
  }
  for (const [k, v] of Object.entries(siteSettings)) {
    await run(db, "INSERT INTO site_settings (key, value) VALUES (?, ?)", k, String(v ?? ""));
    stats.site_settings++;
  }
  for (const s of profitSales) {
    await run(
      db,
      `INSERT INTO profit_sales (product_id, product_code, custom_code, product_name, product_image, cost_price, sale_price, profit, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.product_id,
      s.product_code || "",
      s.custom_code || "",
      s.product_name,
      s.product_image || "",
      s.cost_price,
      s.sale_price,
      s.profit,
      s.created_at || getSystemTimeISO(),
      s.updated_at || getSystemTimeISO()
    );
    stats.profit_sales++;
  }
  for (const [url, file] of Object.entries(uploadFiles)) {
    if (!urlToKey(url) || !file?.data) continue;
    await putBase64File(env2, url, file.data, file.contentType);
    stats.upload_files++;
  }
  await loadSystemTimeOffset(db);
  return stats;
}
__name(restoreBackup, "restoreBackup");
function formatRestoreMessage(stats) {
  return `\u6062\u590D\u5B8C\u6210\uFF1A\u4E70\u5BB6 ${stats.buyers}\uFF0C\u5546\u54C1 ${stats.products}\uFF0C\u8BA2\u5355 ${stats.orders}\uFF0C\u56FE\u7247 ${stats.upload_files}`;
}
__name(formatRestoreMessage, "formatRestoreMessage");

// worker/src/routes/admin.js
var admin = new Hono2();
admin.post("/login", async (c) => {
  const { username, password } = await c.req.json();
  const row = await one(c.env.DB, "SELECT * FROM admins WHERE username = ?", username);
  if (!row || !import_bcryptjs2.default.compareSync(password, row.password_hash)) {
    return c.json({ error: "\u7528\u6237\u540D\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  const token = await signToken(c.env, { id: row.id, username: row.username, role: "admin" });
  return c.json({ token, admin: { id: row.id, username: row.username } });
});
admin.get("/me", adminAuth, async (c) => {
  const row = await one(c.env.DB, "SELECT id, username, created_at FROM admins WHERE id = ?", c.get("admin").id);
  return c.json(row);
});
admin.put("/password", adminAuth, async (c) => {
  const { oldPassword, newPassword, confirmPassword } = await c.req.json();
  try {
    assertPasswordMatch(newPassword, confirmPassword);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const row = await one(c.env.DB, "SELECT * FROM admins WHERE id = ?", c.get("admin").id);
  if (!import_bcryptjs2.default.compareSync(oldPassword, row.password_hash)) return c.json({ error: "\u539F\u5BC6\u7801\u9519\u8BEF" }, 400);
  if (import_bcryptjs2.default.compareSync(newPassword, row.password_hash)) return c.json({ error: "\u65B0\u5BC6\u7801\u4E0D\u80FD\u4E0E\u539F\u5BC6\u7801\u76F8\u540C" }, 400);
  await run(c.env.DB, "UPDATE admins SET password_hash = ? WHERE id = ?", import_bcryptjs2.default.hashSync(newPassword, 10), row.id);
  return c.json({ message: "\u5BC6\u7801\u4FEE\u6539\u6210\u529F" });
});
admin.put("/username", adminAuth, async (c) => {
  const { username, password } = await c.req.json();
  const newUsername = String(username || "").trim();
  if (!newUsername || !password) return c.json({ error: "\u8BF7\u586B\u5199\u65B0\u7528\u6237\u540D\u548C\u5F53\u524D\u5BC6\u7801" }, 400);
  const row = await one(c.env.DB, "SELECT * FROM admins WHERE id = ?", c.get("admin").id);
  if (!row || !import_bcryptjs2.default.compareSync(password, row.password_hash)) return c.json({ error: "\u5F53\u524D\u5BC6\u7801\u9519\u8BEF" }, 400);
  if (newUsername === row.username) return c.json({ error: "\u65B0\u7528\u6237\u540D\u4E0E\u5F53\u524D\u7528\u6237\u540D\u76F8\u540C" }, 400);
  const exists = await one(c.env.DB, "SELECT id FROM admins WHERE username = ? AND id != ?", newUsername, row.id);
  if (exists) return c.json({ error: "\u7528\u6237\u540D\u5DF2\u5B58\u5728" }, 400);
  await run(c.env.DB, "UPDATE admins SET username = ? WHERE id = ?", newUsername, row.id);
  const token = await signToken(c.env, { id: row.id, username: newUsername, role: "admin" });
  return c.json({ message: "\u7528\u6237\u540D\u4FEE\u6539\u6210\u529F", token, admin: { id: row.id, username: newUsername } });
});
admin.get("/list", adminAuth, async (c) => {
  return c.json(await all(c.env.DB, "SELECT id, username, created_at FROM admins ORDER BY id"));
});
admin.post("/create", adminAuth, async (c) => {
  const { username, password } = await c.req.json();
  if (!username || !password) return c.json({ error: "\u8BF7\u586B\u5199\u7528\u6237\u540D\u548C\u5BC6\u7801" }, 400);
  const exists = await one(c.env.DB, "SELECT id FROM admins WHERE username = ?", username);
  if (exists) return c.json({ error: "\u7528\u6237\u540D\u5DF2\u5B58\u5728" }, 400);
  const result = await run(c.env.DB, "INSERT INTO admins (username, password_hash) VALUES (?, ?)", username, import_bcryptjs2.default.hashSync(password, 10));
  return c.json({ id: result.meta.last_row_id, username });
});
admin.delete("/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  if (id === c.get("admin").id) return c.json({ error: "\u4E0D\u80FD\u5220\u9664\u5F53\u524D\u767B\u5F55\u7684\u7BA1\u7406\u5458" }, 400);
  const count3 = await one(c.env.DB, "SELECT COUNT(*) AS c FROM admins");
  if ((count3?.c || 0) <= 1) return c.json({ error: "\u81F3\u5C11\u4FDD\u7559\u4E00\u4E2A\u7BA1\u7406\u5458" }, 400);
  await run(c.env.DB, "DELETE FROM admins WHERE id = ?", id);
  return c.json({ message: "\u5220\u9664\u6210\u529F" });
});
admin.post("/reset-data", adminAuth, async (c) => {
  const { confirm } = await c.req.json();
  if (confirm !== "RESET") return c.json({ error: "\u8BF7\u5728\u786E\u8BA4\u6846\u4E2D\u8F93\u5165 RESET \u4EE5\u786E\u8BA4\u91CD\u7F6E" }, 400);
  await resetAllData(c.env.DB);
  return c.json({ message: "\u6570\u636E\u5DF2\u91CD\u7F6E\u4E3A\u521D\u59CB\u72B6\u6001\uFF0C\u8BF7\u4F7F\u7528 admin / 123456 \u91CD\u65B0\u767B\u5F55" });
});
admin.get("/profit/summary", adminAuth, async (c) => c.json(await getProfitSummary(c.env.DB)));
admin.get("/profit/available", adminAuth, async (c) => {
  const q = String(c.req.query("q") || "").trim();
  const clauses = ["stock > 0"];
  const params = [];
  if (q) {
    const pattern = `%${q}%`;
    clauses.push("(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    params.push(pattern, pattern, pattern, `%${q}%`);
  }
  const rows = await all(c.env.DB, `SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${PRODUCT_LIST_ORDER}`, ...params);
  return c.json(rows.map(formatProduct));
});
admin.get("/profit/sales", adminAuth, async (c) => {
  return c.json(await listProfitSales(c.env.DB, c.req.query("q") || ""));
});
admin.post("/profit/sell", adminAuth, async (c) => {
  try {
    return c.json(await sellProfitProduct(c.env.DB, await c.req.json()));
  } catch (err) {
    return c.json({ error: err.message || "\u5356\u51FA\u5931\u8D25" }, 400);
  }
});
admin.put("/profit/sales/:id", adminAuth, async (c) => {
  try {
    return c.json(await updateProfitSale(c.env.DB, c.req.param("id"), await c.req.json()));
  } catch (err) {
    return c.json({ error: err.message || "\u66F4\u65B0\u5931\u8D25" }, 400);
  }
});
admin.delete("/profit/sales/:id", adminAuth, async (c) => {
  try {
    return c.json(await revokeProfitSale(c.env.DB, c.req.param("id")));
  } catch (err) {
    return c.json({ error: err.message || "\u64A4\u56DE\u5931\u8D25" }, 400);
  }
});
admin.get("/backup/json", adminAuth, async (c) => {
  const backup = await exportBackup(c.env);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="shop-backup-${Date.now()}.json"`
    }
  });
});
admin.get("/backup/images", adminAuth, async (c) => {
  return c.json({
    message: "Cloudflare \u90E8\u7F72\u8BF7\u4F7F\u7528\u300C\u5BFC\u51FA JSON\u300D\uFF08\u5DF2\u542B R2 \u56FE\u7247 base64\uFF09\u3002\u7CFB\u7EDF zip \u5907\u4EFD\u5728 Worker \u4E0A\u4E0D\u53EF\u7528\u3002",
    tip: "Use GET /api/admin/backup/json"
  }, 501);
});
admin.post("/restore", adminAuth, async (c) => {
  try {
    const result = await restoreBackup(c.env, await c.req.json());
    return c.json({ message: formatRestoreMessage(result), ...result });
  } catch (err) {
    return c.json({ error: err.message || "\u6062\u590D\u5931\u8D25" }, 400);
  }
});
admin.post("/restore-file", adminAuth, async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.backup;
    if (!file || typeof file === "string") return c.json({ error: "\u8BF7\u9009\u62E9 .json \u5907\u4EFD\u6587\u4EF6" }, 400);
    let text = await file.text();
    if (text.charCodeAt(0) === 65279) text = text.slice(1);
    const backup = JSON.parse(text);
    const result = await restoreBackup(c.env, backup);
    return c.json({ message: formatRestoreMessage(result), ...result });
  } catch (err) {
    const message2 = err instanceof SyntaxError ? "\u6587\u4EF6\u4E0D\u662F\u6709\u6548\u7684 JSON \u683C\u5F0F\uFF0C\u8BF7\u4F7F\u7528\u300C\u5BFC\u51FA JSON\u300D\u751F\u6210\u7684\u6587\u4EF6" : err.message || "\u6062\u590D\u5931\u8D25";
    return c.json({ error: message2 }, 400);
  }
});
admin.post("/restore-images", adminAuth, async (c) => {
  return c.json({
    error: "Worker \u73AF\u5883\u8BF7\u4F7F\u7528\u542B upload_files \u7684 JSON \u5907\u4EFD\u6062\u590D\u56FE\u7247\uFF0C\u4E0D\u518D\u652F\u6301 zip \u89E3\u538B\u3002"
  }, 501);
});
var admin_default = admin;

// worker/src/routes/buyers.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var import_bcryptjs3 = __toESM(require_bcrypt(), 1);
init_db();

// worker/src/utils/buyerPassword.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var WEAK_SUFFIXES = ["12345678", "1234567", "123456789"];
var WEAK_PATTERN = new RegExp(`^[a-zA-Z](${WEAK_SUFFIXES.join("|")})$`);
var BUYER_PASSWORD_SIMPLE_MSG = "\u5BC6\u7801\u8FC7\u4E8E\u7B80\u5355\uFF0C\u8BF7\u91CD\u65B0\u8BBE\u7F6E\uFF01";
function validateBuyerPassword(password) {
  if (!password || typeof password !== "string") throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
  if (password.length < 8) throw new Error("\u5BC6\u7801\u987B\u81F3\u5C118\u4F4D\uFF0C\u4E14\u540C\u65F6\u5305\u542B\u5B57\u6BCD\u548C\u6570\u5B57");
  if (/^\d+$/.test(password)) throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("\u5BC6\u7801\u987B\u81F3\u5C118\u4F4D\uFF0C\u4E14\u540C\u65F6\u5305\u542B\u5B57\u6BCD\u548C\u6570\u5B57");
  }
  if (WEAK_PATTERN.test(password)) throw new Error(BUYER_PASSWORD_SIMPLE_MSG);
}
__name(validateBuyerPassword, "validateBuyerPassword");

// worker/src/routes/buyers.js
var buyers = new Hono2();
var BUYER_PROFILE_FIELDS = `
  id, email, tokens, is_muted, created_at,
  default_contact_name, default_contact_email, default_address, default_phone
`;
function formatBuyerProfile(row) {
  if (!row) return row;
  return {
    id: row.id,
    email: row.email,
    tokens: row.tokens ?? 0,
    is_muted: !!row.is_muted,
    created_at: row.created_at,
    default_contact_name: row.default_contact_name || "",
    default_contact_email: row.default_contact_email || "",
    default_address: row.default_address || "",
    default_phone: row.default_phone || ""
  };
}
__name(formatBuyerProfile, "formatBuyerProfile");
buyers.post("/register", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "\u8BF7\u586B\u5199\u90AE\u7BB1\u548C\u5BC6\u7801" }, 400);
  try {
    validateBuyerPassword(password);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const exists = await one(c.env.DB, "SELECT id FROM buyers WHERE email = ?", email);
  if (exists) return c.json({ error: "\u8BE5\u90AE\u7BB1\u5DF2\u88AB\u6CE8\u518C\uFF0C\u8BF7\u66F4\u6362\u90AE\u7BB1" }, 400);
  const hash = import_bcryptjs3.default.hashSync(password, 10);
  const result = await run(c.env.DB, "INSERT INTO buyers (email, password_hash) VALUES (?, ?)", email, hash);
  const id = result.meta.last_row_id;
  const token = await signToken(c.env, { id, email, role: "buyer" });
  return c.json({ token, buyer: { id, email, tokens: 0 } });
});
buyers.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) return c.json({ error: "\u8BF7\u586B\u5199\u90AE\u7BB1\u548C\u5BC6\u7801" }, 400);
  const buyer = await one(c.env.DB, "SELECT * FROM buyers WHERE email = ?", email);
  if (!buyer || !import_bcryptjs3.default.compareSync(password, buyer.password_hash)) {
    return c.json({ error: "\u90AE\u7BB1\u6216\u5BC6\u7801\u9519\u8BEF" }, 401);
  }
  const token = await signToken(c.env, { id: buyer.id, email: buyer.email, role: "buyer" });
  return c.json({
    token,
    buyer: { id: buyer.id, email: buyer.email, tokens: buyer.tokens, is_muted: buyer.is_muted }
  });
});
buyers.get("/me", buyerAuth, async (c) => {
  const buyer = await one(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`, c.get("buyer").id);
  return c.json(formatBuyerProfile(buyer));
});
buyers.put("/me/address", buyerAuth, async (c) => {
  const { contact_name, contact_email, address, phone } = await c.req.json();
  if (!contact_name?.trim() || !contact_email?.trim() || !address?.trim() || !phone?.trim()) {
    return c.json({ error: "\u8BF7\u586B\u5199\u5B8C\u6574\u7684\u9ED8\u8BA4\u6536\u8D27\u4FE1\u606F" }, 400);
  }
  await run(c.env.DB, `
    UPDATE buyers SET default_contact_name = ?, default_contact_email = ?, default_address = ?, default_phone = ?
    WHERE id = ?
  `, contact_name.trim(), contact_email.trim(), address.trim(), phone.trim(), c.get("buyer").id);
  const buyer = await one(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE id = ?`, c.get("buyer").id);
  return c.json({ message: "\u9ED8\u8BA4\u6536\u8D27\u5730\u5740\u5DF2\u4FDD\u5B58", buyer: formatBuyerProfile(buyer) });
});
buyers.put("/me/email", buyerAuth, async (c) => {
  const { email, password } = await c.req.json();
  if (!email?.trim() || !password) return c.json({ error: "\u8BF7\u586B\u5199\u65B0\u90AE\u7BB1\u548C\u5F53\u524D\u5BC6\u7801" }, 400);
  const newEmail = email.trim();
  const buyer = await one(c.env.DB, "SELECT * FROM buyers WHERE id = ?", c.get("buyer").id);
  if (!buyer || !import_bcryptjs3.default.compareSync(password, buyer.password_hash)) {
    return c.json({ error: "\u5F53\u524D\u5BC6\u7801\u9519\u8BEF" }, 400);
  }
  if (newEmail === buyer.email) return c.json({ error: "\u65B0\u90AE\u7BB1\u4E0E\u5F53\u524D\u90AE\u7BB1\u76F8\u540C" }, 400);
  const exists = await one(c.env.DB, "SELECT id FROM buyers WHERE email = ?", newEmail);
  if (exists) return c.json({ error: "\u8BE5\u90AE\u7BB1\u5DF2\u88AB\u4F7F\u7528" }, 400);
  await run(c.env.DB, "UPDATE buyers SET email = ? WHERE id = ?", newEmail, buyer.id);
  const token = await signToken(c.env, { id: buyer.id, email: newEmail, role: "buyer" });
  return c.json({ message: "\u90AE\u7BB1\u4FEE\u6539\u6210\u529F", token, buyer: { id: buyer.id, email: newEmail } });
});
buyers.put("/me/password", buyerAuth, async (c) => {
  const { oldPassword, newPassword, confirmPassword } = await c.req.json();
  try {
    assertPasswordMatch(newPassword, confirmPassword);
    validateBuyerPassword(newPassword);
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
  const buyer = await one(c.env.DB, "SELECT * FROM buyers WHERE id = ?", c.get("buyer").id);
  if (!buyer || !import_bcryptjs3.default.compareSync(oldPassword, buyer.password_hash)) {
    return c.json({ error: "\u539F\u5BC6\u7801\u9519\u8BEF" }, 400);
  }
  await run(c.env.DB, "UPDATE buyers SET password_hash = ? WHERE id = ?", import_bcryptjs3.default.hashSync(newPassword, 10), buyer.id);
  return c.json({ message: "\u5BC6\u7801\u4FEE\u6539\u6210\u529F" });
});
buyers.get("/admin/list", adminAuth, async (c) => {
  const q = String(c.req.query("q") || "").trim();
  let rows;
  if (q) {
    rows = await all(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers WHERE email LIKE ? ORDER BY id DESC`, `%${q}%`);
  } else {
    rows = await all(c.env.DB, `SELECT ${BUYER_PROFILE_FIELDS} FROM buyers ORDER BY id DESC`);
  }
  return c.json(rows.map(formatBuyerProfile));
});
buyers.get("/admin/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const buyer = await one(c.env.DB, "SELECT * FROM buyers WHERE id = ?", id);
  if (!buyer) return c.json({ error: "\u4E70\u5BB6\u4E0D\u5B58\u5728" }, 404);
  return c.json(buyer);
});
buyers.delete("/admin/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const conv = await one(c.env.DB, "SELECT id FROM conversations WHERE buyer_id = ?", id);
  if (conv) {
    await run(c.env.DB, "DELETE FROM messages WHERE conversation_id = ?", conv.id);
    await run(c.env.DB, "DELETE FROM conversations WHERE id = ?", conv.id);
  }
  await run(c.env.DB, "DELETE FROM comments WHERE buyer_id = ?", id);
  await run(c.env.DB, "DELETE FROM reviews WHERE buyer_id = ?", id);
  await run(c.env.DB, "DELETE FROM cart_items WHERE buyer_id = ?", id);
  await run(c.env.DB, "DELETE FROM orders WHERE buyer_id = ?", id);
  await run(c.env.DB, "DELETE FROM buyers WHERE id = ?", id);
  return c.json({ message: "\u4E70\u5BB6\u5DF2\u5220\u9664" });
});
buyers.put("/admin/:id/reset-password", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await run(c.env.DB, "UPDATE buyers SET password_hash = ? WHERE id = ?", import_bcryptjs3.default.hashSync("123456", 10), id);
  return c.json({ message: "\u5BC6\u7801\u5DF2\u91CD\u7F6E\u4E3A 123456" });
});
buyers.put("/admin/:id/mute", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { muted } = await c.req.json();
  await run(c.env.DB, "UPDATE buyers SET is_muted = ? WHERE id = ?", muted ? 1 : 0, id);
  return c.json({ message: muted ? "\u5DF2\u7981\u8A00" : "\u5DF2\u89E3\u9664\u7981\u8A00" });
});
buyers.put("/admin/:id/tokens", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { tokens } = await c.req.json();
  const n = Number(tokens);
  if (!Number.isFinite(n) || n < 0) return c.json({ error: "\u65E0\u6548\u4EE3\u5E01\u6570\u91CF" }, 400);
  await run(c.env.DB, "UPDATE buyers SET tokens = ? WHERE id = ?", n, id);
  return c.json({ message: "\u4EE3\u5E01\u5DF2\u66F4\u65B0" });
});
var buyers_default = buyers;

// worker/src/routes/products.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var products = new Hono2();
function buildListOrder(sort = "", priceMin = "", priceMax = "") {
  if (sort === "price_asc") return "price ASC, sort_order ASC, id DESC";
  if (sort === "price_desc") return "price DESC, sort_order ASC, id DESC";
  if (priceMin !== "" || priceMax !== "") return "price ASC, sort_order ASC, id DESC";
  return PRODUCT_LIST_ORDER;
}
__name(buildListOrder, "buildListOrder");
async function ensureSearchCodeAvailable(db, code, excludeId = null) {
  if (!code) return;
  const row = excludeId ? await one(db, "SELECT id FROM products WHERE search_code = ? AND id != ?", code, excludeId) : await one(db, "SELECT id FROM products WHERE search_code = ?", code);
  if (row) throw new Error("\u81EA\u5B9A\u4E49\u7F16\u7801\u5DF2\u88AB\u4F7F\u7528");
}
__name(ensureSearchCodeAvailable, "ensureSearchCodeAvailable");
products.get("/", async (c) => {
  const { sort = "", priceMin = "", priceMax = "" } = c.req.query();
  const clauses = ["status = 'active'"];
  const params = [];
  if (priceMin !== "") {
    clauses.push("price >= ?");
    params.push(parseFloat(priceMin));
  }
  if (priceMax !== "") {
    clauses.push("price <= ?");
    params.push(parseFloat(priceMax));
  }
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const rows = await all(c.env.DB, `SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${orderBy}`, ...params);
  return c.json(rows.map(formatProduct));
});
products.get("/search", async (c) => {
  const q = String(c.req.query("q") || "").trim();
  if (!q) return c.json([]);
  const pattern = `%${q}%`;
  const rows = await all(c.env.DB, `
    SELECT * FROM products WHERE status = 'active' AND (
      name LIKE ? OR description LIKE ? OR product_code LIKE ? OR search_code LIKE ?
    ) ORDER BY ${PRODUCT_LIST_ORDER}
  `, pattern, pattern, pattern, pattern);
  return c.json(rows.map(formatProduct));
});
products.get("/admin/all", adminAuth, async (c) => {
  const { sort = "", priceMin = "", priceMax = "", q = "" } = c.req.query();
  const clauses = [];
  const params = [];
  if (priceMin !== "") {
    clauses.push("price >= ?");
    params.push(parseFloat(priceMin));
  }
  if (priceMax !== "") {
    clauses.push("price <= ?");
    params.push(parseFloat(priceMax));
  }
  if (q.trim()) {
    const pattern = `%${q.trim()}%`;
    clauses.push("(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    params.push(pattern, pattern, pattern, `%${q.trim()}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orderBy = buildListOrder(String(sort), priceMin, priceMax);
  const rows = await all(c.env.DB, `SELECT * FROM products ${where} ORDER BY ${orderBy}`, ...params);
  return c.json(rows.map(formatProduct));
});
products.get("/admin/available", adminAuth, async (c) => {
  const q = String(c.req.query("q") || "").trim();
  const clauses = ["stock > 0"];
  const params = [];
  if (q) {
    const pattern = `%${q}%`;
    clauses.push("(name LIKE ? OR product_code LIKE ? OR search_code LIKE ? OR CAST(id AS TEXT) LIKE ?)");
    params.push(pattern, pattern, pattern, `%${q}%`);
  }
  const rows = await all(c.env.DB, `SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${PRODUCT_LIST_ORDER}`, ...params);
  return c.json(rows.map(formatProduct));
});
products.put("/sort/zero-stock-to-bottom", adminAuth, async (c) => {
  try {
    return c.json(await moveZeroStockToBottom(c.env.DB));
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});
products.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", id);
  if (!product || product.status !== "active") return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
  return c.json(formatProduct(product));
});
products.post("/", adminAuth, async (c) => {
  try {
    const body = await c.req.parseBody({ all: true });
    const name = String(body.name || "").trim();
    const description = String(body.description || "");
    const price = parseFloat(body.price);
    const stockNum = parseInt(body.stock, 10) || 0;
    const costPriceNum = parseFloat(body.cost_price) || 0;
    if (!name || !Number.isFinite(price)) return c.json({ error: "\u8BF7\u586B\u5199\u540D\u79F0\u548C\u4EF7\u683C" }, 400);
    if (stockNum < 0) return c.json({ error: "\u5E93\u5B58\u4E0D\u80FD\u4E3A\u8D1F\u6570" }, 400);
    let customCode = "";
    try {
      customCode = normalizeCustomProductCode(body.custom_code);
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
    await ensureSearchCodeAvailable(c.env.DB, customCode);
    const files = [].concat(body.images || []).filter((f) => f && typeof f === "object" && f.arrayBuffer);
    const images = [];
    for (const file of files.slice(0, 10)) {
      images.push(await putUpload(c.env, file, { folder: "products" }));
    }
    const image = images[0] || "";
    const productCode = await allocateProductCode(c.env.DB);
    const sortOrder = await nextProductSortOrder(c.env.DB);
    const result = await run(c.env.DB, `
      INSERT INTO products (product_code, custom_code, search_code, cost_price, name, description, price, image, image_preview, image_thumb, images, status, stock, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `, productCode, customCode, customCode, costPriceNum, name, description, price, image, image, image, JSON.stringify(images), stockNum, sortOrder);
    const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", result.meta.last_row_id);
    return c.json(formatProduct(product));
  } catch (err) {
    return c.json({ error: err.message || "\u521B\u5EFA\u5931\u8D25" }, 400);
  }
});
products.put("/:id", adminAuth, async (c) => {
  try {
    const id = parseInt(c.req.param("id"), 10);
    const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", id);
    if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
    const body = await c.req.parseBody({ all: true });
    const name = body.name !== void 0 ? String(body.name).trim() : product.name;
    const description = body.description !== void 0 ? String(body.description) : product.description;
    const price = body.price !== void 0 ? parseFloat(body.price) : product.price;
    const stockNum = body.stock !== void 0 ? parseInt(body.stock, 10) : product.stock;
    const costPriceNum = body.cost_price !== void 0 ? parseFloat(body.cost_price) : product.cost_price;
    if (!name || !Number.isFinite(price)) return c.json({ error: "\u8BF7\u586B\u5199\u540D\u79F0\u548C\u4EF7\u683C" }, 400);
    if (stockNum < 0) return c.json({ error: "\u5E93\u5B58\u4E0D\u80FD\u4E3A\u8D1F\u6570" }, 400);
    let customCode = product.search_code || product.custom_code || "";
    if (body.custom_code !== void 0) {
      try {
        customCode = normalizeCustomProductCode(body.custom_code);
      } catch (err) {
        return c.json({ error: err.message }, 400);
      }
      await ensureSearchCodeAvailable(c.env.DB, customCode, id);
    }
    let keepImages = parseProductImages(product);
    if (body.keep_images) {
      try {
        keepImages = JSON.parse(String(body.keep_images));
      } catch {
      }
    }
    const files = [].concat(body.images || []).filter((f) => f && typeof f === "object" && f.arrayBuffer);
    const newImages = [];
    for (const file of files.slice(0, 10)) {
      newImages.push(await putUpload(c.env, file, { folder: "products" }));
    }
    const images = [...keepImages, ...newImages];
    const oldImages = parseProductImages(product);
    const removed = oldImages.filter((u) => !images.includes(u));
    await deleteManyUploads(c.env, removed);
    const image = images[0] || "";
    await run(c.env.DB, `
      UPDATE products SET name = ?, description = ?, price = ?, custom_code = ?, search_code = ?, cost_price = ?,
        image = ?, image_preview = ?, image_thumb = ?, images = ?, stock = ? WHERE id = ?
    `, name, description, price, customCode, customCode, costPriceNum, image, image, image, JSON.stringify(images), stockNum, id);
    const updated = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", id);
    return c.json(formatProduct(updated));
  } catch (err) {
    return c.json({ error: err.message || "\u66F4\u65B0\u5931\u8D25" }, 400);
  }
});
products.put("/:id/stock", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { stock } = await c.req.json();
  const stockNum = parseInt(stock, 10);
  if (isNaN(stockNum) || stockNum < 0) return c.json({ error: "\u65E0\u6548\u5E93\u5B58" }, 400);
  await run(c.env.DB, "UPDATE products SET stock = ? WHERE id = ?", stockNum, id);
  return c.json({ message: "\u5E93\u5B58\u5DF2\u66F4\u65B0" });
});
products.delete("/:id/images", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { image_url } = await c.req.json();
  const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", id);
  if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
  const images = parseProductImages(product).filter((u) => u !== image_url);
  await deleteUpload(c.env, image_url);
  const image = images[0] || "";
  await run(
    c.env.DB,
    "UPDATE products SET image = ?, image_preview = ?, image_thumb = ?, images = ? WHERE id = ?",
    image,
    image,
    image,
    JSON.stringify(images),
    id
  );
  return c.json({ message: "\u56FE\u7247\u5DF2\u5220\u9664" });
});
products.put("/:id/sort", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { direction } = await c.req.json();
  if (!["up", "down"].includes(direction)) return c.json({ error: "\u65E0\u6548\u7684\u6392\u5E8F\u65B9\u5411" }, 400);
  try {
    return c.json(await moveProductSort(c.env.DB, id, direction));
  } catch (err) {
    return c.json({ error: err.message }, 400);
  }
});
products.put("/:id/status", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { status } = await c.req.json();
  if (!["active", "inactive"].includes(status)) return c.json({ error: "\u65E0\u6548\u7684\u72B6\u6001" }, 400);
  await run(c.env.DB, "UPDATE products SET status = ? WHERE id = ?", status, id);
  return c.json({ message: status === "active" ? "\u5546\u54C1\u5DF2\u4E0A\u67B6" : "\u5546\u54C1\u5DF2\u4E0B\u67B6" });
});
products.delete("/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ?", id);
  if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
  await deleteManyUploads(c.env, parseProductImages(product));
  await run(c.env.DB, "DELETE FROM comments WHERE product_id = ?", id);
  await run(c.env.DB, "DELETE FROM product_categories WHERE product_id = ?", id);
  await run(c.env.DB, "DELETE FROM products WHERE id = ?", id);
  return c.json({ message: "\u5546\u54C1\u5DF2\u5220\u9664" });
});
var products_default = products;

// worker/src/routes/orders.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_systemTime();
var orders = new Hono2();
orders.post("/", buyerAuth, async (c) => {
  try {
    const body = await c.req.json();
    const buyer = c.get("buyer");
    const result = await placeOrder(c.env.DB, {
      buyerId: buyer.id,
      productId: body.product_id,
      quantity: body.quantity,
      contact: {
        contact_email: body.contact_email,
        contact_name: body.contact_name,
        address: body.address,
        phone: body.phone
      }
    });
    const tokens = await one(c.env.DB, "SELECT tokens FROM buyers WHERE id = ?", buyer.id);
    return c.json({ ...result, tokens: tokens.tokens });
  } catch (err) {
    const mapped = orderErrorMessage(err);
    if (mapped) return c.json({ error: mapped.error }, mapped.status);
    return c.json({ error: err.message || "\u4E0B\u5355\u5931\u8D25" }, 400);
  }
});
orders.post("/checkout", buyerAuth, async (c) => {
  try {
    const body = await c.req.json();
    const buyer = c.get("buyer");
    const items = body.items || [];
    if (!items.length) return c.json({ error: "\u8D2D\u7269\u8F66\u4E3A\u7A7A" }, 400);
    const contact = {
      contact_email: body.contact_email,
      contact_name: body.contact_name,
      address: body.address,
      phone: body.phone
    };
    const created = [];
    for (const item of items) {
      created.push(await placeOrder(c.env.DB, {
        buyerId: buyer.id,
        productId: item.product_id,
        quantity: item.quantity,
        contact
      }));
    }
    await run(c.env.DB, "DELETE FROM cart_items WHERE buyer_id = ?", buyer.id);
    const tokens = await one(c.env.DB, "SELECT tokens FROM buyers WHERE id = ?", buyer.id);
    return c.json({ orders: created, tokens: tokens.tokens });
  } catch (err) {
    const mapped = orderErrorMessage(err);
    if (mapped) return c.json({ error: mapped.error }, mapped.status);
    return c.json({ error: err.message || "\u7ED3\u7B97\u5931\u8D25" }, 400);
  }
});
orders.get("/my", buyerAuth, async (c) => {
  const buyer = c.get("buyer");
  const rows = await all(c.env.DB, `
    ${ORDER_LIST_SELECT}
    FROM orders o JOIN products p ON o.product_id = p.id
    WHERE o.buyer_id = ?
    ORDER BY o.id DESC
  `, buyer.id);
  return c.json(rows.map(formatOrder));
});
orders.get("/admin/all", adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    ${ORDER_LIST_SELECT}, b.email AS buyer_email
    FROM orders o
    JOIN products p ON o.product_id = p.id
    JOIN buyers b ON o.buyer_id = b.id
    ORDER BY o.id DESC
  `);
  return c.json(rows.map(formatOrder));
});
orders.put("/:id/ship", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { shipping_number } = await c.req.json();
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ?", id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (order2.status !== "pending") return c.json({ error: "\u4EC5\u5F85\u53D1\u8D27\u8BA2\u5355\u53EF\u53D1\u8D27" }, 400);
  const { shippedAt, autoConfirmAt } = shippedTimestamps();
  await run(c.env.DB, `
    UPDATE orders SET status = 'shipped', shipping_number = ?, shipped_at = ?, auto_confirm_at = ?
    WHERE id = ?
  `, shipping_number || "", shippedAt, autoConfirmAt, id);
  return c.json({ message: "\u5DF2\u53D1\u8D27" });
});
orders.put("/:id/cancel", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ?", id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (["cancelled", "completed"].includes(order2.status)) {
    return c.json({ error: "\u8BE5\u8BA2\u5355\u4E0D\u53EF\u53D6\u6D88" }, 400);
  }
  await refundOrder(c.env.DB, order2);
  await run(c.env.DB, "UPDATE orders SET status = 'cancelled' WHERE id = ?", id);
  return c.json({ message: "\u8BA2\u5355\u5DF2\u53D6\u6D88\u5E76\u9000\u6B3E" });
});
orders.put("/:id/confirm", buyerAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const buyer = c.get("buyer");
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ? AND buyer_id = ?", id, buyer.id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (order2.status !== "shipped") return c.json({ error: "\u4EC5\u5DF2\u53D1\u8D27\u8BA2\u5355\u53EF\u786E\u8BA4\u6536\u8D27" }, 400);
  await run(c.env.DB, `
    UPDATE orders SET status = 'completed', confirmed_at = ? WHERE id = ?
  `, getSystemTimeISO(), id);
  return c.json({ message: "\u5DF2\u786E\u8BA4\u6536\u8D27" });
});
orders.post("/:id/return", buyerAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const buyer = c.get("buyer");
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ? AND buyer_id = ?", id, buyer.id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (!["shipped", "completed"].includes(order2.status)) {
    return c.json({ error: "\u5F53\u524D\u72B6\u6001\u4E0D\u53EF\u7533\u8BF7\u9000\u8D27" }, 400);
  }
  if (order2.return_status === "pending" || order2.return_status === "approved") {
    return c.json({ error: "\u5DF2\u6709\u9000\u8D27\u7533\u8BF7" }, 400);
  }
  const body = await c.req.parseBody({ all: true });
  const reason = String(body.reason || "").trim();
  if (!reason) return c.json({ error: "\u8BF7\u586B\u5199\u9000\u8D27\u539F\u56E0" }, 400);
  const files = [].concat(body.images || []).filter((f) => f && typeof f === "object" && f.arrayBuffer);
  const images = [];
  for (const file of files.slice(0, 5)) {
    images.push(await putUpload(c.env, file, { folder: "returns" }));
  }
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'pending', return_reason = ?, return_images = ?, return_reject_reason = ''
    WHERE id = ?
  `, reason, JSON.stringify(images), id);
  return c.json({ message: "\u9000\u8D27\u7533\u8BF7\u5DF2\u63D0\u4EA4" });
});
orders.put("/:id/return/approve", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ?", id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (order2.return_status !== "pending") return c.json({ error: "\u6CA1\u6709\u5F85\u5904\u7406\u7684\u9000\u8D27\u7533\u8BF7" }, 400);
  await refundOrder(c.env.DB, order2);
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'approved', status = 'cancelled' WHERE id = ?
  `, id);
  return c.json({ message: "\u5DF2\u540C\u610F\u9000\u8D27\u5E76\u9000\u6B3E" });
});
orders.put("/:id/return/reject", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { reason } = await c.req.json();
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ?", id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (order2.return_status !== "pending") return c.json({ error: "\u6CA1\u6709\u5F85\u5904\u7406\u7684\u9000\u8D27\u7533\u8BF7" }, 400);
  await run(c.env.DB, `
    UPDATE orders SET return_status = 'rejected', return_reject_reason = ? WHERE id = ?
  `, reason || "", id);
  return c.json({ message: "\u5DF2\u62D2\u7EDD\u9000\u8D27" });
});
var orders_default = orders;

// worker/src/routes/cart.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var cart = new Hono2();
cart.get("/", buyerAuth, async (c) => {
  const items = await all(c.env.DB, `
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.stock, p.image, p.status
    FROM cart_items c
    JOIN products p ON c.product_id = p.id
    WHERE c.buyer_id = ?
    ORDER BY c.id DESC
  `, c.get("buyer").id);
  return c.json(items.filter((i) => i.status === "active"));
});
cart.get("/count", buyerAuth, async (c) => {
  const row = await one(c.env.DB, `
    SELECT COALESCE(SUM(quantity), 0) AS count FROM cart_items WHERE buyer_id = ?
  `, c.get("buyer").id);
  return c.json({ count: row?.count || 0 });
});
cart.post("/", buyerAuth, async (c) => {
  const { product_id, quantity } = await c.req.json();
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ? AND status = ?", product_id, "active");
  if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728\u6216\u5DF2\u4E0B\u67B6" }, 404);
  if (product.stock <= 0) return c.json({ error: "\u5546\u54C1\u5DF2\u552E\u7F44" }, 400);
  const existing = await one(c.env.DB, "SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?", c.get("buyer").id, product_id);
  const newQty = existing ? existing.quantity + qty : qty;
  if (newQty > product.stock) return c.json({ error: `\u5E93\u5B58\u4E0D\u8DB3\uFF0C\u6700\u591A\u53EF\u6DFB\u52A0 ${product.stock} \u4EF6` }, 400);
  if (existing) {
    await run(c.env.DB, "UPDATE cart_items SET quantity = ? WHERE id = ?", newQty, existing.id);
  } else {
    await run(c.env.DB, "INSERT INTO cart_items (buyer_id, product_id, quantity) VALUES (?, ?, ?)", c.get("buyer").id, product_id, qty);
  }
  return c.json({ message: "\u5DF2\u52A0\u5165\u8D2D\u7269\u8F66" });
});
cart.put("/:productId", buyerAuth, async (c) => {
  const productId = parseInt(c.req.param("productId"), 10);
  const body = await c.req.json();
  const qty = Math.max(1, parseInt(body.quantity, 10) || 1);
  const product = await one(c.env.DB, "SELECT * FROM products WHERE id = ? AND status = ?", productId, "active");
  if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
  if (qty > product.stock) return c.json({ error: `\u5E93\u5B58\u4E0D\u8DB3\uFF0C\u6700\u591A ${product.stock} \u4EF6` }, 400);
  const item = await one(c.env.DB, "SELECT * FROM cart_items WHERE buyer_id = ? AND product_id = ?", c.get("buyer").id, productId);
  if (!item) return c.json({ error: "\u8D2D\u7269\u8F66\u4E2D\u6CA1\u6709\u8BE5\u5546\u54C1" }, 404);
  await run(c.env.DB, "UPDATE cart_items SET quantity = ? WHERE id = ?", qty, item.id);
  return c.json({ message: "\u5DF2\u66F4\u65B0\u6570\u91CF" });
});
cart.delete("/:productId", buyerAuth, async (c) => {
  const productId = parseInt(c.req.param("productId"), 10);
  await run(c.env.DB, "DELETE FROM cart_items WHERE buyer_id = ? AND product_id = ?", c.get("buyer").id, productId);
  return c.json({ message: "\u5DF2\u4ECE\u8D2D\u7269\u8F66\u79FB\u9664" });
});
cart.delete("/", buyerAuth, async (c) => {
  await run(c.env.DB, "DELETE FROM cart_items WHERE buyer_id = ?", c.get("buyer").id);
  return c.json({ message: "\u8D2D\u7269\u8F66\u5DF2\u6E05\u7A7A" });
});
var cart_default = cart;

// worker/src/routes/comments.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var comments = new Hono2();
comments.get("/product/:productId", async (c) => {
  const productId = parseInt(c.req.param("productId"), 10);
  const rows = await all(c.env.DB, `
    SELECT c.id, c.content, c.created_at, b.email AS buyer_email
    FROM comments c JOIN buyers b ON c.buyer_id = b.id
    WHERE c.product_id = ?
    ORDER BY c.id DESC
  `, productId);
  return c.json(rows);
});
comments.get("/admin/all", adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    SELECT c.*, b.email AS buyer_email, p.name AS product_name
    FROM comments c
    JOIN buyers b ON c.buyer_id = b.id
    JOIN products p ON c.product_id = p.id
    ORDER BY c.id DESC
  `);
  return c.json(rows);
});
comments.post("/", buyerAuth, async (c) => {
  const buyer = c.get("buyer");
  if (buyer.is_muted) return c.json({ error: "\u60A8\u5DF2\u88AB\u7981\u8A00" }, 403);
  const { product_id, content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: "\u8BF7\u586B\u5199\u7559\u8A00\u5185\u5BB9" }, 400);
  const product = await one(c.env.DB, "SELECT id FROM products WHERE id = ?", product_id);
  if (!product) return c.json({ error: "\u5546\u54C1\u4E0D\u5B58\u5728" }, 404);
  const result = await run(
    c.env.DB,
    "INSERT INTO comments (product_id, buyer_id, content) VALUES (?, ?, ?)",
    product_id,
    buyer.id,
    content.trim()
  );
  return c.json({ id: result.meta.last_row_id, message: "\u7559\u8A00\u6210\u529F" });
});
comments.delete("/:id", adminAuth, async (c) => {
  await run(c.env.DB, "DELETE FROM comments WHERE id = ?", parseInt(c.req.param("id"), 10));
  return c.json({ message: "\u5DF2\u5220\u9664" });
});
var comments_default = comments;

// worker/src/routes/reviews.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var reviews = new Hono2();
reviews.get("/product/:productId", async (c) => {
  const productId = parseInt(c.req.param("productId"), 10);
  const rows = await all(c.env.DB, `
    SELECT r.id, r.content, r.created_at, b.email AS buyer_email
    FROM reviews r JOIN buyers b ON r.buyer_id = b.id
    WHERE r.product_id = ?
    ORDER BY r.id DESC
  `, productId);
  return c.json(rows);
});
reviews.post("/", buyerAuth, async (c) => {
  const buyer = c.get("buyer");
  const { order_id, content } = await c.req.json();
  const order2 = await one(c.env.DB, "SELECT * FROM orders WHERE id = ? AND buyer_id = ?", order_id, buyer.id);
  if (!order2) return c.json({ error: "\u8BA2\u5355\u4E0D\u5B58\u5728" }, 404);
  if (order2.status !== "completed") return c.json({ error: "\u4EC5\u5DF2\u5B8C\u6210\u8BA2\u5355\u53EF\u8BC4\u4EF7" }, 400);
  const exists = await one(c.env.DB, "SELECT id FROM reviews WHERE order_id = ?", order_id);
  if (exists) return c.json({ error: "\u8BE5\u8BA2\u5355\u5DF2\u8BC4\u4EF7" }, 400);
  const result = await run(c.env.DB, `
    INSERT INTO reviews (order_id, product_id, buyer_id, content) VALUES (?, ?, ?, ?)
  `, order_id, order2.product_id, buyer.id, content || "");
  return c.json({ id: result.meta.last_row_id, message: "\u8BC4\u4EF7\u6210\u529F" });
});
reviews.get("/admin/all", adminAuth, async (c) => {
  const rows = await all(c.env.DB, `
    SELECT r.*, b.email AS buyer_email, p.name AS product_name
    FROM reviews r
    JOIN buyers b ON r.buyer_id = b.id
    JOIN products p ON r.product_id = p.id
    ORDER BY r.id DESC
  `);
  return c.json(rows);
});
reviews.delete("/:id", adminAuth, async (c) => {
  await run(c.env.DB, "DELETE FROM reviews WHERE id = ?", parseInt(c.req.param("id"), 10));
  return c.json({ message: "\u5DF2\u5220\u9664" });
});
var reviews_default = reviews;

// worker/src/routes/messages.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
init_systemTime();
var messages = new Hono2();
async function getOrCreateConversation(db, buyerId) {
  let conv = await one(db, "SELECT * FROM conversations WHERE buyer_id = ?", buyerId);
  if (!conv) {
    const r = await run(
      db,
      "INSERT INTO conversations (buyer_id, created_at, updated_at) VALUES (?, ?, ?)",
      buyerId,
      getSystemTimeISO(),
      getSystemTimeISO()
    );
    conv = { id: r.meta.last_row_id, buyer_id: buyerId };
  }
  return conv;
}
__name(getOrCreateConversation, "getOrCreateConversation");
messages.post("/", buyerAuth, async (c) => {
  const buyer = c.get("buyer");
  if (buyer.is_muted) return c.json({ error: "\u60A8\u5DF2\u88AB\u7981\u8A00" }, 403);
  const { content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: "\u8BF7\u8F93\u5165\u6D88\u606F\u5185\u5BB9" }, 400);
  const conv = await getOrCreateConversation(c.env.DB, buyer.id);
  await run(c.env.DB, `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_admin)
    VALUES (?, 'buyer', ?, ?, 0)
  `, conv.id, buyer.id, content.trim());
  await run(c.env.DB, "UPDATE conversations SET updated_at = ? WHERE id = ?", getSystemTimeISO(), conv.id);
  return c.json({ message: "\u53D1\u9001\u6210\u529F" });
});
messages.get("/my", buyerAuth, async (c) => {
  const buyer = c.get("buyer");
  const conv = await one(c.env.DB, "SELECT * FROM conversations WHERE buyer_id = ?", buyer.id);
  if (!conv) return c.json([]);
  await run(c.env.DB, `
    UPDATE messages SET read_by_buyer = 1
    WHERE conversation_id = ? AND sender_type = 'admin' AND read_by_buyer = 0
  `, conv.id);
  const rows = await all(c.env.DB, `
    SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC
  `, conv.id);
  return c.json(rows);
});
messages.get("/admin/notifications", adminAuth, async (c) => {
  const recent = await all(c.env.DB, `
    SELECT m.id, m.content, m.read_by_admin, m.created_at, b.email AS buyer_email, b.id AS buyer_id, c.id AS conversation_id
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    JOIN buyers b ON c.buyer_id = b.id
    WHERE m.sender_type = 'buyer'
    ORDER BY m.id DESC
    LIMIT 50
  `);
  const unread = await one(c.env.DB, `
    SELECT COUNT(*) AS c FROM messages WHERE sender_type = 'buyer' AND read_by_admin = 0
  `);
  return c.json({ messages: recent, unread_count: unread?.c || 0 });
});
messages.get("/admin/conversation/:buyerId", adminAuth, async (c) => {
  const buyerId = parseInt(c.req.param("buyerId"), 10);
  const conv = await getOrCreateConversation(c.env.DB, buyerId);
  await run(c.env.DB, `
    UPDATE messages SET read_by_admin = 1
    WHERE conversation_id = ? AND sender_type = 'buyer' AND read_by_admin = 0
  `, conv.id);
  const rows = await all(c.env.DB, "SELECT * FROM messages WHERE conversation_id = ? ORDER BY id ASC", conv.id);
  return c.json(rows);
});
messages.post("/admin/reply", adminAuth, async (c) => {
  const { buyer_id, content } = await c.req.json();
  if (!content?.trim()) return c.json({ error: "\u8BF7\u8F93\u5165\u56DE\u590D\u5185\u5BB9" }, 400);
  const conv = await getOrCreateConversation(c.env.DB, buyer_id);
  await run(c.env.DB, `
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, read_by_buyer)
    VALUES (?, 'admin', ?, ?, 0)
  `, conv.id, c.get("admin").id, content.trim());
  await run(c.env.DB, "UPDATE conversations SET updated_at = ? WHERE id = ?", getSystemTimeISO(), conv.id);
  return c.json({ message: "\u56DE\u590D\u6210\u529F" });
});
var messages_default = messages;

// worker/src/routes/site.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();

// worker/src/utils/aspectRatio.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
var DEFAULT_ASPECT_RATIO = "1:1";
function normalizeAspectRatio(value, fallback = DEFAULT_ASPECT_RATIO) {
  const raw2 = (value ?? fallback).toString().trim();
  const match2 = raw2.match(/^(\d+(?:\.\d+)?)\s*[:：/xX×]\s*(\d+(?:\.\d+)?)$/);
  if (!match2) throw new Error("\u5546\u54C1\u957F\u5BBD\u6BD4\u683C\u5F0F\u65E0\u6548\uFF0C\u8BF7\u4F7F\u7528\u5982 1:1\u30014:5 \u7684\u683C\u5F0F");
  const w = parseFloat(match2[1]);
  const h = parseFloat(match2[2]);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0 || w > 100 || h > 100) {
    throw new Error("\u5546\u54C1\u957F\u5BBD\u6BD4\u6570\u503C\u9700\u5728 0 \u5230 100 \u4E4B\u95F4");
  }
  return `${stripTrailingZero(w)}:${stripTrailingZero(h)}`;
}
__name(normalizeAspectRatio, "normalizeAspectRatio");
function stripTrailingZero(n) {
  return Number.isInteger(n) ? String(n) : String(parseFloat(n.toFixed(4)));
}
__name(stripTrailingZero, "stripTrailingZero");

// worker/src/routes/site.js
init_systemTime();
var site = new Hono2();
async function getSettingsMap(db) {
  const rows = await all(db, "SELECT key, value FROM site_settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
__name(getSettingsMap, "getSettingsMap");
async function upsertSetting(db, key, value) {
  await run(db, `
    INSERT INTO site_settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `, key, String(value ?? ""));
}
__name(upsertSetting, "upsertSetting");
site.get("/", async (c) => {
  const s = await getSettingsMap(c.env.DB);
  return c.json({
    site_name: s.site_name || "\u6211\u7684\u7F51\u5E97",
    site_icon: s.site_icon || "",
    footer_text: s.footer_text || "",
    home_title: s.home_title || "",
    home_subtitle: s.home_subtitle || "",
    product_aspect_ratio: s.product_aspect_ratio || "1:1",
    watermark_text: s.watermark_text || "",
    watermark_opacity: s.watermark_opacity || "0.20",
    watermark_spacing: s.watermark_spacing || "0.18",
    watermark_size: s.watermark_size || "0.045",
    watermark_pattern: s.watermark_pattern || "grid"
  });
});
site.get("/announcement", async (c) => {
  const s = await getSettingsMap(c.env.DB);
  if (s.announcement_enabled !== "1") {
    return c.json({ enabled: false });
  }
  return c.json({
    enabled: true,
    title: s.announcement_title || "",
    content: s.announcement_content || "",
    image: s.announcement_image || "",
    updated_at: s.announcement_updated_at || ""
  });
});
site.get("/admin", adminAuth, async (c) => {
  await loadSystemTimeOffset(c.env.DB);
  const s = await getSettingsMap(c.env.DB);
  return c.json({
    ...s,
    system_time: getSystemTimeISO(),
    system_time_offset_ms: s.system_time_offset_ms || "0"
  });
});
site.put("/announcement", adminAuth, async (c) => {
  const body = await c.req.parseBody();
  const enabled = body.enabled === "1" || body.enabled === "true" || body.enabled === true ? "1" : "0";
  await upsertSetting(c.env.DB, "announcement_enabled", enabled);
  await upsertSetting(c.env.DB, "announcement_title", body.title || "");
  await upsertSetting(c.env.DB, "announcement_content", body.content || "");
  await upsertSetting(c.env.DB, "announcement_updated_at", getSystemTimeISO());
  if (body.image && typeof body.image === "object" && body.image.arrayBuffer) {
    const s = await getSettingsMap(c.env.DB);
    if (s.announcement_image) await deleteUpload(c.env, s.announcement_image);
    const url = await putUpload(c.env, body.image, { folder: "site" });
    await upsertSetting(c.env.DB, "announcement_image", url);
  }
  if (body.clear_image === "1") {
    const s = await getSettingsMap(c.env.DB);
    if (s.announcement_image) await deleteUpload(c.env, s.announcement_image);
    await upsertSetting(c.env.DB, "announcement_image", "");
  }
  return c.json({ message: "\u516C\u544A\u5DF2\u66F4\u65B0" });
});
site.put("/", adminAuth, async (c) => {
  const body = await c.req.parseBody();
  const keys = [
    "site_name",
    "footer_text",
    "home_title",
    "home_subtitle",
    "watermark_text",
    "watermark_opacity",
    "watermark_spacing",
    "watermark_size",
    "watermark_pattern"
  ];
  for (const k of keys) {
    if (body[k] !== void 0) await upsertSetting(c.env.DB, k, body[k]);
  }
  if (body.product_aspect_ratio !== void 0) {
    try {
      await upsertSetting(c.env.DB, "product_aspect_ratio", normalizeAspectRatio(body.product_aspect_ratio));
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  }
  if (body.site_icon && typeof body.site_icon === "object" && body.site_icon.arrayBuffer) {
    const s = await getSettingsMap(c.env.DB);
    if (s.site_icon) await deleteUpload(c.env, s.site_icon);
    const url = await putUpload(c.env, body.site_icon, { folder: "site" });
    await upsertSetting(c.env.DB, "site_icon", url);
  }
  if (body.reset_system_time === "1") {
    await resetSystemTimeOffset(c.env.DB);
  } else if (body.system_datetime) {
    try {
      await setSystemTimeFromDate(c.env.DB, body.system_datetime);
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  }
  return c.json({ message: "\u7AD9\u70B9\u8BBE\u7F6E\u5DF2\u4FDD\u5B58" });
});
var site_default = site;

// worker/src/routes/categories.js
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_process();
init_virtual_unenv_global_polyfill_cloudflare_unenv_preset_node_console();
init_performance2();
init_db();
var categories = new Hono2();
categories.get("/", async (c) => {
  const rows = await all(c.env.DB, `
    SELECT c.*,
      (SELECT COUNT(*) FROM product_categories pc
       JOIN products p ON pc.product_id = p.id
       WHERE pc.category_id = c.id AND p.status = 'active') AS product_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.id ASC
  `);
  return c.json(rows);
});
categories.get("/admin/all", adminAuth, async (c) => {
  const cats = await all(c.env.DB, "SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
  for (const cat of cats) {
    const products2 = await all(c.env.DB, `
      SELECT p.* FROM products p
      JOIN product_categories pc ON p.id = pc.product_id
      WHERE pc.category_id = ?
      ORDER BY ${PRODUCT_LIST_ORDER}
    `, cat.id);
    cat.products = products2.map(formatProduct);
  }
  return c.json(cats);
});
categories.get("/:id/products", async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const rows = await all(c.env.DB, `
    SELECT p.* FROM products p
    JOIN product_categories pc ON p.id = pc.product_id
    WHERE pc.category_id = ? AND p.status = 'active'
    ORDER BY ${PRODUCT_LIST_ORDER}
  `, id);
  return c.json(rows.map(formatProduct));
});
categories.post("/", adminAuth, async (c) => {
  const { name, description, sort_order } = await c.req.json();
  if (!name?.trim()) return c.json({ error: "\u8BF7\u586B\u5199\u5206\u7C7B\u540D\u79F0" }, 400);
  const result = await run(c.env.DB, `
    INSERT INTO categories (name, description, sort_order) VALUES (?, ?, ?)
  `, name.trim(), description || "", parseInt(sort_order, 10) || 0);
  return c.json({ id: result.meta.last_row_id, message: "\u5206\u7C7B\u5DF2\u521B\u5EFA" });
});
categories.put("/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const { name, description, sort_order } = await c.req.json();
  if (!name?.trim()) return c.json({ error: "\u8BF7\u586B\u5199\u5206\u7C7B\u540D\u79F0" }, 400);
  await run(c.env.DB, `
    UPDATE categories SET name = ?, description = ?, sort_order = ? WHERE id = ?
  `, name.trim(), description || "", parseInt(sort_order, 10) || 0, id);
  return c.json({ message: "\u5206\u7C7B\u5DF2\u66F4\u65B0" });
});
categories.put("/:id/products", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  const cat = await one(c.env.DB, "SELECT id FROM categories WHERE id = ?", id);
  if (!cat) return c.json({ error: "\u5206\u7C7B\u4E0D\u5B58\u5728" }, 404);
  const { product_ids } = await c.req.json();
  const ids = Array.isArray(product_ids) ? product_ids.map((x) => parseInt(x, 10)).filter(Boolean) : [];
  await run(c.env.DB, "DELETE FROM product_categories WHERE category_id = ?", id);
  for (const pid2 of ids) {
    await run(c.env.DB, "INSERT OR IGNORE INTO product_categories (product_id, category_id) VALUES (?, ?)", pid2, id);
  }
  return c.json({ message: "\u5206\u7C7B\u5546\u54C1\u5DF2\u66F4\u65B0" });
});
categories.delete("/:id", adminAuth, async (c) => {
  const id = parseInt(c.req.param("id"), 10);
  await run(c.env.DB, "DELETE FROM product_categories WHERE category_id = ?", id);
  await run(c.env.DB, "DELETE FROM categories WHERE id = ?", id);
  return c.json({ message: "\u5206\u7C7B\u5DF2\u5220\u9664" });
});
var categories_default = categories;

// worker/src/index.js
var app = new Hono2();
app.use("*", cors());
app.use("/api/*", async (c, next) => {
  try {
    await ensureSeed(c.env.DB);
  } catch (err) {
    console.error("seed error", err);
  }
  await next();
});
app.route("/api/admin", admin_default);
app.route("/api/buyers", buyers_default);
app.route("/api/products", products_default);
app.route("/api/orders", orders_default);
app.route("/api/cart", cart_default);
app.route("/api/comments", comments_default);
app.route("/api/reviews", reviews_default);
app.route("/api/messages", messages_default);
app.route("/api/site", site_default);
app.route("/api/categories", categories_default);
app.get("/uploads/*", async (c) => {
  const path = c.req.path.replace(/^\/uploads\//, "");
  const key = urlToKey(`/uploads/${path}`) || path;
  const obj = await getUploadObject(c.env, key);
  if (!obj) return c.json({ error: "\u6587\u4EF6\u4E0D\u5B58\u5728" }, 404);
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=86400");
  return new Response(obj.body, { headers });
});
app.notFound((c) => {
  if (c.req.path.startsWith("/api/")) {
    return c.json({ error: "\u63A5\u53E3\u4E0D\u5B58\u5728" }, 404);
  }
  return c.env.ASSETS.fetch(c.req.raw);
});
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || "\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF" }, 500);
});
var index_default = {
  async fetch(request, env2, ctx) {
    return app.fetch(request, env2, ctx);
  },
  async scheduled(_event, env2, _ctx) {
    try {
      await ensureSeed(env2.DB);
      const n = await runAutoConfirmOrders(env2.DB);
      if (n) console.log(`Auto-confirmed ${n} orders`);
    } catch (err) {
      console.error("cron error", err);
    }
  }
};
export {
  index_default as default
};
/*! Bundled license information:

bcryptjs/dist/bcrypt.js:
  (**
   * @license bcrypt.js (c) 2013 Daniel Wirtz <dcode@dcode.io>
   * Released under the Apache License, Version 2.0
   * see: https://github.com/dcodeIO/bcrypt.js for details
   *)
*/
//# sourceMappingURL=index.js.map
