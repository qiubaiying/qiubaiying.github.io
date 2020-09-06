---
layout:     post
title:      PaperSharing - A review of Sketching and Subliner Data Structures in Genomics
subtitle:   2019 Annual Reviews
date:       2020-09-06
author:     Xuan
header-img: img/post-bg-2.png
catalog: true
tags:
    - Paper_sharing 
    - Review_paper
---

> Title: Sketching and Subliner Data Structures in Genomics


## Content

0.The aim of design data structures : *represents* a way of sketching sequence collections, either with or without error, *using small space*. (用更少的空间去表达数据)



1.*Four broad classes of data structures* 
- compact, compressed indices : efficient exact string matching 

> e.g. FM-index : save space to information-theoretic minimum, while still supporting exact search

- dimensionality reduction : data queries?

> e.g. locality-sensitive hashing (LSH) schemes : but with some error by representing each datum by a probabilistic sketch ?

- support approximate membership queries (AMQs)

> e.g.  data can be usefully represented as a set; AMQ data structures allow that set to be stored in small space, at the cost usually of both some errors and some limits on the types of operations that can be performed. ?

- minimizers and local schemes : sequence analysis & provide reduced representations of strings



2.Two classes of Sequencing methods

short read sequencing V.S. long read sequencing

- Error rate: 1% V.S. 10\~15%

- Read Length: 30\~400 bp V.S. 1000\~100,000 bp (average 30,000 bp)





3.Six classes of Biological Applications

- Genome assembly 
- Variant calling
- Read mapping : identify the best matching against a reference
- Sequence alignment : find similar sequences
- Experiment search ? 
- Metagenomic abundance estimation


> *Genome assembly* is usually *broken into subproblems*, (contaminant removal, error correction, overlap computation, construction of the de Bruijn graph to represent the sequenced fragments)    

*Variant calling* is to identify the genomic differences between a reference sequence and a sequenced individual, requires a lower depth of sequencing than de novo genome assembly.  
*Read mapping* given a collec- tion of fragments {t1 , . . . , tm } and a reference string T , and our goal is to identify the best matching (typically under the edit distance or some appropriately defined alignment score) substring of T for each of the ti.   

*Sequence alignment* is to find similar sequences, e.g. BLAST (basic local alignment search tool); Given a set of sequences {t1 , . . . , tm } and a query q, find the ti and their substrings that are significantly similar to a substring of q; When there is only one sequence in the set (i.e., m = 1) and t1 and q both represent entire genomes, this is the genome-to-genome alignment problem.

*Experiment search* ??

*Metagenomic abundance estimation* identify from this mixture which species or genes are present in what relative quantities in the environment.







<!-- ![paper structure](/img/post-ct-kmerr.png) -->

## Unknow key word

local sensitive hashing

streaming algorithm / off-line settings








## good writting sentence

Driven by falling costs and increasing availability, the number of applications using sequencing data has been increasing rapidly. 

Public repositories of genomics data (7–9) have seen an exponential growth for over two decades 

In addition to storage, the data must be efficiently computationally manipulatable for further analysis to achieve the promised benefit of personal medicine. 

In the medical setting, the timely processing and querying of data are even more crucial than in a research lab environment. 


We have selected the techniques we cover with an eye to their importance and their representativeness.

Our aims are to broaden the appreciation of these sketching and data structuring techniques and to provide a starting point for those interested in applying or improving on them. 


## Reference

