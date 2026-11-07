/** @type {import('next').NextConfig} */
const path = require("path");
const { ModifySourcePlugin } = require('modify-source-webpack-plugin');

const nextConfig = {
    reactStrictMode: false,
    webpack: (config, {buildId, dev, isServer, defaultLoaders, webpack}) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            "react": path.resolve('./node_modules/react'),
            "react-dom": path.resolve('./node_modules/react-dom')
        };

        // lodash getRawTag throws and catches exceptions making it a huge pain in the ass to debug anything
        // skip its overengineer logics
        config.plugins.push(
          new ModifySourcePlugin({
            rules: [
              {
                test: /ckeditor\.js$/,
                modify: (src, path) => {
return src.replace(`function getRawTag(value) {`, 'function getRawTag(value) {return  nativeObjectToString.call(value);\n// patched by Yarik for debugging')
                }
                
              }
            ]
          })
        )

        return config;
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/components',
                permanent: true
            }
        ]
    }
}

module.exports = nextConfig;
