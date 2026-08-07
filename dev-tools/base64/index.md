---
sidebar_position: 2
title: Base64 编解码
description: 在线 Base64 编解码工具，UTF-8 文本与 Base64 互转，支持文件转 Data URI
---

# Base64 编解码

在线 **Base64 编解码**工具，UTF-8 文本与 Base64 字符串互转，支持文件转 Data URI（图片嵌入）。

> **定位说明**：所有处理均在浏览器本地完成，数据不会上传到任何服务器，支持离线使用。

**功能特性**：

- **双向转换**：文本 → Base64 / Base64 → 文本
- **UTF-8 完整支持**：中文、Emoji 等 Unicode 字符正确编解码
- **文件转 Base64**：选择文件直接输出 `data:...;base64,...` Data URI，可用于图片嵌入
- **输入输出交换**：一键交换输入输出，便于双向验证
- **复制结果**：转换结果一键复制

**开源地址**：[GitHub](https://github.com/stark1898y/stark1898y.github.io/tree/main/public/tools/base64)

## 界面预览

![Base64 编解码界面](./images/web.png)

## 在线工具

<div style="margin-bottom: 12px;">
  <a href="/tools/base64/" target="_blank" style="display: inline-block; padding: 8px 20px; background: var(--vp-c-brand); color: white; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">在新窗口打开 →</a>
  <span style="margin-left: 12px; font-size: 13px; color: var(--vp-c-text-2);">内嵌页面显示不全时可点击上方按钮跳转</span>
</div>

<iframe
  src="/tools/base64/"
  style="width: 100%; height: 720px; border: none; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1)"
  title="Base64 编解码"
  loading="lazy"
></iframe>
