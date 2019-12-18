/*
 "text"         response 是包含在 DOMString 对象中的文本。
 ""             将 responseType 设为空字符串与设置为"text"相同， 是默认类型 （实际上是 DOMString）。
 "arraybuffer"  response 是一个包含二进制数据的 JavaScript ArrayBuffer 。
 "blob"         response 是一个包含二进制数据的 Blob 对象 。
 "document"     response 是一个 HTML Document 或 XML XMLDocument，这取决于接收到的数据的 MIME 类型。请参阅 HTML in XMLHttpRequest 以了解使用 XHR 获取 HTML 内容的更多信息。
 "json"         response 是一个 JavaScript 对象。这个对象是通过将接收到的数据类型视为 JSON 解析得到的。（IE10/11不支持）
 */
const ResponseType = {
    text: 'text',
    json: 'json', // IE10/11 不支持该类型
    blob: 'blob',
    document: 'document',
    arraybuffer: 'arraybuffer'
};

const ContentType = {
    stream: 'application/octet-stream',
    json: 'application/json',
    form: 'application/x-www-form-urlencoded',
    formData: 'multipart/form-data',
    javascript: 'application/x-javascript'
};

export { ResponseType, ContentType };
