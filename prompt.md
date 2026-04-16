# Ralph Loop For Ariba

你现在按 Ralph 单故事迭代工作。

## 必读文件
- prd.json
- progress.txt

## 选择规则
1. 读取 prd.json 和 progress.txt。
2. 选择 `passes=false` 且 `dependsOn` 全部已完成的最高优先级故事。
3. 每轮只做一个故事，不顺手扩展到其他故事。

## 执行规则
1. 复述当前故事的目标、验收条件、涉及文件和验证命令。
2. 严格走 TDD: 先写 failing test，再做最小实现，再复跑通过。
3. 故事完成后必须重新跑：
   - 故事测试
   - pnpm lint .
   - pnpm ts-check
   - pnpm exec next build
4. 如果故事涉及用户可访问页面，追加本地 deploy smoke：
   - pnpm exec next start --port 5000
   - 验证对应路由可以访问
5. 只有在 fresh verification 全绿后，才能把该故事标记为 `passes=true`。
6. 每轮结束把命令结果、问题、教训、风险追加到 progress.txt。

## 禁止事项
- 禁止一次处理多个故事。
- 禁止没有 failing test 就写 production code。
- 禁止没有 fresh verification 就改 `passes`。
- 禁止修和当前故事无关的 warning，除非它阻塞质量门禁。

## 当前建议起点
- US-007 团队目录搜索与角色浏览

理由:
- US-001 到 US-006 已经完成，并建立了这份仓库按故事推进的最小测试基线。
- 下一轮应优先处理团队目录的搜索与角色浏览，继续清理用户主路径中的浏览闭环问题。