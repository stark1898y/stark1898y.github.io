---
sidebar_position: 1
---

# RT-Thread 快速入门

RT-Thread 是一个开源的实时操作系统，支持多种 MCU 平台。

## 简介

RT-Thread 是一款高度可裁剪的实时操作系统，具有以下特点：

- 小巧、高效
- 组件丰富
- 社区活跃
- 支持多种 MCU 平台

## 支持的平台

- STM32 系列
- WCH CH32V 系列
- ESP32 系列
- 其他 ARM/RISC-V 平台

## 开发环境

### RT-Thread Studio

RT-Thread Studio 是官方推荐的 IDE，支持：

- 图形化配置
- 代码生成
- 在线调试
- 包管理器

### MounRiver Studio

对于 WCH RISC-V 平台，也可以使用 MounRiver Studio。

## 快速开始

### 1. 安装 RT-Thread Studio

从官网下载并安装 RT-Thread Studio。

### 2. 创建项目

选择目标开发板，创建新项目。

### 3. 编写代码

```c
#include <rtthread.h>

int main(void)
{
    rt_kprintf("Hello RT-Thread!\n");
    return 0;
}
```

### 4. 编译下载

编译项目并下载到开发板。

## 常用组件

- FinSH Shell
- 文件系统
- 网络协议栈
- GUI 框架

---

:::tip 提示
建议从官方示例开始学习，逐步了解 RT-Thread 的各个组件。
:::
