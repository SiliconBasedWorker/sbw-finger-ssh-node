const io = require("socket.io-client");
const { NodeSSH } = require("node-ssh");
const {
  aspherAddr,
  deviceName,
  token,
  authPass,
  deviceType,
  character,
} = require("./config.json");
const socket = io(aspherAddr);
socket.on("connect", () => {
  socket.emit("register", {
    deviceName: deviceName,
    token: token,
    authPass: authPass,
    deviceType: deviceType || "finger",
    character: character || "finger",
    on: {
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
    },
  });
  socket.on("ssh", (deviceInfo) => {
    var deviceName = deviceInfo.deviceName;
    var host = deviceInfo.sshHost;
    var port = deviceInfo.sshPort || 22;
    var username = deviceInfo.sshUserName;
    var useKey = deviceInfo.sshUseKey || false;
    var password = deviceInfo.sshPassword;
    var key = deviceInfo.sshPrivateKey;
    var command = deviceInfo.sshCommand;
    var ssh = new NodeSSH();
    ssh
      .connect({
        host: host,
        port: port,
        username: username,
        privateKey: key,
        password: password,
      })
      .then(() => {
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
  });
});
