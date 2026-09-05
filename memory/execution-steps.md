# 执行步骤

## Step 19: 套餐展示、正式标注与计算说明修正

### Goal

修复渝发试用套餐事实、其他管理员当前租户首页，按本次明确反馈补齐正式标注，更新统一分钟池计算逻辑并保留原全量文档。

### Files

- `mock/data.js`
- `js/pages/home.js`
- `js/app.js`
- `index.html`
- `annotations/annotation-runtime.js`
- `annotations/annotations.js`（S9准备完成后依SRC-019回写）
- `docs/计算逻辑.html`
- `docs/功能说明文档.md`
- `docs/功能说明文档.html`
- `docs/interaction.html`
- `docs/decisions.md`
- `memory/source-materials.md`
- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/acceptance-map.md`
- `memory/annotation-prompt.md`
- `memory/annotation-coverage.md`

### Expected Change

- update

### Inputs

- SRC-019；SRC-014、SRC-016、SRC-018；D-018；R-033；当前源码与字段事实

### Work

- 修正试用种子权益及渝发充值类型，保留已编辑数值；其他管理员绑定渝发，仅展示本租户首页，不开放充值或使用明细。
- 修复SPA标注页识别与账户全局锚点；S8通过后重新扫描48锚点、生成本轮提示词，再回写空骨架并验证。
- 计算说明v2.0采用统一分钟池，补套餐、时长、四组合调整、冻结/结算/释放、幂等和示例；旧14节折叠为已停用历史设计，不删原文。
- 全量说明v3.3和迭代说明v1.8增量维护。保留租户管理菜单/页面演示差异，不改菜单权限。

### Acceptance

- 多租户初始渝发首页为试用套餐、7,800可用分钟；其他管理员套餐可见，创建/充值/调整仍拒绝。
- 首页、账户入口及两级用量标注可显示/隐藏，10维弹窗与字段逐行完整；不标注文档和图集。
- 新公式与源码及边界验证一致，原全量23小节和历史14节保留。

### Verification

- 静态检查、套餐/权限浏览器验证、冻结结算函数断言、五视图及桌面窄屏检查；回写后运行approve-annotations终检。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: index,home,sys-tenant,usage
- annotation-required: yes
- annotation-targets: home | 当前租户套餐与统一分钟余额 | region | FLD-002,FLD-003,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021,FLD-051
- 按当前完整48锚点重建，不继承旧数据、缓存或旧提示词。

### Dependencies

- STEP-18

### Failure Handling

- 留在本步修正，不重置已有额度、不扩大权限、不删除原文档。

## Step 18: 保留全量说明文档与注明权限演示差异

### Goal

恢复原全量说明入口并增量维护说明，明确租户管理为超管专属、本次不改原型菜单或页面权限逻辑。

### Files

- `index.html`（仅文档链接）
- `docs/功能说明文档.md`
- `docs/功能说明文档.html`（从原Markdown源生成）
- `memory/annotation-prompt.md`（仅新增当前权限文档依据，不继承旧标注）
- `memory/annotation-coverage.md`（仅记录新增文档依据覆盖）
- `docs/interaction.html`
- `docs/decisions.md`
- `memory/source-materials.md`
- `memory/business-rules.md`
- `memory/acceptance-map.md`

### Expected Change

- update

### Inputs

- SRC-018；D-017；原全量说明五.7权限章节；SRC-012至SRC-017当前充值规则

### Work

- 恢复右上角原全量文档入口，充值迭代说明提供显式全量链接，保留五交付视图。
- 原Markdown增量增加v3.2版本记录、现行充值摘要和权限演示限制，再使用原渲染器同步HTML；保留全部原章节及非本期正文。
- 权限唯一维护出处仍为原全量说明五.7；迭代说明引用该节，明确当前原型尚未隔离租户管理菜单和页面，本次不实现拦截。
- 旧金额/外部单号内容仅作历史方案原文保留，明确已由现行充值规则替代，不是当前兼容功能。

### Acceptance

- 原23个功能小节和全部旧版本记录保留；首页/充值/资金旧段落有失效说明，新充值规则清楚可达。
- 原入口打开全量v3.2；迭代说明v1.7可跳转全量文档和权限段落。
- 权限规则与原型现状分开说明；JS、业务样式、Mock及正式标注无本次修改。

### Verification

- 原Markdown/HTML同步检查，非本期章节与HEAD逐字比对、所有原标题保留、浏览器文档入口和权限锚点检查、五视图回归。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: None
- annotation-required: no
- annotation-targets: none
- 本次仅文档权限说明，不读写正式标注；下次重建标注以全量说明五.7为权限来源。

### Dependencies

- STEP-17

### Failure Handling

- 只修正文档内容与入口，不扩展到权限代码或其他模块。

## Step 17: 非超管验证入口与说明同步

### Goal

提供可直达的非超管演示账号，并同步本轮版本说明、业务规则和标注准备材料。

### Files

- `index.html`
- `js/app.js`
- `js/delivery-nav.js`
- `docs/interaction.html`
- `docs/decisions.md`
- `memory/source-materials.md`
- `memory/acceptance-map.md`
- `memory/annotation-prompt.md`
- `memory/annotation-coverage.md`

### Expected Change

- update

### Inputs

- SRC-017；D-016；SRC-012 至 SRC-016；FLD-004、FLD-005；R-031

### Work

- 通过 demoAccount 参数选择已存在的 tenant_user 演示上下文，不创建真实凭证、不接受任意租户 ID。
- 右上角功能说明和交付说明导航统一到本次迭代文档，在当前页切换。
- 文档 v1.6 汇总本次修正、演示账号和验证路径；S9 重新扫描当前锚点、同步标注提示词及覆盖清单。
- 正式红点标注不静默合并或覆盖，需用户明确确认完整重建回写。

### Acceptance

- 直达链接进入渝兴租户首页，余额 28,500 分钟、有效期与使用情况一致；每日明细可下钻到任务且合计一致。
- 多租户切换仅展示当前租户，超管无使用情况；普通用户无创建、充值和调整权限。
- 两个文档入口显示同一 v1.6，规则、权限和标注说明与当前实现一致，五视图桌面及窄屏可切换。

### Verification

- 语法、链接白名单、账号切换、首页与两级明细对账、说明入口及五视图、截图检查。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: index,home,sys-tenant,usage
- annotation-required: yes
- annotation-targets: index | 使用情况入口 | action | FLD-004,FLD-005
- 48 个当前业务锚点不新增，只同步本次验证入口和现行业务规则的说明。

### Dependencies

- STEP-16

### Failure Handling

- 留在本步修复入口或说明，不改变已确认套餐、权限和记账规则。

## Step 16: 创建与充值调整归属超级管理员

### Goal

按 SRC-016 将创建租户、充值和手工调增调减统一为超级管理员操作，保留超管无用量明细规则。

### Files

- `js/pages/sys-tenant.js`
- `js/app.js`
- `js/pages/home.js`
- `mock/data.js`
- `index.html`
- `flowcharts/business-process.html`（仅来源提示）
- `flowcharts/sequence-interaction.html`（仅来源提示）

### Expected Change

- update

### Inputs

- SRC-016；D-015；BR-018；FLD-005、FLD-031；R-030

### Work

- 创建、充值、手工调整入口及提交校验 super_admin；角色切换关闭窗口，取消待写账充值。
- 操作人读取当前登录账号；默认演示超管，其他管理员作为无权限对照。
- 保留试用/商用配置、统一分钟池、手工四组合及使用情况角色隔离；不扩大无关编辑/删除或任务权限。
- S9 同步当前说明和权限标注输入，冻结原图保持原文。

### Acceptance

- 超管创建、三种对应类型充值、调增/调减天数与分钟成功，流水操作人正确。
- 普通/多租户/其他管理员及未知角色无入口；直接调用及切换账号后不能写账。
- 超管无使用情况及明细，租户仍只查看当前租户；无外部单号、冻结值不受影响。

### Verification

- JS 语法、角色矩阵、主路径与越权/切换中断、五视图及桌面窄屏检查。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: index,home,sys-tenant,usage
- annotation-required: yes
- annotation-targets: sys-tenant | 新建租户 | action | FLD-001,FLD-002,FLD-003
- 当前 48 个锚点不新增，权限维度按 SRC-016 重新生成。

### Dependencies

- STEP-15

### Failure Handling

- 留在本步定位，不扩大其他管理功能权限，不修改冻结来源或正式标注。

## Step 15: 修复租户表单标签换行

### Goal

修复用户截图中的商用/试用字段标签换行和挤压，保留 R-001 业务行为。

### Files

- `assets/css/app.css`
- `index.html`

### Expected Change

- update

### Inputs

- 本轮用户截图；R-001；SRC-002、SRC-014；FLD-003

### Work

- 复现 90px 标签栏不足导致换行，改为统一 110px 单行标签并留 12px 间距。
- 窄屏允许选项组换行，但单个选项不拆行；不改业务源码、字段、锚点或标注内容。

### Acceptance

- 新建/编辑租户的商用/试用标签单行、无重叠；各行控件对齐。
- 1440、1024、390、320 宽度无横向溢出，单选及保存交互正常。

### Verification

- 浏览器测量、截图、单选/保存、五视图回归及 final 预检。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: no
- 仅样式，现有 48 个锚点及字段合同不变，无需重建提示词或正式标注。

### Dependencies

- STEP-14

### Failure Handling

- 留在本步修复表单布局，不调整充值业务规则或无关页面样式。

## Step 14: 删除历史兼容数据功能

### Goal

按 SRC-015 取消未上线旧功能的历史兼容，不影响当前内部记账。

### Files

- `js/pages/sys-tenant.js`
- `mock/data.js`
- `assets/css/app.css`
- `index.html`
- `related-systems/index.html`

### Expected Change

- update

### Inputs

- SRC-015 / D-014；BR-017；R-029

### Work

- 删除兼容页签、内容、专用渲染、样式和演示记录；无效页签调用保持当前页签。
- 保留内部充值与手工调整流水、空态及原有规则；同步当前说明，历史步骤仅作溯源。

### Acceptance

- R-029：仅有内部充值记录和手工调整流水，无兼容入口、面板及专用数据。
- 两页签切换、记录及空态正常；充值与调整正常写账，租户配置隔离不变。

### Verification

- 语法、引用、浏览器页签/空态/充值/调整、桌面及窄屏检查。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 内部充值流水 | region | FLD-024,FLD-025,FLD-026,FLD-027,FLD-028,FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034
- 删除 legacy-recharge-history，S9 从当前源码重新生成提示词。

### Dependencies

- STEP-13

### Failure Handling

- 在本步骤修复，不恢复兼容功能，不改冻结需求原图。

## Step 13: 试用套餐正名及租户类型隔离

### Goal

按 SRC-014 让试用与商用租户仅使用对应的充值配置，并消除误用名称。

### Files

- `js/pages/sys-tenant.js`
- `js/pages/home.js`
- `mock/data.js`
- `index.html`

### Expected Change

- update

### Inputs

- SRC-014 / D-013；BR-015；FLD-003、FLD-010、FLD-026、FLD-051

### Work

- 正式名称改为试用套餐，首页及新流水同步；未知历史套餐使用中性兜底。
- 用同一白名单控制充值入口、类型单选、打开与提交；试用仅trial_package，商用仅standard_annual/call_credit_pack。
- 保留默认值、编辑校验、手工调整及冻结结算；试用已开通不再提示购买话费包。

### Acceptance

- R-028：试用只见1种、商用只见2种类型，互不混显；跨类型直接调用或篡改提交被拒绝且账户流水不变。
- 试用默认和手改开通正确，新流水与首页显示试用套餐；商用两种配置默认值不变。
- 切换租户重新显示对应配置，手工调整两侧可用，无新增控制台或资源异常。

### Verification

- JS语法、浏览器默认/编辑/拒绝路径、租户切换、布局与源码锚点检查。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: sys-tenant,home
- annotation-required: yes
- annotation-targets: sys-tenant | 试用套餐开通入口 | action | FLD-003,FLD-010,FLD-014,FLD-016

### Dependencies

- STEP-12

### Failure Handling

- 按同一租户类型白名单定位显示和提交差异，复验后交付；不改历史记录或冻结原图。

## Step 12: 复用需求分析原图并补齐试用独立套餐

### Goal

按 SRC-013 修正交付图来源及试用租户实际套餐类型，覆盖上一轮同套餐假设。

### Files

- `flowcharts/business-process.html`
- `flowcharts/sequence-interaction.html`
- `js/pages/sys-tenant.js`
- `mock/data.js`
- `index.html`

### Expected Change

- update

### Inputs

- SRC-006、SRC-007 两份原始 HTML 图集；SRC-013；D-012
- BR-004、BR-015；FLD-010~016、FLD-026、FLD-050、FLD-051

### Work

- 原图逐场景复用到交付路径，仅添加来源、导航及非视觉属性，保留原文、SVG 和布局。
- 试用租户新增独立使用套餐入口与单选类型，默认 0 元、30 天、500 分钟；所有值支持编辑和预览。
- 写账生效为 trial_package，保存实际数值与内部流水；首页、用量同步，保留冻结与手工调整。

### Acceptance

- R-026、R-027；两份图各 7 个原始场景完整，剔除新增合同属性后 SVG 与源文件逐字一致。
- 默认及改值开通均成功；商用无试用套餐入口且强制调用拦截；未到期重复开通拦截。
- 非法输入和缺原因不写账；失败重试不重复入账；标准版/话费包与手工调整无回归。

### Verification

- JS 语法、源图内容比对、s7/final 检查。
- 浏览器验证表单默认/编辑/异常/写账、跨页对账、五视图与桌面窄屏；检查 console/network。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: sys-tenant,home
- annotation-required: yes
- annotation-targets: sys-tenant | 使用套餐开通入口 | action | FLD-003,FLD-010,FLD-014,FLD-016

### Dependencies

- STEP-11

### Failure Handling

- 保留冻结资料和已确认的启动快照，修正当前业务及文档后重新验证。

> 2026-09-05 评审修正由 STEP-11 承接，已删除的冻结结算说明区和原顶部独立入口以 STEP-11 / SRC-012 为准，原步骤保留作为首次实现记录。

> 每个步骤只实现一个可观察业务结果，并在通过单步验证后再进入下一步；文件清单仅包含业务原型与交付页面。

## Step 11: 完成充值与首页五项评审修正

### Goal

让当前版本的充值、账户入口与首页采用一致的新版套餐和分钟口径。

### Files

- `js/pages/sys-tenant.js`
- `js/pages/home.js`
- `js/app.js`
- `mock/data.js`
- `index.html`
- `assets/css/app.css`
- `config/nav.json`

### Expected Change

- update

### Inputs

- `docs/decisions.md` D-011；`memory/source-materials.md` SRC-012
- `memory/business-rules.md`
- `memory/field-map.md` FLD-050、FLD-051

### Work

- 删除冻结结算说明区与专属样式，保留账本行为。
- 为试用租户提供明确使用套餐开通入口和未开通演示数据，开通保留试用标记。
- 套餐总价可编辑，联动默认总价、偏离原因校验与内部流水实际金额。
- 将使用情况移动到账户下拉并保留角色和当前租户边界。
- 首页直接读取当前租户套餐、服务期、统一分钟池，管理角色不展示任意租户用量。

### Acceptance

- R-021 至 R-025 五项行为均通过浏览器验证。
- 价格支持 0 和两位小数；空、负数、超精度与偏离无原因均阻止提交。
- 数量变化自动更新未改总价，保留手改总价；流水金额、分钟与页面一致。
- 切换租户即刷新首页；充值后返回首页能看到新权益和余额。

### Verification

- JavaScript 语法、差异检查与 final 合同核对。
- 浏览器检查账户菜单、租户套餐开通、价格校验及写入、首页跨页一致性、桌面和窄屏布局。
- 对保留的冻结结算函数执行余额与幂等断言。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: index,sys-tenant,home
- annotation-required: yes
- annotation-targets: home | 当前租户套餐与统一分钟余额 | region | FLD-002,FLD-003,FLD-004,FLD-006,FLD-007,FLD-008,FLD-021,FLD-051
- annotation-targets: sys-tenant | 实际套餐价格 | region | FLD-011,FLD-028,FLD-050

### Dependencies

- STEP-01, STEP-02, STEP-03, STEP-04, STEP-05, STEP-06, STEP-07, STEP-08

### Failure Handling

- 按失败项修正对应页面或数据联动后重新验证，不修改冻结启动快照。

## Step 01: 建立统一分钟池与内部记录数据基线

### Goal

提供可被管理端、租户端和冻结结算共用的租户、权益、统一分钟池、内部流水和用量 mock 数据。

### Files

- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/field-map.md`
- `docs/decisions.md`

### Work

- 为租户补充 FLD-001~FLD-008 的身份、商用/试用、服务期和角色上下文。
- 新增标准版、充值包和统一分钟池数据，覆盖 FLD-010~FLD-023。
- 新增内部充值/调整记录 FLD-024~FLD-040，历史外部单号和金额记录保留只读标识。
- 新增按日和任务级用量 FLD-041~FLD-046，并保证二级合计等于一级日汇总。
- 预置 active、expired、empty、error、conflict 和超级管理员演示数据。

### Acceptance

- 大/小模型不再各自拥有独立可用余额字段作为新方案事实。
- 标准版默认 365 天/10,000 分钟，充值包默认 3,500 分钟/包。
- 至少有一个普通租户、一个多租户上下文和一个超级管理员场景。
- 每个日汇总均可由任务明细求和得到。

### Verification

- 对 `mock/data.js` 运行 JavaScript 语法检查。
- 用数据断言检查默认值、统一分钟池非负、日汇总与任务合计一致。
- 检查原始大数据未硬编码进页面脚本。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: None
- annotation-required: no
- annotation-targets: none

### Dependencies

- None

### Failure Handling

- 数据口径与业务规则冲突时回到 S3 修订项目记忆；仅数据结构问题留在本步骤修复。

## Step 02: 升级租户标记与账户概览

### Goal

在租户创建/编辑、租户列表和充值入口中展示并维护商用/试用标记，同时展示服务状态和统一分钟余额概览。

### Files

- `js/pages/sys-tenant.js`
- `assets/css/app.css`
- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/project-structure.md`

### Work

- 在租户表单增加 FLD-003 商用/试用单选并保存。
- 在租户列表增加标记、服务状态、有效期和可用分钟展示。
- 在充值管理入口上下文中展示 FLD-001、FLD-002、FLD-003。
- 为标记字段、标签和充值入口补全唯一 data-anno 合同。
- 确认仅更改标记不会修改权益或统一分钟池。

### Acceptance

- 商用和试用均可保存并立即在列表展示。
- 充值管理能识别当前租户和标记。
- 改标记前后 FLD-007、FLD-008、FLD-021、FLD-022 不变。
- 页面视觉沿用现有租户管理表格和弹窗。

### Verification

- 通过浏览器编辑同一租户的标记并重新打开表单。
- 记录编辑前后有效期、可用分钟和冻结分钟并断言不变。
- 检查 console 无阻塞错误，data-anno 值全局唯一。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 商用/试用标记维护与展示 | field,state,action | FLD-001,FLD-002,FLD-003,FLD-006,FLD-021

### Dependencies

- STEP-01

### Failure Handling

- 若表单结构无法安全扩展，保持页面职责不变并在 `js/pages/sys-tenant.js` 内做最小重构；不得新建无必要的独立租户页。

## Step 03: 重构充值管理概览与内部记录

### Goal

把旧“外部充值单关联”容器改为新方案充值管理，展示统一分钟池、内部充值记录和手工调整流水。

### Files

- `js/pages/sys-tenant.js`
- `assets/css/app.css`
- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/open-items.md`
- `memory/project-structure.md`
- `docs/decisions.md`

### Work

- 重构 `showBillingDrawer` 的信息架构：账户概览、内部充值记录、手工调整流水。
- 移除新流程中的充值单号输入、读取、反显和确认关联，不调用旧 D智链交互。
- 展示 FLD-006~FLD-008、FLD-020~FLD-034，记录完整字段和状态。
- 历史外部单号/金额记录只读兼容并显式标记“历史数据”，不进入新操作。
- 实现 loaded、empty_history 和 error/retry 状态。
- 为账户卡、充值入口、内部流水表和调整流水表增加 data-anno 合同。

### Acceptance

- 新充值管理页面不存在外部单号必填或读取按钮。
- 统一分钟池只显示一组可用/冻结/消耗分钟。
- 内部充值与调整流水可分别查看，字段与 field-map 一致。
- 无历史和加载失败状态可辨识且可重试。

### Verification

- 打开有历史和无历史租户的充值管理。
- 搜索页面 DOM，确认新操作区不存在“请输入充值单号/读取/确认关联”。
- 核对记录状态、前后值、原因、操作人和时间。
- 检查 console、资源和抽屉开关。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 充值管理概览与内部流水 | region,field,state,action | FLD-006,FLD-007,FLD-008,FLD-020,FLD-021,FLD-022,FLD-023,FLD-024,FLD-026,FLD-029,FLD-030,FLD-031,FLD-032,FLD-033,FLD-034

### Dependencies

- STEP-01, STEP-02

### Failure Handling

- 历史数据字段不足时按 OI-002/OI-004 显示“历史数据/暂无”，不得伪造；旧外部流程代码可保留为不可达兼容代码，但不能出现在新入口。

## Step 04: 实现标准版与充值包表单

### Goal

充值管理员能选择标准版或话费充值包，编辑使用天数和入账分钟，完成校验、预览、生效和内部记录写入。

### Files

- `js/pages/sys-tenant.js`
- `assets/css/app.css`
- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/open-items.md`
- `docs/decisions.md`

### Work

- 在充值管理中提供“开通标准版/购买话费充值包”入口和统一表单。
- 按 FLD-010~FLD-019 加载商品、价格、数量、默认/实际天数、默认/实际分钟、偏离原因和生效预览。
- 标准版默认 365/10,000；充值包默认分钟=包数×3,500。
- 实现正整数校验、偏离原因校验、有效服务期校验和写账失败重试。
- 成功后原子更新统一分钟池/服务期并生成 FLD-024~FLD-034 内部流水。
- 套餐说明展示 FLD-047~FLD-049，正好 50% 不做自动判定。
- 给类型、数量、天数、分钟、原因、预览和提交按钮增加 data-anno 合同。

### Acceptance

- 标准版和充值包切换时默认值正确，数量联动正确。
- 天数和分钟可编辑；0、负数、小数均不能提交。
- 修改默认值后原因必填；未修改时原因可为空并在记录中显示“使用默认值”。
- 充值包对未开通/已过期租户拒绝生效。
- 成功后可用分钟和内部流水同步更新，无额外审批步骤。

### Verification

- 分别执行标准版默认提交、标准版改值、充值包多包、充值包改值。
- 执行 0、负数、小数、偏离无原因和过期租户异常用例。
- 比较提交前后 FLD-021、FLD-024、FLD-029、FLD-030。
- 检查表单关闭、成功提示、错误提示和 console。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 标准版与充值包表单 | field,action,state | FLD-010,FLD-011,FLD-012,FLD-013,FLD-014,FLD-015,FLD-016,FLD-017,FLD-018,FLD-019,FLD-047,FLD-048,FLD-049

### Dependencies

- STEP-03

### Failure Handling

- 商品默认值冲突时回到 S3；表单校验或写账交互错误留在本步骤修复并重新验证。

## Step 05: 实现手工调增与调减

### Goal

充值管理员可对使用时长或可用分钟执行调增/调减，预览结果、校验边界并生成内部调整流水。

### Files

- `js/pages/sys-tenant.js`
- `assets/css/app.css`
- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/open-items.md`
- `docs/decisions.md`

### Work

- 升级旧余额调整为 FLD-035~FLD-040 的方向、对象、值、原因、前后值和账户版本。
- 根据调整对象切换“天/分钟”单位与可调减上限。
- 分钟调减仅减少可用分钟，不修改 FLD-022；使用时长调减不得低于合法下限。
- 实现缺字段、非正整数、越界和账户版本冲突状态。
- 成功后更新目标值并生成内部调整流水；历史金额记录只读保留。
- 为四组合选择、数值、原因、边界提示、预览和确认动作增加 data-anno 合同。

### Acceptance

- 调增/调减 × 使用时长/可用分钟四种组合均可选择。
- 至少一个调增和一个调减样例成功并写入流水。
- 越界调减被拒绝，冻结分钟保持不变。
- 缺方向、对象、值或原因时无法提交。
- 账户版本冲突时刷新当前值并要求重新确认。

### Verification

- 执行四组合选择，提交合法调增和合法调减。
- 记录调减前后可用分钟及冻结分钟，断言冻结不变。
- 执行越界、缺字段、非整数和 conflict 用例。
- 检查流水字段、状态和 console。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 手工调增调减 | field,action,state | FLD-035,FLD-036,FLD-037,FLD-038,FLD-039,FLD-040,FLD-022,FLD-029,FLD-030

### Dependencies

- STEP-03

### Failure Handling

- 若旧金额逻辑影响新表单，隔离历史只读渲染与新调整状态，不做金额折算。

## Step 06: 新增右上角使用情况与按日明细

### Goal

普通租户用户能从右上角进入当前登录租户的使用情况，查看有效期、统一分钟余额和按日消耗；超级管理员无入口。

### Files

- `index.html`
- `js/app.js`
- `js/nav.js`
- `js/pages/usage.js` (create)
- `assets/css/app.css`
- `mock/data.js`
- `config/nav.json`

### Expected Change

- create, update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/project-structure.md`

### Work

- 创建独立 `window.Pages['usage']` 模块，理由是它属于租户用户自助区而非租户管理后台。
- 在顶部右侧根据 FLD-005 显示/隐藏“使用情况”入口。
- 由 FLD-004 锁定当前租户，展示 FLD-006~FLD-008、FLD-021、FLD-041、FLD-042。
- 实现 loaded、empty_daily_usage、expired、error/retry 状态。
- 多租户账号始终使用当前登录租户；请求其他租户时拒绝。
- 为入口、概览、日明细、空态和重试增加 data-anno 合同。

### Acceptance

- 普通租户用户可见入口且进入后租户名称与登录态一致。
- 超级管理员看不到入口；直接调用页面模块也不返回租户明细。
- 余额只显示一组可用分钟，不显示金额或大小模型分池。
- 按日表展示日期和当日消耗，空态/错误态清晰。

### Verification

- 切换普通租户、另一租户和超级管理员三种登录上下文。
- 点击右上角入口并核对 FLD-004、FLD-021、FLD-041、FLD-042。
- 触发 empty、expired、error 并点击重试。
- 检查导航、console、资源和 1280/1440 宽度布局。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: index, usage
- annotation-required: yes
- annotation-targets: index | 使用情况入口与权限 | action,state | FLD-004,FLD-005; usage | 有效期与按日消耗 | region,field,state | FLD-002,FLD-006,FLD-007,FLD-008,FLD-021,FLD-041,FLD-042

### Dependencies

- STEP-01, STEP-02

### Failure Handling

- 如果 CurrentUser 私有状态无法支持切换，在 `js/app.js` 暴露只读 getter/setter 演示接口；不得把权限逻辑硬编码在 HTML 文案上。

## Step 07: 新增每日任务分钟消耗二级明细

### Goal

用户可从按日记录进入任务级明细，查看当前租户所选日期的任务消耗并核对当日合计。

### Files

- `js/pages/usage.js`
- `assets/css/app.css`
- `mock/data.js`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/field-map.md`
- `memory/open-items.md`

### Work

- 在 usage 模块内增加日明细到任务明细的二级状态和返回动作。
- 展示 FLD-043~FLD-046，并保留 FLD-002、FLD-004、FLD-041 作为只读上下文。
- 加载时校验任务合计与一级日汇总；不一致时展示数据异常，不静默修正。
- 实现 empty、error/retry 和租户越权保护。
- 为下钻、任务列、合计、返回、空态和重试增加 data-anno 合同。

### Acceptance

- 点击某日进入对应日期任务明细，返回后保留原列表状态。
- 任务 ID、名称、消耗分钟和合计均可见。
- DOM 计算合计等于一级对应日期值。
- 空数据、加载失败和租户不一致均有明确状态。

### Verification

- 点击至少两个日期并核对任务列表。
- 从 DOM 求和 FLD-045 与 FLD-046/FLD-042 比较。
- 测试返回、空态、错误重试和越权场景。
- 检查 console 和响应式表格可读性。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: usage
- annotation-required: yes
- annotation-targets: usage | 每日任务分钟明细 | action,field,state | FLD-002,FLD-004,FLD-041,FLD-043,FLD-044,FLD-045,FLD-046

### Dependencies

- STEP-06

### Failure Handling

- 合计不一致时先修正 STEP-01 mock 数据；若规则歧义则回到 S3，不在页面层强行覆盖。

## Step 08: 验证冻结结算与历史记录兼容

### Goal

证明新统一分钟池未破坏原有冻结、未接通不计费、任务结算/解冻和历史租户充值管理，并对复现的阻断缺陷做最小修复。

### Files

- `js/pages/sys-tenant.js`
- `mock/data.js`
- `assets/css/app.css`

### Expected Change

- update

### Inputs

- `memory/business-rules.md`
- `memory/open-items.md`
- `memory/project-structure.md`
- `docs/decisions.md`

### Work

- 让现有冻结释放函数读取统一分钟池口径，保留幂等释放行为。
- 提供余额不足、已接通不足 1 分钟、未接通、正常完成和任务终止样例。
- 复现 OI-005 的历史记录抽屉错误；若复现，只修复阻断渲染的最小范围。
- 检查历史外部单号和金额调整只读展示，不进入新写入路径。
- 对兼容说明和冻结状态补必要 data-anno 合同。

### Acceptance

- 余额不足时任务不启动；未接通不消耗。
- 接通不足 1 分钟计 1 分钟；完成/终止后冻结被正确结算或释放。
- 重复释放不会重复增加可用分钟。
- 有历史记录的租户能正常打开充值管理且无 `ReferenceError`。
- 历史数据只读，新记录不包含外部单号。

### Verification

- 运行冻结/接通/未接通/完成/终止数据断言。
- 浏览器打开指定历史租户并检查 console。
- 重复触发释放并比较统一分钟池值。
- 搜索新写入对象，确认无外部单号依赖。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/systematic-debugging`

### Annotation Impact

- affected-pages: sys-tenant
- annotation-required: yes
- annotation-targets: sys-tenant | 冻结结算与历史兼容 | state,region | FLD-021,FLD-022,FLD-023,FLD-024,FLD-028,FLD-034

### Dependencies

- STEP-03, STEP-04, STEP-05

### Failure Handling

- 原有冻结语义不清时回到 S3；仅实现或历史渲染错误留在本步骤修复，连续三次失败触发熔断。

## Step 09: 生成本地业务流程图

### Goal

用本地 HTML 泳道图展示租户开通/充值、手工调整、冻结结算和使用情况主流程、判断与异常回流。

### Files

- `flowcharts/business-process.html`
- `assets/css/delivery-diagrams.css`
- `js/delivery-nav.js`

### Expected Change

- update

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/execution-steps.md`
- `docs/decisions.md`

### Work

- 将根节点 `data-diagram-state` 改为 `ready`。
- 至少生成平台管理员、充值管理员/充值管理、内部额度账本、租户用户/任务系统等泳道。
- 使用唯一 `data-flow-lane`、`data-flow-node`、`data-flow-edge` 表达真实动作和条件。
- 覆盖标准版/充值包、偏离原因、手工调整边界、冻结结算、当前租户用量和异常回流。
- 页面直接包含可读 HTML，不使用 ProcessOn、远程 iframe 或图片正文。

### Acceptance

- 至少 1 个 lane、2 个 node、1 个 edge，实际内容覆盖 3 条核心业务流。
- 主流程、判断和异常标签可读，无空壳或占位文字。
- 五视图导航可切换且本地资源无 404。

### Verification

- 检查 data 属性唯一性、`data-diagram-state="ready"` 和节点/边数量。
- 浏览器查看流程图在 1440 与 1280 宽度下可读。
- 检查无 ProcessOn、远程 iframe 和控制台错误。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: None
- annotation-required: no
- annotation-targets: none

### Dependencies

- STEP-04, STEP-05, STEP-07, STEP-08

### Failure Handling

- 流程内容与业务规则冲突时回到 S3；布局问题留在本步骤调整并重新验证。

## Step 10: 生成本地时序图并确认关联系统空态

### Goal

用本地 HTML 时序图展示充值、调整、冻结结算和用量查询的参与者消息顺序，并明确本轮无新增外部系统依赖。

### Files

- `flowcharts/sequence-interaction.html`
- `related-systems/index.html`
- `assets/css/delivery-diagrams.css`
- `js/delivery-nav.js`

### Expected Change

- update, verify-only

### Inputs

- `memory/project.md`
- `memory/business-rules.md`
- `memory/source-materials.md`
- `memory/execution-steps.md`
- `docs/decisions.md`

### Work

- 将时序图根节点 `data-diagram-state` 改为 `ready`。
- 使用唯一 `data-sequence-participant` 和 `data-sequence-message` 展示角色、充值管理、额度账本、任务系统和使用情况的请求/响应。
- 覆盖充值校验、写账、手工调整冲突、任务冻结/结算和当前租户两级查询。
- 保持 `related-systems/index.html` 的 `data-related-systems-state="empty"`，正文说明 D智链读取/关联为 not_required。
- 页面直接包含可读 HTML，不使用远程图或无语义占位。

### Acceptance

- 至少 2 个 participant、1 个 message，实际内容覆盖关键交互和失败响应。
- 时序从上到下可读，角色和系统边界清晰。
- 关联系统页明确说明“新充值无外部接口依赖”，不伪造系统卡片。
- 五视图导航和本地资源正常。

### Verification

- 检查 data 属性唯一性、ready/empty 状态及 participant/message 数量。
- 浏览器查看时序图和关联系统空态。
- 检查无远程资源、无 console 错误、交互文案与 SRC-007/SRC-010 一致。

### Verification Skill

- Verification Skill: `prototype-verifier`
- Browser Evidence Tool: `playwright-cli when needed`
- Support Skill: `superpowers-pm-prototype/skills/verification-before-completion`

### Annotation Impact

- affected-pages: None
- annotation-required: no
- annotation-targets: none

### Dependencies

- STEP-04, STEP-05, STEP-07, STEP-08

### Failure Handling

- 时序语义与业务规则冲突时回到 S3；结构或布局问题留在本步骤修复并重新验证。
