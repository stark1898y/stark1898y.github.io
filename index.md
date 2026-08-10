---
layout: home

hero:
  name: Stark1898y
  text: 个人知识库
  tagline: 嵌入式开发笔记与在线工具集
  actions:
    - theme: brand
      text: 浏览知识库
      link: /docs/intro
    - theme: alt
      text: 开源项目
      link: /open-source/
    - theme: alt
      text: 开发工具
      link: /dev-tools/
  image:
    src: /logo.svg
    alt: Stark1898y

features:
  - icon: 🔌
    title: 硬件设计
    details: 电源、接口、保护器件、常用器件、无线通信等硬件相关知识
    link: /docs/hardware/tools

  - icon: 🎛️
    title: MCU 开发
    details: STM32、WCH RISC-V、BLE 蓝牙等多平台 MCU 开发笔记
    link: /docs/mcu/

  - icon: 💻
    title: 软件开发
    details: 框架架构、常用组件、存储方案、通信协议、升级方案
    link: /docs/software/framework/bare-metal

  - icon: ⚙️
    title: RTOS 系统
    details: RT-Thread、FreeRTOS 等实时操作系统的学习笔记
    link: /docs/rtos/comparison

  - icon: 🛠️
    title: IDE 与调试
    details: Keil MDK、VS Code 等 IDE 使用技巧与调试工具笔记
    link: /docs/tools/ide/keil-mdk

  - icon: 🐧
    title: Linux 开发
    details: Linux 基础、驱动开发、交叉编译等知识
    link: /docs/linux/basics

  - icon: 🤖
    title: AI & Python
    details: Python 基础、机器学习、AI 工具等学习笔记
    link: /docs/ai-python/python-basics

  - icon: 📚
    title: 学习资源
    details: 推荐博客、常用网站、推荐书籍等学习资源汇总
    link: /docs/resources/blogs
---

<div class="project-showcase">

## 开源项目

精选开源工具，专注嵌入式开发场景

<div class="project-grid">

  <a class="project-card" href="/open-source/power-calculator/">
    <img src="/power-calc.png" alt="功耗计算器">
    <div class="card-body">
      <div class="card-icon">🔋</div>
      <div class="card-title">功耗计算器</div>
      <div class="card-desc">嵌入式设备电池续航与容量在线估算工具，支持锂电池、锂亚电池、碱性干电池等多种电池类型，多工作模式配置，图表可视化能耗分布。</div>
      <span class="card-link">查看详情 →</span>
    </div>
  </a>

  <a class="project-card" href="/open-source/gas-converter/">
    <img src="/gas-converter.png" alt="气体浓度换算">
    <div class="card-body">
      <div class="card-icon">🧪</div>
      <div class="card-title">气体浓度换算</div>
      <div class="card-desc">可燃气体 %VOL、ppm、%LEL 浓度单位在线换算工具，支持甲烷、氢气、一氧化碳等 8 种常见可燃气体，提供 C / Python / Web 三端实现。</div>
      <span class="card-link">查看详情 →</span>
    </div>
  </a>

</div>
</div>

<div class="project-showcase">

## 在线开发工具

常用开发调试小工具，完全在浏览器本地运行

<div class="project-grid">

  <a class="project-card" href="/dev-tools/timestamp-converter/" target="_self">
    <div class="card-body">
      <div class="card-icon">⏰</div>
      <div class="card-title">时间戳转换</div>
      <div class="card-desc">Unix 时间戳（秒/毫秒）与日期时间互转，自动识别精度，支持 38 个常用时区与批量转换。</div>
      <span class="card-link">查看详情 →</span>
    </div>
  </a>

  <a class="project-card" href="/dev-tools/json-formatter/" target="_self">
    <div class="card-body">
      <div class="card-icon">📄</div>
      <div class="card-title">JSON 格式化</div>
      <div class="card-desc">粘贴 JSON 即刻美化缩进、语法高亮，支持压缩与校验，错误精准定位到行和列。</div>
      <span class="card-link">查看详情 →</span>
    </div>
  </a>

  <a class="project-card" href="/dev-tools/base64/" target="_self">
    <div class="card-body">
      <div class="card-icon">🔤</div>
      <div class="card-title">Base64 编解码</div>
      <div class="card-desc">UTF-8 文本与 Base64 字符串互转，支持文件转 Data URI，输入输出一键交换。</div>
      <span class="card-link">查看详情 →</span>
    </div>
  </a>

  <a class="project-card" href="/dev-tools/">
    <div class="card-body">
      <div class="card-icon">🧰</div>
      <div class="card-title">全部开发工具</div>
      <div class="card-desc">工具集概览，更多实用开发调试工具持续上新中。</div>
      <span class="card-link">查看全部 →</span>
    </div>
  </a>

</div>
</div>

<div class="platform-section">

## 更多平台

在其他平台也能找到我的技术分享

<div class="platform-grid">

  <a class="platform-card" href="https://blog.csdn.net/gg1658608470?spm=1000.2115.3001.10640" target="_blank">
    <div class="platform-icon">📝</div>
    <div class="platform-title">CSDN 博客</div>
    <div class="platform-tag">技术文章 · 实战笔记</div>
    <div class="platform-desc">嵌入式开发技术博客，涵盖 STM32、RTOS、硬件设计、通信协议等内容，持续更新中。</div>
    <span class="platform-action">访问 CSDN 博客 →</span>
  </a>

  <div class="platform-card">
    <div class="platform-icon">💬</div>
    <div class="platform-title">微信公众号</div>
    <div class="platform-tag">扫码关注 · 获取更新</div>
    <div class="platform-desc">关注微信公众号，获取嵌入式开发干货、开源项目动态和技术分享推送。</div>
    <div style="text-align: center; margin-top: 12px;">
      <img src="/wechat-qrcode.png" alt="微信公众号二维码" style="width: 400px; height: auto; border-radius: 8px;">
    </div>
  </div>

</div>
</div>
