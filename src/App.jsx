import React, { useState } from "react";

const defaultMata = {
  // 新增目标模式及相关字段
  targetMode: "tcping", // 可选：tcping、icmp、heartbeat
  tcpingHost: "",
  tcpingPort: "",
  icmpHost: "",
  heartbeat: "",
  // 生成后的 Target 值
  Target: "",
  ps: "",
  Main: {
    ZoneID: "",
    Type: "A",
    Name: "",
    Content: "",
    Proxied: false,
  },
  Then: {
    ZoneID: "",
    Type: "A",
    Name: "",
    Content: "",
    Proxied: true,
  },
};

function App() {
  const [config, setConfig] = useState({
    cf_api_key: "",
    // 仅保留 Telegram 通知相关配置（界面上可选择，但最终生成的 JSON 不输出 notificationType）
    notificationType: "tg",
    BotToken: "",
    ChatID: "",
    TgApiUrl: "https://api.telegram.org",
    // 以下字段用于 UI 控制，不在最终 JSON 输出中
    useExternalServer: false,
    ServerJiang: "",
    Contcp: "",
    Corn: 300,
    Mata: [{ ...defaultMata }],
  });

  // 根据当前目标模式和相关字段更新 Target 值
  const updateTarget = (index, newData) => {
    const newMata = [...config.Mata];
    const mata = newMata[index];
    Object.assign(mata, newData);
    switch (mata.targetMode) {
      case "tcping":
        mata.Target =
          mata.tcpingHost && mata.tcpingPort
            ? `${mata.tcpingHost}:${mata.tcpingPort}`
            : "";
        break;
      case "icmp":
        mata.Target = mata.icmpHost || "";
        break;
      case "heartbeat":
        mata.Target = mata.heartbeat || "";
        break;
      default:
        mata.Target = "";
    }
    setConfig({ ...config, Mata: newMata });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleMataChange = (index, field, value) => {
    const newMata = [...config.Mata];
    newMata[index][field] = value;
    setConfig({ ...config, Mata: newMata });
  };

  const handleMainChange = (index, field, value) => {
    const newMata = [...config.Mata];
    newMata[index].Main[field] = field === "Proxied" ? value === "true" : value;
    setConfig({ ...config, Mata: newMata });
  };

  const handleThenChange = (index, field, value) => {
    const newMata = [...config.Mata];
    newMata[index].Then[field] = field === "Proxied" ? value === "true" : value;
    setConfig({ ...config, Mata: newMata });
  };

  const addMata = () => {
    setConfig({ ...config, Mata: [...config.Mata, { ...defaultMata }] });
  };

  const deleteMata = (index) => {
    const newMata = config.Mata.filter((_, i) => i !== index);
    setConfig({ ...config, Mata: newMata });
  };

  // 过滤掉不需要输出的字段
  const getOutputConfig = () => {
    // 过滤掉 config 顶层不需要输出的字段
    const { notificationType, useExternalServer, ...rest } = config;
    // 对每个 Mata 对象过滤掉不需要的字段
    const filteredMata = rest.Mata.map(
      ({
        targetMode,
        tcpingHost,
        tcpingPort,
        icmpHost,
        heartbeat,
        ...filteredMataItem
      }) => filteredMataItem
    );

    return {
      ...rest,
      Mata: filteredMata,
    };
  };

  const copyToClipboard = () => {
    if (config.Mata.length === 0) {
      alert("请至少添加一条 Mata 配置！");
      return;
    }
    const output = JSON.stringify(getOutputConfig(), null, 2);
    navigator.clipboard
      .writeText(output)
      .then(() => {
        alert("配置已复制到剪贴板！");
      })
      .catch((err) => {
        alert("复制失败，请手动复制！");
        console.error(err);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-4">Mata 配置生成</h1>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Cloudflare API Key
            </label>
            <input
              type="text"
              name="cf_api_key"
              value={config.cf_api_key}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="Cloudflare Zone API Token"
            />
          </div>

          {/* 通知方式选择（界面上显示，但不输出到 JSON） */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              通知方式
            </label>
            <div className="flex space-x-4 mt-1">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="notificationType"
                  value="tg"
                  checked={config.notificationType === "tg"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Telegram</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="notificationType"
                  value="server"
                  checked={config.notificationType === "server"}
                  onChange={handleChange}
                  className="form-radio"
                />
                <span className="ml-2">Server酱</span>
              </label>
            </div>
          </div>

          {config.notificationType === "tg" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  name="BotToken"
                  value={config.BotToken}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Telegram Bot Token"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  name="ChatID"
                  value={config.ChatID}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Telegram Chat ID"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Telegram API URL
                </label>
                <input
                  type="text"
                  name="TgApiUrl"
                  value={config.TgApiUrl}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="https://api.telegram.org"
                />
              </div>
            </>
          )}
          {config.notificationType === "server" && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Server酱
              </label>
              <input
                type="text"
                name="ServerJiang"
                value={config.ServerJiang}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="请输入 Server酱的配置"
              />
            </div>
          )}

          {/* 外部服务器监测选项 */}
          <div className="col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="useExternalServer"
                checked={config.useExternalServer}
                onChange={handleChange}
                className="form-checkbox"
              />
              <span className="ml-2">使用外部服务器监测</span>
            </label>
          </div>
          {config.useExternalServer && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                外部服务器地址 (Contcp)
              </label>
              <input
                type="text"
                name="Contcp"
                value={config.Contcp}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                placeholder="请输入外部服务器地址"
              />
            </div>
          )}

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Corn (监测间隔)
            </label>
            <input
              type="number"
              name="Corn"
              value={config.Corn}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              placeholder="300"
            />
          </div>
        </div>

        {/* Mata 配置部分 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Mata 配置</h2>
          {config.Mata.length === 0 && (
            <p className="text-red-500">请至少添加一条 Mata 配置</p>
          )}
          {config.Mata.map((mata, index) => (
            <div key={index} className="mb-4 border p-4 rounded-md relative">
              {/* 删除按钮 */}
              <button
                onClick={() => deleteMata(index)}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
              >
                删除
              </button>
              {/* Target 配置部分 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  目标模式
                </label>
                <select
                  value={mata.targetMode}
                  onChange={(e) =>
                    updateTarget(index, { targetMode: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="tcping">TCPing</option>
                  <option value="icmp">ICMP</option>
                  <option value="heartbeat">心跳模式</option>
                </select>
                {mata.targetMode === "tcping" && (
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Host
                      </label>
                      <input
                        type="text"
                        value={mata.tcpingHost}
                        onChange={(e) =>
                          updateTarget(index, { tcpingHost: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="请输入 Host"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Port
                      </label>
                      <input
                        type="text"
                        value={mata.tcpingPort}
                        onChange={(e) =>
                          updateTarget(index, { tcpingPort: e.target.value })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="请输入 Port"
                      />
                    </div>
                  </div>
                )}
                {mata.targetMode === "icmp" && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Host
                    </label>
                    <input
                      type="text"
                      value={mata.icmpHost}
                      onChange={(e) =>
                        updateTarget(index, { icmpHost: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      placeholder="请输入 Host"
                    />
                  </div>
                )}
                {mata.targetMode === "heartbeat" && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      心跳模式 (不带 . 的字符串)
                    </label>
                    <input
                      type="text"
                      value={mata.heartbeat}
                      onChange={(e) =>
                        updateTarget(index, { heartbeat: e.target.value })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                      placeholder="请输入心跳密钥"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    描述 (ps)
                  </label>
                  <input
                    type="text"
                    value={mata.ps}
                    onChange={(e) =>
                      handleMataChange(index, "ps", e.target.value)
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    placeholder="官网"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">
                    Main 配置 (目标在线时的解析)
                  </h3>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ZoneID
                    </label>
                    <input
                      type="text"
                      value={mata.Main.ZoneID}
                      onChange={(e) =>
                        handleMainChange(index, "ZoneID", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={mata.Main.Type}
                      onChange={(e) =>
                        handleMainChange(index, "Type", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="A">A</option>
                      <option value="CNAME">CNAME</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={mata.Main.Name}
                      onChange={(e) =>
                        handleMainChange(index, "Name", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <input
                      type="text"
                      value={mata.Main.Content}
                      onChange={(e) =>
                        handleMainChange(index, "Content", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Proxied
                    </label>
                    <select
                      value={mata.Main.Proxied}
                      onChange={(e) =>
                        handleMainChange(index, "Proxied", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">
                    Then 配置 (目标宕机时的解析)
                  </h3>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      ZoneID
                    </label>
                    <input
                      type="text"
                      value={mata.Then.ZoneID}
                      onChange={(e) =>
                        handleThenChange(index, "ZoneID", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={mata.Then.Type}
                      onChange={(e) =>
                        handleThenChange(index, "Type", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="A">A</option>
                      <option value="CNAME">CNAME</option>
                    </select>
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      value={mata.Then.Name}
                      onChange={(e) =>
                        handleThenChange(index, "Name", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Content
                    </label>
                    <input
                      type="text"
                      value={mata.Then.Content}
                      onChange={(e) =>
                        handleThenChange(index, "Content", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Proxied
                    </label>
                    <select
                      value={mata.Then.Proxied}
                      onChange={(e) =>
                        handleThenChange(index, "Proxied", e.target.value)
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="false">false</option>
                      <option value="true">true</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addMata}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            添加 Mata
          </button>
        </div>

        {/* JSON 配置展示及复制 */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">生成的 JSON 配置</h2>
          <div className="relative">
            {config.Mata.length === 0 ? (
              <p className="text-red-500 p-4">请至少添加一条 Mata 配置</p>
            ) : (
              <pre className="bg-gray-900 text-green-400 p-4 rounded-md overflow-auto">
                {JSON.stringify(getOutputConfig(), null, 2)}
              </pre>
            )}
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 bg-gray-700 text-white px-2 py-1 text-sm rounded hover:bg-gray-600"
            >
              复制
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
