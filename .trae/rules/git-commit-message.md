---
---
alwaysApply: true
scene: git_message
---
# Git 提交信息规范

## 格式

```
<type>(<scope>): <中文简述>

<详细说明（可选）>
```

## type 类型

| type         | 说明                                     |
| ------------ | ---------------------------------------- |
| `feat`     | 新功能                                   |
| `fix`      | Bug 修复                                 |
| `refactor` | 重构（不改变功能行为）                   |
| `perf`     | 性能优化                                 |
| `style`    | 代码格式调整（空格、缩进等，不影响逻辑） |
| `docs`     | 文档变更                                 |
| `test`     | 测试相关                                 |
| `chore`    | 构建/工具/配置等杂项                     |

## scope 范围

用涉及的模块或文件名，常见：`ui` `net` `ble` `ch4` `onenet` `camera` `scheduler` `record` `battery` `water` `memory` `common` `main`

## 简述

- 中文，一行概括本次变更做了什么
- 不超过 50 字
- 不需要句号结尾

## 示例

```
feat(ui): 新增手动联网状态页面
```

```
fix(net): 修复空闲超时无法关机的问题
```

```
refactor(onenet): 统一属性上报分组逻辑
```

```
chore: 升级 FlashDB 至 v2.2.0
```

---
