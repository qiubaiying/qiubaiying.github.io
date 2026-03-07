---
layout:     post
title:      pairtools处理HIC测序数据
subtitle:   bug解决日志
date:       2026-03-04
author:     June
header-img: img/header_img/snow-4936687.jpg
assets_folder: pairtools处理HIC数据bug解决日志.assets
tags:
    - 生信
article: true
---

## 一、scHi-C 核心原理概述

scHi-C（single-cell High-throughput Chromosome Conformation Capture）是**单细胞水平**的染色质三维空间互作捕获技术，核心目标是解析单个细胞内染色质的**多位点同时互作（Chromatin Hub）**。
其实验核心原理：通过甲醛交联固定染色质天然空间构象，限制性内切酶切割基因组DNA，对**空间邻近的不同染色质区段**进行生物素标记与连接，形成跨多个基因组位点的**嵌合DNA片段**；利用高通量双端测序读取嵌合片段序列，通过生物信息学比对定位片段对应的基因组坐标，最终还原染色质的真实空间接触关系。
区别于群体细胞Hi-C，scHi-C 高度依赖**嵌合read（chimeric read）**的捕获与分析，这是识别单细胞多位点互作的核心数据特征。

---

## 二、测序数据格式

### SAM 格式（比对结果存储）
SAM 是存储序列比对信息的标准文本格式，每行代表一条 read 的比对记录，scHi-C 数据中**同一 read name 的 R1/R2 记录连续相邻**，示例如下：
```
A01045:956:HMNFYDMXY:2:1101:19307:1016	97	chr10	111308001	60	150M	=	111308051	200	GTATGTGATGGGTCAACGTGCCACAGACTCAGGAGTAACGAGGCCTCCTGACCTCAGACAAAACCTCCAACACTATGAGCACAATGAACGTTCCCTGCTTTTAAAGCTGATGATCTCAGGTATTCTGGTACACTAACAGAAAGCTGATGT	FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFFFFFFFFFFFFFFFFFF,FFF:FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFFFFF:FFFFFF:FF	NM:i:1 MD:Z:81A68	MC:Z:150M	AS:i:145	XS:i:0
A01045:956:HMNFYDMXY:2:1101:19307:1016	145	chr10	111308051	60	150M	=	111308001	-200	ACCTCAGACAAAACCTCCAACACTATGAGCAAAATGAACGTTCCCTGCTTTTAAAGCTGATGATCTCAGGTATTCTGGTACACTAACAGAAAGCTGATGTGATGGTTTTAAATGTTAACTCAGAATCATGTGGGAAGAGAGTCTCCATAG	FFF:FFFFFFFFFFFFFFFFFFF:FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFF:FFFFFFFFFFFFFFFFFFFFFFFF	NM:i:0 MD:Z:150	MC:Z:150M	AS:i:150	XS:i:0
A01045:956:HMNFYDMXY:2:1101:23683:1047	81	chrX	25068476	0	150M	=	32598360	7529736	TAGATTCCCTCTTTTCTTCCAGATTCCAAGATGCCTTCCAGGCTCGAACCCGGACATGTGAGCCACTGGCCAGCCTCAACAATTTGGCGAACCAATGCAGGACCTGAGAAAGGCAGAGGACATTTGGAAGAAACACTGCTGATTTGTAGC	FFFFF,FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF:FFFFFFF,FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF	NM:i:0 MD:Z:150	MC:Z:150M	AS:i:150	XS:i:150
```

#### 关键字段原理（scHi-C 核心）
1. **readName**：测序原始 read 唯一标识，**R1 和 R2 共享完全相同的 read name**，是 pairtools 配对的核心依据；
2. **flag**：二进制状态码（scHi-C 关键），`97/145` 为双端 read 正确配对的反向比对标记，`81` 为单端反向比对标记，直接标识 read 类型与比对方向；
3. **chr/pos**：read 比对的染色体与基因组坐标，是染色质互作的定位基础；
4. **mapQ**：比对质量值（`60`为最高可信度，`0`为无有效比对），parse2 步骤会过滤 `min-mapq 40` 以下的低质量记录；
5. **CIGAR（150M）**：表示 150bp 序列完全匹配，无插入缺失，是 scHi-C 有效比对的标准格式；
6. **RNEXT/PNEXT**：配对 read（R1/R2）的比对染色体/坐标，`=` 表示配对 read 比对在同一条染色体；
7. **SA:Z**（嵌合read专属tag）：scHi-C 核心特征，记录一条 read 的多个比对位置，对应染色质多位点空间互作；
8. **NM/MD/AS**：比对错配、匹配区域、比对得分等质控标签，用于评估比对可靠性。



### 原理补充
1. 双端测序的必要性：Hi-C 实验产生的有效片段均为**空间邻近的不同染色质区段连接形成的嵌合片段**，R1、R2 分别读取片段两端，可直接定位两个互作位点；
2. 单细胞数据特征：每个细胞独立生成 R1.fastq.gz 和 R2.fastq.gz 两个文件，保证单细胞分辨率的数据独立性；
3. 嵌合read价值：scHi-C 中一条 read 可能比对到多个基因组位置，直接对应染色质多位点空间互作。

---

## 三、比对流程
### BWA 比对（核心比对步骤）
```bash
bwa mem -SP5M -T0 -t16 ref.fa R1.fastq.gz R2.fastq.gz > output.int.sam
```

#### 1. scHi-C 专用参数原理（关键）
`-SP5M` 是 Hi-C/scHi-C 数据的**专用参数组合**，专为嵌合read设计，缺一不可：
- `-S`：跳过SAM头部校验，适配Hi-C嵌合read的输出格式；
- `-P`：严格保留双端read的配对关系，保证R1/R2绑定；
- `-5`：仅保留read 5'端比对位置（Hi-C互作仅依赖片段末端坐标，排除内部序列干扰）；
- `-M`：将多位置比对的read标记为次级比对，通过`SA`tag记录所有嵌合位点；
- `-T0`：最低比对得分设为0，保留弱比对信号，避免丢失嵌合read；
- `-t16`：16线程加速比对。

#### 2. 输出核心规则
BWA 直接输出的 SAM 文件**严格按照 read name 排序**，**同一 read 的 R1、R2 及所有嵌合比对记录连续相邻**，这是后续 pairtools 配对的**必要前提**。

### SAM 格式（比对结果存储）
```sh
readName  flag  chr7  144581129  60  150M  =  125449562  ...  SA:Z:...
readName  flag  chr7  125449562  60  150M  =  144581129  ...
```

#### 关键字段原理
- `flag`：二进制标记，标识read类型（R1/R2）、比对方向、是否唯一比对；
- `SA:Z:***`：**嵌合read标记**，scHi-C核心特征，记录一条read的所有补充比对位置，对应多位点互作；
- 坐标信息：记录染色质互作的基因组位置，是三维构象分析的基础。

---

## 四、pairtools 处理流程
pairtools 是 Hi-C/scHi-C 数据标准化工具，核心功能是完成read配对、过滤、去重，输出标准化互作对（pairs）。

### parse2：SAM → pairs 格式转换（最核心步骤）
```bash
pairtools parse2 -c mm10.chrom.sizes --assembly mm10 --add-pair-index --expand --drop-sam --min-mapq 40 input.sam -o output.pairs
```

#### 工作原理
1. 算法：采用**滑动缓冲窗口**扫描SAM，将同名read存入缓冲区，等待R1/R2及嵌合记录全部集齐后完成配对；
2. 硬性依赖：**必须基于read name连续的SAM文件**，记录分散则直接判定为无效；
3. 输出规则：生成pairs格式，存储一对read对应的两个互作位点坐标；
4. `pair_type=UU`：两端均**唯一比对**，是scHi-C有效互作的金标准。

### sort：pairs 基因组坐标排序
```bash
pairtools sort -o output_sorted.pairs input.pairs
```
#### 原理
原始pairs按read name排序，**相同坐标的重复互作分散存储**；按基因组坐标排序后，技术重复会连续排列，为去重做准备。

### dedup：PCR 重复去除
```bash
pairtools dedup --mark-dups --output-stats output.dedup.stats -o output_dedup.pairs input_sorted.pairs
```
#### 原理
1. 重复来源：PCR扩增会导致**同一原始嵌合片段被多次测序**，产生完全相同的坐标互作（技术噪音）；
2. 去重逻辑：识别坐标完全一致的pairs，仅保留1条，保证数据的生物学真实性；
3. `--mark-dups`：标记重复而非直接删除，便于质控。

### select：过滤自连接，保留 UU 有效对
```bash
pairtools select '(pair_type=="UU") and ((chrom1!=chrom2) or (abs(pos1-pos2)>10000))' input_dedup.pairs > output.Noselfligation.UU.pairs
```
#### 原理
1. 自连接（self-ligation）：Hi-C实验技术噪音，指**同一染色质片段自身连接**，非真实空间互作；
2. 过滤规则：同一染色体距离＜10kb的互作判定为自连接，直接剔除；
3. 保留规则：仅保留`UU`类型（两端唯一比对）的高可信度互作。

---

## 五、自定义过滤流程（R语言，scHi-C特有）
### 去 blacklist 区域
```r
# 去除两端落入 mm10 blacklist 区域的 pairs
y <- a[a$ID1 == 0 & a$ID2 == 0, ]
```
#### 原理
黑名单区域是基因组中**串联重复、着丝粒、比对异常区**的集合，序列重复性极高，互作信号无生物学意义，需彻底剔除。

### 筛选多位点接触（≥3个10kb bin）
```r
# 只保留一条 PE read 覆盖 ≥3 个唯一 10kb bin 的接触
out <- rec[rec$Num.10Kb.Bin >= 3, ]
```
#### 原理
1. scHi-C核心：专注**多位点同时互作（Chromatin Hub）**，区别于普通Hi-C的两位点互作；
2. 10kb bin：染色质互作的基本分析单元；
3. 筛选逻辑：≥3个不同bin代表真实多位点互作，＜3个判定为普通Hi-C噪音。

---

## 六、典型问题排查：M24样本处理失效分析
### 6.1 异常症状
1. M24 样本走完完整流程后，`.Noselfligation.UU.pairs` 文件几乎为空（仅1行）；
2. 对照 D0 样本同一步骤有**十万级有效互作**；
3. SAM 文件大小（十几GB）、raw pairs 行数均正常，**数据未丢失，但全部失效**；
4. 无效pairs特征：全为`! 0 ! 0`（无基因组坐标）+`XX`（无效配对类型）。

### 6.2 根本原因（原理级）
M24 的 BWA 流程**错误加入了 samtools 坐标排序**：
```bash
# 错误流程：排序破坏read name顺序
bwa mem ... | samtools sort -o output.bam - && samtools view -h -o output.sam output.bam
```
1. **samtools sort 的破坏性**：将文件按**染色体物理坐标重排**，彻底摧毁 BWA 输出的 read name 有序性；
2. 记录分散：同一read的R1、R2、嵌合比对被随机分散（间隔数百万行）；
3. pairtools 失效：滑动缓冲窗口无法集齐配对read，**全部判定为无效数据**；
4. 输出特征：无效配对统一输出`! 0 ! 0 XX`，文件大小正常但无有效信息。

### 6.3 修复方案（仅改一步）
```bash
# 正确流程：BWA直接输出SAM，保留read name顺序
bwa mem -SP5M -T0 -t16 ref.fa R1.fastq.gz R2.fastq.gz 2>log > output.int.sam
```
#### 修复原理
1. 去掉`samtools sort/index`，BWA直接输出SAM，**严格保留原始read name顺序**；
2. 同一read的R1/R2/嵌合记录连续相邻，满足`pairtools parse2`的核心要求；
3. 兼容性：仅修改比对步骤，**后续pairtools、R脚本完全无需改动**，即可恢复正常输出。

---

## 七、流程核心总结
1. **黄金原则**：scHi-C 比对后**绝对不能做坐标排序**（指的是sam文件不能sort，parse后的pairs文件仍然需要`pairtools`的sort），必须保留 read name 顺序；
2. 核心依赖：BWA `-SP5M` 参数 + 有序SAM + pairtools 滑动窗口配对；
3. 数据逻辑：嵌合read → 多位点互作 → Chromatin Hub（scHi-C核心生物学信号）；
4. 失效根源：坐标排序破坏read配对，是scHi-C数据处理最常见的致命错误。