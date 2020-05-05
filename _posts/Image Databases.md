## Image Databases

`图像数据库`

1、CVonline: http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm

2、YACVID: http://riemenschneider.hayko.at/vision/dataset/index.php

3、http://academictorrents.com/collection/computer-vision



#### CVonline Category

https://blog.csdn.net/u010429424/article/details/72171476

1.[行为动作](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#action)
2.[农业](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#agriculture)
3.[属性识别](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#atre)
4.[无人驾驶](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#autodriving)
5.[生物/医学](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#biomed)
6.[相机校准](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#Caca)
7.[脸/眼睛或鸢尾花](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#face)
8.[指纹](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#fingerprints)
9.[常规图像](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#images)
10.[常规彩色图像和深度](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#rgbd)(这里是3D数据集，如：目标，场景，行为)
11.[常规视频](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#videos)
12.[手，手势等姿势数据库](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#gestur)
13.[图像，视频，形状数据恢复](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#retrieve)
14.[目标数据集](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#object)
15.[人（静态/动态），人类姿势](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#human)
16.[人类检索追踪](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#people)
17.[遥感图像](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#remote)
18.[机器人](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#robotics)
19.[场景分割或分类](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#scene)
20.[分割（常规）](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#segmentation)
21.[实时定位与导航](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#surveillance)
22.[监督和追踪](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#surveillance)
23.[纹理图像](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#texture)
24.[城市数据集](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#urban)
25.[视觉和自然语言](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#language)
26.[其它收集](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#collect)
27.[杂乱的数据](http://homepages.inf.ed.ac.uk/rbf/CVonline/Imagedbase.htm#misc)





#### 开源数据集整理

- [Images Analysis](#Images Analysis)
- [Image Motion & Tracking](#Image Motion & Tracking)
- [Video Analysis & Scene Understanding](#Video Analysis & Scene Understanding)
- [3D Computer Vision](#3D Computer Vision)
- [Analyzing Humans in Images](#Analyzing Humans in Images)
- [Application](#Application)
- [Low- & Mid-Level Vision](#Low- & Mid-Level Vision)
- [Text](#Text)



##### Images Analysis

| 数据集                | 介绍           | 备注                                                   | 网址                                                         |
| --------------------- | -------------- | ------------------------------------------------------ | ------------------------------------------------------------ |
| Flickr30k             | 图片描述       | 31,783 images，每张图片5个语句标注                     | [链接](http://web.engr.illinois.edu/~bplumme2/Flickr30kEntities/) |
| Microsoft COCO        | 图片描述       | 330,000 images,每张图片至少5个语句标注                 | [链接](http://cocodataset.org/#download)                     |
| ESP Game              | 多标签定义图像 | 20,770 images，268 tags，诸如bed, light man,music      | [链接](https://www.kaggle.com/c/challenges-in-representation-learning-multi-modal-learning/data) |
| IAPRTC-12             | 多标签定义图像 | 19,452 images,291 tags                                 | [链接](http://www.imageclef.org/photodata)                   |
| NUS-WIDE              | 多标签定义图像 | 269,648 images,several tags (2-5 on average) per image | [链接](http://lms.comp.nus.edu.sg/research/NUS-WIDE.htm)     |
| CUHK-PEDES            | 以文搜图       | 34,054 images，每张图片2条描述                         | [链接](http://cuhk-pedes.shuanglee.me/)                      |
| VRD                   | 视觉关系检测   | 5,000 images, 100目录，37,993对关系                    | [链接](https://cs.stanford.edu/people/ranjaykrishna/vrd/)    |
| sVG                   | 视觉关系检测   | 108,000 images, 998,000对关系                          | [链接](https://drive.google.com/file/d/0B5RJWjAhdT04SXRfVHBKZ0dOTzQ/view) |
| Visual Genome Dataset | 图像属性检测   | 108,077 images, 5.4 M 区域块，2.8 M 属性，2.3 M 关系   | [链接](https://visualgenome.org/)                            |
| VQA                   | 问答系统       | 1,105,904问题，11,059,040 回答                         | [链接](http://www.visualqa.org/)                             |
| Visual7W              | 问答系统       | 327,939 问答对                                         | [链接](http://web.stanford.edu/~yukez/visual7w/)             |
| TID2013               | 图像质量评价   | 25张参考图像，24个失真类型                             | [链接](http://www.ponomarenko.info/tid2013.htm)              |
| CSIQ                  | 图像质量评价   | 30张参考图像，6个失真类型                              | [链接](http://vision.eng.shizuoka.ac.jp/mod/page/view.php?id=23) |
| LIVE                  | 图像质量评价   | 29张参考图像，5个失真类型                              | [链接](http://live.ece.utexas.edu/research/quality/subjective.htm) |
| WATERLOO              | 图像质量评价   | 4744张参考图像，20个失真类型                           | [链接](https://ece.uwaterloo.ca/~k29ma/exploration/)         |
| photo.net             | 图像美观评价   | 20,278张图像，打分[0,10]                               | [链接](http://ritendra.weebly.com/aesthetics-datasets.html)  |
| DPChallenge.com       | 图像美观评价   | 16,509张图像，打分[0,10]                               | [链接](http://ritendra.weebly.com/aesthetics-datasets.html)  |
| CUHK                  | 图像美观评价   | 28,410张图像，只分高质量和低质量                       | [链接](http://mmlab.ie.cuhk.edu.hk/archive/CUHKPQ/Dataset.htm) |
| AVA                   | 图像美观评价   | 255,500张图像，打分[0,10]                              | [链接](https://github.com/mtobeiyf/ava_downloader)           |



##### Image Motion & Tracking

| 数据集                       | 介绍                                   | 备注                                                    | 网址                                                         |
| ---------------------------- | -------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------ |
| CUHK03                       | Person re-identification(人重识别)     | image num:13164 person num:1360 camera num:10( 5 pairs) | [链接](http://www.ee.cuhk.edu.hk/~xgwang/CUHK_identification.html) |
| CUHK02                       | Person re-identification(人重识别)     | image num:7264 person num:1816 camera num:10( 5 pairs)  | [链接](http://www.ee.cuhk.edu.hk/~xgwang/CUHK_identification.html) |
| CUHK01                       | Person re-identification(人重识别)     | image num:3884 person num:971 camera num: 2             | [链接](http://www.ee.cuhk.edu.hk/~xgwang/CUHK_identification.html) |
| VIPeR                        | Person re-identification(人重识别)     | image num:1264 person num:632 camera num:2              | [链接](https://vision.soe.ucsc.edu/node/178)                 |
| ETH1,2,3                     | Person re-identification(人重识别)     | image num:8580 person num:83,35,28 camera num:1         | [链接](http://homepages.dcc.ufmg.br/~william/datasets.html)  |
| PRID2011                     | Person re-identification(人重识别)     | image num:24541 person num:934 camera num:2             | [链接](https://www.tugraz.at/institute/icg/research/team-bischof/lrs/downloads/PRID11/) |
| MARS                         | Person re-identification(人重识别)     | image num:11910031 person num:1261 camera num:6         | [链接](http://www.liangzheng.com.cn/Project/project_mars.html) |
| Market1501                   | Person re-identification(人重识别)     | image num:32217 person num:1501 camera num:6            | [链接](http://www.liangzheng.org/Project/project_reid.html)  |
| Epic Fail (EF) dataset       | Risk Assessment(风险评估)              | video num:3000                                          | [链接](https://vision.soe.ucsc.edu/?q=node/178)              |
| Street Accident (SA) dataset | Risk Assessment(风险评估)              | video num:1733                                          | [链接](https://vision.soe.ucsc.edu/?q=node/178)              |
| OTB-50                       | visual tracking(跟踪)                  | video num:50                                            | [链接](http://www.visual-tracking.net/)                      |
| OTB-100                      | visual tracking(跟踪)                  | video num:100                                           | [链接](http://www.visual-tracking.net/)                      |
| VOT2015                      | visual tracking(跟踪)                  | video num:60                                            | [链接](http://www.votchallenge.net/vot2015/)                 |
| ALOV300                      | visual tracking(跟踪)                  | video num:314                                           | [链接](http://alov300pp.joomlafree.it/)                      |
| MOT                          | visual tracking(跟踪)                  | video num:train11 test:11                               | [链接](https://motchallenge.net/)                            |
| THUMOS                       | Temporal action localization(动作定位) | video num:~3K activities class:20 instances:~3K         | [链接](http://crcv.ucf.edu/THUMOS14/)                        |
| ActivityNet                  | Temporal action localization(动作定位) | video num:20k activities class:200 instances:7.6K       | [链接](http://activity-net.org/challenges/2016/)             |
| Mexaction2                   | Temporal action localization(动作定位) | activities class:2 instances:1975                       | [链接](http://mexculture.cnam.fr/xwiki/bin/view/Datasets/Mex+action+dataset) |
| FlyingChairs dataset         | optical flow(光流)                     | image pairs：22k                                        | [链接](https://lmb.informatik.uni-freiburg.de/resources/datasets/FlyingChairs.en.html) |
| FlyingThings3D               | optical flow(光流)                     | image pairs：22k                                        | [链接](https://lmb.informatik.uni-freiburg.de/resources/datasets/SceneFlowDatasets.en.html) |
| KITTI benchmark suite        | optical flow(光流)                     | image pairs：1600                                       | [链接](http://www.cvlibs.net/datasets/kitti/)                |
| MPI Sintel                   | optical flow(光流)                     | image pairs：1064                                       | [链接](http://sintel.is.tue.mpg.de/)                         |

##### Video Analysis & Scene Understanding

| 数据集                      | 介绍                             | 备注                                                         | 网址                                                         |
| --------------------------- | -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| UCF101                      | 动作行为识别                     | 13320 video,101类动作，主要是五大类：1)人-物交互；2)肢体运动；3)人-人交互；4)弹奏乐器；5)运动 | [链接](http://crcv.ucf.edu/data/UCF101.php)                  |
| HMDB51                      | 动作行为识别                     | 7000 videos,51类，包括人脸表情动作，身体动作，人与人交互等   | [链接](http://serre-lab.clps.brown.edu/resource/hmdb-a-large-human-motion-database/#Downloads) |
| Moments-in-Time             | 动作行为识别                     | 1,000,000 videos,339类                                       | [链接](http://moments.csail.mit.edu/)                        |
| ActivityNet 1.3             | 动作行为识别                     | 20,000 videos,200类                                          | [链接](http://activity-net.org/challenges/2016/guidelines.html) |
| Kinetics                    | 动作行为识别                     | 300,000 videos，400类                                        | [链接](https://deepmind.com/research/open-source/open-source-datasets/kinetics/) |
| AVA                         | 动作行为识别                     | 57,600 videos，80类                                          | [链接](https://research.google.com/ava/)                     |
| Collective Activity Dataset | 群体活动行为识别                 | 44 videos,穿叉、行走、等待、交谈和排队 五类                  | [链接](http://vhosts.eecs.umich.edu/vision//activity-dataset.html) |
| Choi’s New Dataset          | 群体活动行为识别                 | 32 videos，聚会，谈话，分开，一起走，追逐和排队 六类         | None                                                         |
| ActivityNet 1.3             | 检测动作事件的起始时间和终止时间 | 20,000 videos,200类动作的起始时间和终止时间                  | [链接](http://activity-net.org/challenges/2016/guidelines.html) |
| THUMOS                      | 检测动作事件的起始时间和终止时间 | 15,000 videos，101类动作的起始时间和终止时间                 | [链接](http://www.thumos.info/download.html)                 |
| MED                         | 事件检测                         | 32,744 videos,20个事件                                       | [链接](http://www-nlpir.nist.gov/projects/tv2017/data/)      |
| EventNet                    | 事件检测                         | 90,000 videos，500个事件                                     | [链接](http://eventnet.ee.columbia.edu/)                     |
| Columbia Consumer Video     | 事件检测                         | 9,317 videos，20个事件                                       | [链接](http://www.ee.columbia.edu/ln/dvmm/CCV/)              |
| ADE20K                      | 事件检测                         | 20,210 videos，900个事件                                     | [链接](http://sceneparsing.csail.mit.edu/)                   |
| DAVIS                       | 视频主物体分割                   | 50 videos，分割标注                                          | [链接](http://davischallenge.org/)                           |
| FBMS                        | 视频主物体分割                   | 59 videos，分割标注                                          | [链接](https://lmb.informatik.uni-freiburg.de/resources/datasets/moseg.en.html) |
| IJB-C                       | 视频人脸识别                     | 11,000 videos，                                              | [链接](https://www.nist.gov/programs-projects/face-challenges) |
| YouTube Faces               | 视频人脸识别                     | 3,425 videos，1595 人                                        | [链接](https://www.cs.tau.ac.il/~wolf/ytfaces/)              |
| MS-Celeb-1M                 | 视频人脸识别                     | 1,000,000 images，21,000人                                   | [链接](http://www.msceleb.org/download/sampleset)            |
| MSVD                        | 视频描述                         | 1,970 videos                                                 | [链接](http://www.cs.utexas.edu/users/ml/clamp/videoDescription/YouTubeClips.tar) |
| MSR-VTT-10K                 | 视频描述                         | 10，000 videos                                               | [链接](http://ms-multimedia-challenge.com/2017/dataset)      |
| MSR-VTT-10K                 | 视频描述                         | 无                                                           | [链接](https://sites.google.com/site/describingmovies/lsmdc-2016/download) |



##### 3D Computer Vision

| 数据集                  | 介绍                                                         | 备注                                                         | 网址                                                         |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| photoface database      | 基于光度立体视觉的二维和三维人脸识别数据库                   | 总共7356张图像，包含1839个session和261个subjects             | None                                                         |
| NYU Depth V2 dataset    | 关于RGBD 图像场景理解的数据库                                | 提供1449张深度图片和他们的密集2d点类标注                     | [链接](https://cs.nyu.edu/~silberman/datasets/nyu_depth_v2.html) |
| SUN RGBD dataset        | 是上面的NYU Depth V2 dataset的超集，多了3D bounding boxes和room layouts的标注。 | 有10,000张RGB-D图片，有58,657个3D包围框和146,617 个2d包围框。 | [链接](http://rgbd.cs.princeton.edu/)                        |
| PASCAL3D+               | 新的三维物体检测和姿态估计数据集，从PASCAL VOC 演化而来，包含图像，注解，和3D CAD模型 | 总共12个类，平均每个类别有3000多个实例                       | [链接](http://cvgl.stanford.edu/projects/pascal3d.html)      |
| IKEA                    | 包含典型室内场景的三维模型的数据库，例如桌子椅子等           | 包含大约759张图片和219个3D模型                               | [链接](http://ikea.csail.mit.edu/)                           |
| New Tsukuba Dataset     | 包含了很多立体物体对的数据库，用于立体物体匹配               | 总共1800个立体物体对，以及每立体对的立体视差图、遮挡图和不连续图 | [链接](https://cvlab-home.blogspot.jp/2012/05/h2fecha-2581457116665894170-displaynone.html) |
| Oxford RobotCar Dataset | 关于户外自动驾驶的数据集。                                   | 包含在驾驶汽车过程从6个摄像头收集的2000w张图片，和当时的激光雷达，GPS和地面实况标注。 | [链接](http://robotcar-dataset.robots.ox.ac.uk/)             |
| Middlebury V3           | 包含高分辨率物体立体视差标注的数据库                         | 包含33个类，没有明说每类有多少数据                           | [链接](http://vision.middlebury.edu/stereo/eval3/)           |
| ShapeNet                | 包含3D模型，和3d模型的类别标注的数据集，覆盖了常用的3D数据集PASCAL 3D+。 | 它涵盖55个常见的对象类别，有大约51,300个3D模型               | [链接](https://www.shapenet.org/)                            |
| MICC dataset            | 包含了3D人脸扫描和在不同分辨率，条件和缩放级别下的几个视频序列的数据库。 | 有53个人的立体人脸数据                                       | [链接](https://www.micc.unifi.it/resources/datasets/florence-3d-faces/) |
| CMU MoCap Dataset       | 包含了3D人体关键点标注和骨架移动标注的数据集。               | 有6个类别和23个子类别，总共2605个数据。                      | [链接](http://mocap.cs.cmu.edu/)                             |
| DTU dataset             | 关于3D场景的数据集。                                         | 有124个场景，每场景有49/64个位置的RGB图像和结构光标注。      | [链接](http://roboimagedata.compute.dtu.dk/?page_id=36)      |





##### Analyzing Humans in Images

| 数据集                                  | 介绍                           | 备注                                                         | 网址                                                         |
| --------------------------------------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| MSR-Action3D                            | 包含深度的动作识别数据集，     | 有20个动作，总共557个序列。                                  | [链接](http://users.eecs.northwestern.edu/~jwa368/my_data.html) |
| Florence-3D                             | 包含深度的动作识别数据集，     | 有9个动作，总共215个动作序列。                               | [链接](https://www.micc.unifi.it/resources/datasets/florence-3d-actions-dataset/) |
| Berkeley MHAD                           | 包含深度的动作识别数据集，     | 有11个动作，产生660个动作序列。                              | [链接](http://tele-immersion.citris-uc.org/berkeley_mhad)    |
| Online Action Detection                 | 包含深度的动作识别数据集，     | 数据集包含59个长序列，包含10种不同的日常生活行为。           | [链接](http://homes.esat.kuleuven.be/~rdegeest/OnlineActionDetection.html) |
| ChaLearn LAP IsoGD Dataset              | RGB-D图像的手势识别的数据集。  | 包括47933个RGB-D手势视频，有249个手势标签。Training有35878视频，Validation有5784个，test有6271个 | [链接](http://gesture.chalearn.org/2016-looking-at-people-cvpr-challenge/isogd-and-congd-datasets) |
| MAFA dataset                            | 关于面部遮挡问题的数据集       | 有30, 811张人脸和35806张有遮挡的脸组成。                     | [链接](http://www.escience.cn/people/geshiming/mafa.html)    |
| MSRC-12 Kinect Gesture Dataset          | 手势识别数据集                 | 有4900张图片，包含12个不同手势，                             | [链接](https://www.microsoft.com/en-us/download/details.aspx?id=52283) |
| 2013 Chalearn Gesture Challenge dataset | 手势识别数据集                 | 有11000张图片，包含20个不同手势，                            | [链接](http://gesture.chalearn.org/2013-multi-modal-challenge) |
| WIDER FACE                              | 人脸检测数据集                 | 有 32,203 张图片，标注了393703个人脸。                       | [链接](http://mmlab.ie.cuhk.edu.hk/projects/WIDERFace/)      |
| FDDB                                    | 人脸检测数据集                 | 2845张图片，标注了5171张人脸。                               | [链接](http://vis-www.cs.umass.edu/fddb/)                    |
| 300-VW dataset                          | 面部表情数据集                 | 包含114个视频和总计218,595帧。                               | [链接](https://ibug.doc.ic.ac.uk/resources/300-VW/)          |
| HMDB51                                  | 人类行为识别的数据集           | 包含51个动作，总共有6766个视频剪辑                           | [链接](http://serre-lab.clps.brown.edu/resource/hmdb-a-large-human-motion-database/) |
| MPII Cooking Activities Dataset         | 人类行为识别的数据集           | 包含65个动作，有5609个视频                                   | [链接](https://www.mpi-inf.mpg.de/departments/computer-vision-and-multimodal-computing/research/human-activity-recognition/mpii-cooking-activities-dataset/) |
| UCF101                                  | 人类行为识别的数据集           | 包含101个动作，有13320个视频                                 | [链接](http://crcv.ucf.edu/data/UCF101.php)                  |
| IJB-A dataset                           | 包含视频和图片人脸识别的数据集 | 包含5712个图像和2085个视频                                   | [链接](https://www.nist.gov/programs-projects/face-challenges) |
| YouTube celebrities                     | 视频人脸识别的数据集           | 包含47位名人的1910个视频                                     | [链接](https://www.cs.tau.ac.il/~wolf/ytfaces/)              |
| COX                                     | 视频人脸识别的数据集           | 包含1000个主题的4000个视频                                   | [链接](http://vipl.ict.ac.cn/view_database.php?id=3)         |
| Human3.6M                               | 人体姿态估计的数据集           | 360万张3D照片，11名受试者在4个视点下执行15个了不同的动作     | [链接](http://vision.imar.ro/human3.6m/description.php)      |
| iLIDS                                   | 行人重识别的数据集             | 476 张图像，包含119个人                                      | [链接](http://www.eecs.qmul.ac.uk/~xiatian/downloads_qmul_iLIDS-VID_ReID_dataset.html) |
| VIPeR                                   | 行人重识别的数据集             | 632个行人图片对（由两个相机拍摄）                            | [链接](https://iiw.kuleuven.be/onderzoek/eavise/viper/dataset) |
| CUHK01                                  | 行人重识别的数据集             | 包含971行人, 3884张图片                                      | [链接](http://www.ee.cuhk.edu.hk/~xgwang/CUHK_identification.html) |
| CUHK03                                  | 行人重识别的数据集             | 包含1360行人, 13164张图片                                    | [链接](http://www.ee.cuhk.edu.hk/~xgwang/CUHK_identification.html) |
| RWTH-PHOENIX-Weather multi-signer 2014  | 手语识别的数据集               | 包含了5672个德语手语的句子，有65,227个手语姿势和799,006帧    | [链接](https://www-i6.informatik.rwth-aachen.de/~forster/database-rwth-phoenix.php) |
| AFLW                                    | 人类面部关键点的数据集         | 总共约有25k张脸，每幅图像标注了大约21个位置。                | [链接](https://www.tugraz.at/institute/icg/research/team-bischof/lrs/downloads/aflw) |
| CMU mocap database                      | 动作识别的数据集               | 2235个数据，包含144个不同的动作。                            | [链接](http://mocap.cs.cmu.edu/)                             |
| Georgia Tech (GT) database              | 人脸识别数据库                 | 50个人每人15张人脸。                                         | [链接](http://www.anefian.com/research/face_reco.htm)        |
| ORL                                     | 人脸识别数据库                 | 40个人每个人10张图。                                         | [链接](https://www.cl.cam.ac.uk/research/dtg/attarchive/facedatabase.html) |



##### Application

| 数据集                               | 介绍                                           | 备注                                                      | 网址                                                         |
| ------------------------------------ | ---------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| DogCentric Activity Dataset          | 第一视角的狗和人之间的相互行为的数据集（视频） | 总共有10类，具体数据量没有明说，y是动作类别               | [链接](http://robotics.ait.kyushu-u.ac.jp/yumi/db/first_dog.html) |
| JPL First-Person Interaction Dataset | 第一视角观察动作的数据集                       | 57个视频，8个大类，y是动作类别                            | [链接](http://michaelryoo.com/jpl-interaction.html)          |
| NUS-WIDE                             | 关于图像文本匹配的数据集                       | 269,648个图像和对应的标签                                 | [链接](http://lms.comp.nus.edu.sg/research/NUS-WIDE.htm)     |
| LabelMe Dataset                      | 关于图像文本匹配的数据集                       | 3825个图像和对应标签                                      | [链接](http://labelme.csail.mit.edu/Release3.0/browserTools/php/dataset.php) |
| Pascal Dataset                       | 关于图像文本匹配的数据集                       | 5011张训练图像和4952张测试图像                            | )                                                            |
| ICDAR 2015                           | 关于文本检测的数据集                           | 1500张训练，1000张测试，y为四边形的四个顶点。             | [链接](http://rrc.cvc.uab.es/)                               |
| COCO-Text                            | 关于文本检测的数据集                           | 63686张图片，其中43686张被选为训练集，剩下的2万用于测试。 | [链接](https://vision.cornell.edu/se3/coco-text-2/)          |
| MSRA-TD500                           | 关于文本检测的数据集                           | 300个训练，200个测试图像                                  | [链接](http://www.iapr-tc11.org/mediawiki/index.php/MSRA_Text_Detection_500_Database_(MSRA-TD500)) |
| Microsoft 7-Scenes Dataset           | 室内人体运动的数据集                           | 有7种不同室内环境，每包含500-1000张图像视频序列。         | [链接](https://www.microsoft.com/en-us/research/project/rgb-d-dataset-7-scenes/) |
| Oxford RobotCar                      | 户外自动驾驶数据集                             | 包含图像，激光扫描结果和GPS数据。                         | [链接](http://robotcar-dataset.robots.ox.ac.uk/)             |

##### Low- & Mid-Level Vision

| 数据集                                      | 介绍                                                         | 备注                                                         | 网址                                                         |
| ------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Deep Video Deblurring for Hand-held Cameras | video/image deblurring(图像去模糊)                           | video num:71 video time: 3-5s blurry and sharp pair image num:6708 | [链接](https://www.cs.ubc.ca/labs/imager/tr/2017/DeepVideoDeblurring/#dataset) |
| GOPRO dataset                               | video/image deblurring(图像去模糊)                           | blurry and sharp pair image num:3214 train num:2103 test num:1111 | [链接](https://github.com/SeungjunNah/DeepDeblur_release)    |
| BSD68                                       | image restoration(图像修复)/高斯降噪                         | image num:68                                                 | [链接](https://www.robots.ox.ac.uk/~vgg/data/dtd/)           |
| BSD100                                      | “image restoration(图像修复)super resolution超分辨率重建”    | image num:100                                                | [链接](https://github.com/jbhuang0604/SelfExSR/tree/master/data) |
| Set5                                        | “image restoration(图像修复)super resolution超分辨率重建”    | image num:5                                                  | [链接](https://github.com/jbhuang0604/SelfExSR/tree/master/data) |
| Set14                                       | “image restoration(图像修复)super resolution超分辨率重建”    | image num:14                                                 | [链接](https://github.com/jbhuang0604/SelfExSR/tree/master/data) |
| Urban100                                    | “image restoration(图像修复)super resolution超分辨率重建”    | image num:100                                                | [链接](https://github.com/jbhuang0604/SelfExSR/tree/master/data) |
| NYU v2 dataset                              | “image restoration(图像修复)depth super resolution深度超分辨率重建” | image num:1449                                               | [链接](https://cs.nyu.edu/~silberman/datasets/nyu_depth_v2.html) |
| Middlebury dataset                          | “image restoration(图像修复)depth super resolution深度超分辨率重建” | image pair num: 33                                           | [链接](http://vision.middlebury.edu/stereo/data/)            |
| alpha matting benchmark                     | Natural image matting(抠图)                                  | “train num:27,test num:8”                                    | [链接](http://www.alphamatting.com/)                         |
| real image benchmark                        | Natural image matting(抠图)                                  | “train num:49300,test num:1000”                              | [链接](https://sites.google.com/view/deepimagematting)       |
| MSRA10K/MSRA-B                              | Image saliency detection(显著性区域检测)                     | image num(MSRA10K):10000 image num(MSRA-B):5000              | [链接](https://mmcheng.net/zh/msra10k/)                      |
| ECSSD                                       | Image saliency detection(显著性区域检测)                     | image num:1000                                               | [链接](http://www.cse.cuhk.edu.hk/leojia/projects/hsaliency/dataset.html) |
| DUT-OMRON                                   | Image saliency detection(显著性区域检测)                     | image num:5168                                               | [链接](http://saliencydetection.net/dut-omron/)              |
| PASCAL-S                                    | Image saliency detection(显著性区域检测)                     | image num:850                                                | [链接](http://cbi.gatech.edu/salobj/)                        |
| HKU-IS                                      | Image saliency detection(显著性区域检测)                     | image num:4447                                               | [链接](http://i.cs.hku.hk/~gbli/deep_saliency.html)          |
| SOD                                         | Image saliency detection(显著性区域检测)                     | image num:300                                                | [链接](http://i.cs.hku.hk/~gbli/deep_saliency.html)          |
| Describable Textures Dataset                | texture synthesis(纹理合成)                                  | image num:5640 category num:47 split train:val:test = 1:1:1  | [链接](https://www.robots.ox.ac.uk/~vgg/data/dtd/)           |
| CVPPP leaf segmentation                     | Instance segmentation(样例分割)                              | image num: 161 train num: 128 test num: 33                   | [链接](https://www.plant-phenotyping.org/CVPPP2014-dataset)  |
| KITTI car segmentation                      | Instance segmentation(样例分割)                              | image num: 3976 train num: 3712 test num: 144 val:120        | [链接](http://www.cvlibs.net/datasets/kitti/eval_semantics.php) |
| Cityscapes                                  | Instance segmentation(样例分割)                              | image num: 5000 train num: 2975 test num: 1525 val:500       | [链接](https://www.cityscapes-dataset.com/)                  |
| SYMMAX                                      | Symmetry Detection(对称性检测)                               | image num: train:200 test:100                                | [链接](https://github.com/KevinKecc/SRN)                     |
| WHSYMMAX                                    | Symmetry Detection(对称性检测)                               | image num: train:228 test:100 object num: 1                  | [链接](https://github.com/KevinKecc/SRN)                     |
| SK506                                       | Symmetry Detection(对称性检测)                               | image num: train:300 test:206 object num: 16                 | [链接](https://github.com/KevinKecc/SRN)                     |
| Sym-PASCAL                                  | Symmetry Detection(对称性检测)                               | image num: train:648 test:787 object num: 14                 | [链接](https://github.com/KevinKecc/SRN)                     |
| Color Checker Dataset                       | Color constancy(颜色恒定)                                    | image num: 568                                               | [链接](http://www.eecs.harvard.edu/~ayanc/oldcc/dbs.html)    |
| NUS 8-Camera Dataset                        | Color constancy(颜色恒定)                                    | image num: 1736                                              | [链接](http://www.comp.nus.edu.sg/~whitebal/illuminant/illuminant.html) |





##### Text

| 数据集                                         | 介绍         | 备注                                                         | 网址                                                         |
| ---------------------------------------------- | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Stanford Sentiment Treebank                    | 文本情感分析 | 11855个句子划分为239231个短语，每个短语有个概率值，越小越负面，越大越正面 | [链接](https://nlp.stanford.edu/sentiment/)                  |
| IMDB                                           | 文本情感分析 | 100,000句子，正面负面两类                                    | [链接](http://ai.stanford.edu/~amaas/data/sentiment/)        |
| Yelp                                           | 文本情感分析 | 无                                                           | [链接](https://www.yelp.com/dataset/challenge)               |
| Multi-Domain Sentiment Dataset(Amazon product) | 文本情感分析 | 100,000+句子，正面负面2类或强正面、弱正面、中立、弱负面、强负面5类 | [链接](http://www.cs.jhu.edu/~mdredze/datasets/sentiment/)   |
| SemEval                                        | 文本情感分析 | 20,632句子，三类（正面、负面、中立）                         | [链接](http://alt.qcri.org/semeval2017/task4/index.php?id=data-and-tools) |
| Sentiment140(STS)                              | 文本情感分析 | 1,600,000句子,三类（正面、负面、中立）                       | [链接](https://drive.google.com/uc?id=0B04GJPshIjmPRnZManQwWEdTZjg&export=download) |