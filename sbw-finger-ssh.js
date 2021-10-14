const io = require("socket.io-client");
const { NodeSSH } = require("node-ssh");

const sendSSHCmd = function (deviceInfo) {
  var deviceName = deviceInfo.deviceName;
  var host = deviceInfo.sshHost;
  var port = deviceInfo.sshPort || 22;
  var username = deviceInfo.sshUserName;
  var useKey = deviceInfo.sshUseKey || false;
  var password = deviceInfo.sshPassword;
  var key = deviceInfo.sshPrivateKey;
  var command = deviceInfo.sshCommand;
  var ssh = new NodeSSH();
  var cfg = { host: host, port: port, username: username };
  if (useKey) {
    cfg.privateKey = key;
  } else {
    cfg.password = password;
  }
  ssh.connect(cfg).then(() => {
    ssh.execCommand(command, {
      cwd: "~",
      onStdout(chunk) {
        console.log("stdoutChunk", chunk.toString("utf8"));
      },
      onStderr(chunk) {
        console.log("stderrChunk", chunk.toString("utf8"));
      },
    });
  });
};

const dataStruct = {
  event: "ssh",
  dataStruct: {
    deviceName: "name",
    sshHost: "0.0.0.0",
    sshPort: 2000,
    sshUserName: "user",
    sshUseKey: false,
    sshPassword: "password",
    sshPrivateKey: "keykeykey",
    sshCommand: "echo aaa",
  },
};

const installSSHSocketIO = function (deviceCfg) {
  const socket = io(deviceCfg.aspherAddr);
  socket.on("connect", () => {
    console.log("connected on config:", deviceCfg);
    socket.emit("register", {
      deviceName: deviceCfg.deviceName,
      token: deviceCfg.token,
      authPass: deviceCfg.authPass,
      deviceType: deviceCfg.deviceType || "finger",
      character: deviceCfg.character || "finger",
      on: dataStruct,
    });
    setupSSHSocketIO(socket);
  });
  return socket;
};

const setupSSHSocketIO = function (socket) {
  socket.on("ssh", (deviceInfo) => {
    sendSSHCmd(deviceInfo);
  });
};

if (require.main === module) {
  const deviceCfg = require("./config.json");
  installSSHSocketIO(deviceCfg);
} else {
  module.exports = {
    setupSSHSocketIO,
    dataStruct,
  };
}
