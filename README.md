## 简介
`sharegoods-utils`是一个前端的小工具集合，支出输出`commonjs`以及`umd`包,请使用`npm run doc`查看具体函数和类

## 功能

- [x] git日志工具
- [x] 接口签名
- [x] REST接口
- [ ] polyfill
- [ ] eslint
- [ ] less\sass编译

## 开发
```bash
# 下载代码
$ git clone http://git.mr.com/frontend/sharegoods-utils.git

# 开发、调试
$ npm run dev myLibrary

# 构建代码
$ npm run build myLibrary

# 登录 npm
$ npm login

# 发布包，请注意，如果非首次发布，需要修改 package.json 的版本字段 version
$ npm publish

```


## 使用

```bash
# 安装包
$ npm install --save sharegoods-utils
```

```js
// 引用 myLibrary
import myLibrary from 'sharegoods-utils/libs/myLibrary'

// 调用 myLibrary 的方法
myLibrary.someFunc()
```

## library 的命名规范
- 请在 src 目录下新建并开发你的 library，如案例的 urlParams 文件夹，其中 index.js 为入口文件；
- 如果暴露的是个类或构造函数，请用大驼峰命名法 (big camel-case)，如：MyClass、MyConstructor；
- 其他，请用小驼峰命名法 (little camel-case)：如：myLibrary



# sharegoods-utils/http

> This is a secondary encapsulation library that extends Axios.

## Features

- 从浏览器中创建 XMLHttpRequests
- 支持 Promise API
- 拦截请求和响应
- 转换请求数据和响应数据
- 取消请求

## Attributes
`axios`相关参数请参阅 [http://www.axios-js.com/zh-cn/docs/](http://www.axios-js.com/zh-cn/docs/)

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| baseURL | 接口前缀| String | — | - |
| timeout | 超时时间| Number | — | 15000 |
| headers | 请求头| Object | — | - |

个性化配置

| 参数      | 说明          | 类型      | 可选值                           | 默认值  |
|---------- |-------------- |---------- |--------------------------------  |-------- |
| isTrim | 是否对数据去两边空格| Boolean | — | true |
| stopRepeatRequest | 是否禁止重复请求(url、method、参数相同)| Boolean | — | false |
| repeatInterval | 允许重复请求的间隔时间（stopRepeatRequest=true才生效）| Number | — | 2000 |
| getResponseSuccess | 判断数据是否正确(回传 body)| Function | - | true |
| beforeRequest | 全局请求前回调函数(回传 { url, path, payload, meta }) | Function | — | - |
| handleRequest | 全局请求中回调函数(回传 config) | Function | — | - |
| afterRequest | 全局请求后回调函数(回传 { url, path, payload, meta, body }) | Function | — | - |
| handleError | 全局请求后错误回调函数(回传 { url, path, payload, meta, body }) | Function | — | - |
| handleSuccess | 全局请求后成功回调函数(回传 { url, path, payload, meta, body }) | Function | — | - |
| getHeaders | 全局请求后获取headers回调函数(回传 response) | Function | — | - |
| setHeaders | 全局请求前设置headers回调函数(回传 config) | Function | — | - |


> payload: 请求参数对象  body: 服务端返回的json 或者 错误信息 meta: 自定义的参数 url: restful后的url path: restful前的url response:axios的response config: axios的config 


## Setup
install：
```bash
npm i sharegoods-utils -S
```



## Usage
The content of both requests and responses is 'json'：

### 基础
```javascript
import { Request } from 'sharegoods-utils/http';
const http = new Request({
    baseURL:'/api'
});
http.get('/user', {
    id:1
}).then(function (body) {
  console.log(body);
})
.catch(function (error) {
  console.log(error);
});
http.post('/user', {
    name:'damon'
}).then(function (body) {
    console.log(body);
  })
  .catch(function (error) {
    console.log(error);
  });
http.delete('/user/{id}', {
    id:1
}).then(function (body) {
    console.log(body);
  })
  .catch(function (error) {
    console.log(error);
  });
http.put('/user/{id}', { id:1,name:'damon'},{timeout:10000,headers:{version:'1.0.0'}}).then(function (body) {
    console.log(body);
  })
  .catch(function (error) {
    console.log(error);
  });
http.request({
      method: 'post',
      url: '/user/12345',
      data: {
        firstName: 'Fred',
        lastName: 'Flintstone'
      }
    }).then(function (body) {
        console.log(body);
      })
      .catch(function (error) {
        console.log(error);
      });
```


### 高级

```javascript
import { Request,HttpError,ResponseType,ContentType } from 'sharegoods-utils/http';

const api = {
  'getAddressList': [
    '/gateway/user/userAddress/query',
    {
      'action': '查询地址',
      'method': 'get',
      'unRedirect': true
    }
  ],
  'getAreaList': [
    '/gateway/config/sysArea/queryAreaList',
    {
      'action': '查询省市区',
      'method': 'get'
    }
  ],
  'delAddress': [
    '/gateway/user/userAddress/delete',
    {
      'action': '删除地址',
      'method': 'post'
    }
  ],
  'setDefaultAddr': [
    '/gateway/user/userAddress/setDefault',
    {
      'action': '设置默认地址',
      'method': 'post'
    }
  ],
  'addOrEditAddr': [
    '/gateway/user/userAddress/save',
    {
      'action': '新增/修改地址',
      'method': 'post'
    }
  ]
}

const http = new Request({
    debug:true,
    api,
    /**
     * Default config
     * @type {AxiosRequestConfig}
     */
    baseURL: '/api', // 接口前缀
    timeout: 15000, // 超时时间 默认15000
    responseType: ResponseType.json, // 默认 json 
    withCredentials: false, // 当前请求为跨域类型时是否在请求中协带cookie
    headers: { 'Content-Type': ContentType.json }, // 默认 application/json
    
    /**
     * Default config
     * @type {CustomRequestConfig}
     */
    isTrim: true, // 数据是否去空格
    stopRepeatRequest: true, // 是否禁止重复请求
    repeatInterval: 3000, // 重复请求间隔
    HttpError, // 覆盖默认错误信息
    // 全局接口请求数据成功条件
    getResponseSuccess(body) {
        if ([10000].includes(body.code)) {
            return true;
        }
        return false;
    },
    // 请求前
    beforeRequest({ url, payload, meta = {} }) {
        console.log(`开始请求${url},请求参数:${JSON.stringify(payload)}`);

        // isShowLoading是自定义参数
        if(meta.isShowLoading) {
            // do loading
        }
    },
    // 请求后
    afterRequest({ body,payload,meta }) {
        // isShowLoading是自定义参数
        if(meta.isShowLoading) {
            // hide loading
        }
       
    },
    // 全局错误回调 内部错误都会提供 message 但是服务端的提示信息需要根据实际情况获取
    handleError({ body, path, meta = {} }) {
        let message = body.message || body.msg;
        // isShowError是自定义参数
        if (meta.isShowError) {
            console.error(message)
        }
        // 用户登录失效
        if ([40002].includes(body.code)) {
           // do logout
        }
    },
    // 全局成功回调
    handleSuccess({ body, path, meta = {} }) {
        const data = body.data || {};
        const token = data.token;
        if (token) {
            // setToken(token);
        }
        if (meta.isShowSuccess) {
            console.log('ok')
        }
    },
    // 请求完成后获取headers
    getHeaders(config) {
        const headers = config.headers;
        console.log('headers', headers);
    },
    // 请求前设置heeaders
    setHeaders() {
        const token = getToken() || '';
        return { token: token };
    }
});

// 直接调用
http.post('/admin/user/login', { id: 1 }, {
    timeout: 10000,
    isShowError: true,
    isShowSuccess: true,
    isShowLoading: true
}).then(function (body) {
    console.log(body);
});
http.request({
    url:'/admin/user/login',
    payload:{
        name:1
    },
    method:'post',
    timeout: 10000,
    isShowError: true,
    isShowSuccess: true,
    isShowLoading: true
}).then(function (body) {
    console.log(body);
});


// api模式 支持数组以及对象模式
// 数组模式
const API = http.toAPI([
    {
        name: 'userLogin',
        label: '用户登录',
        path: '/admin/user/login',
        method: 'post'

    },
    {
        name: 'userOwnDetail',
        label: '查询当前用户的详情接口',
        path: '/user/ownDetails',
        method: 'post'
    }
]);

API.userLogin({ id: 1 }, {
    timeout: 10000,
    isShowError: true,
    isShowSuccess: true,
    isShowLoading: true
}).then(function (body) {
    console.log(body);
});

// 对象模式
const API2 = http.toAPI({
    'getBargainList': [
        '/gateway/bargain/list',
        {
          'action': '查询用户活动商品列表',
          'method': 'get'
        }
    ],
    'login': [
        '/h5/user/login',
        {
          'action': '登录',
          'method': 'post',
          'timeout':10000
        }
    ]
});

API2.login({ id: 1 }, {
    timeout: 20000,
    isShowError: true,
    isShowSuccess: true,
    isShowLoading: true
}).then(function (body) {
    console.log(body);
});


// 取消所有请求
http.cancel();

// 下载文件 返回流则直接在浏览器中下载，返回json则手动下载
http.download('/download/file',{name:1},{method:'post'}).then(console.log).catch(console.error);

```



## 关于 Git 日志
自动生成`git commit`记录用以统计个人项目周报，全组项目周报，版本、分支差异记录自动生成Tag等

### 功能
  * 生成(本人:默认/其他人/团队)(任意时间段/上周:默认)(任意项目/当前项目:默认)日志
  * 控制是否覆盖已有文件
  * 控制是否显示生成时间
  * 指定分支比对、版本比对、`CHANGELOG`、`publish`模式
  * 比对模式可(指定/读取`package.json`：默认)版本生成对应文件名
  * 分支比对模式可指定比对分支(当前:默认)
  * 版本比对模式可指定比对版本(源版本/HEAD:默认、目标版本/最新版本:默认)
  * `CHANGELOG`模式可检索全部标签并生成每个标签log
  * `publish`模式可基于当前分支代码生成版本log，并与上个`commit`合并，切到指定分支进行合并，生成并推送标签和代码至远程

### 配置项
  * `-m`： 生成模式  默认：无(周报)，可选：branch(分支比对)、tag(标签比对)、changelog(汇总日志)、publish(发布模式)、copy(将标签对比结果仅输出至剪切板**该特性暂仅支持 macOS**)
  * `-a`： 贡献者；默认：`git` 配置 `name`；可传 ''(所有贡献者)、任意成员`name`
  * `-s`： 起始日期  默认：上周一，格式：2018-01-01
  * `-u`： 终止日期  默认：当天，格式：2018-01-01
  * `-S`： 源分支/标签 默认：无，比对模式：当前分支/最近标签 例：develop
  * `-T`： 目标分支/标签 默认：无，比对模式：当前分支/当前HEAD 例：master
  * `-r`： Git 仓库本地路径  默认：当前目录
  * `-v`： 版本号  默认：无，比对模式：仓库路径下 package.json 中 VERSION 字段值
  * `-d`： log 输出目录 默认：仓库路径下 log 文件夹
  * `-f`： 覆盖文件  默认：否，不需要传值
  * `-t`： log 首行为生成日期  默认：否，不需要传值

### 使用
```bash
npm install sharegoods-utils -g
```
**示例为安装在全局后切到项目目录使用，因此不需要`-r`参数, 并且本地代码与线上保持同步**
#### 周报
```bash
sg-log
```
#### 标签比对
 ```bash
#  此时需保证当前分支有未打tag的commit即可，即在开发分支即将合入master时使用最佳
sg-log -t -m tag
 ```
#### 项目CHANGELOG
```bash
sg-log -m changelog
```
#### 发布模式
发布模式会做以下几件事（默认当前分支为待发布分支）
* 修改package.json的版本号
* 根据版本号生成log文件，同标签对比模式
* 生成`commit` "`chore: Publish version x.x.x`"
* 生成新的发布分支`release-v{version}-{date}`
* 复制版本`log`到剪切板
* 生成tag
* 推送tag
* 推送发布分支
* 完成
```bash
sg-log -m publish
```

### 示例
#### 生成个人周报  ->  xxx.md
```bash
sg-log

# [2018-03-06]
#  * chore: 发布xx ([02f64964](http://xxx.xxx.xxx/xxx/xxx/commit/02f64964de959931074a253ed0ba185d96704c3d))  - 26 hours ago

# [2018-03-07]
#  * fix: xxx ([14b475d5](http://xxx.xxx.xxx/xxx/xxx/commit/14b475d53655f14a1be3cb51fc24f372dfc4be79))  - 13 hours ago
#  * chore: 发布xxx ([60cec8c0](http://xxx.xxx.xxx/xxx/xxx/commit/60cec8c03a160cc43063e16331e462401ea6390b))  - 4 hours ago
```

#### 生成团队周报  ->  20xx.xx.xx.md
```bash
sg-log -a ''

# [2018-03-06]
#  * chore：xxx修改 ([82d1ae32](http://xxx.xxx.xxx/xxx/xxx/commit/82d1ae3224e4787660429d7ecad02b6d1b2f9387))  <xxx>
#  * chore: xxx细节修改 ([42dad557](http://xxx.xxx.xxx/xxx/xxx/commit/42dad557fd9a766c82ad4563c36d6f9ce520cd9f))  <xxx>

# [2018-03-07]
#  * fix: xxx ([14b475d5](http://xxx.xxx.xxx/xxx/xxx/commit/14b475d53655f14a1be3cb51fc24f372dfc4be79))  <oo>
```

#### 生成待发布版本信息 ->  vx.x.x.md
```bash
sg-log -m branch -S develop
# 或
sg-log -m tag

# #### 新增
# * xxxx ([575001fb](http://xxx.xxx.xxx/xxx/xxx/commit/575001fb0a904bd6b900da9afbd6da28fb8aea05))  @xxx

# #### 修改
# * xxx ([92349b05](http://xxx.xxx.xxx/xxx/xxx/commit/92349b058b484829ae36d12e2f1d57251f2fa6a3))  @ooo
# * xxx ([36f52ea3](http://xxx.xxx.xxx/xxx/xxx/commit/36f52ea30446031387f449dd504c8cf5fd7dd7dd))  @ooo

# #### 其他
# *  xxxx ([25706352](http://xxx.xxx.xxx/xxx/xxx/commit/257063524332cea17351dfa5a1a2fac602a980da))  @ooo
# * xxx ([6b20d235](http://xxx.xxx.xxx/xxx/xxx/commit/6b20d2350d64d0c2483d758449ad7723536eb9a8))  @ooo

# #### 文档
# * xx.0.2 ([60cec8c0](http://xxx.xxx.xxx/xxx/xxx/commit/60cec8c03a160cc43063e16331e462401ea6390b))  @ooo
# * xxx ([c23cb128](http://xxx.xxx.xxx/xxx/xxx/commit/c23cb128627d6811688b34dc2b7ea87ce6b515cb))  @ooo
```

#### 生成在 version 目录下
```bash
sg-log -d version
```

### 高级
#### xx仓库 someone 2018年1月1日至2018年1月31日commit记录至./git-log/someone.md文件中，若已存在该文件直接覆盖
```bash
sg-log -r <path-to-your-repository> -a someone -s 2018-01-01 -u 2018-01-31 -d git-log -f
```
### 注意
 * `commit`分类要求所有`commit message`符合规范，及以`feat fix refactor style docs chore build ci pref test`开头，后紧跟`: `，然后是正文；例：`feat: 新增git-log`
 * 尽可能**保证功能分支commit message精简扼要**
 * 分支对比模式需要两个分支都在本地存在

### 其他
* 团队周报中贡献者姓名为贡献者`git` 配置 `name`
* 版本日志中`@`后紧随贡献者`git` 配置 `email`用户名(即不包含@xx.xx)
* 根据配置项可生成各种git记录，欢迎优化拓展


## 参考
- [babel javaScript 编译器](https://www.babeljs.cn/)
- [jest 单元测试](https://www.npmjs.com/package/jest)
- [docjs 文档生成](http://www.dba.cn/book/jsdoc/)
- [Rollup.js 打包](http://rollup.org/)
- [Rollup.js 中文文档](https://rollup.bootcss.com/)
- [Rollup 插件列表](https://github.com/rollup/rollup/wiki/Plugins)
- [如何使用Rollup打包样式文件并添加LiveReload](http://www.w3cplus.com/javascript/learn-rollup-css.html)

