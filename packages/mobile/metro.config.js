const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const config = getDefaultConfig(__dirname)

// Include the form-schema package so Metro can resolve and transform its TypeScript source
config.watchFolders = [
  ...(config.watchFolders ?? []),
  path.resolve(__dirname, '../form-schema'),
]

module.exports = config
