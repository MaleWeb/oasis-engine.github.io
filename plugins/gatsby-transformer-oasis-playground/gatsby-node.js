const babel = require("@babel/core");

exports.onCreateNode = module.exports.onCreateNode = async function onCreateNode(
  {
    node,
    loadNodeContent,
    actions,
    createNodeId,
    reporter,
    createContentDigest
  }
) {
  try {
    const { createNode } = actions

    const content = await loadNodeContent(node)

    const result = babel.transformSync(content, {
      presets: [
        ["@babel/preset-env",
          {
            "loose": true,
            "modules": 'umd'
          }
        ],
        "@babel/preset-typescript"
      ],
      plugins: [
        [
          "@babel/plugin-proposal-class-properties", { loose: true },
        ],
        [
          "@babel/plugin-transform-modules-umd",
          {
              "globals": {
                  "@oasis-engine/controls": "@oasisEngine/controls",
                  "@oasis-engine/framebuffer-picker": "@oasisEngine/framebufferPicker",
                  "@oasis-engine/stats": "@oasisEngine/stats",
                  "@oasis-engine/engine-spine": "oasisSpine"
              },
              exactGlobals: true
          }
        ],
      ],
      filename: "index.ts",
    });

    const playgroundNode = {
      id: createNodeId(`${node.id} >>> Playground`),
      playgroundId: 'default',
      name: node.name,
      internal: {
        content: result.code,
        type: `Playground`,
      },
    }

    playgroundNode.internal.contentDigest = createContentDigest(playgroundNode)

    createNode(playgroundNode)

    return playgroundNode
  } catch (err) {
    reporter.panicOnBuild(
      `Error processing Playground ${node.absolutePath ? `file ${node.absolutePath}` : `in node ${node.id}`
      }:\n
      ${err.message}`
    )

    return {} // eslint
  }
}

module.exports.unstable_shouldOnCreateNode = function ({ node }) {
  return node.extension === `ts`
}