/*
 * @Author:Mars
 * @Date: 2016-10-06
 */
'use strict';

var webpack = require("webpack");
var path = require("path");
var glob = require('glob')

//路径定义
var srcDir = path.resolve(process.cwd(), 'src');
var distDir = path.resolve(process.cwd(), 'dist');
var nodeModPath = path.resolve(__dirname, './node_modules');
var pathMap = require('./src/pathmap.json');
var publicPath = '/';
//插件定义
var WebpackMd5Hash = require('webpack-md5-hash');
var CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var CleanWebpackPlugin = require('clean-webpack-plugin'); //build之前 清除 dist目录， clean操作
var sprite = require('sprite-webpack-plugin');

//入口文件定义
var entries = function() {
        var jsDir = path.resolve(srcDir, 'js')
        var entryFiles = glob.sync(jsDir + '/page/*.{js,jsx}')
        var map = {};

        for (var i = 0; i < entryFiles.length; i++) {
            var filePath = entryFiles[i];
            var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
            map[filename] = filePath;
        }
        return map;
    }
    //html_webpack_plugins 定义
var html_plugins = function() {
    var entryHtml = glob.sync(srcDir + '/*.html')
    var r = [];
    var entriesFiles = entries()
    for (var i = 0; i < entryHtml.length; i++) {
        var filePath = entryHtml[i];
        var filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'));
        var conf = {
                template: 'html!' + filePath,
                filename: filename + '.html',
                hash: true
            }
            //如果和入口js文件同名
        if (filename in entriesFiles) {
            conf.inject = 'body',
                conf.chunks = ['vendor', filename] //需要引入的chunk，不配置就会引入所有页面的资源.名字来源于你的入口文件
        }
        //跨页面引用，如pageA,pageB 共同引用了common-a-b.js，那么可以在这单独处理
        //if(pageA|pageB.test(filename)) conf.chunks.splice(1,0,'common-a-b')
        r.push(new HtmlWebpackPlugin(conf))
    }
    return r
}
module.exports = function(options) {
    options = options || {}
    var debug = options.debug !== undefined ? options.debug : true;

    var plugins = [];

    var extractCSS;
    var cssLoader;
    var sassLoader;
    plugins.push(
        new CleanWebpackPlugin(['dist', 'build'], {
            root: path.resolve(__dirname), // An absolute path for the root. 
            verbose: true, // Write logs to console.
            dry: false, // Use boolean "true" to test/emulate delete. (will not remove files). (Default: "false", remove files) 
            exclude: ['commons.js'] // Instead of removing whole path recursively,
        }),
        new sprite({
            'source': __dirname + '/src/img/spritesource/',
            'imgPath': __dirname + '/src/img/',
            'cssPath': __dirname + '/src/css/'
        }),
        new WebpackMd5Hash(), // js与css共用相同chunkhash的解决方案, css文件改变时 只改变生成的对应css文件的contenthash值，不改变对应js文件chunkhash值
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery",
            "window.jQuery": "jquery"
        }),
        new CommonsChunkPlugin({
            name: 'vendor',
            children: true,
            minChunks: Infinity
        })
    );

    if (debug) {
        extractCSS = new ExtractTextPlugin('css/[name].css?[contenthash]')
        cssLoader = ExtractTextPlugin.extract('style', 'css')
        sassLoader = ExtractTextPlugin.extract('style', 'css', 'sass')

        plugins.push(extractCSS)
    } else {
        extractCSS = new ExtractTextPlugin('css/[contenthash:8].[name].min.css', {
            // 当allChunks指定为false时，css loader必须指定怎么处理
            allChunks: false
        })
        cssLoader = ExtractTextPlugin.extract('style', 'css?minimize')
        sassLoader = ExtractTextPlugin.extract('style', 'css?minimize', 'sass')

        plugins.push(
            extractCSS,
            new UglifyJsPlugin({
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                },
                mangle: {
                    except: ['$', 'exports', 'require', 'avalon']
                }
            }),
            new webpack.optimize.DedupePlugin(),
            new webpack.NoErrorsPlugin()
        )
    };

    //config
    var config = {
        entry: Object.assign(entries(), {
            // 用到什么公共lib（例如jquery.js），就把它加进vendor去，目的是将公用库单独提取打包
            // 'vendor': ['jquery', 'avalon', 'cm']
            "vendor": ['jquery', 'cm', 'reset']
        }),
        output: {
            path: path.join(__dirname, "dist"),
            // filename: "js/[hash:8]-[name].js",
            filename: 'js/[hash:8].[name].js',
            chunkFilename: '[chunkhash:8].chunk.js',
            publicPath: publicPath
        },
        module: {
            loaders: [{
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            }, {
                test: /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/,
                loaders: [
                    //小于10KB的图片会自动转成dataUrl，
                    'url?limit=10000&name=img/[hash:8].[name].[ext]'
                ]
            }, {
                test: /\.((ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9]))|(ttf|eot)$/,
                loader: 'url?limit=10000&name=fonts/[hash:8].[name].[ext]'
            }, {
                test: /\.(tpl|ejs)$/,
                loader: 'ejs'
            }, {
                test: /\.css$/,
                loader: cssLoader
            }, {
                test: /\.scss$/,
                loader: sassLoader
            }]
            // {　　　　　　
            //     test: /\.html$/,
            //     　　　　　loader: 'html-withimg-loader'　　
            // }, 
        },
        resolve: {
            extensions: ['', '.js', '.css', '.scss', '.tpl', '.png', '.jpg'],
            root: [srcDir, nodeModPath],
            alias: pathMap,
            publicPath: '/'
        },
        plugins: plugins.concat(html_plugins(), new webpack.HotModuleReplacementPlugin())
    }

    return config;
}