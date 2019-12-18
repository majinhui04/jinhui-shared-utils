import Qs from 'qs';

// 请求队列
class Queue {
    constructor(options = {}) {
        this.options = options;
        this.list = [];
    }

    // 根据url、method、data、params 生成唯一键值
    static getQueueUniqueId(config = {}) {
        let { data = null, params = null, method = '', url = '' } = config;
        let payload = null;
        if (['get', 'delete', 'head'].includes(method.toLowerCase())) {
            payload = params;
        } else {
            payload = data;
        }
        let res = '';
        if (typeof payload === 'string') {
            res = payload;
        } else {
            url = Queue.replace(url, payload || {});
            res = Qs.stringify(payload);
        }
        let uniqueKey = `${url}?method=${method}&${res}`;
        return uniqueKey;
    }

    static replace(path, options = {}) {
        let result = path;
        try {
            Object.keys(options).forEach(value => {
                path = path.replace(new RegExp(`{${value}}`, 'img'), options[value]);
            });
            result = path;
        } catch (e) {
            console.error(e);
        }
        return result;
    }

    cancel(config, message) {
        if (config) {
            let target = this.get(config);
            target && this._cancel(target, message);
            target && this.dequeue(target);
        } else {
            const list = this.list;
            for (let i = list.length - 1; i >= 0; i--) {
                const target = list[i];
                this._cancel(target, message);
                this.dequeue(target);
            }
        }
    }

    _cancel(target, message) {
        if (target) {
            typeof target.cancelToken === 'function' && target.cancelToken(message);
            target.cancelToken = null;
        }
    }

    // 获取目标
    get(config) {
        return this.list.filter(item => item.uuid === config.uuid)[0];
    }

    // 压入队列
    enqueue(target, message) {
        let options = this.options;
        let stopRepeatRequest = typeof target.stopRepeatRequest === 'boolean' ? target.stopRepeatRequest : options.stopRepeatRequest;
        let result = [];
        const list = this.list;
        for (let i = list.length - 1; i >= 0; i--) {
            const listItem = list[i];
            // 如果队列里有相同请求则取消
            if (listItem.id === target.id && stopRepeatRequest) {
                result.push(listItem);
            }
        }
        list.push(target);
        // 取消队列
        result.forEach(item => {
            this.cancel(item, message);
        });
    }

    // 移除目标，不指定则清空队列
    dequeue(config) {
        const list = this.list;
        this.log('准备移除队列', JSON.stringify(this.list));
        const uuid = config.uuid;
        for (let i = list.length - 1; i >= 0; i--) {
            const item = list[i];
            if (item.uuid === uuid) {
                this.log('移除队列成功', item.uuid);
                list.splice(i, 1);
                break;
            }
        }

    }

    log() {
        if (this.options.debug) {
            console.log.apply(this, arguments);
        }
    }

    error() {
        if (this.options.debug) {
            console.error.apply(this, arguments);
        }
    }

    warn() {
        if (this.options.debug) {
            console.warn.apply(this, arguments);
        }
    }
}

export default Queue;
