var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require("webpack-dev-server");
var WebpackMd5Hash = require('webpack-md5-hash');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin  = require('extract-text-webpack-plugin'); //自动抽取 css文件
var CleanWebpackPlugin = require('clean-webpack-plugin'); //build之前 清除 dist目录， clean操作
// var OpenBrowserPlugin = require('open-browser-webpack-plugin');//webpack插件

//自定义"魔力"变量 开发环境 与 发布环境 配置
// var definePlugin = new webpack.DefinePlugin({
//     __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'false')),
//     __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
// });

    //package.js文件 需要设置 如下信息
    
    // "scripts": {
  //   "dev": "BUILD_DEV=1 webpack-dev-server --progress --colors",
  //   "build": "BUILD_PRERELEASE=1 webpack -p"
  // },

module.exports={
    entry:{
        index:'./src/js/page/index',
        delegate:'./src/js/page/jsEvent'
    },
    output:{
        path: path.join(__dirname,'dist'),
        publicPath:'/', /*设置 webpack-dev-server 的访问路径  
                                若设置publicPath:'/assets/',  http://localhost:8080/webpack-dev-server/assets/index.html*/
        filename:'[chunkhash]-[name].js',
        chunkFilename:'[chunkhash]-[id].chunk.js'
        // chunkFilename: "[chunkhash].[id].chunk.js"   md5hash 设置
    },
    module:{
        loaders:[
            // {test: /\.jsx?$/,exclude: /node_modules/,loaders: ['babel-loader', 'jsx-loader']}, //babel必须放在第一位,不然sourcemap是编译后的代码
            { test: /\.css$/, loader: ExtractTextPlugin.extract("style-loader", "css-loader")},
            // {test: /\.scss$/,loader: ExtractTextPlugin.extract('style!css!postcss!sass?sourceMap')}
            {test:/\.html$/,loader:'html'},
            {test:/\.(png|jpg|gif)$/,loader:'url-loader?limit=8192'}
        ],
        //noParse 设置不需要loader转化目录 或者文件
        // noParse: [
        //     path.join(__dirname + '/client/node_modules/jquery/'),
        //     path.join(__dirname + '/client/lib/**')
        // ]
    },
    plugins:[
        new CleanWebpackPlugin(['dist', 'build'], {
          root: '', // An absolute path for the root. 
          verbose: true, // Write logs to console.
          dry: false,// Use boolean "true" to test/emulate delete. (will not remove files). (Default: "false", remove files) 
          exclude: ['commons.js','commons.js.css']// Instead of removing whole path recursively,
        }),
        // 启动热替换 
        new webpack.HotModuleReplacementPlugin(),
        //开启错误提示
        new webpack.NoErrorsPlugin(), 
        //开启 自动打开本地服务器
        // new OpenBrowserPlugin({ url: 'http://localhost:8080' }),

        new webpack.ProvidePlugin({
            $:'jquery'
        }),
        new webpack.optimize.CommonsChunkPlugin('commons.js',['index','delegate']),
        //设置抽出css文件名
        new ExtractTextPlugin("[name].css?[hash]-[chunkhash]-[contenthash]", {
            disable: false,
            // allChunks: true
        }),
        // new WebpackMd5Hash(),    设置md5hash
        
        /*方式一，传入字符串参数 
        new webpack.optimize.CommonsChunkPlugin(‘common.js’), // 默认会把所有入口节点的公共代码提取出来,生成一个common.js
        
        方式二，有选择的提取公共代码
        // 只提取main节点和index节点
        new webpack.optimize.CommonsChunkPlugin('common.js',['main','index']), 

        方式三，有选择性的提取（对象方式传参） 推荐
        new webpack.optimize.CommonsChunkPlugin({
            name:'common', // 注意不要.js后缀
            chunks:['main','user','index']
        }),*/
        new webpack.optimize.UglifyJsPlugin({
            compress:{
                warnings:false
            }
        }),
        // Configuration
        // 可以进行一系列的配置，支持如下的配置信息

        // title: 用来生成页面的 title 元素
        // filename: 输出的 HTML 文件名，默认是 index.html, 也可以直接配置带有子目录。
        // template: 模板文件路径，支持加载器，比如 html!./index.html
        // templateContent: templateContentString 如果html模版是字符串可以使用此参数   
        // inject: true | 'head' | 'body' | false  ,注入所有的资源到特定的 template 或者 templateContent 中，如果设置为 true 或者 body，所有的 javascript 资源将被放置到 body 元素的底部，'head' 将放置到 head 元素中。
        // favicon: 添加特定的 favicon 路径到输出的 HTML 文件中。
        // minify:{    //压缩HTML文件
        //         removeComments:true,    //移除HTML中的注释
        //         collapseWhitespace:true    //删除空白符与换行符
        // }。
        // hash: true | false, 如果为 true, 将添加一个唯一的 webpack 编译 hash 到所有包含的脚本和 CSS 文件，对于解除 cache 很有用。
        // cache: true | false，如果为 true, 这是默认值，仅仅在文件修改之后才会发布文件。
        // showErrors: true | false, 如果为 true, 这是默认值，错误信息会写入到 HTML 页面中
        // chunks: 允许只添加某些块 (比如，仅仅 unit test 块)
        // chunksSortMode: 允许控制块在添加到页面之前的排序方式，支持的值：'none' | 'default' | {function}-default:'auto'
        // excludeChunks: 允许跳过某些块，(比如，跳过单元测试的块) 
        new HtmlWebpackPlugin({
            'title': "app",
            "template": "./index.html"
        }),
    ],
    except: ['$super', '$', 'exports', 'require']    //排除关键字

}
