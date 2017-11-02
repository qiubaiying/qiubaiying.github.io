---
layout:     post
title:      Neural Network Language Model
subtitle:   神经网络语言模型
date:       2017-11-01
author:     Awybupt
header-img: img/NNLM_bg.jpg
catalog: true
tags:
    - NNLM
    - ML
    - NLP
---

# 模型原理
用神经网络来训练语言模型的思想最早由百度 IDL （深度学习研究院）的徐伟提出[1],NNLM（Nerual Network Language Model）是这方面的一个经典模型，具体内容可参考 Bengio 2003年发表在JMLR上的论文[2]
* 模型训练数据是一组词序列w1…wT,wt∈V。其中V是所有单词的集合（即词典），Vi表示字典中的第 i 个单词。NNLM的目标是训练如下模型：	
    * f(wt,wt−1,...,wt−n+2,wt−n+1)=p(wt|w1t−1)
* 其中wt表示词序列中第t个单词，w1t−1表示从第1个词到第t个词组成的子序列。模型需要满足的约束条件是：
    * f(wt,wt−1,...,wt−n+2,wt−n+1)>0
    * ∑|V|i=1f(i,wt−1,...,wt−n+2,wt−n+1)=1
* 下图展示了模型的总体架构：
![NNLM](https://github.com/Awybupt/Awybupt.github.io/blob/master/img/NNLM_page.png)

```python
vocabulary_size = 8000
unknown_token = "UNKNOWN_TOKEN"
sentence_start_token = "SENTENCE_START"
sentence_end_token = "SENTENCE_END"

# Read the data and append SENTENCE_START and SENTENCE_END tokens
print "Reading CSV file..."
with open('data/reddit-comments-2015-08.csv', 'rb') as f:
    reader = csv.reader(f, skipinitialspace=True)
    reader.next()
    # Split full comments into sentences
    sentences = itertools.chain(*[nltk.sent_tokenize(x[0].decode('utf-8').lower()) for x in reader])
    # Append SENTENCE_START and SENTENCE_END
    sentences = ["%s %s %s" % (sentence_start_token, x, sentence_end_token) for x in sentences]
print "Parsed %d sentences." % (len(sentences))

# Tokenize the sentences into words
tokenized_sentences = [nltk.word_tokenize(sent) for sent in sentences]

# Count the word frequencies
word_freq = nltk.FreqDist(itertools.chain(*tokenized_sentences))
print "Found %d unique words tokens." % len(word_freq.items())

# Get the most common words and build index_to_word and word_to_index vectors
vocab = word_freq.most_common(vocabulary_size-1)
index_to_word = [x[0] for x in vocab]
index_to_word.append(unknown_token)
word_to_index = dict([(w,i) for i,w in enumerate(index_to_word)])

print "Using vocabulary size %d." % vocabulary_size
print "The least frequent word in our vocabulary is '%s' and appeared %d times." % (vocab[-1][0], vocab[-1][1])

# Replace all words not in our vocabulary with the unknown token
for i, sent in enumerate(tokenized_sentences):
    tokenized_sentences[i] = [w if w in word_to_index else unknown_token for w in sent]

print "\nExample sentence: '%s'" % sentences[0]
print "\nExample sentence after Pre-processing: '%s'" % tokenized_sentences[0]

# Create the training data
X_train = np.asarray([[word_to_index[w] for w in sent[:-1]] for sent in tokenized_sentences])
y_train = np.asarray([[word_to_index[w] for w in sent[1:]] for sent in tokenized_sentences])

```


