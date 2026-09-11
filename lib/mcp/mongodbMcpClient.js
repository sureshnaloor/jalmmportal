import compatibleTools from "./compatibleMongoTools";

const { executeCompatibleTool, listCompatibleTools } =
  compatibleTools.default || compatibleTools;

function getGlobalState() {
  if (!global._mmportalMongoMcp) {
    global._mmportalMongoMcp = {
      handle: null,
    };
  }
  return global._mmportalMongoMcp;
}

function createCompatibleHandle() {
  return {
    async listTools() {
      return listCompatibleTools();
    },
    async callTool(name, rawArgs = {}) {
      return executeCompatibleTool(name, rawArgs);
    },
    async close() {
      return undefined;
    },
  };
}

export async function getMongoMcpClient() {
  const state = getGlobalState();
  if (!state.handle) {
    state.handle = createCompatibleHandle();
  }
  return state.handle;
}

export async function resetMongoMcpClient() {
  const state = getGlobalState();
  state.handle = null;
}

export async function callMongoMcpTool(name, args) {
  const client = await getMongoMcpClient();
  return client.callTool(name, args);
}
