/**
 * 签名模块
 * @module libs/signature
 */
import moment from 'moment';
import MD5 from 'js-md5';
import qs from 'qs';

function object2Query(params) {
    return Object.keys(params)
        .map(function (key) {
            return key + '=' + encodeURIComponent(params[key]);
        })
        .join('&');
}

/**
 * 签名函数
 * @author 吴丞稷 <wuchengji@meeruu.com>
 * @param {object} data 请求参数
 * @param {method} method 请求方法
 * @returns {string} 签名结果
 */
function signature(data = {}, method = 'get') {
    // 添加签名
    let encryptionData = '';
    let date = `&date=${moment().format('YYYYMMDD')}`;
    if (method === 'get') {
        // 空对象
        if (!data || JSON.stringify(data) === '{}') {
            // 如果没有参数则是字符串加时间
            encryptionData = `hsjkak1200~@34455abcdefghijklmnopqrstuvwxyzZABHJKLS./@<?>sdtkan${date}`;
        } else {
            // 有参数就是参数+时间
            encryptionData = decodeURIComponent(object2Query(data)) + date;
        }
    } else {
        encryptionData = JSON.stringify(data) + date;
    }
    return MD5(encryptionData);
}

export default signature;
