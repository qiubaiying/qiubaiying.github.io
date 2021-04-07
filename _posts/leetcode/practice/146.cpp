#include<bits/stdc++.h>
using namespace std;


struct DoubleLinkedNode{
	int key, val;
	DoubleLinkedNode* prev;
	DoubleLinkedNode* next;
	DoubleLinkedNode(): key(0), val(0) , prev(nullptr), next(nullptr){}
	DoubleLinkedNode(int _key,int _val): key(_key), val(_val),prev(nullptr), next(nullptr) {}
};

class LRUCache {
	unordered_map<int, DoubleLinkedNode*> cache; // hashTabel
	DoubleLinkedNode* head;
	DoubleLinkedNode* tail;
	int size;
	int capacity;

public:
    LRUCache(int capacity):capacity(capacity), size(0){
		head = new DoubleLinkedNode();
		tail = new DoubleLinkedNode();
		head -> next = tail;
        tail -> prev = head;
	}
    
    int get(int key) {
		if(cache.find(key) == cache.end()){
			return -1;
		}
		else{
			// found
			DoubleLinkedNode* node = cache[key];
			UpdateNode(node);
			return node -> val;
		}
		
    }
    
    void put(int key, int value) {
		if(cache.find(key) != cache.end()){
			// found
			DoubleLinkedNode* node = cache[key];
			node -> val = value;
			UpdateNode(node);
		}
		else{// not found
			DoubleLinkedNode* node = new DoubleLinkedNode(key, value);
			cache[key] = node;
			addtoHashTab(node);
			size++;
			if(capacity <size){
                DoubleLinkedNode* removed = remvTail();
                cache.erase(removed->key);
                delete removed;
				size--;
			}
		}
    }

	void UpdateNode(DoubleLinkedNode* node){
		node -> prev -> next = node -> next;
		node -> next -> prev = node -> prev;
		addtoHashTab(node);
	}
	
	void addtoHashTab(DoubleLinkedNode* node){
        node -> prev = head;
		node -> next = head -> next;
		head -> next -> prev = node;
		head -> next = node;
	}

	DoubleLinkedNode* remvTail(){
		DoubleLinkedNode* toBeDel = tail -> prev;
		toBeDel -> prev -> next = toBeDel -> next;
		toBeDel -> next -> prev = toBeDel -> prev;
        return toBeDel;
	}
};




int main(){
	Solution solution;
	cout << solution.function(1)<< endl;
}
