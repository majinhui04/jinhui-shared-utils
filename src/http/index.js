import Request from './request';
import HttpError from './HttpError';
import { ResponseType, ContentType } from './Types';

// 做为 Vue Plugin
function install(Vue, config) {
    Vue.http = new Request(config);
}

export {
    install,
    Request,
    HttpError,
    ResponseType,
    ContentType
};
