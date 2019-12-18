import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: "src/http/index.js",
    format:'umd',
    moduleName:"xx",
    dest:'xx.js',
    //entry: 'src/http/index.js',
    // output: [
    //     {
    //         file: "dist/xxx.js",
    //         format: "umd",
    //         name: "xxx"
    //     }
    // ],
    plugins: [
        resolve({
            browser: true,
        }),
        babel({
            exclude: 'node_modules/**',
        }),
        commonjs(),
    ]
};
