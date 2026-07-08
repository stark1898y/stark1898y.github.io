---
sidebar_position: 1
---

# SDI Printf 虚拟串口

WCH RISC CH32V303RCT6 单片机的 SDI Printf 虚拟串口功能，类似 SEGGER RTT 打印功能。

## 简介

SDI Printf 是 WCH 提供的一种虚拟串口调试功能，无需硬件串口即可打印调试信息。

## 特点

- 无需额外硬件串口
- 使用 SWD 接口
- 类似 SEGGER RTT 功能
- 支持 printf 重定向

## 使用方法

### 1. 启用 SDI Printf

在工程中启用 SDI Printf 功能。

### 2. 重定向 printf

```c
#include "debug.h"

int main(void)
{
    NVIC_PriorityGroupConfig(NVIC_PriorityGroup_2);
    SystemCoreClockUpdate();
    Delay_Init();
    USART_Printf_Init(115200);
    
    printf("SDI Printf Test\r\n");
    
    while(1)
    {
        // 主循环
    }
}
```

## 参考链接

- [WCH 官方文档](https://www.wch.cn/)
- [CH32V303 EVT 包](https://github.com/openwch/ch32v307)

---

:::info 注意
SDI Printf 需要使用 WCH-Link 调试器才能正常工作。
:::
