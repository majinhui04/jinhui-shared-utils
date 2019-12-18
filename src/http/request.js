import axios from 'axios';
import qs from 'qs';
import HttpError from './HttpError';
import {ResponseType, ContentType} from './Types';
import Queue from './queue';

const CancelToken = axios.CancelToken;

function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * 基于 axios 的 RESTful HTTP 简单封装
 * @module libs/http
 */
class HTTP {
    /**
     * 默认配置 参数请参阅`axios` http://www.axios-js.com/zh-cn/docs/
     * @type {AxiosRequestConfig}
     */
    static Default = {
        baseURL: '', // 接口基础地址
        timeout: 15000, // 超时时间 默认15000
        responseType: ResponseType.json, // 默认响应数据类型
        withCredentials: false, // 当前请求为跨域类型时是否在请求中协带cookie
        headers: {'Content-Type': ContentType.json}, // 默认请求数据类型
        paramsSerializer: function (params) {
            return qs.stringify(params, {arrayFormat: 'repeat'});
        }
    };
    // --------------------------------------------------------------------------
    //
    // Class constructor
    //
    // --------------------------------------------------------------------------

    /**
     * 构建 API 通信模块实例
     * @param {Object} [options]
     */
    constructor(options = {}) {
        let {
            api,
            debug,
            isTrim,
            getResponseSuccess,
            stopRepeatRequest,
            repeatInterval,
            HttpError,
            beforeRequest,
            afterRequest,
            handleRequest,
            handleError,
            handleSuccess,
            setHeaders,
            getHeaders,
            ...AxiosRequestConfig
        } = options;
        let MyRequestConfig = {
            debug,
            isTrim,
            getResponseSuccess,
            stopRepeatRequest,
            repeatInterval,
            HttpError,
            beforeRequest,
            afterRequest,
            handleRequest,
            handleError,
            handleSuccess,
            setHeaders,
            getHeaders
        };
        Object.keys(MyRequestConfig).forEach(name => {
            if (MyRequestConfig[name] !== undefined) {
                this[name] = MyRequestConfig[name]
            }
        });
        this._conf = Object.assign({}, HTTP.Default, AxiosRequestConfig);
        this._api = this.formatAPI(api);
        this._init();
    }

    _init() {
        const HttpError = this.HttpError;
        // 创建实例成员（不影响全局使用）
        this._axios = axios.create(this._conf);
        this._axios.interceptors.request.use(
            config => {
                this.log('[interceptors.request.config]', config);
                // 全局函数 handleRequest
                this.handleRequest && this.handleRequest(config);
                // 全局函数 setHeaders
                const headers = this.setHeaders && this.setHeaders(config);
                const payload = config.data || config.params || {};
                // todo 数据中包含$timeout则设置超时时间 兼容老版本
                const timeout = payload.$timeout;
                if (headers) {
                    config.headers = Object.assign(config.headers, headers || {});
                }
                if (timeout) {
                    config.timeout = timeout;
                }
                config.uuid = guid();
                // 创建取消函数
                config.cancelToken = new CancelToken(c => {
                    const id = Queue.getQueueUniqueId(config);
                    const item = {
                        stopRepeatRequest: config.stopRepeatRequest,
                        uuid: config.uuid,
                        id,
                        cancelToken: c
                    };
                    this.log('enqueue', item);
                    this._queue.enqueue(item, 'repeat');
                });
                return config;
            },
            error => {
                this.error('interceptors.request.error', error.message, error);
                Promise.reject(error);
            }
        );

        this._axios.interceptors.response.use(
            response => {
                let repeatInterval = response.config.repeatInterval || this.repeatInterval;
                // 将请求移除队列
                setTimeout(() => {
                    this._queue.dequeue(response.config);
                }, repeatInterval);

                return this._responseHandler(response);
            },
            error => {
                this.error('interceptors.response.error', error.message, error.config);
                // 将请求移除队列
                error && error.response && this._queue.dequeue(error.response.config);

                const errInfo = HttpError.info(error);
                return Promise.reject(errInfo);
            }
        );
        // 实例化队列
        this._queue = new Queue({
            debug: this.debug,
            HttpError: HttpError,
            stopRepeatRequest: this.stopRepeatRequest
        });
    }

    // --------------------------------------------------------------------------
    //
    // Class properties
    //
    // --------------------------------------------------------------------------
    /**
     * 配置信息
     * @type {AxiosRequestConfig}
     * @private
     */
    _conf = null;

    /**
     * 创建实例，不影响全局使用
     * @type {AxiosInstance}
     * @private
     */
    _axios = null;

    /**
     * 快捷的API函数
     * @type {Object}
     * @private
     */
    _api = [];

    /**
     * 是否对请求数据去空格
     * @type {boolean}
     */
    isTrim = true;
    /**
     * 是否允许重复请求
     * @type {boolean}
     */
    stopRepeatRequest = false;
    /**
     * 重复请求时间间隔
     * @type {number}
     */
    repeatInterval = 2000;
    /**
     * 是否打印调试信息
     * @type {boolean}
     * @private
     */
    debug = false;
    /**
     * 错误的对照map
     * @type {Object}
     * @private
     */
    HttpError = HttpError;

    // --------------------------------------------------------------------------
    //
    // Class methods
    //
    // --------------------------------------------------------------------------

    /**
     * 对象转 URL
     * @param {Object} obj 待转化对象
     * @return {string}
     */
    toURL(obj) {
        if (!obj || !Object.keys(obj).length) {
            return '';
        }

        return (
            '?' +
            Object.keys(obj)
                .map(key => `${key}=${encodeURIComponent(obj[key])}`)
                .join('&')
        );
    }

    /**
     * 路劲参数替换
     * @param {Object} options={} 路劲参数列表
     */
    replace(path, options = {}) {
        Object.keys(options).forEach(value => {
            path = path.replace(new RegExp(`{${value}}`, 'img'), options[value]);
        });
        return path;
    }

    /**
     * 请求前回调
     */
    beforeRequest() {
    }

    /**
     * 请求结果回调
     */
    afterRequest() {
    }

    /**
     * 请求中回调
     */
    handleRequest() {
    }

    /**
     * 请求错误回调
     */
    handleError(json) {
        // return Promise.reject(json);
    }

    /**
     * 请求成功回调
     */
    handleSuccess(json) {
        return Promise.resolve(json);
    }

    /**
     * 请求成功条件
     */
    getResponseSuccess(json) {
        return true;
    }

    /**
     * 设置请求头
     */
    setHeaders() {
    }

    /**
     * 获取请求头
     */
    getHeaders() {
    }

    /**
     * 取消所有请求（message 参数是可选的）
     * @param {String} [message] 做为请求失败时的返回信息
     */
    cancel() {
        this.log('取消队列', this._queue.list.length);
        this._queue.cancel(null, 'cancel');
    }

    /**
     * 统一API格式 [{ name, path, method, meta }]
     * @param {Object} [api]
     */
    formatAPI(source) {
        let result = [];
        let map = {};
        if (Array.isArray(source)) {
            source.forEach(item => {
                const {name = '', path = '', method = 'get', ...meta} = item;
                let api = {
                    name,
                    path,
                    method,
                    meta: {
                        ...meta
                    }
                };
                if (!api.name || !api.path) {
                    throw new Error('缺少name, path');
                }
                if (!map[api.name]) {
                    map[api.name] = 1;
                } else {
                    throw new Error('存在相同的name');
                }
                result.push(api)
            });
        } else if (Object.prototype.toString.call(source) === '[object Object]') {
            Object.keys(source).forEach(name => {
                let detail = source[name];
                let target = typeof detail === 'string' ? [detail] : detail;
                let path = target[0];
                let meta = {...target[1]};
                let method = meta.method || meta.methods || 'get';
                let api = {
                    name,
                    path,
                    method,
                    meta: {
                        ...meta
                    }
                };
                if (!api.name || !api.path) {
                    throw new Error('缺少name, path');
                }
                result.push(api);
            });
        }
        console.log('api', result);
        return result;
    }

    /**
     * 创建API
     * @param {Array}
     * @return {Object}
     */
    toAPI(Urls) {
        let list = this.formatAPI(Urls);
        const $api = {};
        const self = this;
        list.forEach(api => {
            const {path, name, method = 'get', meta = {}} = api;
            $api[name] = function (payload = {}, config = {}) {
                let options = {...meta, ...config};
                return self[method](path, payload, options);
            };
        });
        return $api;
    }

    // 去除数据中的空格
    trimData(target) {
        if (target) {
            for (let key in target) {
                if (target.hasOwnProperty(key) && typeof target[key] === 'string') {
                    target[key] = target[key].replace(/^\s+|\s+$/gm, '');
                }
            }
        }
        return target;

    }

    /**
     * 请求
     * @param {Object} [config={}] axios配置项以及自定义配置项
     * @return {Promise}
     */
    request(config = {}) {
        let methods = ['GET', 'HEAD', 'DELETE'];
        let _api = this._api || [];
        let isTrim = this.isTrim;
        let {url = '', payload = null, method = 'GET', params = null, data = null, ...$meta} = config;
        let target = _api.filter(item => item.name === url)[0];
        let path = target ? target.path : url;
        let meta = target ? Object.assign({}, $meta, target.meta || {}) : $meta;
        let options = {...meta};
        payload = payload || data || params || {};
        method = target ? target.method || 'GET' : method;
        if (methods.includes(method.toUpperCase())) {
            options.params = payload;
        } else {
            options.data = payload;
        }
        url = this.replace(path, payload);
        isTrim && this.trimData(options.params);
        isTrim && this.trimData(options.data);
        options.url = url;
        options.method = method;
        this.log('request原装参数', JSON.stringify(config));
        this.log('request最终参数', JSON.stringify(options));
        return new Promise((resolve, reject) => {
            this.beforeRequest({url, path, payload, meta});
            this._axios
                .request(options)
                .then(body => {
                    this.afterRequest({url, path, payload, meta, body});
                    resolve(body);
                })
                .catch(body => {
                    this.afterRequest({url, path, payload, meta, body});
                    reject(body);
                });
        }).then(body => {
            // 全局成功回调
            this.handleSuccess({body, path, url, payload, meta});
            return body;
        }).catch(body => {
            // 全局失败回调 人工cancel不作为错误处理
            if (body.name !== 'cancel') {
                this.handleError({body, path, url, payload, meta});
            }
            return Promise.reject(body);
        });
    }

    get(url, params = [], config = {}) {
        return this.request({method: 'GET', url, params, ...config});
    }

    head(url, params = [], config = {}) {
        return this.request({method: 'HEAD', url, params, ...config});
    }

    post(url, data = null, config = {}) {
        return this.request({method: 'POST', url, data, ...config});
    }

    put(url, data = null, config = {}) {
        return this.request({method: 'PUT', url, data, ...config});
    }

    patch(url, data = null, config = {}) {
        return this.request({method: 'PATCH', url, data, ...config});
    }

    delete(url, params = null, config = {}) {
        return this.request({method: 'DELETE', url, params, ...config});
    }

    // 请求并直接解析下载流文件
    download(url, payload = null, config = {}) {
        config.responseType = ResponseType.arraybuffer; // 因为有可能返回json错误
        return this.request({url, payload, ...config}).then(response => {
            if (response.headers) {
                let filename = response.headers['x-suggested-filename'];

                if (!filename) {
                    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    const matches = filenameRegex.exec(response.headers['content-disposition']);
                    if (matches != null && matches[1]) {
                        filename = matches[1].replace(/['"]/g, '');
                    }
                }

                if (filename) {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', decodeURIComponent(filename));
                    link.click();
                    window.URL.revokeObjectURL(url);

                    return {message: '下载成功'};
                } else {
                    return Promise.reject({name: 'download', message: '文件内容已损坏'});
                }
            } else {
                // 返回json
                return response;
            }
        });
    }

    /**
     *  结果处理
     */
    _responseHandler(response) {
        // 全局
        this.getHeaders && this.getHeaders(response);
        // 如果是流文件直接返回成功
        if (response.config.responseType === 'blob') {
            return Promise.resolve(response);
        }
        // 数据结果根据`content-type`来操作json数据以及文件流
        if (response.config.responseType === 'arraybuffer') {
            const headers = response.headers || {};
            const contentType = headers['content-type'] || '';
            const isJSON = contentType.indexOf('application/json') > -1;
            if (isJSON) {
                try {
                    const result = JSON.parse(Buffer.from(response.data).toString('utf8'));
                    if (this.getResponseSuccess(result)) {
                        return Promise.resolve(result);
                    } else {
                        return Promise.reject(result);
                    }
                } catch (e) {
                    return Promise.reject(e);
                }
            } else {
                // 流
                return Promise.resolve(response);
            }
        }
        // 正常json数据
        if (this.getResponseSuccess(response.data)) {
            return Promise.resolve(response.data);
        } else {
            return Promise.reject(response.data);
        }
    }

    // --------------------------------------------------------------------------
    //
    // Interceptor methods
    //
    // --------------------------------------------------------------------------

    /**
     * 批量注册拦截器
     * @param {InterceptorConfig[]} interceptors
     */
    batchUseInterceptor(interceptors) {
        interceptors.forEach(item => {
            const {type, interceptor, error} = item;
            this.useInterceptor(type, interceptor, error);
        });
    }

    /**
     * 注册拦截器
     * @param {String} type 注册类型（request / response）
     * @param {Function} fulfilled 处理函数（具体使用方法请参考 Axios 官方文档）
     * @param {Function} [rejected] 错误捕获处理函数
     * @return {Number} id 返回供注销时使用的唯一 id
     */
    useInterceptor(type, fulfilled, rejected = null) {
        const target = this._axios.interceptors[type];
        return target.use(fulfilled, rejected);
    }

    /**
     * 移除所有指定类型的拦截器
     * @param {String} type 注册类型（request / response）
     * @param {Number} [id] 移除指定的拦截器，未指定则移除全部拦截器
     */
    ejectInterceptor(type, id) {
        const target = this._axios.interceptors[type];
        const handlers = target['handlers'];

        // 通过 eject 方法注销拦截器，因其设计时用数组下标做为标记，不能打乱其排列顺序
        if (id instanceof Number && id < handlers.length) {
            target.eject(id);
        } else {
            handlers.forEach((interceptor, index) => {
                target.eject(index);
            });
        }
    }

    log() {
        if (this.debug) {
            console.log.apply(this, arguments);
        }
    }

    error() {
        if (this.debug) {
            console.error.apply(this, arguments);
        }
    }

    warn() {
        if (this.debug) {
            console.warn.apply(this, arguments);
        }
    }
}

export default HTTP;
