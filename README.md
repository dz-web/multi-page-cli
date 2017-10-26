# multi-page-cli

用于新建页面

## 目的

针对dz-web多页面项目结构，新建页面时，要修改的和新建的文件太多，效率低，并且会忘记修改组件名等问题

## 安装

#### yarn

```shell
yarn add --dev @dz-web/multi-page-cli 
```

#### npm

```shell
npm i -D @dz-web/multi-page-cli 
```

## 使用


1. 在项目根目录下新建.mpcli.config.js文件，内容如下：

```js
module.exports = {
  // 多页面配置文件
  file: './app.config.js',
  // html模板
  templates: [
    'public/dynamic-rem.html',
    'public/index.html'
  ],
  // react 根组件入口配置
  entries: {
    // 入口文件存放目录
    directory: './src/single-page',
    // 新建页面模板文件
    template: './dev/templates/entry.ejs',
  },
  views: {
    // 页面组件存放目录
    directory: './src/views',
    // 新建组件模板文件
    template: './dev/templates/views.ejs',
  },
};
```

2. 根据配置，编写好新建文件的模板，采用[ejs](https://www.npmjs.com/package/ejs)语法编写即可, 渲染时传入两个变量: pascal与kebab,
pascal是pascal命名法的组件名称, 如: TestPage, Home, kebab是kebab形式的命名，如: test-page, home。

3. 在package.json的scripts增加一行配置:

```js
"create:page": "mpcli page"
```

4. 在项目目录下运行

```
npm run create:page
```

5. 根据提示，输入kebab形式的组件名，如test-page, 然后一直按回车，以使用配置指定的默认路径创建文件

文件都已经创建好了，app.config.js也修改好了，重新运行npm start，接着你的开发工作 ！

---

## 示例模板

复制以下示例模板，根据项目依赖不同，适当修改

### entry.ejs

```js
import 'react-hot-loader/patch';
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import { AppContainer } from 'react-hot-loader';
import '../../css/main.scss';
import <%- pascal %> from '../../views/<%- kebab %>/<%- kebab %>';

const rootEl = document.getElementById('root');
injectTapEventPlugin();

if (DEBUG) {
  ReactDOM.render(
    (<AppContainer><<%- pascal %> /></AppContainer>), rootEl
  );

  if (module.hot) {
    module.hot.accept('../../views/<%- kebab %>/<%- kebab %>', () => {
      ReactDOM.render(
        <AppContainer>
          <<%- pascal %> />
        </AppContainer>,
        rootEl
      );
    });
  }
} else {
  ReactDOM.render(<<%- pascal %> />, rootEl);
}
```

### views.ejs

```js
import React, { Component } from 'react';
import cssModules from 'react-css-modules';
// import classNames from 'classnames';
// import PropTypes from 'prop-types';
// import shortid from 'shortid';
import styles from './<%- kebab %>.scss';
// import Tips from '../../components/tips/tips';
import injectLoading from '../../components/inject-loading/inject-loading';

class <%- pascal %> extends Component {
  constructor() {
    super();
    this.state = {
    };
  }
  render() {
    return (
      <div styleName="<%- kebab %>">
        <%- pascal %>
      </div>
    );
  }
}
export default cssModules(injectLoading(<%- pascal %>), styles, {
  allowMultiple: true, errorWhenNotFound: false,
});
```
