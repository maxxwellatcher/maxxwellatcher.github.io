---
title: 通用commit规范
createTime: 2025/01/24 02:09:46
permalink: /article/0dhichno/
tags:
  - git
  - 未完待续
---
## commit规范

1. feat: 新增功能
2. fix: 修复bug
3. docs: 文档修改
4. style: 代码格式修改，不影响逻辑
5. refactor: 重构代码，不是新增删除，也不是修改bug
6. perf: 性能优化
7. test: 测试相关
8. chore: 构建工具或者辅助工具的变动
9. WIP: 正在进行、未完成工作但又不得已需要进行提交的情况下使用 (work in progress)
10. merge: 合并分支，通用格式：`merge: branch <branch_name1> into <branch_name2>`

## 分支管理办法

这里办法是通用的git管理最佳实践。

### 三个必要分支

* dev
* release
* main

dev为开发分支，表示未进行完整测试的代码。

main为主分支，表示稳定版本，只进行bug修复以及release合并。

release为发布分支，要求其上的代码必须是通过测试的。

### 临时分支

临时分支应当在完成其任务后删除，通常需要合并后再删除分支。需要注意的是：删除本地分支后，远程分支并不会自动删除。所以需要定期清理远程分支。

```sh
git branch -d <branch_name> # 删除本地已合并分支
git branch -D <branch_name> # 强制删除本地未合并分支
git push origin --delete <branch_name> # 删除远程分支
```

#### 临时分支命名规范

* feat-xxx: feat为功能分支，一般从dev中切出，再合并到dev。
* fix-xxx: fix为修复分支，一般从main中切出，修复好后合并到main和release。

### 常用命令

```sh
git log # 查看历史提交记录，查看commit ID
git checkout -b <branch_name> [commit ID] # 从某个节点开始创建分支
git push # 推送本地分支到远程
git pull # 拉取最新代码
git merge <branch_name> -m <message> # 合并分支到当前分支
git commit -m <message> # 提交代码
```

## tag管理规范

通常而言只需要在release分支和main分支上打tag，前缀带上分支名称例如`release/v1.0.0`和`main/v1.0.0`。