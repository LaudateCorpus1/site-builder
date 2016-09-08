var webpack = require('webpack');
var path = require('path');

var HtmlWebpackPlugin = require('html-webpack-plugin');

var configApp = {
	entry: './src/app/index.jsx',
	output: {
		filename: './app/index.js'
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx']
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			loader: 'babel',
			exclude: /node_modules/
		}],
	},
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
		'react-router': 'ReactRouter',
	},
};

var configAdmin = {
	entry: './src/admin/index.jsx',
	output: {
		filename: './admin/index.js'
	},
	devtool: 'source-map',
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js', '.jsx']
	},
	node: {
  		fs: "empty"
	},
	module: {
		loaders: [{
			test: /\.jsx?$/,
			loader: 'babel',
			exclude: /node_modules/
		}]
	},
	externals: {
		'react': 'React',
		'react-dom': 'ReactDOM',
		'react-router': 'ReactRouter'
	},
};

module.exports = [configApp];
