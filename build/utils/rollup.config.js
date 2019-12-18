const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const uglify = require('rollup-plugin-uglify')
const replace = require('rollup-plugin-replace')

// const postcss = require('rollup-plugin-postcss')
// const simplevars = require('postcss-simple-vars')
// const nested = require('postcss-nested')
// const cssnext = require('postcss-cssnext')
// const cssnano = require('cssnano')

const pkg = require('../../package.json')
const external = Object.keys(pkg.dependencies)
const plugins = [
    replace({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'process.env.VUE_ENV': JSON.stringify('browser')
    }),
  // postcss({
  //   plugins: [
  //     simplevars(),
  //     nested(),
  //     cssnext({warnForDuplicates: false}),
  //     cssnano(),
  //   ],
  //   extensions: ['.css']
  // }),
  resolve({
    jsnext: true,
    main: true,
    browser: true
  }),

    babel({
        runtimeHelpers: true,
        exclude: 'node_modules/**' // 仅仅转译我们的源码
    }),
    commonjs(),
  uglify()
]

module.exports = {
  plugins: plugins,
  external: external,
  globals: Object.keys(external).map((value) => {
    return {[value]: value}
  })
}
