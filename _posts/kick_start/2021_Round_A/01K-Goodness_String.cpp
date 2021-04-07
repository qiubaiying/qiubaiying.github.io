#include<bits/stdc++.h>
using namespace std;

#define ll long long
#define ar array

void solve(){
    int n, k;
    cin >> n >> k;
    string s;
    cin >> s;
    int res = 0;
    for(int i = 0 ; i < n/2; i++){
        res += s[i] != s[n - i - 1];
    }
    cout <<  abs(k - res) << endl;
}



int main(){
    ios::sync_with_stdio(0);
    cin.tie(0);
    int t;
    cin >> t;
    int i = 1;
    while(t--){
        cout << "Case #" << i++ << ": ";
        solve();
    }
}

