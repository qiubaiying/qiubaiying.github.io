#include<bits/stdc++.h>
using namespace std;

class Solution {
public:
    bool repeatedSubstringPattern(string s) {
		string s2 = s + s;
		int n = s2.length();
		string s2_2 = s2.substr(1, s2.length() - 2);
		return s2_2.find(s) != s2_2.npos;

	}
};

int main(){
	Solution solution;
	string s = "abab";
	cout << solution.repeatedSubstringPattern(s)<< endl;
}
