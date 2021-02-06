#include<bits/stdc++.h>
using namespace std;

#define ll long long 
#define ar array

int n,b ,a[100000];

void solve(){
	int res = 0;
	cin >>n >> b;
	for(int i = 0 ; i < n; i++){
		cin >> a[i];
	}
	sort(a ,a + n);
	for(int i = 0 ; i <  n; i++){
		if(b < a[i])
			break;
		b -= a[i];
		res ++;
	}
	cout << res;
}


int main(){
	ios::sync_with_stdio(0);
	cin.tie(0);
	
	int t;

	int i = 0;
	cin >> t;
	while(t--){
		cout << "Case #"<< ++i << ": "; 
		solve();
		cout << endl;
	}
}
